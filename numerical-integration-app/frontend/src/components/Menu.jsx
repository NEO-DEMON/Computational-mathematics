import React from 'react';

const PRESETS = [
  { label: 'sin(x) + 2', func: 'sin(x) + 2', a: 0, b: 3.14 },
  { label: 'x² + 1', func: 'x^2 + 1', a: 0, b: 3 },
  { label: 'e^(-x²)', func: 'exp(-x^2)', a: -2, b: 2 },
  { label: '1 / (1 + x²)', func: '1 / (1 + x^2)', a: -2, b: 2 },
  { label: 'x · sin(x)', func: 'x * sin(x)', a: 0, b: 6.28 },
  { label: 'cos(2x) + x/2', func: 'cos(2*x) + x/2', a: 0, b: 4 },
];

const CONST_METHODS = [
  { id: 1, name: 'Левые прямоугольники', badge: 'O(h)', desc: 'yᵢ = f(xᵢ)' },
  { id: 2, name: 'Правые прямоугольники', badge: 'O(h)', desc: 'yᵢ = f(xᵢ₊₁)' },
  { id: 3, name: 'Метод трапеций', badge: 'O(h²)', desc: '(f(xᵢ) + f(xᵢ₊₁)) / 2' },
  { id: 4, name: 'Метод Симпсона', badge: 'O(h⁴)', desc: 'Параболическая интерполяция' },
];

const VAR_METHODS = [
  { id: 1, name: 'Метод Рунге (Автошаг)', badge: '|I₂ₙ − Iₙ| < ε', desc: 'Удвоение сетки n → 2n' },
  { id: 2, name: 'Адаптивный шаг', badge: 'Локальный h', desc: 'Дробление на участках кривизны' },
];

export default function Menu({
  algo,
  method,
  setMethod,
  varAlgo,
  setVarAlgo,
  func,
  setFunc,
  a,
  setA,
  b,
  setB,
  n,
  setN,
  eps,
  setEps,
  loading,
  error,
  onCalculate,
  onCompareAll,
}) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  const isReversed = Number.isFinite(numA) && Number.isFinite(numB) && numA > numB;

  const handleSwapLimits = () => {
    const temp = a;
    setA(b);
    setB(temp);
  };

  const applyPreset = (preset) => {
    setFunc(preset.func);
    setA(preset.a);
    setB(preset.b);
  };

  return (
    <section className="apple-card rounded-2xl p-5 sm:p-6 space-y-6">
      <div className="space-y-6">
        {/* Заголовок инспектора */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Параметры расчёта
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--apple-text-secondary)' }}>
              Подынтегральное выражение и пределы
            </p>
          </div>
          <button
            type="button"
            onClick={handleSwapLimits}
            title="Поменять местами пределы a и b"
            className="apple-btn-secondary px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <span>⇅ a ↔ b</span>
          </button>
        </div>

        {/* Математическая запись интеграла */}
        <div className="apple-well rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-3.5">
            {/* Знак интеграла с компактными математическими подписями пределов */}
            <div className="flex flex-col items-center select-none shrink-0 min-w-[3.25rem]">
              <span
                className="text-xs font-mono font-medium tabular-nums leading-none"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                {b !== '' ? b : 'b'}
              </span>

              <div
                className="text-5xl font-serif leading-none mt-1.5 mb-3.5 italic"
                style={{ color: 'var(--apple-blue)' }}
              >
                ∫
              </div>

              <span
                className="text-xs font-mono font-medium tabular-nums leading-none"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                {a !== '' ? a : 'a'}
              </span>
            </div>

            {/* Поле функции f(x) */}
            <div className="flex-1 min-w-0">
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Функция f(x)
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={func}
                  onChange={(e) => setFunc(e.target.value)}
                  placeholder="sin(x) + 2"
                  className="w-full apple-input px-3.5 py-2.5 text-sm font-mono"
                />
                <span
                  className="text-sm font-serif italic shrink-0"
                  style={{ color: 'var(--apple-text-secondary)' }}
                >
                  dx
                </span>
              </div>
            </div>
          </div>

          {/* Явные поля Нижний / Верхний предел */}
          <div
            className="grid grid-cols-2 gap-3 pt-3.5 border-t"
            style={{ borderColor: 'var(--apple-border)' }}
          >
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Нижний предел (a)
              </label>
              <input
                type="number"
                step="any"
                value={a}
                onChange={(e) => setA(e.target.value)}
                className="w-full apple-input px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Верхний предел (b)
              </label>
              <input
                type="number"
                step="any"
                value={b}
                onChange={(e) => setB(e.target.value)}
                className="w-full apple-input px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          {isReversed && (
            <div
              className="px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2"
              style={{
                backgroundColor: 'var(--apple-blue-tint)',
                color: 'var(--apple-text)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: 'var(--apple-blue)' }}
              />
              <span>
                Нижний предел <b>a = {a}</b> больше верхнего <b>b = {b}</b> (знак интеграла инвертирован).
              </span>
            </div>
          )}
        </div>

        {/* Быстрые пресеты функций */}
        <div>
          <label
            className="block text-xs font-medium mb-2"
            style={{ color: 'var(--apple-text-secondary)' }}
          >
            Готовые функции
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const active = func === p.func && Number(a) === p.a && Number(b) === p.b;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={
                    active
                      ? {
                          backgroundColor: 'var(--apple-blue-tint)',
                          borderColor: 'var(--apple-blue)',
                          color: 'var(--apple-blue)',
                        }
                      : {
                          backgroundColor: 'var(--apple-well)',
                          borderColor: 'var(--apple-border)',
                          color: 'var(--apple-text-secondary)',
                        }
                  }
                  className="px-3 py-2 rounded-xl text-xs font-mono truncate transition-all cursor-pointer border font-medium hover:opacity-90"
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Параметры выбранного режима */}
        {algo === 'const' ? (
          <div className="space-y-5">
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Численный метод
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                {CONST_METHODS.map((m) => {
                  const selected = Number(method) === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      style={
                        selected
                          ? {
                              backgroundColor: 'var(--apple-blue-tint)',
                              borderColor: 'var(--apple-blue)',
                            }
                          : {
                              backgroundColor: 'var(--apple-well)',
                              borderColor: 'var(--apple-border)',
                            }
                      }
                      className="w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: selected ? 'var(--apple-blue)' : 'var(--apple-text)' }}
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
                        className="text-xs font-mono px-2.5 py-0.5 rounded-md shrink-0 font-medium"
                        style={
                          selected
                            ? {
                                backgroundColor: 'var(--apple-blue)',
                                color: '#ffffff',
                              }
                            : {
                                backgroundColor: 'var(--apple-segmented-bg)',
                                color: 'var(--apple-text-secondary)',
                              }
                        }
                      >
                        {m.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-xs font-medium"
                  style={{ color: 'var(--apple-text-secondary)' }}
                >
                  Разбиения (n)
                </label>
                <span
                  className="text-xs font-mono px-2.5 py-0.5 rounded-md tabular-nums"
                  style={{
                    backgroundColor: 'var(--apple-well)',
                    color: 'var(--apple-text-secondary)',
                  }}
                >
                  h = {Number.isFinite((numB - numA) / n) && n > 0 ? Math.abs((numB - numA) / n).toFixed(4) : '—'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="100"
                  value={Math.min(Math.max(Number(n) || 2, 2), 100)}
                  onChange={(e) => setN(Number(e.target.value))}
                  className="flex-1 apple-range cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="500000"
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                  className="w-24 apple-input px-3 py-2 text-sm text-center font-mono tabular-nums"
                />
              </div>

              <div className="grid grid-cols-6 gap-1.5 mt-2.5">
                {[4, 10, 20, 50, 100, 500].map((val) => {
                  const active = Number(n) === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setN(val)}
                      style={
                        active
                          ? {
                              backgroundColor: 'var(--apple-blue)',
                              borderColor: 'var(--apple-blue)',
                              color: '#ffffff',
                            }
                          : {
                              backgroundColor: 'var(--apple-well)',
                              borderColor: 'var(--apple-border)',
                              color: 'var(--apple-text-secondary)',
                            }
                      }
                      className="py-1.5 rounded-lg text-xs font-mono tabular-nums border transition-all cursor-pointer font-medium"
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Алгоритм контроля шага
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {VAR_METHODS.map((m) => {
                  const selected = Number(varAlgo) === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setVarAlgo(m.id)}
                      style={
                        selected
                          ? {
                              backgroundColor: 'var(--apple-blue-tint)',
                              borderColor: 'var(--apple-blue)',
                            }
                          : {
                              backgroundColor: 'var(--apple-well)',
                              borderColor: 'var(--apple-border)',
                            }
                      }
                      className="w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div
                          className="text-sm font-medium"
                          style={{ color: selected ? 'var(--apple-blue)' : 'var(--apple-text)' }}
                        >
                          {m.name}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: 'var(--apple-text-secondary)' }}
                        >
                          {m.desc}
                        </div>
                      </div>
                      <span
                        className="text-xs font-mono px-2.5 py-0.5 rounded-md shrink-0 font-medium"
                        style={
                          selected
                            ? {
                                backgroundColor: 'var(--apple-blue)',
                                color: '#ffffff',
                              }
                            : {
                                backgroundColor: 'var(--apple-segmented-bg)',
                                color: 'var(--apple-text-secondary)',
                              }
                        }
                      >
                        {m.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--apple-text-secondary)' }}
              >
                Требуемая точность (ε)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0000001"
                value={eps}
                onChange={(e) => setEps(e.target.value)}
                className="w-full apple-input px-3.5 py-2.5 text-sm font-mono tabular-nums"
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                {[0.01, 0.001, 0.0001, 0.00001].map((val) => {
                  const active = Number(eps) === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setEps(val)}
                      style={
                        active
                          ? {
                              backgroundColor: 'var(--apple-blue)',
                              borderColor: 'var(--apple-blue)',
                              color: '#ffffff',
                            }
                          : {
                              backgroundColor: 'var(--apple-well)',
                              borderColor: 'var(--apple-border)',
                              color: 'var(--apple-text-secondary)',
                            }
                      }
                      className="py-1.5 rounded-lg text-xs font-mono tabular-nums border transition-all cursor-pointer font-medium"
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 text-xs leading-relaxed">
            {error}
          </div>
        )}
      </div>

      {/* Кнопки действий в стиле Apple */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onCalculate}
          disabled={loading}
          className="w-full apple-btn-primary py-3 px-4 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{loading ? 'Вычисление...' : 'Рассчитать интеграл'}</span>
        </button>

        <button
          type="button"
          onClick={onCompareAll}
          disabled={loading}
          className="w-full apple-btn-secondary py-3 px-4 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2.5 12.5h11M4.5 9.5v-4M8 9.5v-6M11.5 9.5v-2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Сравнить все методы (6 в 1)</span>
        </button>
      </div>
    </section>
  );
}
