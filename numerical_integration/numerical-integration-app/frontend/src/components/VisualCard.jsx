import React, { useMemo, useState } from 'react';
import { createMathEvaluator } from '../api';

function buildPreviewAdaptiveSegments(f, low, high, eps) {
  const span = high - low;
  if (span <= 1e-12) return [];
  const safeEps = Math.max(Number(eps) || 0.01, (span / 120) * 0.05);
  let x = low;
  let h = Math.min(0.5, span / 2);
  const hMin = span / 80;
  const segs = [];
  let guard = 0;

  while (x < high - 1e-9 && guard < 200) {
    guard++;
    const xRight = Math.min(x + h, high);
    const hActual = xRight - x;
    const fx = f(x) ?? 0;
    const fxMid = f(x + hActual / 2) ?? 0;
    const I1 = fx * hActual;
    const I2 = ((fx + fxMid) * hActual) / 2;
    const diff = Math.abs(I2 - I1);

    if (diff > safeEps && hActual > hMin) {
      h = hActual / 2;
      continue;
    }

    segs.push({ x0: x, x1: xRight, y0: fx, yMid: fxMid });
    x = xRight;
    if (diff < safeEps / 2) {
      h = Math.min(h * 1.8, high - x);
    } else {
      h = hActual;
    }
  }
  return segs;
}

export default function VisualCard({
  theme = 'dark',
  func,
  a,
  b,
  n,
  eps,
  algo,
  method,
  varAlgo,
  latestResult,
  adaptiveSegments,
}) {
  const [hoverX, setHoverX] = useState(null);

  const evaluator = useMemo(() => createMathEvaluator(func), [func]);

  const numA = parseFloat(a);
  const numB = parseFloat(b);
  const validBounds = Number.isFinite(numA) && Number.isFinite(numB) && Math.abs(numB - numA) > 1e-9;

  const low = validBounds ? Math.min(numA, numB) : 0;
  const high = validBounds ? Math.max(numA, numB) : 3.14;
  const span = high - low || 1;
  const padX = span * 0.08;
  const xMin = low - padX;
  const xMax = high + padX;

  const width = 860;
  const height = 370;
  const margin = { top: 40, right: 32, bottom: 40, left: 60 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const isDark = theme === 'dark';
  const colors = {
    grid: isDark ? 'rgba(255, 255, 255, 0.065)' : 'rgba(0, 0, 0, 0.065)',
    zeroLine: isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.24)',
    axisText: isDark ? '#98989d' : '#6e6e73',
    curve: isDark ? '#0a84ff' : '#0071e3',
    barStroke: isDark ? 'rgba(10, 132, 255, 0.55)' : 'rgba(0, 113, 227, 0.45)',
    barStopTop: isDark ? '#0a84ff' : '#0071e3',
    barOpacityTop: isDark ? '0.28' : '0.18',
    barOpacityBottom: isDark ? '0.04' : '0.03',
    limitStroke: isDark ? 'rgba(245, 245, 247, 0.45)' : 'rgba(29, 29, 31, 0.4)',
    limitBg: isDark ? '#2c2c2e' : '#ffffff',
    limitBorder: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.1)',
    limitText: isDark ? '#f5f5f7' : '#1d1d1f',
    nodeFill: '#ffffff',
    nodeStroke: isDark ? '#0a84ff' : '#0071e3',
  };

  const chartData = useMemo(() => {
    if (!evaluator || !validBounds) return null;

    const samples = 260;
    const curvePoints = [];
    let minY = 0;
    let maxY = 0;

    for (let i = 0; i <= samples; i++) {
      const x = xMin + (i / samples) * (xMax - xMin);
      const y = evaluator(x);
      if (y !== null && Math.abs(y) < 1e6) {
        curvePoints.push({ x, y });
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (curvePoints.length < 2) return null;

    const ySpan = maxY - minY || 1;
    const yLow = minY - ySpan * 0.12;
    const yHigh = maxY + ySpan * 0.16;

    const toSvgX = (x) => margin.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toSvgY = (y) => margin.top + plotH - ((y - yLow) / (yHigh - yLow)) * plotH;
    const zeroY = toSvgY(0);

    const shapes = [];
    const nodes = [];

    if (algo === 'var' && Number(varAlgo) === 2) {
      const segs =
        adaptiveSegments && adaptiveSegments.length > 0
          ? adaptiveSegments
          : buildPreviewAdaptiveSegments(evaluator, low, high, eps);

      segs.slice(0, 120).forEach((seg, idx) => {
        const yVal = seg.y0 !== undefined ? seg.y0 : evaluator(seg.x0) ?? 0;
        const sx0 = toSvgX(seg.x0);
        const sx1 = toSvgX(seg.x1);
        const sy = toSvgY(yVal);
        shapes.push({
          key: `adapt-${idx}`,
          type: 'rect',
          x: Math.min(sx0, sx1),
          y: Math.min(sy, zeroY),
          w: Math.max(Math.abs(sx1 - sx0), 1),
          h: Math.abs(zeroY - sy),
        });
        nodes.push({ cx: sx0, cy: sy });
      });
    } else {
      const rawN = algo === 'const' ? parseInt(n, 10) || 10 : latestResult?.n || 16;
      const drawN = Math.min(Math.max(rawN, 1), 80);
      const effectiveN = Number(method) === 4 && algo === 'const' && drawN % 2 !== 0 ? drawN + 1 : drawN;
      const hStep = (high - low) / effectiveN;
      const activeMethod = algo === 'const' ? Number(method) : 1;

      if (activeMethod === 1 || activeMethod === 2) {
        for (let i = 0; i < effectiveN; i++) {
          const x0 = low + i * hStep;
          const x1 = x0 + hStep;
          const sampleX = activeMethod === 1 ? x0 : x1;
          const yVal = evaluator(sampleX) ?? 0;
          const sx0 = toSvgX(x0);
          const sx1 = toSvgX(x1);
          const sy = toSvgY(yVal);
          shapes.push({
            key: `rect-${i}`,
            type: 'rect',
            x: Math.min(sx0, sx1),
            y: Math.min(sy, zeroY),
            w: Math.max(Math.abs(sx1 - sx0), 1),
            h: Math.abs(zeroY - sy),
          });
          nodes.push({ cx: toSvgX(sampleX), cy: sy });
        }
      } else if (activeMethod === 3) {
        for (let i = 0; i < effectiveN; i++) {
          const x0 = low + i * hStep;
          const x1 = x0 + hStep;
          const y0 = evaluator(x0) ?? 0;
          const y1 = evaluator(x1) ?? 0;
          const sx0 = toSvgX(x0);
          const sx1 = toSvgX(x1);
          const sy0 = toSvgY(y0);
          const sy1 = toSvgY(y1);
          shapes.push({
            key: `trap-${i}`,
            type: 'polygon',
            points: `${sx0},${zeroY} ${sx0},${sy0} ${sx1},${sy1} ${sx1},${zeroY}`,
          });
          nodes.push({ cx: sx0, cy: sy0 });
          if (i === effectiveN - 1) nodes.push({ cx: sx1, cy: sy1 });
        }
      } else if (activeMethod === 4) {
        for (let i = 0; i < effectiveN; i += 2) {
          const x0 = low + i * hStep;
          const x1 = x0 + hStep;
          const x2 = x0 + 2 * hStep;
          const y0 = evaluator(x0) ?? 0;
          const y1 = evaluator(x1) ?? 0;
          const y2 = evaluator(x2) ?? 0;

          const polyPts = [];
          const subSteps = 16;
          for (let s = 0; s <= subSteps; s++) {
            const xt = x0 + (s / subSteps) * (x2 - x0);
            const l0 = ((xt - x1) * (xt - x2)) / ((x0 - x1) * (x0 - x2));
            const l1 = ((xt - x0) * (xt - x2)) / ((x1 - x0) * (x1 - x2));
            const l2 = ((xt - x0) * (xt - x1)) / ((x2 - x0) * (x2 - x1));
            const yt = y0 * l0 + y1 * l1 + y2 * l2;
            polyPts.push(`${toSvgX(xt)},${toSvgY(yt)}`);
          }

          const sx0 = toSvgX(x0);
          const sx2 = toSvgX(x2);
          shapes.push({
            key: `simp-${i}`,
            type: 'polygon',
            points: `${sx0},${zeroY} ${polyPts.join(' ')} ${sx2},${zeroY}`,
          });
          nodes.push({ cx: sx0, cy: toSvgY(y0) }, { cx: toSvgX(x1), cy: toSvgY(y1) });
          if (i + 2 >= effectiveN) nodes.push({ cx: sx2, cy: toSvgY(y2) });
        }
      }
    }

    const linePath = curvePoints
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(pt.x).toFixed(2)} ${toSvgY(pt.y).toFixed(2)}`)
      .join(' ');

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = yLow + t * (yHigh - yLow);
      return { val, y: toSvgY(val) };
    });

    const xTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = low + t * (high - low);
      return { val, x: toSvgX(val) };
    });

    return {
      toSvgX,
      toSvgY,
      zeroY,
      linePath,
      shapes,
      nodes,
      yTicks,
      xTicks,
    };
  }, [evaluator, validBounds, low, high, xMin, xMax, algo, method, varAlgo, n, eps, adaptiveSegments, latestResult]);

  const updatePointerX = (clientX, target) => {
    if (!chartData) return;
    const rect = target.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * width;
    if (relX < margin.left || relX > width - margin.right) {
      setHoverX(null);
      return;
    }
    const mathX = xMin + ((relX - margin.left) / plotW) * (xMax - xMin);
    setHoverX(mathX);
  };

  const hoverY = hoverX !== null && evaluator ? evaluator(hoverX) : null;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 4 выделенных KPI-виджета в стиле Apple Health / macOS Settings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Численный результат — Apple System Blue */}
        <div className="apple-kpi-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2.5">
            <span
              className="text-base font-medium leading-snug"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              Численный результат
            </span>
            <span
              className="apple-squircle-icon w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-serif italic shrink-0"
              style={{
                background: 'linear-gradient(180deg, #38a1ff 0%, #0071e3 100%)',
              }}
            >
              ∫
            </span>
          </div>
          <div className="mt-3.5">
            <div
              className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight truncate"
              style={{ color: 'var(--apple-blue)' }}
            >
              {latestResult ? latestResult.calcVal : '—'}
            </div>
            <div
              className="text-xs sm:text-sm mt-1 truncate"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              {latestResult ? latestResult.methodName : 'Ожидание расчёта'}
            </div>
          </div>
        </div>

        {/* 2. Точное (SymPy) — Apple System Indigo */}
        <div className="apple-kpi-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2.5">
            <span
              className="text-base font-medium leading-snug"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              Точное (SymPy)
            </span>
            <span
              className="apple-squircle-icon w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-mono font-semibold shrink-0"
              style={{
                background: 'linear-gradient(180deg, #7d7aff 0%, #5856d6 100%)',
              }}
            >
              =
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight truncate">
              {latestResult ? latestResult.exactVal : '—'}
            </div>
            <div
              className="text-xs sm:text-sm mt-1 truncate"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              Пределы [{a}; {b}]
            </div>
          </div>
        </div>

        {/* 3. Абс. погрешность — Apple System Green */}
        <div className="apple-kpi-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2.5">
            <span
              className="text-base font-medium leading-snug"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              Абс. погрешность
            </span>
            <span
              className="apple-squircle-icon w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-mono font-semibold shrink-0"
              style={{
                background: 'linear-gradient(180deg, #34d058 0%, #248a3d 100%)',
              }}
            >
              Δ
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight truncate">
              {latestResult ? latestResult.absErr : '—'}
            </div>
            <div
              className="text-xs sm:text-sm font-mono mt-1 truncate"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              {latestResult ? latestResult.step : `n = ${n}`}
            </div>
          </div>
        </div>

        {/* 4. Отн. погрешность — Apple System Orange */}
        <div className="apple-kpi-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2.5">
            <span
              className="text-base font-medium leading-snug"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              Отн. погрешность
            </span>
            <span
              className="apple-squircle-icon w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-mono font-semibold shrink-0"
              style={{
                background: 'linear-gradient(180deg, #ffab2e 0%, #ef8600 100%)',
              }}
            >
              %
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight truncate">
              {latestResult ? latestResult.relErr : '—'}
            </div>
            <div
              className="text-xs sm:text-sm mt-1 truncate"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              {latestResult ? latestResult.algo : 'Точность модели'}
            </div>
          </div>
        </div>
      </div>

      {/* Карточка интерактивного графика */}
      <section className="apple-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base font-semibold tracking-tight">
                График функции и разбиения
              </h2>
              <span
                className="text-xs font-mono px-2.5 py-0.5 rounded-lg truncate max-w-full"
                style={{
                  backgroundColor: 'var(--apple-well)',
                  color: 'var(--apple-blue)',
                }}
              >
                f(x) = {func || '...'}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--apple-text-secondary)' }}>
              Отрезок [{a}; {b}] •{' '}
              {algo === 'const'
                ? `Разбиений: n = ${n}`
                : Number(varAlgo) === 1
                ? `Метод Рунге (ε = ${eps})`
                : `Адаптивный шаг (ε = ${eps})`}
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-4 text-xs"
            style={{ color: 'var(--apple-text-secondary)' }}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-0.5 inline-block rounded-full"
                style={{ backgroundColor: 'var(--apple-blue)' }}
              />
              f(x)
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 inline-block rounded-[3px] border"
                style={{
                  backgroundColor: 'var(--apple-blue-tint)',
                  borderColor: 'var(--apple-blue)',
                }}
              />
              Площадь Sᵢ
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-0.5 border-b border-dashed inline-block"
                style={{ borderColor: 'var(--apple-text-secondary)' }}
              />
              Пределы a, b
            </span>
          </div>
        </div>

        <div className="w-full">
          {chartData ? (
            <div className="relative select-none apple-canvas rounded-xl overflow-hidden">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto block touch-pan-y"
                onMouseMove={(e) => updatePointerX(e.clientX, e.currentTarget)}
                onMouseLeave={() => setHoverX(null)}
                onTouchMove={(e) => {
                  if (e.touches?.[0]) updatePointerX(e.touches[0].clientX, e.currentTarget);
                }}
                onTouchEnd={() => setHoverX(null)}
              >
                <defs>
                  <linearGradient id="apple-bar-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.barStopTop} stopOpacity={colors.barOpacityTop} />
                    <stop offset="100%" stopColor={colors.barStopTop} stopOpacity={colors.barOpacityBottom} />
                  </linearGradient>
                </defs>

                {/* Горизонтальные линии сетки */}
                {chartData.yTicks.map((t, i) => (
                  <g key={`ytick-${i}`}>
                    <line
                      x1={margin.left}
                      y1={t.y}
                      x2={width - margin.right}
                      y2={t.y}
                      stroke={colors.grid}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={margin.left - 10}
                      y={t.y + 4}
                      textAnchor="end"
                      fill={colors.axisText}
                      style={{ fontSize: '12.5px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                    >
                      {t.val.toFixed(2)}
                    </text>
                  </g>
                ))}

                {/* Деления по оси X */}
                {chartData.xTicks.map((t, i) => (
                  <g key={`xtick-${i}`}>
                    <line
                      x1={t.x}
                      y1={margin.top}
                      x2={t.x}
                      y2={height - margin.bottom}
                      stroke={colors.grid}
                    />
                    <text
                      x={t.x}
                      y={height - margin.bottom + 22}
                      textAnchor="middle"
                      fill={colors.axisText}
                      style={{ fontSize: '12.5px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                    >
                      {t.val.toFixed(2)}
                    </text>
                  </g>
                ))}

                {/* Ось Y = 0 */}
                {chartData.zeroY >= margin.top && chartData.zeroY <= height - margin.bottom && (
                  <line
                    x1={margin.left}
                    y1={chartData.zeroY}
                    x2={width - margin.right}
                    y2={chartData.zeroY}
                    stroke={colors.zeroLine}
                    strokeWidth="1.25"
                  />
                )}

                {/* Фигуры аппроксимации */}
                {chartData.shapes.map((s) =>
                  s.type === 'rect' ? (
                    <rect
                      key={s.key}
                      x={s.x}
                      y={s.y}
                      width={s.w}
                      height={s.h}
                      fill="url(#apple-bar-fill)"
                      stroke={colors.barStroke}
                      strokeWidth="1"
                    />
                  ) : (
                    <polygon
                      key={s.key}
                      points={s.points}
                      fill="url(#apple-bar-fill)"
                      stroke={colors.barStroke}
                      strokeWidth="1"
                    />
                  )
                )}

                {/* Вертикальные линии пределов интегрирования a и b */}
                {[
                  { label: `a = ${numA}`, val: numA },
                  { label: `b = ${numB}`, val: numB },
                ].map((lim, idx) => {
                  const lx = chartData.toSvgX(lim.val);
                  return (
                    <g key={`lim-${idx}`}>
                      <line
                        x1={lx}
                        y1={margin.top}
                        x2={lx}
                        y2={height - margin.bottom}
                        stroke={colors.limitStroke}
                        strokeWidth="1.25"
                        strokeDasharray="4 4"
                      />
                      <rect
                        x={lx - 36}
                        y={margin.top - 26}
                        width="72"
                        height="20"
                        rx="6"
                        fill={colors.limitBg}
                        stroke={colors.limitBorder}
                      />
                      <text
                        x={lx}
                        y={margin.top - 12}
                        textAnchor="middle"
                        fill={colors.limitText}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        {lim.label}
                      </text>
                    </g>
                  );
                })}

                {/* Непрерывная линия функции f(x) */}
                <path
                  d={chartData.linePath}
                  fill="none"
                  stroke={colors.curve}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Точки узлов */}
                {chartData.nodes.length <= 60 &&
                  chartData.nodes.map((pt, i) => (
                    <circle
                      key={`node-${i}`}
                      cx={pt.cx}
                      cy={pt.cy}
                      r="2.8"
                      fill={colors.nodeFill}
                      stroke={colors.nodeStroke}
                      strokeWidth="1.5"
                    />
                  ))}

                {/* Интерактивное перекрестие */}
                {hoverX !== null && hoverY !== null && (
                  <g>
                    <line
                      x1={chartData.toSvgX(hoverX)}
                      y1={margin.top}
                      x2={chartData.toSvgX(hoverX)}
                      y2={height - margin.bottom}
                      stroke={colors.limitStroke}
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={chartData.toSvgX(hoverX)}
                      cy={chartData.toSvgY(hoverY)}
                      r="4.5"
                      fill={colors.curve}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>

              {hoverX !== null && hoverY !== null && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 apple-card text-xs font-mono tabular-nums px-3.5 py-1.5 rounded-lg pointer-events-none flex items-center gap-2.5 whitespace-nowrap">
                  <span style={{ color: 'var(--apple-text-secondary)' }}>
                    x = {hoverX.toFixed(4)}
                  </span>
                  <span style={{ color: 'var(--apple-border-strong)' }}>|</span>
                  <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    f(x) = {hoverY.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="h-64 rounded-xl apple-canvas flex items-center justify-center px-4 text-center text-sm"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              Введите корректную функцию f(x) и различные пределы a ≠ b для отображения графика
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
