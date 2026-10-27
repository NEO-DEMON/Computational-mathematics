import React, { useState, useEffect } from 'react';
import { integrateConst, integrateVariable, integrateCompare } from './api';
import Menu from './components/Menu';
import VisualCard from './components/VisualCard';
import ResultsTable from './components/ResultsTable';
import DocsModal from './components/DocsModal';

const METHODS_CONST = {
  1: 'Левые прямоугольники',
  2: 'Правые прямоугольники',
  3: 'Трапеции',
  4: 'Параболы (Симпсон)',
};

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apple-ui-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('apple-ui-theme', theme);
  }, [theme]);

  const [algo, setAlgo] = useState('const');
  const [method, setMethod] = useState(1);
  const [varAlgo, setVarAlgo] = useState(1);
  const [func, setFunc] = useState('sin(x) + 2');
  const [a, setA] = useState(0);
  const [b, setB] = useState(3.14);
  const [n, setN] = useState(16);
  const [eps, setEps] = useState(0.001);
  const [results, setResults] = useState([]);
  const [adaptiveSegments, setAdaptiveSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const calculate = async () => {
    setLoading(true);
    setError(null);
    try {
      if (algo === 'const') {
        const data = await integrateConst({ func, a, b, n, method });
        const actualN = data.n ?? n;
        const newRow = {
          id: Date.now() + Math.random(),
          func,
          a,
          b,
          n: actualN,
          algo: 'Постоянный шаг',
          methodName: METHODS_CONST[method],
          step: `n=${actualN}`,
          calcVal: data.result.toFixed(8),
          exactVal: data.exact.toFixed(8),
          absErr: data.abs_error.toExponential(4),
          relErr: `${data.rel_error.toFixed(4)}%`,
          rawAbsErr: data.abs_error,
          rawRelErr: data.rel_error,
        };
        setResults((prev) => [newRow, ...prev]);
      } else {
        const data = await integrateVariable({ func, a, b, eps, algo_type: varAlgo });
        if (data.segments && data.segments.length > 0) {
          setAdaptiveSegments(data.segments);
        } else {
          setAdaptiveSegments([]);
        }
        const algoName =
          Number(varAlgo) === 1 ? 'Переменный (Рунге)' : 'Переменный (Адаптивный)';
        const newRow = {
          id: Date.now() + Math.random(),
          func,
          a,
          b,
          n: data.n,
          algo: algoName,
          methodName: 'Прямоугольники (Левые)',
          step: data.info,
          calcVal: data.result.toFixed(8),
          exactVal: data.exact.toFixed(8),
          absErr: data.abs_error.toExponential(4),
          relErr: `${data.rel_error.toFixed(4)}%`,
          rawAbsErr: data.abs_error,
          rawRelErr: data.rel_error,
        };
        setResults((prev) => [newRow, ...prev]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const compareAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await integrateCompare({ func, a, b, n, eps });
      const batchRows = data.items.map((item, idx) => {
        if (item.segments && item.segments.length > 0) {
          setAdaptiveSegments(item.segments);
        }
        return {
          id: Date.now() + idx + Math.random(),
          func,
          a,
          b,
          n: item.n,
          algo: item.algo,
          methodName: item.methodName,
          step: item.step,
          calcVal: item.result.toFixed(8),
          exactVal: item.exact.toFixed(8),
          absErr: item.abs_error.toExponential(4),
          relErr: `${item.rel_error.toFixed(4)}%`,
          rawAbsErr: item.abs_error,
          rawRelErr: item.rel_error,
        };
      });
      setResults((prev) => [...batchRows, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRow = (id) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearResults = () => {
    setResults([]);
    setAdaptiveSegments([]);
  };

  return (
    <div className="min-h-screen w-full flex flex-col py-4 sm:py-6 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="w-full flex-1 flex flex-col space-y-5 sm:space-y-6">
        <header className="apple-card rounded-2xl px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-serif italic text-white shrink-0 shadow-sm"
              style={{
                background: 'linear-gradient(180deg, #2997ff 0%, #0071e3 100%)',
              }}
            >
              ∫
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate">
                Численное интегрирование
              </h1>
              <p className="text-xs truncate" style={{ color: 'var(--apple-text-secondary)' }}>
                Аналитическое и численное моделирование • SymPy Engine
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={() => setIsDocsOpen(true)}
              title="Открыть подробную документацию по всем методам, числам и функциям"
              className="apple-btn-secondary px-3.5 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  d="M2.5 3.5A1.5 1.5 0 0 1 4 2h3a1 1 0 0 1 1 1v10.5a.5.5 0 0 1-.8.4A2.99 2.99 0 0 0 5.4 13H3.5a1 1 0 0 1-1-1V3.5Zm11 0A1.5 1.5 0 0 0 12 2H9a1 1 0 0 0-1 1v10.5a.5.5 0 0 0 .8.4a2.99 2.99 0 0 1 1.8-.9h1.9a1 1 0 0 0 1-1V3.5Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Документация</span>
            </button>

            <div className="apple-segmented flex items-center flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={() => setAlgo('const')}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm cursor-pointer ${
                  algo === 'const'
                    ? 'apple-segmented-item apple-segmented-item-active'
                    : 'apple-segmented-item'
                }`}
              >
                Постоянный шаг
              </button>
              <button
                type="button"
                onClick={() => setAlgo('var')}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm cursor-pointer ${
                  algo === 'var'
                    ? 'apple-segmented-item apple-segmented-item-active'
                    : 'apple-segmented-item'
                }`}
              >
                Переменный шаг
              </button>
            </div>

            <div className="apple-segmented flex items-center shrink-0" role="group" aria-label="Тема оформления">
              <button
                type="button"
                onClick={() => setTheme('light')}
                title="Светлая тема"
                className={`px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer ${
                  theme === 'light'
                    ? 'apple-segmented-item apple-segmented-item-active'
                    : 'apple-segmented-item'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="3" />
                  <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" strokeLinecap="round" />
                </svg>
                <span className="hidden md:inline">Светлая</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                title="Тёмная тема"
                className={`px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer ${
                  theme === 'dark'
                    ? 'apple-segmented-item apple-segmented-item-active'
                    : 'apple-segmented-item'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13.2 10.2A5.8 5.8 0 015.8 2.8a5.8 5.8 0 107.4 7.4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden md:inline">Тёмная</span>
              </button>
            </div>
          </div>
        </header>

        <main className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <Menu
              algo={algo}
              setAlgo={setAlgo}
              method={method}
              setMethod={setMethod}
              varAlgo={varAlgo}
              setVarAlgo={setVarAlgo}
              func={func}
              setFunc={setFunc}
              a={a}
              setA={setA}
              b={b}
              setB={setB}
              n={n}
              setN={setN}
              eps={eps}
              setEps={setEps}
              loading={loading}
              error={error}
              onCalculate={calculate}
              onCompareAll={compareAll}
            />
          </div>

          <div className="lg:col-span-8 space-y-5 sm:space-y-6 min-w-0">
            <VisualCard
              theme={theme}
              func={func}
              a={a}
              b={b}
              n={n}
              eps={eps}
              algo={algo}
              method={method}
              varAlgo={varAlgo}
              latestResult={results[0] || null}
              adaptiveSegments={adaptiveSegments}
            />

            <ResultsTable
              results={results}
              onClear={handleClearResults}
              onRemoveRow={handleRemoveRow}
            />
          </div>
        </main>
      </div>

      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
