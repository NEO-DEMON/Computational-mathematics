import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  solveOdeFirst,
  matchOdeFirst,
  solveOdeSecond,
  solveOdeSystem,
  formatMathFormula,
  getStatusMeta,
  computeStatusMap,
  computeSummaryStats,
  exportRowsToCsv,
} from '../api';

const PRESETS_ODE1 = [
  {
    label: 'КП №1: y·(1 − x)',
    desc: 'Контрольный пример 1 (методичка, [0; 1], y(0)=1, n=10)',
    func: 'y * (1 - x)',
    x0: 0,
    y0: 1,
    b: 1,
    n: 10,
  },
  {
    label: 'Конспект: x + y',
    desc: 'Задача из конспекта (п. 8–10, [0; 0.4], y(0)=1, h=0.1)',
    func: 'x + y',
    x0: 0,
    y0: 1,
    b: 0.4,
    n: 4,
  },
  {
    label: 'Лекция 1: y + x²',
    desc: 'Пример 1 из лекции ([0; 0.5], y(0)=1, h=0.1)',
    func: 'y + x^2',
    x0: 0,
    y0: 1,
    b: 0.5,
    n: 5,
  },
  {
    label: 'Лекция 2: y − x²',
    desc: 'Пример 2 из лекции ([1; 2], y(1)=0, h=0.1)',
    func: 'y - x^2',
    x0: 1,
    y0: 0,
    b: 2,
    n: 10,
  },
  {
    label: 'Теория: −y / x',
    desc: 'Пример из лекции ([2; 4], y(2)=1, точное y = 2/x)',
    func: '-y / x',
    x0: 2,
    y0: 1,
    b: 4,
    n: 10,
  },
];

const PRESETS_ODE2 = [
  {
    label: 'КП №2 (n = 10, h = 0.05)',
    desc: "Контрольный пример 2: y'' + y'/x + y = 0 на [1; 1.5], 10 частей",
    func: '-z / x - y',
    x0: 1,
    y0: 0.77,
    z0: -0.44,
    b: 1.5,
    n: 10,
  },
  {
    label: 'КП №2 (n = 5, h = 0.1)',
    desc: "Контрольный пример 2: y'' + y'/x + y = 0 на [1; 1.5], шаг h = 0.1",
    func: '-z / x - y',
    x0: 1,
    y0: 0.77,
    z0: -0.44,
    b: 1.5,
    n: 5,
  },
  {
    label: "Осциллятор: y'' + y = 0",
    desc: 'Гармонические колебания на [0; 3.14], y(0)=1, y\'(0)=0',
    func: '-y',
    x0: 0,
    y0: 1,
    z0: 0,
    b: 3.14,
    n: 10,
  },
];

const PRESETS_SYS3 = [
  {
    label: 'КП №3 (п. 7.1): n = 10 (h = 0.03)',
    desc: 'Контрольный пример 3 на [0; 0.3], разбиение на 10 частей',
    f1: '-2*x + 5*z',
    f2: 'sin(t - 1)*x - y + 3*z',
    f3: '-x + 2*z',
    t0: 0,
    x0: 2,
    y0: 1,
    z0: 1,
    b: 0.3,
    n: 10,
  },
  {
    label: 'КП №3 (п. 3.4): n = 100 (h = 0.003)',
    desc: 'Контрольный пример 3 на [0; 0.3], шаг уменьшен в 10 раз (h = 0.003)',
    f1: '-2*x + 5*z',
    f2: 'sin(t - 1)*x - y + 3*z',
    f3: '-x + 2*z',
    t0: 0,
    x0: 2,
    y0: 1,
    z0: 1,
    b: 0.3,
    n: 100,
  },
];

export default function OdeWorkspace({ theme = 'dark', odeMethod, setOdeMethod }) {
  const [problemType, setProblemType] = useState('ode1'); // 'ode1' | 'ode2' | 'system3'

  // Состояние для ОДУ 1-го порядка
  const [func1, setFunc1] = useState('y * (1 - x)');
  const [x0_1, setX0_1] = useState(0);
  const [y0_1, setY0_1] = useState(1);
  const [b_1, setB_1] = useState(1);
  const [n_1, setN_1] = useState(10);

  // Состояние для ОДУ 2-го порядка (y' = z, z' = f(x, y, z))
  const [func2, setFunc2] = useState('-z / x - y');
  const [x0_2, setX0_2] = useState(1);
  const [y0_2, setY0_2] = useState(0.77);
  const [z0_2, setZ0_2] = useState(-0.44);
  const [b_2, setB_2] = useState(1.5);
  const [n_2, setN_2] = useState(10);

  // Состояние для Системы 3-х ОДУ
  const [f1Sys, setF1Sys] = useState('-2*x + 5*z');
  const [f2Sys, setF2Sys] = useState('sin(t - 1)*x - y + 3*z');
  const [f3Sys, setF3Sys] = useState('-x + 2*z');
  const [t0Sys, setT0Sys] = useState(0);
  const [x0Sys, setX0Sys] = useState(2);
  const [y0Sys, setY0Sys] = useState(1);
  const [z0Sys, setZ0Sys] = useState(1);
  const [bSys, setBSys] = useState(0.3);
  const [nSys, setNSys] = useState(10);

  const [currentSolution, setCurrentSolution] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchNotice, setMatchNotice] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [sysComp, setSysComp] = useState('x'); // 'x' | 'y' | 'z' для графика системы 3-х ОДУ
  const [isJournalExpanded, setIsJournalExpanded] = useState(false);
  const [isNodesExpanded, setIsNodesExpanded] = useState(false);

  useEffect(() => {
    if (!isJournalExpanded && !isNodesExpanded) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsJournalExpanded(false);
        setIsNodesExpanded(false);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isJournalExpanded, isNodesExpanded]);

  const isPresetActive = (p) => {
    if (problemType === 'ode1') {
      return (
        func1.trim() === p.func.trim() &&
        Number(x0_1) === Number(p.x0) &&
        Number(y0_1) === Number(p.y0) &&
        Number(b_1) === Number(p.b) &&
        Number(n_1) === Number(p.n)
      );
    }
    if (problemType === 'ode2') {
      return (
        func2.trim() === p.func.trim() &&
        Number(x0_2) === Number(p.x0) &&
        Number(y0_2) === Number(p.y0) &&
        Number(z0_2) === Number(p.z0) &&
        Number(b_2) === Number(p.b) &&
        Number(n_2) === Number(p.n)
      );
    }
    return (
      f1Sys.trim() === p.f1.trim() &&
      f2Sys.trim() === p.f2.trim() &&
      f3Sys.trim() === p.f3.trim() &&
      Number(t0Sys) === Number(p.t0) &&
      Number(x0Sys) === Number(p.x0) &&
      Number(y0Sys) === Number(p.y0) &&
      Number(z0Sys) === Number(p.z0) &&
      Number(bSys) === Number(p.b) &&
      Number(nSys) === Number(p.n)
    );
  };

  // Классифицируем записи журнала ОДУ на Лучший / Средний / Худший внутри одной и той же задачи
  const historyStatusMap = React.useMemo(
    () =>
      computeStatusMap(
        history,
        (r) => `${r.typeLabel}|${r.equation}|${r.interval}`,
        (r) => {
          const err = Number(r.rawAbsErr) || 0;
          return err < 1e-3 ? 'best' : err < 5e-2 ? 'medium' : 'worst';
        }
      ),
    [history]
  );

  const summaryStats = React.useMemo(
    () => computeSummaryStats(history, historyStatusMap),
    [history, historyStatusMap]
  );

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = [
      'Оценка',
      'Тип задачи',
      'Метод',
      'Уравнение',
      'Интервал и НУ',
      'Сетка',
      'Численное в b',
      'Эталон в b',
      'Макс. абс. погр.',
    ];
    const rows = history.map((r) => {
      const meta = getStatusMeta(historyStatusMap[r.id]);
      return [
        `"${meta.label}"`,
        `"${r.typeLabel}"`,
        `"${r.methodName}"`,
        `"${(r.equation || '').replace(/"/g, '""')}"`,
        `"${(r.interval || '').replace(/"/g, '""')}"`,
        `"${r.stepInfo}"`,
        `"${r.endVal}"`,
        `"${r.exactVal}"`,
        r.absErr,
      ];
    });
    exportRowsToCsv('ode_calculations', headers, rows);
  };

  const buildHistoryRow = (data) => {
    if (data.problem_type === 'ode1') {
      return {
        id: Date.now() + Math.random(),
        typeLabel: 'ОДУ 1-го порядка',
        methodName: data.method_name,
        equation: `y' = ${formatMathFormula(data.func)}`,
        interval: `[${data.x0}; ${data.b}], y(${data.x0})=${data.y0}`,
        stepInfo: `n=${data.n} (h=${data.h.toFixed(4)})`,
        endVal: `y(${data.b}) = ${data.y_end.toFixed(6)}`,
        exactVal: `y(${data.b}) = ${data.y_end_exact.toFixed(6)}`,
        absErr: data.max_abs_err.toExponential(4),
        rawAbsErr: data.max_abs_err,
      };
    }
    if (data.problem_type === 'ode2') {
      return {
        id: Date.now() + Math.random(),
        typeLabel: 'ОДУ 2-го порядка',
        methodName: data.method_name,
        equation: `y'' = ${formatMathFormula(data.func)}`,
        interval: `[${data.x0}; ${data.b}], y=${data.y0}, y'=${data.z0}`,
        stepInfo: `n=${data.n} (h=${data.h.toFixed(4)})`,
        endVal: `y(${data.b}) = ${data.y_end.toFixed(6)}`,
        exactVal: `y(${data.b}) = ${data.y_end_exact.toFixed(6)}`,
        absErr: data.max_abs_err.toExponential(4),
        rawAbsErr: data.max_abs_err,
      };
    }
    return {
      id: Date.now() + Math.random(),
      typeLabel: 'Система 3-х ОДУ',
      methodName: data.method_name,
      equation: `x'=${formatMathFormula(data.f1)}; y'=${formatMathFormula(data.f2)}; z'=${formatMathFormula(data.f3)}`,
      interval: `[${data.t0}; ${data.b}]`,
      stepInfo: `n=${data.n} (h=${data.h.toFixed(4)})`,
      endVal: `x=${data.x_end.toFixed(4)}, y=${data.y_end.toFixed(4)}, z=${data.z_end.toFixed(4)}`,
      exactVal: `x=${data.x_end_exact.toFixed(4)}, y=${data.y_end_exact.toFixed(4)}, z=${data.z_end_exact.toFixed(4)}`,
      absErr: data.max_abs_err.toExponential(4),
      rawAbsErr: data.max_abs_err,
    };
  };

  const handleSolve = async (
    overrideMethod = null,
    overrideN = null,
    recordHistory = true,
    overridePreset = null
  ) => {
    const activeMethod = overrideMethod || odeMethod;
    setLoading(true);
    setError(null);
    setMatchNotice(null);
    try {
      let data;
      if (problemType === 'ode1') {
        const p = overridePreset || { func: func1, x0: x0_1, y0: y0_1, b: b_1, n: overrideN ?? n_1 };
        data = await solveOdeFirst({
          func: p.func,
          x0: p.x0,
          y0: p.y0,
          b: p.b,
          n: p.n,
          method: activeMethod,
        });
      } else if (problemType === 'ode2') {
        const p = overridePreset || { func: func2, x0: x0_2, y0: y0_2, z0: z0_2, b: b_2, n: overrideN ?? n_2 };
        data = await solveOdeSecond({
          func: p.func,
          x0: p.x0,
          y0: p.y0,
          z0: p.z0,
          b: p.b,
          n: p.n,
          method: activeMethod,
        });
      } else {
        const p = overridePreset || {
          f1: f1Sys,
          f2: f2Sys,
          f3: f3Sys,
          t0: t0Sys,
          x0: x0Sys,
          y0: y0Sys,
          z0: z0Sys,
          b: bSys,
          n: overrideN ?? nSys,
        };
        data = await solveOdeSystem({
          f1: p.f1,
          f2: p.f2,
          f3: p.f3,
          t0: p.t0,
          x0: p.x0,
          y0: p.y0,
          z0: p.z0,
          b: p.b,
          n: p.n,
          method: activeMethod,
        });
      }
      setCurrentSolution(data);
      if (recordHistory) {
        setHistory((prev) => [buildHistoryRow(data), ...prev]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareBoth = async () => {
    setLoading(true);
    setError(null);
    setMatchNotice(null);
    try {
      let resEuler, resRk4;
      if (problemType === 'ode1') {
        resEuler = await solveOdeFirst({ func: func1, x0: x0_1, y0: y0_1, b: b_1, n: n_1, method: 'euler' });
        resRk4 = await solveOdeFirst({ func: func1, x0: x0_1, y0: y0_1, b: b_1, n: n_1, method: 'rk4' });
      } else if (problemType === 'ode2') {
        resEuler = await solveOdeSecond({ func: func2, x0: x0_2, y0: y0_2, z0: z0_2, b: b_2, n: n_2, method: 'euler' });
        resRk4 = await solveOdeSecond({ func: func2, x0: x0_2, y0: y0_2, z0: z0_2, b: b_2, n: n_2, method: 'rk4' });
      } else {
        resEuler = await solveOdeSystem({ f1: f1Sys, f2: f2Sys, f3: f3Sys, t0: t0Sys, x0: x0Sys, y0: y0Sys, z0: z0Sys, b: bSys, n: nSys, method: 'euler' });
        resRk4 = await solveOdeSystem({ f1: f1Sys, f2: f2Sys, f3: f3Sys, t0: t0Sys, x0: x0Sys, y0: y0Sys, z0: z0Sys, b: bSys, n: nSys, method: 'rk4' });
      }
      const shown = odeMethod === 'euler' ? resEuler : resRk4;
      setCurrentSolution(shown);
      setHistory((prev) => [buildHistoryRow(resRk4), buildHistoryRow(resEuler), ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchEuler = async () => {
    setLoading(true);
    setError(null);
    setMatchNotice(null);
    try {
      if (problemType === 'ode1') {
        const data = await matchOdeFirst({
          func: func1,
          x0: x0_1,
          y0: y0_1,
          b: b_1,
          n_rk4: 10,
          target_diff: 0.001,
        });
        setOdeMethod('euler');
        setN_1(data.matched_n);
        setCurrentSolution(data);
        setMatchNotice(
          data.converged !== false
            ? `Пункт 3.4 выполнен: при n = ${data.matched_n} (шаг h = ${data.h.toFixed(5)}) решение методом Эйлера сближается с методом Рунге — Кутта (n=10) с точностью max |Δ| = ${data.matched_diff.toExponential(3)}.`
            : `Достигнут предел дробления сетки n = ${data.matched_n} (шаг h = ${data.h.toFixed(5)}): текущее расхождение max |Δ| = ${data.matched_diff.toExponential(3)} (цель ${data.target_diff}).`
        );
        setHistory((prev) => [buildHistoryRow(data), ...prev]);
      } else if (problemType === 'ode2') {
        // Для ОДУ 2-го порядка увеличиваем разбиение до n = 200 для сближения Эйлера с РК4
        const targetN = 200;
        setOdeMethod('euler');
        setN_2(targetN);
        const data = await solveOdeSecond({
          func: func2,
          x0: x0_2,
          y0: y0_2,
          z0: z0_2,
          b: b_2,
          n: targetN,
          method: 'euler',
        });
        setCurrentSolution(data);
        setMatchNotice(
          `Пункт 3.4 выполнен: при увеличении разбиения до n = ${targetN} (h = ${data.h.toFixed(5)}) отклонение метода Эйлера от эталона Рунге — Кутта снижено до ${data.max_abs_err.toExponential(3)}.`
        );
        setHistory((prev) => [buildHistoryRow(data), ...prev]);
      } else {
        // Для системы ОДУ (п. 3.4 методички: уменьшить шаг в 10 раз -> n = 100, h = 0.003)
        const targetN = 100;
        setOdeMethod('euler');
        setNSys(targetN);
        const data = await solveOdeSystem({
          f1: f1Sys,
          f2: f2Sys,
          f3: f3Sys,
          t0: t0Sys,
          x0: x0Sys,
          y0: y0Sys,
          z0: z0Sys,
          b: bSys,
          n: targetN,
          method: 'euler',
        });
        setCurrentSolution(data);
        setMatchNotice(
          `Пункт 3.4 выполнен: шаг уменьшен в 10 раз (n = ${targetN}, h = ${data.h.toFixed(4)}). Погрешность метода Эйлера уменьшилась до ${data.max_abs_err.toExponential(3)}.`
        );
        setHistory((prev) => [buildHistoryRow(data), ...prev]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Автоматический первичный расчёт при переключении типа задачи или метода без засорения журнала
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        handleSolve(odeMethod, null, false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemType, odeMethod]);

  const applyPreset = (preset) => {
    if (problemType === 'ode1') {
      setFunc1(preset.func);
      setX0_1(preset.x0);
      setY0_1(preset.y0);
      setB_1(preset.b);
      setN_1(preset.n);
    } else if (problemType === 'ode2') {
      setFunc2(preset.func);
      setX0_2(preset.x0);
      setY0_2(preset.y0);
      setZ0_2(preset.z0);
      setB_2(preset.b);
      setN_2(preset.n);
    } else {
      setF1Sys(preset.f1);
      setF2Sys(preset.f2);
      setF3Sys(preset.f3);
      setT0Sys(preset.t0);
      setX0Sys(preset.x0);
      setY0Sys(preset.y0);
      setZ0Sys(preset.z0);
      setBSys(preset.b);
      setNSys(preset.n);
    }
    handleSolve(odeMethod, preset.n, false, preset);
  };

  const activePresets =
    problemType === 'ode1'
      ? PRESETS_ODE1
      : problemType === 'ode2'
      ? PRESETS_ODE2
      : PRESETS_SYS3;

  const displayedNodes = currentSolution?.nodes ? currentSolution.nodes.slice(0, 200) : [];
  const isDark = theme === 'dark';

  // Подготовка данных для SVG-графика траекторий ОДУ
  const odeChart = React.useMemo(() => {
    if (!currentSolution || !currentSolution.nodes || currentSolution.nodes.length < 2) {
      return null;
    }
    const width = 860;
    const height = 370;
    const margin = { top: 36, right: 32, bottom: 40, left: 60 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const isSys = currentSolution.problem_type === 'system3';
    const dense = currentSolution.dense_curve || [];
    const nodes = currentSolution.nodes;
    const comp = isSys ? sysComp : 'y';

    const getX = (pt) => (isSys ? pt.t : pt.x);
    const getExactY = (pt) => (isSys ? pt[comp] : pt.y);
    const getNodeEulerY = (n) => (isSys ? n[`${comp}_euler`] : n.y_euler);
    const getNodeRk4Y = (n) => (isSys ? n[`${comp}_rk4`] : n.y_rk4);
    const getNodeExactY = (n) => (isSys ? n[`${comp}_exact`] : n.y_exact);

    const xVals = nodes.map(getX);
    const xMin = Math.min(...xVals);
    const xMax = Math.max(...xVals);
    const xSpan = xMax - xMin || 1;

    let yMin = Infinity;
    let yMax = -Infinity;
    const considerY = (v) => {
      if (Number.isFinite(v) && Math.abs(v) < 1e6) {
        if (v < yMin) yMin = v;
        if (v > yMax) yMax = v;
      }
    };

    dense.forEach((pt) => considerY(getExactY(pt)));
    nodes.forEach((n) => {
      considerY(getNodeEulerY(n));
      considerY(getNodeRk4Y(n));
      considerY(getNodeExactY(n));
    });

    if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) return null;
    const ySpan = yMax - yMin || 1;
    const yLow = yMin - ySpan * 0.14;
    const yHigh = yMax + ySpan * 0.16;

    const toSvgX = (x) => margin.left + ((x - xMin) / xSpan) * plotW;
    const toSvgY = (y) => margin.top + plotH - ((y - yLow) / (yHigh - yLow)) * plotH;

    const buildPath = (pts, yGetter) =>
      pts
        .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(getX(pt)).toFixed(2)} ${toSvgY(yGetter(pt)).toFixed(2)}`)
        .join(' ');

    const exactPath = dense.length > 1 ? buildPath(dense, getExactY) : '';
    const eulerPath = buildPath(nodes, getNodeEulerY);
    const rk4Path = buildPath(nodes, getNodeRk4Y);

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = yLow + t * (yHigh - yLow);
      return { val, y: toSvgY(val) };
    });
    const xTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = xMin + t * xSpan;
      return { val, x: toSvgX(val) };
    });

    const markerStep = nodes.length <= 45 ? 1 : Math.ceil(nodes.length / 40);
    const nodeMarkers = nodes
      .map((n, idx) => ({
        idx,
        i: n.i,
        xVal: getX(n),
        svgX: toSvgX(getX(n)),
        eulerY: getNodeEulerY(n),
        svgEulerY: toSvgY(getNodeEulerY(n)),
        rk4Y: getNodeRk4Y(n),
        svgRk4Y: toSvgY(getNodeRk4Y(n)),
        exactY: getNodeExactY(n),
        svgExactY: toSvgY(getNodeExactY(n)),
      }))
      .filter((m, idx) => idx % markerStep === 0 || idx === nodes.length - 1 || idx === hoverIndex);

    return {
      width,
      height,
      margin,
      exactPath,
      eulerPath,
      rk4Path,
      yTicks,
      xTicks,
      toSvgX,
      toSvgY,
      isSys,
      comp,
      nodeMarkers,
      getX,
      getNodeEulerY,
      getNodeRk4Y,
      getNodeExactY,
    };
  }, [currentSolution, sysComp, hoverIndex]);

  const hoveredNode =
    hoverIndex !== null && displayedNodes[hoverIndex] ? displayedNodes[hoverIndex] : null;

  const renderNodesTable = (inModal = false) => {
    if (!currentSolution) return null;
    const rowsToRender = inModal ? currentSolution.nodes : displayedNodes;
    const thPad = inModal ? 'px-5 py-3.5' : 'px-4 py-3';
    const thMidPad = inModal ? 'px-4 py-3.5' : 'px-4 py-3';
    const tdFirstPad = inModal ? 'px-5 py-2.5' : 'px-4 py-2.5';

    return (
      <div
        className={`overflow-x-auto overflow-y-auto apple-scroll ${
          inModal ? 'flex-1' : 'h-80'
        }`}
      >
        <table
          className={`w-full ${
            inModal ? 'text-xs sm:text-sm' : 'text-xs'
          } font-mono text-left border-collapse tabular-nums`}
        >
          <thead
            className="sticky top-0 z-10 border-b"
            style={{
              backgroundColor: 'var(--apple-kpi-bg)',
              borderColor: 'var(--apple-border)',
              color: 'var(--apple-text-secondary)',
            }}
          >
            <tr>
              <th className={`${thPad} whitespace-nowrap`}>i</th>
              <th className={`${thMidPad} whitespace-nowrap`}>
                {currentSolution.problem_type === 'system3' ? 'tᵢ' : 'xᵢ'}
              </th>
              <th className={`${thMidPad} whitespace-nowrap`}>
                {currentSolution.problem_type === 'system3' ? 'xᵢ' : 'yᵢ (шаг h)'}
              </th>
              {currentSolution.problem_type !== 'system3' && (
                <th className={`${thMidPad} whitespace-nowrap`}>yᵢ (шаг h/2)</th>
              )}
              {currentSolution.problem_type === 'ode2' && (
                <th className={`${thMidPad} whitespace-nowrap`}>y&apos;ᵢ = zᵢ</th>
              )}
              <th className={`${thMidPad} whitespace-nowrap`}>
                {currentSolution.problem_type === 'system3' ? 'yᵢ' : 'yᵢ (Эйлер)'}
              </th>
              <th className={`${thMidPad} whitespace-nowrap`}>
                {currentSolution.problem_type === 'system3' ? 'zᵢ' : 'yᵢ (РК4)'}
              </th>
              <th className={`${thMidPad} whitespace-nowrap`}>Эталон</th>
              {currentSolution.problem_type !== 'system3' && (
                <th className={`${thMidPad} whitespace-nowrap`}>Рунге</th>
              )}
              <th className={`${thMidPad} whitespace-nowrap`}>|Δᵢ|</th>
            </tr>
          </thead>
          <tbody>
            {rowsToRender.map((node, idx) => {
              const isHovered = !inModal && hoverIndex === idx;
              return (
                <tr
                  key={node.i}
                  onMouseEnter={inModal ? undefined : () => setHoverIndex(idx)}
                  onMouseLeave={inModal ? undefined : () => setHoverIndex(null)}
                  className="border-b last:border-b-0 transition-colors"
                  style={{
                    borderColor: 'var(--apple-border)',
                    backgroundColor: isHovered ? 'var(--apple-blue-tint)' : 'transparent',
                  }}
                >
                  <td className={`${tdFirstPad} whitespace-nowrap`}>{node.i}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{(node.x ?? node.t).toFixed(4)}</td>
                  <td
                    className="px-4 py-2.5 font-semibold whitespace-nowrap"
                    style={{ color: 'var(--apple-blue)' }}
                  >
                    {(currentSolution.problem_type === 'system3' ? node.x : node.y).toFixed(6)}
                  </td>
                  {currentSolution.problem_type !== 'system3' && (
                    <td
                      className="px-4 py-2.5 whitespace-nowrap"
                      style={{ color: 'var(--apple-text-secondary)' }}
                    >
                      {node.y_half !== undefined ? node.y_half.toFixed(6) : '—'}
                    </td>
                  )}
                  {currentSolution.problem_type === 'ode2' && (
                    <td
                      className="px-4 py-2.5 whitespace-nowrap"
                      style={{ color: 'var(--apple-text-secondary)' }}
                    >
                      {node.z !== undefined ? node.z.toFixed(6) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {(currentSolution.problem_type === 'system3' ? node.y : node.y_euler).toFixed(6)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {(currentSolution.problem_type === 'system3' ? node.z : node.y_rk4).toFixed(6)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {(currentSolution.problem_type === 'system3' ? node.x_exact : node.y_exact).toFixed(6)}
                  </td>
                  {currentSolution.problem_type !== 'system3' && (
                    <td
                      className="px-4 py-2.5 whitespace-nowrap"
                      style={{ color: 'var(--apple-text-secondary)' }}
                    >
                      {node.runge_err !== undefined ? node.runge_err.toExponential(3) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-2.5 whitespace-nowrap">{node.abs_err.toExponential(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderJournalTable = (inModal = false) => (
    <div
      className={`overflow-x-auto overflow-y-auto apple-scroll ${
        inModal ? 'flex-1' : 'h-72 rounded-b-2xl'
      }`}
    >
      <table className="w-full min-w-[50rem] text-sm text-left border-collapse">
        <thead
          className="text-xs font-medium border-b sticky top-0 z-10"
          style={{
            backgroundColor: 'var(--apple-kpi-bg)',
            borderColor: 'var(--apple-border)',
            color: 'var(--apple-text-secondary)',
          }}
        >
          <tr>
            <th className="px-5 py-3.5 whitespace-nowrap">Метод / Класс ОДУ</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Оценка</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Задача Коши</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Сетка</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Численное в b</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Эталон в b</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Макс. |Δ|</th>
            <th className="px-4 py-3.5 w-10 whitespace-nowrap"></th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {history.map((hRow) => {
            const meta = getStatusMeta(historyStatusMap[hRow.id]);
            return (
              <tr
                key={hRow.id}
                className="border-b last:border-b-0 transition-colors"
                style={{
                  borderColor: 'var(--apple-border)',
                  backgroundColor: meta.rowBg,
                }}
              >
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="font-medium whitespace-nowrap">{hRow.methodName}</div>
                  <div
                    className="text-xs mt-0.5 whitespace-nowrap"
                    style={{ color: 'var(--apple-text-secondary)' }}
                  >
                    {hRow.typeLabel}
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span
                    className="inline-flex items-center justify-center min-w-[5.25rem] text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap"
                    style={meta.badgeStyle}
                  >
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                  <div className="whitespace-nowrap">{hRow.equation}</div>
                  <div
                    className="text-xs whitespace-nowrap"
                    style={{ color: 'var(--apple-text-secondary)' }}
                  >
                    {hRow.interval}
                  </div>
                </td>
                <td
                  className="px-4 py-3.5 font-mono text-xs whitespace-nowrap"
                  style={{ color: 'var(--apple-text-secondary)' }}
                >
                  {hRow.stepInfo}
                </td>
                <td
                  className="px-4 py-3.5 font-mono text-xs font-semibold whitespace-nowrap"
                  style={{ color: 'var(--apple-blue)' }}
                >
                  {hRow.endVal}
                </td>
                <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                  {hRow.exactVal}
                </td>
                <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                  <span
                    className="px-2.5 py-1 rounded-lg font-medium inline-block whitespace-nowrap"
                    style={meta.badgeStyle}
                  >
                    {hRow.absErr}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() =>
                      setHistory((prev) => prev.filter((item) => item.id !== hRow.id))
                    }
                    title="Удалить строку"
                    className="px-1.5 py-0.5 rounded hover:opacity-75 cursor-pointer"
                    style={{ color: 'var(--apple-text-secondary)' }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
      <div className="lg:col-span-4 lg:sticky lg:top-6">
        <section className="apple-card rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Задача Коши для ОДУ</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--apple-text-secondary)' }}>
              Методы Эйлера и Рунге — Кутта 4-го порядка
            </p>
          </div>

          <div className="apple-segmented grid grid-cols-3 gap-1">
            {[
              { id: 'ode1', label: 'ОДУ 1-го пор.' },
              { id: 'ode2', label: 'ОДУ 2-го пор.' },
              { id: 'system3', label: 'Система 3-х' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProblemType(tab.id)}
                className={`px-2 py-2 text-xs cursor-pointer ${
                  problemType === tab.id
                    ? 'apple-segmented-item apple-segmented-item-active'
                    : 'apple-segmented-item'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              Численный метод
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'euler',
                  name: 'Метод Эйлера',
                  badge: 'O(h)',
                  desc: 'Явная схема 1-го порядка: yᵢ₊₁ = yᵢ + h·f(xᵢ, yᵢ)',
                },
                {
                  id: 'rk4',
                  name: 'Метод Рунге — Кутта 4',
                  badge: 'O(h⁴)',
                  desc: 'Классическая схема 4-го порядка: (k₁ + 2k₂ + 2k₃ + k₄) / 6',
                },
              ].map((m) => {
                const active = odeMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setOdeMethod(m.id)}
                    style={{
                      backgroundColor: active ? 'var(--apple-blue-tint)' : 'var(--apple-well)',
                      borderColor: active ? 'var(--apple-blue)' : 'var(--apple-border)',
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div
                        className="text-xs sm:text-sm font-medium truncate"
                        style={{ color: active ? 'var(--apple-blue)' : 'var(--apple-text)' }}
                      >
                        {m.name}
                      </div>
                      <div
                        className="text-xs font-mono truncate mt-0.5"
                        style={{ color: 'var(--apple-text-secondary)' }}
                      >
                        {m.desc}
                      </div>
                    </div>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-md shrink-0 font-semibold"
                      style={{
                        backgroundColor: active ? 'var(--apple-blue)' : 'var(--apple-segmented-bg)',
                        color: active ? '#ffffff' : 'var(--apple-text-secondary)',
                      }}
                    >
                      {m.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-[32.25rem] flex flex-col justify-between gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--apple-text-secondary)' }}>
                Контрольные примеры
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {activePresets.map((p) => {
                  const active = isPresetActive(p);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="text-left px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors hover:opacity-90 flex items-center justify-between gap-2"
                      style={{
                        backgroundColor: active ? 'var(--apple-blue-tint)' : 'var(--apple-well)',
                        borderColor: active ? 'var(--apple-blue)' : 'var(--apple-border)',
                      }}
                    >
                      <div className="min-w-0">
                        <div
                          className="font-mono font-medium truncate"
                          style={{ color: active ? 'var(--apple-blue)' : 'var(--apple-text)' }}
                        >
                          {p.label}
                        </div>
                        <div className="text-xs truncate mt-0.5" style={{ color: 'var(--apple-text-secondary)' }}>
                          {p.desc}
                        </div>
                      </div>
                      {active && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: 'var(--apple-blue)' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              {problemType === 'ode1' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--apple-text-secondary)' }}>
                      Уравнение y&apos; = f(x, y)
                    </label>
                    <input
                      value={func1}
                      onChange={(e) => setFunc1(e.target.value)}
                      className="w-full apple-input px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>x₀</label>
                      <input type="number" step="any" value={x0_1} onChange={(e) => setX0_1(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>y(x₀)</label>
                      <input type="number" step="any" value={y0_1} onChange={(e) => setY0_1(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>Конец b</label>
                      <input type="number" step="any" value={b_1} onChange={(e) => setB_1(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>Шагов n</label>
                      <input type="number" min="1" max="10000" value={n_1} onChange={(e) => setN_1(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {problemType === 'ode2' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--apple-text-secondary)' }}>
                      Уравнение y&apos;&apos; = f(x, y, z), где z = y&apos;
                    </label>
                    <input
                      value={func2}
                      onChange={(e) => setFunc2(e.target.value)}
                      className="w-full apple-input px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>x₀</label>
                      <input type="number" step="any" value={x0_2} onChange={(e) => setX0_2(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>y(x₀)</label>
                      <input type="number" step="any" value={y0_2} onChange={(e) => setY0_2(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>y&apos;(x₀) = z₀</label>
                      <input type="number" step="any" value={z0_2} onChange={(e) => setZ0_2(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>Конец b</label>
                      <input type="number" step="any" value={b_2} onChange={(e) => setB_2(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>Шагов n</label>
                      <input type="number" min="1" max="10000" value={n_2} onChange={(e) => setN_2(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {problemType === 'system3' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>dx/dt = f₁(t, x, y, z)</label>
                    <input value={f1Sys} onChange={(e) => setF1Sys(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>dy/dt = f₂(t, x, y, z)</label>
                    <input value={f2Sys} onChange={(e) => setF2Sys(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>dz/dt = f₃(t, x, y, z)</label>
                    <input value={f3Sys} onChange={(e) => setF3Sys(e.target.value)} className="w-full apple-input px-3 py-2 text-sm font-mono" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>t₀</label>
                      <input type="number" step="any" value={t0Sys} onChange={(e) => setT0Sys(e.target.value)} className="w-full apple-input px-2.5 py-1.5 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>b</label>
                      <input type="number" step="any" value={bSys} onChange={(e) => setBSys(e.target.value)} className="w-full apple-input px-2.5 py-1.5 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>n</label>
                      <input type="number" min="1" max="10000" value={nSys} onChange={(e) => setNSys(e.target.value)} className="w-full apple-input px-2.5 py-1.5 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>x(t₀)</label>
                      <input type="number" step="any" value={x0Sys} onChange={(e) => setX0Sys(e.target.value)} className="w-full apple-input px-2.5 py-1.5 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>y(t₀)</label>
                      <input type="number" step="any" value={y0Sys} onChange={(e) => setY0Sys(e.target.value)} className="w-full apple-input px-2.5 py-1.5 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--apple-text-secondary)' }}>z(t₀)</label>
                      <input type="number" step="any" value={z0Sys} onChange={(e) => setZ0Sys(e.target.value)} className="w-full apple-input px-2.5 py-1.5 text-sm font-mono" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Постоянный блок статуса фиксированной высоты (без условного появления/скачков кнопок) */}
          <div
            className={`h-14 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 border overflow-hidden ${
              error ? 'bg-red-500/10 border-red-500/25 text-red-500' : ''
            }`}
            style={
              error
                ? undefined
                : {
                    backgroundColor: matchNotice ? 'var(--apple-blue-tint)' : 'var(--apple-well)',
                    borderColor: matchNotice ? 'var(--apple-blue)' : 'var(--apple-border)',
                    color: matchNotice ? 'var(--apple-text)' : 'var(--apple-text-secondary)',
                  }
            }
            title={error || matchNotice || ''}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: error
                  ? '#ef4444'
                  : matchNotice
                  ? 'var(--apple-blue)'
                  : 'var(--apple-green)',
              }}
            />
            <span className="line-clamp-2 leading-snug">
              {error
                ? error
                : matchNotice
                ? matchNotice
                : `Готово к расчёту • Метод: ${
                    odeMethod === 'euler' ? 'Эйлера O(h)' : 'Рунге — Кутта O(h⁴)'
                  }`}
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleSolve()}
              disabled={loading}
              className="w-full apple-btn-primary py-2.5 px-4 text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Вычисление...' : 'Решить задачу Коши'}
            </button>
            <button
              type="button"
              onClick={handleCompareBoth}
              disabled={loading}
              className="w-full apple-btn-secondary py-2.5 px-4 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
            >
              Сравнить Эйлера и Рунге — Кутта
            </button>
            <button
              type="button"
              onClick={handleMatchEuler}
              disabled={loading}
              className="w-full apple-btn-secondary py-2.5 px-4 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
            >
              Подобрать шаг Эйлера (п. 3.4)
            </button>
          </div>
        </section>
      </div>

      <div className="lg:col-span-8 space-y-5 sm:space-y-6 min-w-0">
        {/* 4 карточки KPI в едином стиле с VisualCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Численное решение в конце отрезка */}
          <div className="apple-kpi-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span
                className="text-sm sm:text-base font-medium leading-snug min-w-0 break-words"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Численное в b
              </span>
              <span
                className="apple-squircle-icon w-9 h-9 flex items-center justify-center text-base font-serif italic shrink-0"
                style={{
                  background: 'linear-gradient(180deg, #38a1ff 0%, #0071e3 100%)',
                }}
              >
                y
              </span>
            </div>
            <div className="mt-3.5">
              <div
                className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight truncate"
                style={{ color: 'var(--apple-blue)' }}
              >
                {currentSolution
                  ? (currentSolution.problem_type === 'system3'
                      ? currentSolution[`${sysComp}_end`]
                      : currentSolution.y_end
                    ).toFixed(6)
                  : '—'}
              </div>
              <div
                className="text-xs sm:text-sm mt-1 truncate"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                {currentSolution ? currentSolution.method_name : 'Выберите параметры'}
              </div>
            </div>
          </div>

          {/* 2. Эталонное / точное значение */}
          <div className="apple-kpi-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span
                className="text-sm sm:text-base font-medium leading-snug min-w-0 break-words"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Эталон (SymPy / РК4)
              </span>
              <span
                className="apple-squircle-icon w-9 h-9 flex items-center justify-center text-sm sm:text-base font-serif italic shrink-0"
                style={{
                  background: 'linear-gradient(180deg, #a970ff 0%, #7d3aed 100%)',
                }}
              >
                y*
              </span>
            </div>
            <div className="mt-3.5">
              <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight truncate">
                {currentSolution
                  ? (currentSolution.problem_type === 'system3'
                      ? currentSolution[`${sysComp}_end_exact`]
                      : currentSolution.y_end_exact
                    ).toFixed(6)
                  : '—'}
              </div>
              <div
                className="text-xs sm:text-sm mt-1 font-mono truncate"
                title={currentSolution?.exact_formula || ''}
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                {currentSolution
                  ? currentSolution.exact_formula &&
                    !currentSolution.exact_formula.startsWith('Численный') &&
                    !currentSolution.exact_formula.startsWith('Эталон')
                    ? `y(x) = ${formatMathFormula(currentSolution.exact_formula)}`
                    : `Отрезок [${currentSolution.x0 ?? currentSolution.t0}; ${currentSolution.b}]`
                  : 'Аналитический эталон'}
              </div>
            </div>
          </div>

          {/* 3. Максимальная абсолютная погрешность */}
          <div className="apple-kpi-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span
                className="text-sm sm:text-base font-medium leading-snug min-w-0 break-words"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Макс. погр. |Δ|
              </span>
              <span
                className="apple-squircle-icon w-9 h-9 flex items-center justify-center text-sm sm:text-base font-mono font-semibold shrink-0"
                style={{
                  background: 'linear-gradient(180deg, #34d058 0%, #248a3d 100%)',
                }}
              >
                Δ
              </span>
            </div>
            <div className="mt-3.5">
              <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight truncate">
                {currentSolution ? currentSolution.max_abs_err.toExponential(4) : '—'}
              </div>
              <div
                className="text-xs sm:text-sm font-mono mt-1 truncate"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                {currentSolution?.max_runge_err !== undefined
                  ? `Рунге: ${currentSolution.max_runge_err.toExponential(3)}`
                  : 'По всем узлам сетки'}
              </div>
            </div>
          </div>

          {/* 4. Параметры сетки (h и n) */}
          <div className="apple-kpi-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span
                className="text-sm sm:text-base font-medium leading-snug min-w-0 break-words"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Шаг сетки h
              </span>
              <span
                className="apple-squircle-icon w-9 h-9 flex items-center justify-center text-sm sm:text-base font-mono font-semibold shrink-0"
                style={{
                  background: 'linear-gradient(180deg, #ffab2e 0%, #ef8600 100%)',
                }}
              >
                h
              </span>
            </div>
            <div className="mt-3.5">
              <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight truncate">
                {currentSolution ? currentSolution.h.toFixed(5) : '—'}
              </div>
              <div
                className="text-xs sm:text-sm font-mono mt-1 truncate"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                {currentSolution ? `Разбиений n = ${currentSolution.n}` : 'Равномерная сетка'}
              </div>
            </div>
          </div>
        </div>

        {/* Интерактивный график интегральных кривых */}
        <section className="apple-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base font-semibold tracking-tight">
                  График интегральных кривых
                </h3>
                <span
                  className="text-xs font-mono px-2.5 py-0.5 rounded-full truncate max-w-md"
                  style={{
                    backgroundColor: 'var(--apple-blue-tint)',
                    color: 'var(--apple-blue)',
                  }}
                >
                  {currentSolution?.exact_formula
                    ? currentSolution.exact_formula.startsWith('Численный') ||
                      currentSolution.exact_formula.startsWith('Эталон')
                      ? currentSolution.exact_formula
                      : `Точное SymPy: y(x) = ${formatMathFormula(currentSolution.exact_formula)}`
                    : 'Численный эталон РК4'}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--apple-text-secondary)' }}>
                Наведите курсор на узлы графика или строки таблицы для инспекции значений
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {problemType === 'system3' && (
                <div className="apple-segmented flex items-center text-xs">
                  {[
                    { id: 'x', label: 'x(t)' },
                    { id: 'y', label: 'y(t)' },
                    { id: 'z', label: 'z(t)' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSysComp(c.id)}
                      className={`px-2.5 py-1 cursor-pointer ${
                        sysComp === c.id
                          ? 'apple-segmented-item apple-segmented-item-active'
                          : 'apple-segmented-item'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded bg-emerald-500 inline-block" /> Эталон
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded bg-amber-500 inline-block" /> Эйлер
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded bg-sky-500 inline-block" /> РК4
                </span>
              </div>
            </div>
          </div>

          <div className="w-full overflow-hidden rounded-xl apple-canvas">
            {odeChart ? (
              <svg
                viewBox={`0 0 ${odeChart.width} ${odeChart.height}`}
                className="w-full h-auto block select-none"
                onMouseLeave={() => setHoverIndex(null)}
              >
                {odeChart.yTicks.map((t, idx) => (
                  <g key={idx}>
                    <line
                      x1={odeChart.margin.left}
                      y1={t.y}
                      x2={odeChart.width - odeChart.margin.right}
                      y2={t.y}
                      stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={odeChart.margin.left - 8}
                      y={t.y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fontFamily="monospace"
                      fill={isDark ? '#98989d' : '#6e6e73'}
                    >
                      {t.val.toFixed(2)}
                    </text>
                  </g>
                ))}
                {odeChart.xTicks.map((t, idx) => (
                  <g key={idx}>
                    <line
                      x1={t.x}
                      y1={odeChart.margin.top}
                      x2={t.x}
                      y2={odeChart.height - odeChart.margin.bottom}
                      stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={t.x}
                      y={odeChart.height - odeChart.margin.bottom + 18}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fill={isDark ? '#98989d' : '#6e6e73'}
                    >
                      {t.val.toFixed(2)}
                    </text>
                  </g>
                ))}

                {/* Кривые решений */}
                {odeChart.exactPath && (
                  <path d={odeChart.exactPath} fill="none" stroke="#10b981" strokeWidth="2.2" opacity="0.9" />
                )}
                {odeChart.eulerPath && (
                  <path d={odeChart.eulerPath} fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="5 3" />
                )}
                {odeChart.rk4Path && (
                  <path d={odeChart.rk4Path} fill="none" stroke="#0ea5e9" strokeWidth="2" />
                )}

                {/* Вертикальная линия выбранного узла */}
                {hoveredNode && (
                  <line
                    x1={odeChart.toSvgX(odeChart.getX(hoveredNode))}
                    y1={odeChart.margin.top}
                    x2={odeChart.toSvgX(odeChart.getX(hoveredNode))}
                    y2={odeChart.height - odeChart.margin.bottom}
                    stroke={isDark ? '#38bdf8' : '#0284c7'}
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                )}

                {/* Узловые маркеры */}
                {odeChart.nodeMarkers.map((m) => {
                  const isHovered = hoverIndex === m.idx;
                  return (
                    <g
                      key={m.i}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoverIndex(m.idx)}
                    >
                      <circle
                        cx={m.svgX}
                        cy={m.svgEulerY}
                        r={isHovered ? 5.5 : 3}
                        fill="#f59e0b"
                        stroke={isDark ? '#1c1c1e' : '#ffffff'}
                        strokeWidth="1.2"
                      />
                      <circle
                        cx={m.svgX}
                        cy={m.svgRk4Y}
                        r={isHovered ? 5.5 : 3}
                        fill="#0ea5e9"
                        stroke={isDark ? '#1c1c1e' : '#ffffff'}
                        strokeWidth="1.2"
                      />
                      <circle cx={m.svgX} cy={m.svgRk4Y} r={10} fill="transparent" />
                    </g>
                  );
                })}
              </svg>
            ) : (
              <svg viewBox="0 0 860 370" className="w-full h-auto block select-none">
                <text
                  x="430"
                  y="185"
                  textAnchor="middle"
                  fontSize="13"
                  fill={isDark ? '#98989d' : '#6e6e73'}
                >
                  Выполняется расчёт интегральных кривых...
                </text>
              </svg>
            )}
          </div>
        </section>

        {/* Таблица узлов решения (постоянная высота h-80, без скачков при смене n) */}
        <section className="apple-card rounded-2xl overflow-hidden">
          <div
            className="px-5 sm:px-6 py-4 border-b flex flex-wrap items-center justify-between gap-2"
            style={{ borderColor: 'var(--apple-border)' }}
          >
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight truncate">
                Таблица узлов решения ({currentSolution ? currentSolution.method_name : 'Загрузка...'})
              </h3>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--apple-text-secondary)' }}>
                {currentSolution
                  ? `Шаг h = ${currentSolution.h.toFixed(5)} • Макс. погр. |Δ| = ${currentSolution.max_abs_err.toExponential(4)}${
                      currentSolution.max_runge_err !== undefined
                        ? ` • Оценка Рунге = ${currentSolution.max_runge_err.toExponential(4)}`
                        : ''
                    }`
                  : 'Ожидание расчёта узлов...'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-xs font-mono tabular-nums px-2.5 py-1 rounded-lg font-medium whitespace-nowrap"
                style={{
                  backgroundColor: hoveredNode ? 'var(--apple-blue-tint)' : 'var(--apple-well)',
                  color: hoveredNode ? 'var(--apple-blue)' : 'var(--apple-text-secondary)',
                }}
              >
                {hoveredNode
                  ? `Узел i = ${hoveredNode.i} (${
                      currentSolution?.problem_type === 'system3' ? 't' : 'x'
                    } = ${(hoveredNode.x ?? hoveredNode.t).toFixed(4)})`
                  : `Узлов: ${displayedNodes.length}`}
              </span>
              <button
                type="button"
                onClick={() => setIsNodesExpanded(true)}
                disabled={!currentSolution}
                className="apple-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    d="M6 2.5H3.5a1 1 0 0 0-1 1V6M10 2.5h2.5a1 1 0 0 1 1 1V6M6 13.5H3.5a1 1 0 0 1-1-1V10M10 13.5h2.5a1 1 0 0 0 1-1V10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>На весь экран</span>
              </button>
            </div>
          </div>

          {currentSolution ? (
            renderNodesTable(false)
          ) : (
            <div className="h-80 flex items-center justify-center text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
              Выполняется расчёт узлов...
            </div>
          )}
        </section>

        {/* Журнал расчётов ОДУ в едином стиле с ResultsTable (с кнопкой На весь экран и полосой Лучшего результата) */}
        <section className="apple-card rounded-2xl overflow-hidden">
          <div
            className="px-5 sm:px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: 'var(--apple-border)' }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-semibold tracking-tight">Журнал расчётов ОДУ</h3>
                <span
                  className="text-xs font-mono tabular-nums px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: 'var(--apple-well)',
                    color: 'var(--apple-text-secondary)',
                  }}
                >
                  {history.length}
                </span>
              </div>

              <div
                className="hidden sm:flex items-center gap-3 text-xs pl-2 border-l"
                style={{ borderColor: 'var(--apple-border)', color: 'var(--apple-text-secondary)' }}
              >
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--apple-blue)' }} />
                  Лучший
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--apple-amber)' }} />
                  Средний
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--apple-red)' }} />
                  Худший
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsJournalExpanded(true)}
                title="Открыть журнал ОДУ в большом модальном окне"
                className="apple-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    d="M6 2.5H3.5a1 1 0 0 0-1 1V6M10 2.5h2.5a1 1 0 0 1 1 1V6M6 13.5H3.5a1 1 0 0 1-1-1V10M10 13.5h2.5a1 1 0 0 0 1-1V10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>На весь экран</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={history.length === 0}
                className="apple-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2.5v7.5m0 0L5.25 7.25M8 10l2.75-2.75M3 12.5h10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setHistory([])}
                disabled={history.length === 0}
                className="apple-btn-secondary px-3 py-1.5 text-xs cursor-pointer hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Очистить
              </button>
            </div>
          </div>

          {/* Постоянная сводная полоса лучшего результата */}
          <div
            className="px-5 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-xs"
            style={{
              borderColor: 'var(--apple-border)',
              backgroundColor: 'var(--apple-well)',
            }}
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span style={{ color: 'var(--apple-text-secondary)' }}>Лучший результат:</span>
              <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                {summaryStats ? `${summaryStats.bestRow.methodName} (${summaryStats.bestRow.stepInfo})` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span style={{ color: 'var(--apple-text-secondary)' }}>Мин. абс. погр. |Δ|:</span>
              <span className="font-mono font-semibold">
                {summaryStats ? summaryStats.bestRow.absErr : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span style={{ color: 'var(--apple-text-secondary)' }}>Макс. абс. погр. |Δ|:</span>
              <span
                className="font-mono font-semibold"
                style={{ color: summaryStats ? 'var(--apple-red)' : 'var(--apple-text-secondary)' }}
              >
                {summaryStats ? `${summaryStats.worstRow.absErr} (${summaryStats.worstRow.methodName})` : '—'}
              </span>
            </div>
          </div>

          {history.length === 0 ? (
            <div
              className="h-72 px-6 flex flex-col items-center justify-center text-center"
              style={{ color: 'var(--apple-text-secondary)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--apple-text)' }}>
                Журнал расчётов ОДУ пуст
              </p>
              <p className="text-xs mt-1">
                Нажмите «Решить задачу Коши» или «Сравнить Эйлера и Рунге — Кутта», чтобы добавить результаты в журнал
              </p>
            </div>
          ) : (
            renderJournalTable(false)
          )}
        </section>
      </div>

      {/* Полноэкранное модальное окно Таблицы узлов решения */}
      {isNodesExpanded &&
        currentSolution &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsNodesExpanded(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Таблица узлов решения — полноэкранный режим"
              className="apple-kpi-card rounded-2xl w-full max-w-[1720px] max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div
                className="px-5 sm:px-7 py-4 border-b flex items-center justify-between gap-3 shrink-0"
                style={{ borderColor: 'var(--apple-border)' }}
              >
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-tight truncate">
                    Таблица узлов решения ({currentSolution.method_name})
                  </h2>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--apple-text-secondary)' }}>
                    Шаг h = {currentSolution.h.toFixed(5)} • Макс. погр. |Δ| ={' '}
                    {currentSolution.max_abs_err.toExponential(4)} • Всего узлов: {currentSolution.nodes.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNodesExpanded(false)}
                  className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto"
                >
                  <span>Свернуть</span>
                  <span className="font-mono opacity-80">Esc</span>
                </button>
              </div>

              {renderNodesTable(true)}
            </div>
          </div>,
          document.body
        )}

      {/* Полноэкранное модальное окно Журнала расчётов ОДУ */}
      {isJournalExpanded &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsJournalExpanded(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Журнал расчётов ОДУ — полноэкранный режим"
              className="apple-kpi-card rounded-2xl w-full max-w-[1720px] max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div
                className="px-5 sm:px-7 py-4 border-b flex items-center justify-between gap-3 shrink-0"
                style={{ borderColor: 'var(--apple-border)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <h2 className="text-lg font-semibold tracking-tight truncate">
                      Журнал расчётов ОДУ — детальный просмотр
                    </h2>
                    <span
                      className="text-xs font-mono tabular-nums px-2.5 py-0.5 rounded-full font-medium shrink-0"
                      style={{
                        backgroundColor: 'var(--apple-well)',
                        color: 'var(--apple-text-secondary)',
                      }}
                    >
                      Записей: {history.length}
                    </span>
                  </div>

                  <div
                    className="hidden xl:flex items-center gap-3 text-xs pl-3 border-l shrink-0"
                    style={{ borderColor: 'var(--apple-border)', color: 'var(--apple-text-secondary)' }}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--apple-blue)' }} />
                      Лучший
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--apple-amber)' }} />
                      Средний
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--apple-red)' }} />
                      Худший
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={history.length === 0}
                    className="apple-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-40"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 2.5v7.5m0 0L5.25 7.25M8 10l2.75-2.75M3 12.5h10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Скачать CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    disabled={history.length === 0}
                    className="apple-btn-secondary px-3.5 py-1.5 text-xs cursor-pointer whitespace-nowrap hover:text-red-500 disabled:opacity-40"
                  >
                    Очистить
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsJournalExpanded(false)}
                    className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>Свернуть</span>
                    <span className="font-mono opacity-80">Esc</span>
                  </button>
                </div>
              </div>

              {/* Сводная полоса по результатам в модальном окне */}
              <div
                className="px-5 sm:px-7 py-3 border-b flex flex-wrap items-center justify-between gap-x-6 gap-y-2 shrink-0 text-xs"
                style={{
                  borderColor: 'var(--apple-border)',
                  backgroundColor: 'var(--apple-well)',
                }}
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span style={{ color: 'var(--apple-text-secondary)' }}>Лучший результат:</span>
                  <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    {summaryStats ? `${summaryStats.bestRow.methodName} (${summaryStats.bestRow.stepInfo})` : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span style={{ color: 'var(--apple-text-secondary)' }}>Мин. абс. погрешность |Δ|:</span>
                  <span className="font-mono font-semibold">
                    {summaryStats ? summaryStats.bestRow.absErr : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span style={{ color: 'var(--apple-text-secondary)' }}>Макс. абс. погрешность |Δ|:</span>
                  <span
                    className="font-mono font-semibold"
                    style={{ color: summaryStats ? 'var(--apple-red)' : 'var(--apple-text-secondary)' }}
                  >
                    {summaryStats ? `${summaryStats.worstRow.absErr} (${summaryStats.worstRow.methodName})` : '—'}
                  </span>
                </div>
              </div>

              {history.length === 0 ? (
                <div
                  className="flex-1 px-6 py-16 flex items-center justify-center text-center text-sm"
                  style={{ color: 'var(--apple-text-secondary)' }}
                >
                  Журнал расчётов ОДУ пуст.
                </div>
              ) : (
                renderJournalTable(true)
              )}
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}
