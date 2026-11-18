import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  formatMathFormula,
  getStatusMeta,
  computeStatusMap,
  computeSummaryStats,
  exportRowsToCsv,
} from '../api';

export default function ResultsTable({ results, onClear, onRemoveRow }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Закрытие полноэкранного режима по клавише Escape и блокировка прокрутки фона
  useEffect(() => {
    if (!isExpanded) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  // Классифицируем каждую запись на Лучший / Средний / Худший результат внутри одной и той же задачи (f(x), a, b)
  const statusMap = React.useMemo(
    () =>
      computeStatusMap(
        results,
        (r) => `${(r.func || '').trim()}|${Number(r.a)}|${Number(r.b)}`,
        (r) => {
          const rel = Number(r.rawRelErr) || 0;
          return rel < 0.05 ? 'best' : rel < 1.5 ? 'medium' : 'worst';
        }
      ),
    [results]
  );

  // Сводка для полноэкранного режима
  const summaryStats = React.useMemo(
    () => computeSummaryStats(results, statusMap),
    [results, statusMap]
  );

  const handleExportCSV = () => {
    if (results.length === 0) return;
    const headers = [
      'Оценка',
      'Функция',
      'Предел A',
      'Предел B',
      'Алгоритм',
      'Метод',
      'Шаг / Точность',
      'Вычисленное',
      'Точное',
      'Абс. погрешность',
      'Отн. погрешность (%)',
    ];
    const rows = results.map((r) => {
      const meta = getStatusMeta(statusMap[r.id]);
      return [
        `"${meta.label}"`,
        `"${(r.func || '').replace(/"/g, '""')}"`,
        r.a ?? '',
        r.b ?? '',
        `"${r.algo}"`,
        `"${r.methodName}"`,
        `"${r.step}"`,
        r.calcVal,
        r.exactVal,
        r.absErr,
        r.relErr,
      ];
    });
    exportRowsToCsv('numerical_integration', headers, rows);
  };

  // Единый рендер таблицы с гарантированным горизонтальным скроллом без переноса строк
  const renderTableContent = (inModal = false) => (
    <div
      className={`overflow-x-auto overflow-y-auto apple-scroll rounded-b-2xl ${
        inModal ? 'flex-1' : 'h-72'
      }`}
    >
      <table className="w-full min-w-[54rem] text-sm text-left border-collapse">
        <thead
          className="text-xs font-medium border-b sticky top-0 z-10"
          style={{
            backgroundColor: 'var(--apple-kpi-bg)',
            borderColor: 'var(--apple-border)',
            color: 'var(--apple-text-secondary)',
          }}
        >
          <tr>
            <th className="px-5 sm:px-6 py-3.5 whitespace-nowrap">Метод / Алгоритм</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Оценка</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Интеграл</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Шаг / Точность</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Вычисленное</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Точное</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Абс. погр. (Δ)</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Отн. погр. (δ)</th>
            <th className="px-4 py-3.5 w-10 whitespace-nowrap"></th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {results.map((row) => {
            const meta = getStatusMeta(statusMap[row.id]);
            return (
              <tr
                key={row.id}
                className="border-b last:border-b-0 transition-colors"
                style={{
                  borderColor: 'var(--apple-border)',
                  backgroundColor: meta.rowBg,
                }}
              >
                <td className="px-5 sm:px-6 py-3.5 whitespace-nowrap">
                  <div className="font-medium whitespace-nowrap">{row.methodName}</div>
                  <div
                    className="text-xs mt-0.5 whitespace-nowrap"
                    style={{ color: 'var(--apple-text-secondary)' }}
                  >
                    {row.algo}
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
                  <div className="whitespace-nowrap">{formatMathFormula(row.func)}</div>
                  <div
                    className="text-xs whitespace-nowrap"
                    style={{ color: 'var(--apple-text-secondary)' }}
                  >
                    [{row.a}; {row.b}]
                  </div>
                </td>
                <td
                  className="px-4 py-3.5 font-mono text-xs whitespace-nowrap"
                  style={{ color: 'var(--apple-text-secondary)' }}
                >
                  {row.step}
                </td>
                <td
                  className="px-4 py-3.5 font-mono font-semibold whitespace-nowrap"
                  style={{ color: 'var(--apple-blue)' }}
                >
                  {row.calcVal}
                </td>
                <td className="px-4 py-3.5 font-mono whitespace-nowrap">{row.exactVal}</td>
                <td
                  className="px-4 py-3.5 font-mono text-xs whitespace-nowrap"
                  style={{ color: 'var(--apple-text-secondary)' }}
                >
                  {row.absErr}
                </td>
                <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                  <span
                    className="px-2.5 py-1 rounded-lg font-medium inline-block whitespace-nowrap"
                    style={meta.badgeStyle}
                  >
                    {row.relErr}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(row.id)}
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
    <>
      <section className="apple-card rounded-2xl overflow-hidden">
        {/* Шапка журнала (все элементы постоянны, без условного появления/скачков) */}
        <div
          className="px-5 sm:px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3"
          style={{ borderColor: 'var(--apple-border)' }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold tracking-tight">
                Журнал вычислений
              </h3>
              <span
                className="text-xs font-mono tabular-nums px-2.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: 'var(--apple-well)',
                  color: 'var(--apple-text-secondary)',
                }}
              >
                {results.length}
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
              onClick={() => setIsExpanded(true)}
              title="Открыть журнал в большом модальном окне"
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
              disabled={results.length === 0}
              className="apple-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2.5v7.5m0 0L5.25 7.25M8 10l2.75-2.75M3 12.5h10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={results.length === 0}
              className="apple-btn-secondary px-3 py-1.5 text-xs cursor-pointer hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Очистить
            </button>
          </div>
        </div>

        {/* Постоянная сводная полоса лучшего результата с кнопкой разворачивания */}
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
              {summaryStats ? `${summaryStats.bestRow.methodName} (${summaryStats.bestRow.relErr})` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span style={{ color: 'var(--apple-text-secondary)' }}>Мин. абс. погр. (Δ):</span>
            <span className="font-mono font-semibold">
              {summaryStats ? summaryStats.bestRow.absErr : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span style={{ color: 'var(--apple-text-secondary)' }}>Макс. абс. погр. (Δ):</span>
            <span className="font-mono font-semibold" style={{ color: summaryStats ? 'var(--apple-red)' : 'var(--apple-text-secondary)' }}>
              {summaryStats ? `${summaryStats.worstRow.absErr} (${summaryStats.worstRow.methodName})` : '—'}
            </span>
          </div>
        </div>

        {results.length === 0 ? (
          <div
            className="h-72 px-6 flex items-center justify-center text-center text-sm"
            style={{ color: 'var(--apple-text-secondary)' }}
          >
            Нажмите «Рассчитать интеграл» или «Сравнить все методы (6 в 1)», чтобы добавить результаты в журнал.
          </div>
        ) : (
          renderTableContent(false)
        )}
      </section>

      {/* Полноэкранное модальное окно в стиле macOS Sheet для детального изучения журнала */}
      {isExpanded &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsExpanded(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Журнал вычислений — полноэкранный режим"
              className="apple-kpi-card rounded-2xl w-full max-w-[1720px] max-h-[90vh] flex flex-col"
            >
              {/* Верхняя панель модального окна */}
              <div
                className="px-5 sm:px-7 py-4 border-b flex items-center justify-between gap-3 shrink-0"
                style={{ borderColor: 'var(--apple-border)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <h2 className="text-lg font-semibold tracking-tight truncate">
                      Журнал вычислений — детальный просмотр
                    </h2>
                    <span
                      className="text-xs font-mono tabular-nums px-2.5 py-0.5 rounded-full font-medium shrink-0"
                      style={{
                        backgroundColor: 'var(--apple-well)',
                        color: 'var(--apple-text-secondary)',
                      }}
                    >
                      Записей: {results.length}
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
                  {results.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="apple-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M8 2.5v7.5m0 0L5.25 7.25M8 10l2.75-2.75M3 12.5h10" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Скачать CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={onClear}
                        className="apple-btn-secondary px-3.5 py-1.5 text-xs cursor-pointer whitespace-nowrap hover:text-red-500"
                      >
                        Очистить
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>Свернуть</span>
                    <span className="font-mono opacity-80">Esc</span>
                  </button>
                </div>
              </div>

              {/* Сводная полоса по результатам */}
              {summaryStats && (
                <div
                  className="px-5 sm:px-7 py-3 border-b flex flex-wrap items-center justify-between gap-x-6 gap-y-2 shrink-0 text-xs"
                  style={{
                    borderColor: 'var(--apple-border)',
                    backgroundColor: 'var(--apple-well)',
                  }}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span style={{ color: 'var(--apple-text-secondary)' }}>Наиболее точный метод:</span>
                    <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      {summaryStats.bestRow.methodName} ({summaryStats.bestRow.relErr})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span style={{ color: 'var(--apple-text-secondary)' }}>Мин. абс. погрешность (Δ):</span>
                    <span className="font-mono font-semibold">
                      {summaryStats.bestRow.absErr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span style={{ color: 'var(--apple-text-secondary)' }}>Макс. абс. погрешность (Δ):</span>
                    <span className="font-mono font-semibold" style={{ color: 'var(--apple-red)' }}>
                      {summaryStats.worstRow.absErr} ({summaryStats.worstRow.methodName})
                    </span>
                  </div>
                </div>
              )}

              {/* Прокручиваемая таблица */}
              {results.length === 0 ? (
                <div
                  className="flex-1 px-6 py-16 flex items-center justify-center text-center text-sm"
                  style={{ color: 'var(--apple-text-secondary)' }}
                >
                  Журнал вычислений пуст.
                </div>
              ) : (
                renderTableContent(true)
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
