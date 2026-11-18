import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const INTEGRAL_SECTIONS = [
  { id: 'overview', title: '1. Обзор системы', short: 'Архитектура и возможности' },
  { id: 'syntax', title: '2. Блок «Параметры расчёта» и синтаксис', short: 'Все поля, пресеты, ползунки, n, h, ε' },
  { id: 'const-methods', title: '3. Методы с постоянным шагом', short: '5 классических формул' },
  { id: 'var-methods', title: '4. Алгоритмы с переменным шагом', short: 'Двойной пересчёт и адаптивный' },
  { id: 'metrics', title: '5. Выводимые числа и погрешности', short: 'Карточки KPI, Δ, δ, SymPy' },
  { id: 'journal', title: '6. График и Журнал вычислений', short: 'Визуализация, оценки, CSV' },
  { id: 'backend', title: '7. Программная реализация (Backend / API)', short: 'Функции Python и эндпоинты' },
];

const ODE_SECTIONS = [
  { id: 'ode-overview', title: '1. Обзор системы', short: 'Архитектура и возможности (ОДУ)' },
  { id: 'ode-syntax', title: '2. Блок «Задача Коши» и синтаксис', short: 'Все поля, пресеты, начальные условия, n, h' },
  { id: 'ode-methods', title: '3. Методы с постоянным шагом', short: 'Методы Эйлера O(h) и Рунге — Кутта O(h⁴)' },
  { id: 'ode-higher', title: '4. ОДУ 2-го порядка и системы ОДУ', short: 'Сведение к системе и подбор шага (п. 3.4)' },
  { id: 'ode-metrics', title: '5. Выводимые числа и погрешности', short: 'Карточки KPI, Δ, правило Рунге, SymPy' },
  { id: 'ode-journal', title: '6. График и Журнал расчётов ОДУ', short: 'Интегральные кривые, узлы, оценки, CSV' },
  { id: 'ode-backend', title: '7. Программная реализация (Backend / API)', short: 'Функции Python и эндпоинты ОДУ' },
];

export default function DocsModal({ isOpen, onClose, appMode = 'integral' }) {
  const [docsModeOverride, setDocsModeOverride] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const docsMode = docsModeOverride || (appMode === 'ode' ? 'ode' : 'integral');
  const activeSections = docsMode === 'ode' ? ODE_SECTIONS : INTEGRAL_SECTIONS;
  const activeTab = activeSections[activeIdx]?.id || activeSections[0].id;

  const handleClose = () => {
    setDocsModeOverride(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDocsModeOverride(null);
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Справочная документация комплекса"
        className="apple-kpi-card rounded-2xl w-full max-w-[1480px] h-[88vh] flex flex-col"
      >
        {/* Шапка окна документации (в точности как в исходной вёрстке + 2 кнопки переключения) */}
        <div
          className="px-5 sm:px-7 py-4 border-b flex items-center justify-between gap-4 shrink-0"
          style={{ borderColor: 'var(--apple-border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="apple-squircle-icon w-9 h-9 flex items-center justify-center text-base font-semibold shrink-0"
              style={{
                background: 'linear-gradient(180deg, #38a1ff 0%, #0071e3 100%)',
              }}
            >
              ?
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight truncate">
                Документация и математический справочник
              </h2>
              <p className="text-xs truncate" style={{ color: 'var(--apple-text-secondary)' }}>
                Полное описание алгоритмов, формул, параметров ввода и выводимых показателей
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="apple-segmented flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setDocsModeOverride('integral')}
                className={`px-3 py-1.5 text-xs cursor-pointer whitespace-nowrap ${
                  docsMode === 'integral'
                    ? 'apple-segmented-item apple-segmented-item-active'
                    : 'apple-segmented-item'
                }`}
              >
                ∫ Интегралы
              </button>
              <button
                type="button"
                onClick={() => setDocsModeOverride('ode')}
                className={`px-3 py-1.5 text-xs cursor-pointer whitespace-nowrap ${
                  docsMode === 'ode'
                    ? 'apple-segmented-item apple-segmented-item-active'
                    : 'apple-segmented-item'
                }`}
              >
                y&apos; ОДУ
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Закрыть</span>
              <span className="font-mono opacity-80">Esc</span>
            </button>
          </div>
        </div>

        {/* Основная область: слева навигация по разделам, справа подробное описание */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Боковое меню разделов */}
          <aside
            className="lg:w-80 border-b lg:border-b-0 lg:border-r p-3 sm:p-4 overflow-x-auto lg:overflow-y-auto apple-scroll shrink-0 flex lg:flex-col gap-1.5"
            style={{
              borderColor: 'var(--apple-border)',
              backgroundColor: 'var(--apple-well)',
            }}
          >
            {activeSections.map((sec, idx) => {
              const active = activeIdx === idx;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  style={
                    active
                      ? {
                          backgroundColor: 'var(--apple-blue)',
                          color: '#ffffff',
                        }
                      : {
                          color: 'var(--apple-text)',
                        }
                  }
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0 lg:shrink ${
                    active ? 'shadow-sm' : 'hover:opacity-80'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-medium whitespace-nowrap lg:whitespace-normal">
                    {sec.title}
                  </div>
                  <div
                    className="text-xs mt-0.5 hidden lg:block"
                    style={{
                      color: active ? 'rgba(255, 255, 255, 0.82)' : 'var(--apple-text-secondary)',
                    }}
                  >
                    {sec.short}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Контент выбранного раздела */}
          <div className="flex-1 overflow-y-auto apple-scroll p-5 sm:p-8 space-y-6 text-sm leading-relaxed">
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    1. Назначение и архитектура программного комплекса
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Программный комплекс предназначен для численного вычисления определённых интегралов вида{' '}
                    <span className="font-mono font-medium whitespace-nowrap" style={{ color: 'var(--apple-text)' }}>
                      I = ∫<sub>a</sub><sup>b</sup> f(x) dx
                    </span>
                    , сопоставления численных методов с аналитическим эталоном SymPy и визуального анализа разбиения области интегрирования.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      Символьное ядро (SymPy Engine)
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Выполняет безопасный разбор математической строки, компилирует быструю функцию вычисления{' '}
                      <code className="font-mono">lambdify</code> и находит точное аналитическое значение определённого интеграла{' '}
                      <code className="font-mono">sympy.integrate(expr, (x, a, b))</code> для расчёта истинной погрешности.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      6 численных схем интегрирования
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Реализованы 4 квадратурные формулы с постоянным шагом (левые и правые прямоугольники, трапеции, параболы Симпсона) и 2 автоматических алгоритма с переменным шагом (правило Рунге двойного пересчёта и локально-адаптивное дробление).
                    </p>
                  </div>
                </div>

                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold">Что происходит при нажатии кнопок расчёта:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>«Рассчитать интеграл»</b> — отправляет запрос{' '}
                      <code className="font-mono">POST /api/integrate</code> с выбранным режимом и параметрами, обновляет 4 верхние карточки метрик, строит геометрическую интерпретацию на графике и добавляет строку в «Журнал вычислений».
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>«Сравнить все методы (6 в 1)»</b> — отправляет запрос{' '}
                      <code className="font-mono">POST /api/integrate/compare</code>, одновременно вычисляя интеграл всеми 6 реализованными методами при текущих{' '}
                      <code className="font-mono">n</code> и <code className="font-mono">ε</code>, чтобы наглядно сравнить их точность и скорость сходимости в журнале.
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'syntax' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    2. Полное устройство блока «Параметры расчёта» и синтаксис функций
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Левая панель <b>«Параметры расчёта»</b> управляет постановкой задачи интегрирования, выбором численной схемы и дискретизацией сетки. Ниже подробно описан каждый элемент этого блока сверху вниз.
                  </p>
                </div>

                {/* 1. Шапка и формула */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    1. Математическая запись интеграла и пределы [a; b]:
                  </h4>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>Кнопка <code className="font-mono">⇅ a ↔ b</code></b> (в правом верхнем углу блока) — мгновенно меняет местами значения нижнего (<code className="font-mono">a</code>) и верхнего (<code className="font-mono">b</code>) пределов интегрирования для проверки свойства антисимметрии{' '}
                      <code className="font-mono whitespace-nowrap">
                        ∫<sub>a</sub><sup>b</sup> f(x) dx = −∫<sub>b</sub><sup>a</sup> f(x) dx
                      </code>
                      .
                    </div>
                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>Визуальный символ интеграла <code className="font-mono">∫</code> с подписями <code className="font-mono">b</code> и <code className="font-mono">a</code></b> — в реальном времени отображает введённые значения верхнего (над знаком <code className="font-mono">∫</code>) и нижнего (под знаком <code className="font-mono">∫</code>) пределов. Справа от поля ввода функции стоит символ дифференциала <code className="font-mono">dx</code>, образуя классическую запись определённого интеграла.
                    </div>
                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>Поле «Функция f(x)»</b> — текстовое поле ввода аналитического выражения одной независимой переменной <code className="font-mono">x</code>. При изменении формулы интерактивный график справа перестраивается мгновенно без необходимости нажимать кнопку расчёта.
                    </div>
                    <div>
                      <b>Поля «Нижний предел (a)» и «Верхний предел (b)»</b> — числовые поля ввода границ интегрирования (поддерживают целые и дробные вещественные числа):
                      <ul className="list-disc pl-5 mt-1 space-y-1" style={{ color: 'var(--apple-text-secondary)' }}>
                        <li>При <code className="font-mono">a &lt; b</code> — стандартное интегрирование слева направо.</li>
                        <li>При <code className="font-mono">a == b</code> — отрезок нулевой длины, численный и точный интегралы строго равны <code className="font-mono">0</code>.</li>
                        <li>При <code className="font-mono">a &gt; b</code> — под полями автоматически появляется информационная плашка: <i>«Нижний предел a = ... больше верхнего b = ... (знак интеграла инвертирован)»</i>, а все алгоритмы учитывают отрицательное направление обхода.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. Готовые функции (пресеты) */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    2. Секция «Готовые функции» (6 эталонных тестовых пресетов):
                  </h4>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    Кнопки быстрого выбора автоматически подставляют как саму функцию <code className="font-mono">f(x)</code>, так и оптимальный отрезок <code className="font-mono">[a; b]</code> (активный пресет подсвечивается синей рамкой):
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>sin(x) + 2</span> на <code className="font-mono">[0; 3.14]</code> — гладкая положительная тригонометрическая полуволна.
                    </div>
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>x² + 1</span> на <code className="font-mono">[0; 3]</code> — квадратичная парабола (на ней метод Симпсона даёт 0% погрешности даже при минимальном <code className="font-mono">n = 2</code>).
                    </div>
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>e<sup>−x²</sup></span> (<code className="font-mono">exp(−x²)</code>) на <code className="font-mono">[−2; 2]</code> — кривая Гаусса (интеграл Пуассона / функция ошибок <code className="font-mono">erf</code>, не берущийся в элементарных функциях).
                    </div>
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>1 / (1 + x²)</span> на <code className="font-mono">[−2; 2]</code> — классическая функция Рунге (производная <code className="font-mono">atan(x)</code>).
                    </div>
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>x · sin(x)</span> на <code className="font-mono">[0; 6.28]</code> — знакопеременная функция с растущей амплитудой.
                    </div>
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>cos(2·x) + x / 2</span> на <code className="font-mono">[0; 4]</code> — наложение быстрой косинусоиды на линейный рост.
                    </div>
                  </div>
                </div>

                {/* 3. Настройки режима Постоянный шаг */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    3. Элементы управления в режиме «Постоянный шаг»:
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Карточки «Численный метод» (4 варианта)</b> — переключают формулу интегрирования. На каждой карточке указано название метода, краткая математическая запись аппроксимации на шаге (<code className="font-mono">yᵢ = f(xᵢ)</code>, <code className="font-mono">yᵢ = f(xᵢ₊₁)</code>, <code className="font-mono">(f(xᵢ) + f(xᵢ₊₁)) / 2</code>, <code className="font-mono">Параболическая интерполяция</code>) и плашка теоретического порядка точности (<code className="font-mono">O(h)</code>, <code className="font-mono">O(h²)</code>, <code className="font-mono">O(h⁴)</code>).
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Индикатор шага интегрирования <code className="font-mono">h = 0.1570</code> (плашка над полем ввода <code className="font-mono">n</code>)</b> — автоматически вычисляет и в реальном времени отображает длину (ширину по оси <code className="font-mono">X</code>) одного элементарного участка разбиения по формуле <code className="font-mono">h = |b - a| / n</code> с точностью до 4 знаков после запятой (<code className="font-mono">toFixed(4)</code>). Например, при <code className="font-mono">a = 0</code>, <code className="font-mono">b = 3.14</code> и <code className="font-mono">n = 20</code> шаг равен <code className="font-mono">h = |3.14 - 0| / 20 = 0.1570</code>. Геометрически <code className="font-mono">h</code> — это основание каждого прямоугольника или трапеции на графике; чем меньше <code className="font-mono">h</code>, тем выше точность численного метода.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Интерактивный ползунок и поле ввода <code className="font-mono">Разбиения (n)</code></b> — ползунок позволяет плавно менять <code className="font-mono">n</code> от <code className="font-mono">2</code> до <code className="font-mono">100</code>, наблюдая за перестроением прямоугольников/трапеций/парабол на графике в реальном времени, а числовое поле справа позволяет ввести любое значение <code className="font-mono">n</code> вплоть до <code className="font-mono">1 000 000</code>.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Быстрые кнопки выбора <code className="font-mono">n</code> (<code className="font-mono">4, 10, 20, 50, 100, 500</code>)</b> — позволяют в один клик задать типовую густоту сетки для исследования сходимости метода.
                    </li>
                  </ul>
                </div>

                {/* 4. Настройки режима Переменный шаг и кнопки запуска */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    4. Элементы управления в режиме «Переменный шаг» и кнопки действий:
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Карточки «Алгоритм контроля шага»</b> — выбор между <b>«Метод Рунге (Автошаг)»</b> (бейдж <code className="font-mono">|I₂ₙ − Iₙ| &lt; ε</code>, равномерное удвоение сетки <code className="font-mono">n → 2n</code>) и <b>«Адаптивный шаг»</b> (бейдж <code className="font-mono">Локальный h</code>, независимое дробление на участках большой кривизны).
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Поле «Требуемая точность (ε)» и кнопки пресетов (<code className="font-mono">0.01, 0.001, 0.0001, 0.00001</code>)</b> — задают целевую погрешность <code className="font-mono">ε</code>.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Блок диагностики ошибок</b> — если введена синтаксически неверная функция или функция терпит разрыв/неопределённость на отрезке <code className="font-mono">[a; b]</code> (например, корень из отрицательного числа или деление на ноль), над кнопками расчёта появляется красное уведомление с точным описанием причины.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Кнопки «Рассчитать интеграл» и «Сравнить все методы (6 в 1)»</b> — запускают одиночный расчёт выбранным методом либо одновременное сравнение всех 6 методов комплекса.
                    </li>
                  </ul>
                </div>

                {/* 5. Таблица синтаксиса */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    5. Справочник поддерживаемого математического синтаксиса f(x):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-mono">
                    <div>• <b>+, -, *, /</b> — арифметические операции</div>
                    <div>• <b>x^2</b> или <b>x**2</b> — возведение в степень</div>
                    <div>• <b>sin(x), cos(x), tan(x)</b> — тригонометрия</div>
                    <div>• <b>asin(x), acos(x), atan(x)</b> — аркфункции</div>
                    <div>• <b>exp(x)</b> или <b>e^x</b> — экспонента</div>
                    <div>• <b>ln(x)</b> или <b>log(x)</b> — натуральный логарифм</div>
                    <div>• <b>sqrt(x)</b> — квадратный корень</div>
                    <div>• <b>pi</b> (π ≈ 3.14159265), <b>e</b> (≈ 2.7182818)</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'const-methods' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    3. Методы численного интегрирования с постоянным шагом
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Отрезок <code className="font-mono">[a, b]</code> делится на <code className="font-mono">n</code> равных частей с постоянным шагом{' '}
                    <code className="font-mono font-semibold">h = (b − a) / n</code> и узлами{' '}
                    <code className="font-mono">xᵢ = a + i·h</code>.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                        1. Метод левых прямоугольников (left_rect)
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--apple-card)', color: 'var(--apple-text-secondary)' }}>
                        Порядок точности O(h)
                      </span>
                    </div>
                    <div className="font-mono text-xs sm:text-sm py-1">
                      I ≈ h · ∑<sub>i=0</sub><sup>n−1</sup> f(x<sub>i</sub>),   где x<sub>i</sub> = a + i·h
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      На каждом элементарном участке функция заменяется константой, равной её значению в левой границе участка <code className="font-mono">x<sub>i</sub></code>.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                        2. Метод правых прямоугольников (right_rect)
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--apple-card)', color: 'var(--apple-text-secondary)' }}>
                        Порядок точности O(h)
                      </span>
                    </div>
                    <div className="font-mono text-xs sm:text-sm py-1">
                      I ≈ h · ∑<sub>i=1</sub><sup>n</sup> f(x<sub>i</sub>),   где x<sub>i</sub> = a + i·h
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Высота каждого прямоугольника берётся в правой точке элементарного отрезка <code className="font-mono">x<sub>i+1</sub></code>.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                        3. Метод трапеций (trapezoid)
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--apple-card)', color: 'var(--apple-text-secondary)' }}>
                        Порядок точности O(h²)
                      </span>
                    </div>
                    <div className="font-mono text-xs sm:text-sm py-1">
                      I ≈ h · [ (f(a) + f(b)) / 2 + ∑<sub>i=1</sub><sup>n−1</sup> f(x<sub>i</sub>) ]
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Дуга графика на каждом шаге аппроксимируется хордой (прямолинейной трапецией), соединяющей точки <code className="font-mono">(x<sub>i</sub>, f(x<sub>i</sub>))</code> и <code className="font-mono">(x<sub>i+1</sub>, f(x<sub>i+1</sub>))</code>.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                        4. Метод парабол / Формула Симпсона (simpson)
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--apple-card)', color: 'var(--apple-text-secondary)' }}>
                        Порядок точности O(h⁴)
                      </span>
                    </div>
                    <div className="font-mono text-xs sm:text-sm py-1">
                      I ≈ (h / 3) · [ f(a) + f(b) + 4·∑<sub>нечёт</sub> f(x<sub>i</sub>) + 2·∑<sub>чёт</sub> f(x<sub>i</sub>) ]
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      На каждой паре соседних участков функция приближается квадратичной параболой Лагранжа по трём узлам. Обладает наивысшей точностью <code className="font-mono">O(h⁴)</code> среди методов постоянного шага.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                        5. Метод средних прямоугольников (mid_rect — в вычислительном ядре API)
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--apple-card)', color: 'var(--apple-text-secondary)' }}>
                        Порядок точности O(h²)
                      </span>
                    </div>
                    <div className="font-mono text-xs sm:text-sm py-1">
                      I ≈ h · ∑<sub>i=0</sub><sup>n−1</sup> f(x<sub>i</sub> + h / 2),   где x<sub>i</sub> = a + i·h
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Функция на каждом шаге аппроксимируется значением в центральной точке подотрезка <code className="font-mono">x<sub>i</sub> + h/2</code> (доступен через эндпоинт <code className="font-mono">POST /api/integrate/const</code> при <code className="font-mono">method=5</code>, а также используется внутри шага удвоения локально-адаптивного алгоритма).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'var-methods' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    4. Алгоритмы с переменным шагом (автоматический контроль точности ε)
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    В режиме <b>«Переменный шаг»</b> пользователь задаёт желаемую точность <code className="font-mono">ε</code>, а программа автоматически подбирает густоту сетки.
                  </p>
                </div>

                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <div className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    1. Алгоритм двойного пересчёта (правило Рунге)
                  </div>
                  <div className="font-mono text-xs sm:text-sm">
                    Условие остановки: |I₂ₙ − Iₙ| ≤ ε
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    Расчёт начинается с <code className="font-mono">n = 4</code> и шага <code className="font-mono">h = (b − a) / 4</code>. На каждой итерации шаг делится пополам (<code className="font-mono">n ← 2n</code>, <code className="font-mono">h ← h/2</code>), вычисляется новое приближение <code className="font-mono">I₂ₙ</code> по формуле левых прямоугольников и сравнивается с предыдущим <code className="font-mono">Iₙ</code>. Как только разница становится не больше <code className="font-mono">ε</code>, алгоритм возвращает достигнутое значение и итоговое число разбиений <code className="font-mono">n</code>.
                  </p>
                </div>

                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <div className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    2. Локально-адаптивный алгоритм (адаптивное дробление)
                  </div>
                  <div className="font-mono text-xs sm:text-sm">
                    Локальный критерий на отрезке [x, x+h]: |I₁ − I₂| ≤ ε · (h / (b − a))
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    На каждом текущем участке <code className="font-mono">[x, x+h]</code> сравниваются площадь одного прямоугольника <code className="font-mono">I₁ = f(x)·h</code> и сумма двух половинных прямоугольников <code className="font-mono">I₂ = (f(x) + f(x + h/2))·(h/2)</code>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      Если погрешность превышает локальный допуск, шаг <code className="font-mono">h</code> уменьшается вдвое ровно на этом сложном участке.
                    </li>
                    <li>
                      Если условие выполнено, площадь <code className="font-mono">I₂</code> добавляется в общую сумму, а отрезок сохраняется для отрисовки на графике.
                    </li>
                    <li>
                      Дополнительно программа считает точное <b>число участков</b> и <b>число вызовов функции f(x)</b> (например: <code className="font-mono">eps=0.001 (уч=46, f()=118)</code>).
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'metrics' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    5. Подробное описание всех выводимых чисел и показателей
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    В верхней части рабочей области расположены 4 сводных блока ключевых показателей (KPI), а также строка параметров под ними.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="apple-squircle-icon w-7 h-7 flex items-center justify-center text-sm font-serif italic shrink-0"
                        style={{ background: 'linear-gradient(180deg, #38a1ff 0%, #0071e3 100%)' }}
                      >
                        ∫
                      </span>
                      <span className="font-semibold">
                        1. Численный результат (I<sub>числ</sub>)
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Приближённое значение определённого интеграла, вычисленное выбранным численным методом с точностью до 8 знаков после запятой. Под числом выводится название применённого метода.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="apple-squircle-icon w-7 h-7 flex items-center justify-center text-sm font-mono font-semibold shrink-0"
                        style={{ background: 'linear-gradient(180deg, #7d7aff 0%, #5856d6 100%)' }}
                      >
                        =
                      </span>
                      <span className="font-semibold">
                        2. Точное (SymPy) (I<sub>точн</sub>)
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Эталонное аналитическое значение интеграла по формуле Ньютона — Лейбница, найденное символьным ядром <code className="font-mono">SymPy</code>. Под числом отображаются пределы интегрирования <code className="font-mono">[a; b]</code>.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="apple-squircle-icon w-7 h-7 flex items-center justify-center text-xs font-mono font-semibold shrink-0"
                        style={{ background: 'linear-gradient(180deg, #34d058 0%, #248a3d 100%)' }}
                      >
                        Δ
                      </span>
                      <span className="font-semibold">3. Абсолютная погрешность (Δ)</span>
                    </div>
                    <div className="font-mono text-xs">
                      Δ = |I<sub>точн</sub> − I<sub>числ</sub>|
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Модуль разности между точным аналитическим и численным значениями в экспоненциальной записи (например, <code className="font-mono">1.0327e-5</code>). В подписи выводится использованный шаг (<code className="font-mono">n=...</code> или статистика <code className="font-mono">eps=... (уч=..., f()=...)</code>).
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="apple-squircle-icon w-7 h-7 flex items-center justify-center text-xs font-mono font-semibold shrink-0"
                        style={{ background: 'linear-gradient(180deg, #ffab2e 0%, #ef8600 100%)' }}
                      >
                        %
                      </span>
                      <span className="font-semibold">4. Относительная погрешность (δ)</span>
                    </div>
                    <div className="font-mono text-xs">
                      δ = ( |I<sub>точн</sub> − I<sub>числ</sub>| / |I<sub>точн</sub>| ) · 100%
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Отношение абсолютной погрешности к модулю точного значения, выраженное в процентах с точностью до 4 знаков (<code className="font-mono">toFixed(4)%</code>). При <code className="font-mono">I<sub>точн</sub> = 0</code> полагается равным <code className="font-mono">0.0000%</code>. В нижней строке карточки выводится тип алгоритма шага.
                    </p>
                  </div>
                </div>

                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    Нижняя информационная панель графика (4 блока под холстом SVG):
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Метод</b> — текущая выбранная схема численного интегрирования, которая в данный момент визуализируется на графике.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Параметр сетки</b> — активный параметр дискретизации: <code className="font-mono">n = ...</code> (при постоянном шаге), <code className="font-mono">ε = ...</code> (при двойном пересчёте) или <code className="font-mono">Участков: ...</code> (фактическое количество адаптивных подотрезков, полученных от сервера).
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Отрезок [a, b]</b> — текущие числовые границы интегрирования и длина интервала <code className="font-mono">L = |b - a|</code>.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Состояние</b> — индикатор корректности математического выражения (<code className="font-mono">Готово к расчёту</code> с зелёным индикатором или предупреждение о некорректном синтаксисе).
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'journal' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    6. Интерактивный график и полный справочник «Журнала вычислений»
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Подробное описание каждого столбца, числа, алгоритма ранжирования и кнопок управления журнала.
                  </p>
                </div>

                {/* Все столбцы таблицы */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    Все столбцы и числа таблицы «Журнал вычислений»:
                  </h4>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>1. Метод / Алгоритм</b> — состоит из двух строк:
                      <ul className="list-disc pl-5 mt-1 space-y-0.5" style={{ color: 'var(--apple-text-secondary)' }}>
                        <li>Верхняя строка (<code className="font-mono">methodName</code>): название квадратурной формулы (<i>Левые прямоугольники, Правые прямоугольники, Средние прямоугольники, Трапеции, Параболы (Симпсон), Двойной пересчет, Адаптивный (лев. прям.)</i>).</li>
                        <li>Нижняя подпись (<code className="font-mono">algo</code>): режим сетки — <code className="font-mono">Постоянный шаг</code>, <code className="font-mono">Переменный (Двойной пересчет)</code> или <code className="font-mono">Переменный (Адаптивный)</code>.</li>
                      </ul>
                    </div>

                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>2. Оценка</b> — выровненный в единый вертикальный столбик цветной бейдж (<code className="font-mono">Лучший</code>, <code className="font-mono">Средний</code>, <code className="font-mono">Худший</code>), автоматически присваиваемый каждой записи при любом изменении журнала.
                    </div>

                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>3. Интеграл</b> — содержит:
                      <ul className="list-disc pl-5 mt-1 space-y-0.5" style={{ color: 'var(--apple-text-secondary)' }}>
                        <li>Верхняя строка (<code className="font-mono">func</code>): символьная запись функции <code className="font-mono">f(x)</code>, для которой проводился расчёт.</li>
                        <li>Нижняя строка (<code className="font-mono">[a; b]</code>): точные пределы интегрирования на момент расчёта.</li>
                      </ul>
                    </div>

                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>4. Шаг / Точность (<code className="font-mono">step</code>)</b> — детальная телеметрия разбиения в зависимости от выбранного алгоритма:
                      <ul className="list-disc pl-5 mt-1 space-y-1" style={{ color: 'var(--apple-text-secondary)' }}>
                        <li>Для постоянного шага: <code className="font-mono">n=16</code> — фактическое количество равных подотрезков (с учётом автокоррекции чётности для метода Симпсона).</li>
                        <li>Для двойного пересчёта (Рунге): <code className="font-mono">eps=0.001 (n=1024)</code> — заданная точность <code className="font-mono">ε</code> и итоговое число разбиений <code className="font-mono">n = 2ᵏ</code>, на котором сработало условие остановки <code className="font-mono">|I₂ₙ − Iₙ| ≤ ε</code>.</li>
                        <li>Для локально-адаптивного алгоритма: <code className="font-mono">eps=0.001 (уч=46, f()=118)</code> — где <code className="font-mono">eps</code> — заданный допуск, <code className="font-mono">уч</code> (<code className="font-mono">segments</code>) — итоговое число принятых элементарных отрезков разной длины, <code className="font-mono">f()</code> (<code className="font-mono">func_evals</code>) — общее количество обращений к подынтегральной функции <code className="font-mono">f(x)</code> за время работы алгоритма.</li>
                      </ul>
                    </div>

                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>5. Вычисленное (<code className="font-mono">calcVal</code>)</b> — итоговое численное значение интеграла, отформатированное с фиксированной точностью <b>8 знаков после запятой</b> (<code className="font-mono">toFixed(8)</code>).
                    </div>

                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>6. Точное (<code className="font-mono">exactVal</code>)</b> — аналитическое значение интеграла, вычисленное символьным ядром SymPy и отформатированное до <b>8 знаков после запятой</b> (<code className="font-mono">toFixed(8)</code>).
                    </div>

                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>7. Абс. погр. (Δ, <code className="font-mono">absErr</code>)</b> — абсолютная погрешность <code className="font-mono">|I* − Iч|</code> в научной экспоненциальной форме с 4 значащими цифрами мантиссы (<code className="font-mono">toExponential(4)</code>, например <code className="font-mono">1.7290e-7</code> = <code className="font-mono">1.7290 × 10⁻⁷</code>).
                    </div>

                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>8. Отн. погр. (δ, <code className="font-mono">relErr</code>)</b> — относительная погрешность в процентах (<code className="font-mono">toFixed(4)%</code>) внутри цветной плашки, соответствующей оценке строки.
                    </div>

                    <div>
                      <b>9. Кнопка удаления строки (<code className="font-mono">✕</code>)</b> — удаляет конкретный эксперимент из журнала, после чего ранги (<code className="font-mono">Лучший / Средний / Худший</code>) и верхние KPI-карточки мгновенно пересчитываются.
                    </div>
                  </div>
                </div>

                {/* Правила расчёта оценки */}
                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    Математическое правило присвоения оценок («Лучший», «Средний», «Худший»):
                  </h4>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    Алгоритм классификации (<code className="font-mono">statusMap</code>) работает в двух режимах:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b>Если для данной задачи (f(x), a, b) в журнале всего 1 запись:</b> оценка ставится по порогу относительной погрешности <code className="font-mono">δ</code>: при <code className="font-mono">δ &lt; 0.05%</code> — <b>Лучший</b>, при <code className="font-mono">0.05% ≤ δ &lt; 1.5%</code> — <b>Средний</b>, при <code className="font-mono">δ ≥ 1.5%</code> — <b>Худший</b>.
                    </li>
                    <li>
                      <b>Если для одной и той же задачи (f(x), a, b) в журнале 2 и более записей:</b> записи группируются по ключу <code className="font-mono">func|a|b</code>, и внутри каждой задачи находятся минимальная <code className="font-mono">minErr = min(Δ)</code> и максимальная <code className="font-mono">maxErr = max(Δ)</code> абсолютные погрешности:
                    </li>
                  </ul>
                  <ul className="space-y-2 pt-1 text-xs sm:text-sm">
                    <li className="flex items-center gap-2.5">
                      <span
                        className="inline-flex items-center justify-center min-w-[5.25rem] text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'var(--apple-blue)', color: '#ffffff' }}
                      >
                        Лучший
                      </span>
                      <span style={{ color: 'var(--apple-text-secondary)' }}>
                        Присваивается всем строкам, у которых <code className="font-mono">|Δ - minErr| ≤ 10⁻¹⁵</code> (наименьшая абсолютная погрешность в выборке). Строка подсвечивается синим тоном.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span
                        className="inline-flex items-center justify-center min-w-[5.25rem] text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'var(--apple-amber-badge)', color: 'var(--apple-amber)' }}
                      >
                        Средний
                      </span>
                      <span style={{ color: 'var(--apple-text-secondary)' }}>
                        Присваивается всем промежуточным результатам (<code className="font-mono">minErr &lt; Δ &lt; maxErr</code>). Строка подсвечивается янтарным тоном.
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span
                        className="inline-flex items-center justify-center min-w-[5.25rem] text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'var(--apple-red-badge)', color: 'var(--apple-red)' }}
                      >
                        Худший
                      </span>
                      <span style={{ color: 'var(--apple-text-secondary)' }}>
                        Присваивается строкам с максимальной погрешностью <code className="font-mono">|Δ - maxErr| ≤ 10⁻¹⁵</code> (при условии <code className="font-mono">maxErr &gt; minErr</code>). Строка подсвечивается красным тоном.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Функционал кнопок и полноэкранного режима журнала */}
                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    Кнопки управления и полноэкранный режим журнала:
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Счётчик записей</b> — круглая плашка рядом с заголовком «Журнал вычислений», отображающая общее число строк в таблице.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Кнопка «На весь экран»</b> — открывает широкоформатное модальное окно детального просмотра (<code className="font-mono">max-w-[1720px]</code>) с закреплённой шапкой таблицы и дополнительной <b>сводной аналитической полосой</b>:
                      <ul className="list-disc pl-5 mt-1 space-y-0.5">
                        <li><i>Наиболее точный метод</i> — название лучшего метода и его относительная погрешность <code className="font-mono">δ (%)</code>.</li>
                        <li><i>Мин. абс. погрешность (Δ)</i> — минимальное достигнутое абсолютное отклонение в выборке.</li>
                        <li><i>Макс. абс. погрешность (Δ)</i> — максимальное абсолютное отклонение и название метода, давшего его.</li>
                      </ul>
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Кнопка «CSV» / «Скачать CSV»</b> — экспортирует весь журнал в табличный файл <code className="font-mono">numerical_integration_YYYY-MM-DD.csv</code> в кодировке <code className="font-mono">UTF-8 с BOM (\uFEFF)</code> с разделителем точка с запятой (<code className="font-mono">;</code>) для прямого открытия в Excel / Numbers. Выгружаются все 11 столбцов: <i>Оценка, Функция, Предел A, Предел B, Алгоритм, Метод, Шаг / Точность, Вычисленное, Точное, Абс. погрешность, Отн. погрешность (%)</i>.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Кнопка «Очистить»</b> — удаляет все накопленные записи журнала и сбрасывает верхние индикаторы в состояние ожидания.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Горизонтальная и вертикальная прокрутка</b> — таблица имеет защиту от переноса строк (<code className="font-mono">whitespace-nowrap</code>) и плавный скролл слева направо на любых разрешениях экрана.
                    </li>
                  </ul>
                </div>

                {/* Элементы интерактивного графика */}
                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    Элементы интерактивного графика:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b>Синяя гладкая кривая</b> — точный график подынтегральной функции <code className="font-mono">y = f(x)</code> (360 точек семплирования).
                    </li>
                    <li>
                      <b>Закрашенные фигуры разбиения</b> — прямоугольники (левые, правые, средние), трапеции, квадратичные параболы Лагранжа (для Симпсона) или подотрезки переменной ширины (для адаптивного алгоритма).
                    </li>
                    <li>
                      <b>Вертикальные пунктирные линии a и b</b> — границы отрезка интегрирования.
                    </li>
                    <li>
                      <b>Центральный инспектор координат</b> — при наведении курсора вверху по центру показывает точные координаты <code className="font-mono">x</code> и <code className="font-mono">f(x)</code> с перекрестием на кривой.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'backend' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    7. Программная реализация модуля интегрирования (Backend / API)
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Серверная часть реализована на Python (<code className="font-mono">FastAPI + SymPy</code>) и разделена на аналитический парсер и вычислительное ядро квадратурных формул:
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      backend/parser.py — parse_and_evaluate(func_str, a, b)
                    </div>
                    <p style={{ color: 'var(--apple-text-secondary)' }}>
                      Нормализует синтаксис (<code className="font-mono">^ → **</code>, <code className="font-mono">ln → log</code>, <code className="font-mono">log10</code>, <code className="font-mono">cbrt</code>, неявное умножение <code className="font-mono">2x → 2*x</code> без искажения научной нотации <code className="font-mono">1e-3</code>), строит символьное дерево SymPy, проверяет отсутствие посторонних переменных, компилирует быструю функцию <code className="font-mono">f(x)</code> с проверкой области определения (<code className="font-mono">math.isfinite</code>) и вычисляет точный интеграл <code className="font-mono">sympy.integrate</code>.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      backend/math_engine.py — Численные методы интегрирования
                    </div>
                    <ul className="list-disc pl-5 space-y-1 font-mono text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      <li>left_rect(f, a, b, n), right_rect(f, a, b, n), mid_rect(f, a, b, n), trapezoid(f, a, b, n), simpson(f, a, b, n) — 5 квадратурных формул с постоянным шагом</li>
                      <li>runge_algorithm_left_rect(f, a, b, eps) — правило Рунге двойного пересчёта с удвоением сетки n → 2n и возвратом кортежа (res, final_n, runge_err)</li>
                      <li>adaptive_algorithm_left_rect(f, a, b, eps, return_segments=True) — локально-адаптивное интегрирование с пропорциональным масштабированием допуска ε · (h / (b - a)) и возвратом списка подотрезков [x0, x1]</li>
                    </ul>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      backend/main.py — HTTP Эндпоинты численного интегрирования
                    </div>
                    <ul className="list-disc pl-5 space-y-1 font-mono text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      <li>POST /api/integrate/const — расчёт выбранной квадратурной формулой с постоянным шагом h = (b - a) / n</li>
                      <li>POST /api/integrate/variable — расчёт алгоритмом двойного пересчёта (Рунге) или локально-адаптивным дроблением</li>
                      <li>POST /api/integrate/compare — пакетное сравнение всех 6 методов при одинаковых параметрах n и ε</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* ПОЛНАЯ 7-РАЗДЕЛЬНАЯ ДОКУМЕНТАЦИЯ ДЛЯ МОДУЛЯ РЕШЕНИЯ ЗАДАЧИ КОШИ ОДУ */}
            {/* =================================================================== */}

            {activeTab === 'ode-overview' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    1. Назначение и архитектура модуля решения задачи Коши для ОДУ
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Модуль <b>«y&apos; ОДУ»</b> предназначен для численного и аналитического решения начальной задачи (задачи Коши) для обыкновенных дифференциальных уравнений 1-го и 2-го порядков, а также нормальных систем из 3-х дифференциальных уравнений на заданном отрезке с равномерным шагом{' '}
                    <span className="font-mono font-medium" style={{ color: 'var(--apple-text)' }}>
                      h = (b − x₀) / n
                    </span>
                    .
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      Символьный решатель (SymPy dsolve) + эталон РК4
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Для ОДУ 1-го порядка сервер автоматически обращается к символьному решателю{' '}
                      <code className="font-mono">sympy.dsolve(ode_eq, y(x), ics=...)</code>, находит точную аналитическую формулу интегральной кривой (например,{' '}
                      <code className="font-mono">y(x) = exp(−x·(x − 2)/2)</code>) и вычисляет истинную погрешность в каждом узле сетки. Если уравнение не интегрируется в элементарных функциях (а также для ОДУ 2-го порядка и систем), эталонное решение строится методом Рунге — Кутта 4-го порядка на сверхмелкой сетке (до <code className="font-mono">60 000</code> шагов).
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      Два одношаговых метода и двойной пересчёт на сетке h/2
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Каждая задача одновременно просчитывается <b>явным методом Эйлера</b> 1-го порядка точности{' '}
                      <code className="font-mono">O(h)</code> и <b>классическим методом Рунге — Кутта 4-го порядка</b>{' '}
                      <code className="font-mono">O(h⁴)</code> как на основной сетке с шагом <code className="font-mono">h</code> (<code className="font-mono">n</code> частей), так и на сгущённой сетке с половинным шагом <code className="font-mono">h/2</code> (<code className="font-mono">2n</code> частей) для вычисления апостериорной оценки погрешности по правилу Рунге.
                    </p>
                  </div>
                </div>

                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold">Что происходит при нажатии трёх кнопок расчёта:</h4>
                  <ul className="list-disc pl-5 space-y-2.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>«Решить задачу Коши»</b> — отправляет запрос к соответствующему эндпоинту (<code className="font-mono">/api/ode/first</code>, <code className="font-mono">/api/ode/second</code> или <code className="font-mono">/api/ode/system</code>) с выбранным методом (<code className="font-mono">euler</code> или <code className="font-mono">rk4</code>), обновляет 4 верхние карточки KPI, строит на графике 3 интегральные кривые (Эталон, Эйлер, РК4), заполняет «Таблицу узлов решения» и добавляет запись в «Журнал расчётов ОДУ».
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>«Сравнить Эйлера и Рунге — Кутта»</b> — за один клик выполняет расчёт текущей задачи обоими методами на одной и той же сетке <code className="font-mono">n</code> и одновременно записывает обе строки в «Журнал расчётов ОДУ», где они автоматически ранжируются бейджами <code className="font-mono">Лучший</code> и <code className="font-mono">Худший</code> с подсчётом минимальной и максимальной погрешностей.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>«Подобрать шаг Эйлера (п. 3.4)»</b> — реализует требование пункта 3.4 методических указаний: автоматически уменьшает шаг <code className="font-mono">h</code> (удваивая число разбиений <code className="font-mono">n = 10, 20, 40, 80, ...</code> для ОДУ 1-го порядка или увеличивая <code className="font-mono">n</code> в 10–20 раз для ОДУ 2-го порядка и систем), пока решение методом Эйлера не сблизится с решением методом Рунге — Кутта до требуемой точности, и выводит подробный отчёт в строке статуса.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'ode-syntax' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    2. Устройство панели «Задача Коши для ОДУ», пресеты и синтаксис
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Левая панель управляет выбором класса дифференциальной задачи, численного метода, контрольных примеров и начальных условий. Ниже подробно описан каждый элемент сверху вниз.
                  </p>
                </div>

                {/* 1. Переключатель типа задачи и метода */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    1. Переключатель класса задачи и карточки «Численный метод»:
                  </h4>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--apple-border)' }}>
                      <b>Сегментированный переключатель класса задачи (3 вкладки):</b>
                      <ul className="list-disc pl-5 mt-1 space-y-1" style={{ color: 'var(--apple-text-secondary)' }}>
                        <li><b>«ОДУ 1-го пор.»</b> — скалярное уравнение <code className="font-mono">y&apos; = f(x, y)</code> с одним начальным условием <code className="font-mono">y(x₀) = y₀</code>.</li>
                        <li><b>«ОДУ 2-го пор.»</b> — уравнение второго порядка <code className="font-mono">y&apos;&apos; = f(x, y, z)</code>, где <code className="font-mono">z = y&apos;</code>, с двумя начальными условиями <code className="font-mono">y(x₀) = y₀</code> и <code className="font-mono">y&apos;(x₀) = z₀</code>.</li>
                        <li><b>«Система 3-х»</b> — нормальная система трёх уравнений <code className="font-mono">dx/dt = f₁(t, x, y, z)</code>, <code className="font-mono">dy/dt = f₂(t, x, y, z)</code>, <code className="font-mono">dz/dt = f₃(t, x, y, z)</code> с начальным вектором <code className="font-mono">x(t₀), y(t₀), z(t₀)</code>.</li>
                      </ul>
                    </div>
                    <div>
                      <b>Карточки «Численный метод» (синхронизированы с переключателем в верхней шапке):</b>
                      <ul className="list-disc pl-5 mt-1 space-y-1" style={{ color: 'var(--apple-text-secondary)' }}>
                        <li><b>Метод Эйлера</b> (бейдж <code className="font-mono">O(h)</code>) — явная схема 1-го порядка <code className="font-mono">yᵢ₊₁ = yᵢ + h·f(xᵢ, yᵢ)</code>.</li>
                        <li><b>Метод Рунге — Кутта 4</b> (бейдж <code className="font-mono">O(h⁴)</code>) — классическая четырёхэтапная схема 4-го порядка <code className="font-mono">yᵢ₊₁ = yᵢ + (k₁ + 2k₂ + 2k₃ + k₄) / 6</code>.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. Полный справочник 10 контрольных примеров */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    2. Секция «Контрольные примеры» (10 встроенных задач из методички и лекций):
                  </h4>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    При клике по любому примеру автоматически заполняются все поля уравнений, начальных условий и числа шагов <code className="font-mono">n</code>, подсвечивается активная карточка пресета и мгновенно обновляется график и таблица узлов:
                  </p>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="font-medium" style={{ color: 'var(--apple-text)' }}>Для ОДУ 1-го порядка (5 пресетов):</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                        <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>КП №1: y·(1 − x)</span> — контрольный пример №1 из методички на <code className="font-mono">[0; 1]</code>, <code className="font-mono">y(0) = 1</code>, <code className="font-mono">n = 10</code> (<code className="font-mono">h = 0.1</code>). Точное аналитическое решение: <code className="font-mono">y(x) = exp(x − x²/2)</code>, в конце отрезка <code className="font-mono">y<sub>точн</sub>(1) = √e ≈ 1.648721</code>.
                      </div>
                      <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                        <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>Конспект: x + y</span> — задача из рукописного конспекта на <code className="font-mono">[0; 0.4]</code>, <code className="font-mono">y(0) = 1</code>, <code className="font-mono">n = 4</code> (<code className="font-mono">h = 0.1</code>). Точное решение: <code className="font-mono">y(x) = 2·exp(x) − x − 1</code>.
                      </div>
                      <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                        <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>Лекция 1: y + x²</span> — пример 1 из лекции на <code className="font-mono">[0; 0.5]</code>, <code className="font-mono">y(0) = 1</code>, <code className="font-mono">n = 5</code> (<code className="font-mono">h = 0.1</code>). Точное решение: <code className="font-mono">y(x) = 3·exp(x) − x² − 2·x − 2</code>.
                      </div>
                      <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                        <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>Лекция 2: y − x²</span> — пример 2 из лекции на <code className="font-mono">[1; 2]</code>, <code className="font-mono">y(1) = 0</code>, <code className="font-mono">n = 10</code> (<code className="font-mono">h = 0.1</code>).
                      </div>
                      <div className="p-3 rounded-xl border md:col-span-2" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                        <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>Теория: −y / x</span> — теоретический пример на <code className="font-mono">[2; 4]</code>, <code className="font-mono">y(2) = 1</code>, <code className="font-mono">n = 10</code> (<code className="font-mono">h = 0.2</code>). Точное решение: гипербола <code className="font-mono">y(x) = 2 / x</code>, <code className="font-mono">y<sub>точн</sub>(4) = 0.5</code>.
                      </div>
                    </div>

                    <div className="font-medium pt-2" style={{ color: 'var(--apple-text)' }}>Для ОДУ 2-го порядка и системы 3-х ОДУ (5 пресетов):</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                        <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>КП №2 (n = 10 и n = 5)</span> — уравнение Бесселя <code className="font-mono">y&apos;&apos; + y&apos;/x + y = 0</code> в виде <code className="font-mono">y&apos;&apos; = −z / x − y</code> на <code className="font-mono">[1; 1.5]</code> при <code className="font-mono">y(1) = 0.77</code>, <code className="font-mono">y&apos;(1) = −0.44</code> с шагами <code className="font-mono">h = 0.05</code> и <code className="font-mono">h = 0.1</code>.
                      </div>
                      <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                        <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>Осциллятор: y&apos;&apos; + y = 0</span> — гармонические колебания <code className="font-mono">y&apos;&apos; = −y</code> на <code className="font-mono">[0; 3.14]</code> при <code className="font-mono">y(0) = 1</code>, <code className="font-mono">y&apos;(0) = 0</code> (точное решение <code className="font-mono">y(x) = cos(x)</code>).
                      </div>
                      <div className="p-3 rounded-xl border md:col-span-2" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                        <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>КП №3 (n = 10 и n = 100)</span> — система 3-х ОДУ из методички:{' '}
                        <code className="font-mono">dx/dt = −2·x + 5·z</code>,{' '}
                        <code className="font-mono">dy/dt = sin(t − 1)·x − y + 3·z</code>,{' '}
                        <code className="font-mono">dz/dt = −x + 2·z</code> на <code className="font-mono">[0; 0.3]</code> при <code className="font-mono">x(0) = 2, y(0) = 1, z(0) = 1</code> с базовым шагом <code className="font-mono">h = 0.03</code> (<code className="font-mono">n = 10</code>) и уменьшенным в 10 раз шагом <code className="font-mono">h = 0.003</code> (<code className="font-mono">n = 100</code>, п. 3.4).
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Поля ввода и допустимые переменные */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    3. Поля ввода правых частей, начальных условий и разрешённые переменные:
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>В режиме «ОДУ 1-го пор.»</b> разрешены только переменные <code className="font-mono">x</code> и <code className="font-mono">y</code>. Поля: <code className="font-mono">x₀</code> (начальная абсцисса), <code className="font-mono">y(x₀)</code> (начальная ордината), <code className="font-mono">Конец b</code> (правая граница отрезка, <code className="font-mono">b ≠ x₀</code>), <code className="font-mono">Шагов n</code> (число разбиений от <code className="font-mono">1</code> до <code className="font-mono">100 000</code>).
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>В режиме «ОДУ 2-го пор.»</b> разрешены переменные <code className="font-mono">x</code>, <code className="font-mono">y</code> и <code className="font-mono">z</code> (где <code className="font-mono">z = y&apos;</code> — первая производная). Дополнительно вводится начальный наклон <code className="font-mono">y&apos;(x₀) = z₀</code>.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>В режиме «Система 3-х»</b> разрешены независимая переменная времени <code className="font-mono">t</code> и три фазовые координаты <code className="font-mono">x</code>, <code className="font-mono">y</code>, <code className="font-mono">z</code>. При попытке ввести посторонний символ парсер вернёт диагностическое сообщение со списком разрешённых переменных.
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Поддерживаемые математические функции и операции:</b> <code className="font-mono">+, -, *, /, ^ (**), sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, exp, ln, log, log10, sqrt, cbrt, abs, pi, e</code>, а также неявное умножение (<code className="font-mono">2x</code>, <code className="font-mono">y(1-x)</code>) и научная запись чисел (<code className="font-mono">1e-3</code>).
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'ode-methods' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    3. Одношаговые численные методы Эйлера и Рунге — Кутта 4-го порядка
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Для численного интегрирования задачи Коши <code className="font-mono">y&apos; = f(x, y), y(x₀) = y₀</code> на отрезке <code className="font-mono">[x₀; b]</code> строится равномерная сетка узлов{' '}
                    <code className="font-mono font-semibold">xᵢ = x₀ + i·h</code> (<code className="font-mono">i = 0, 1, ..., n</code>) с постоянным шагом{' '}
                    <code className="font-mono font-semibold">h = (b − x₀) / n</code>.
                  </p>
                </div>

                {/* Метод Эйлера */}
                <div className="apple-well rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      1. Явный метод Эйлера (euler_ode1)
                    </span>
                    <span
                      className="text-xs font-mono px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--apple-card)', color: 'var(--apple-text-secondary)' }}
                    >
                      Порядок точности O(h)
                    </span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm py-1">
                    xᵢ₊₁ = xᵢ + h,   yᵢ₊₁ = yᵢ + h · f(xᵢ, yᵢ)
                  </div>
                  <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                    На каждом элементарном участке <code className="font-mono">[xᵢ; xᵢ₊₁]</code> неизвестная интегральная кривая заменяется отрезком касательной, проведённой в левом узле <code className="font-mono">(xᵢ, yᵢ)</code> с угловым коэффициентом <code className="font-mono">tg αᵢ = f(xᵢ, yᵢ)</code>. Локальная погрешность на одном шаге имеет порядок <code className="font-mono">O(h²)</code>, а глобальная накопленная погрешность на всём отрезке — <code className="font-mono">O(h)</code>.
                  </p>
                </div>

                {/* Метод Рунге — Кутта 4 */}
                <div className="apple-well rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      2. Классический метод Рунге — Кутта 4-го порядка (rk4_ode1)
                    </span>
                    <span
                      className="text-xs font-mono px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--apple-card)', color: 'var(--apple-text-secondary)' }}
                    >
                      Порядок точности O(h⁴)
                    </span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm space-y-1 py-1">
                    <div>k₁ = h · f(xᵢ, yᵢ)</div>
                    <div>k₂ = h · f(xᵢ + h/2, yᵢ + k₁/2)</div>
                    <div>k₃ = h · f(xᵢ + h/2, yᵢ + k₂/2)</div>
                    <div>k₄ = h · f(xᵢ + h, yᵢ + k₃)</div>
                    <div className="font-semibold pt-0.5">yᵢ₊₁ = yᵢ + (k₁ + 2k₂ + 2k₃ + k₄) / 6</div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                    На каждом шаге вычисляются четыре пробных приращения <code className="font-mono">k₁..k₄</code> (в начале, дважды в середине и в конце шага) и усредняются с весами параболической формулы Симпсона <code className="font-mono">(1, 2, 2, 1) / 6</code>. Локальная погрешность на шаге равна <code className="font-mono">O(h⁵)</code>, а глобальная на всём отрезке — <code className="font-mono">O(h⁴)</code>.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'ode-higher' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    4. Сведение ОДУ 2-го порядка к системе и решение систем 3-х ОДУ
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Любое дифференциальное уравнение высшего порядка сводится к нормальной системе уравнений 1-го порядка введением дополнительных фазовых переменных, после чего вектор состояния интегрируется синхронно.
                  </p>
                </div>

                {/* ОДУ 2-го порядка */}
                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <div className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    1. Задача Коши для ОДУ 2-го порядка (euler_ode2, rk4_ode2)
                  </div>
                  <div className="font-mono text-xs sm:text-sm">
                    Замена y&apos; = z  ⇒  система:  y&apos; = z,   z&apos; = f(x, y, z)
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    Уравнение <code className="font-mono">y&apos;&apos; = f(x, y, y&apos;)</code> с начальными условиями <code className="font-mono">y(x₀) = y₀</code> и <code className="font-mono">y&apos;(x₀) = z₀</code> сводится к замкнутой системе двух ОДУ 1-го порядка:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b>Шаг метода Эйлера:</b> <code className="font-mono">yᵢ₊₁ = yᵢ + h·zᵢ</code>, <code className="font-mono">zᵢ₊₁ = zᵢ + h·f(xᵢ, yᵢ, zᵢ)</code>.
                    </li>
                    <li>
                      <b>Шаг метода Рунге — Кутта 4:</b> синхронно вычисляются пары коэффициентов <code className="font-mono">(k₁, l₁)</code>, <code className="font-mono">(k₂, l₂)</code>, <code className="font-mono">(k₃, l₃)</code>, <code className="font-mono">(k₄, l₄)</code>, после чего <code className="font-mono">yᵢ₊₁ = yᵢ + (k₁ + 2k₂ + 2k₃ + k₄)/6</code> и <code className="font-mono">zᵢ₊₁ = zᵢ + (l₁ + 2l₂ + 2l₃ + l₄)/6</code>.
                    </li>
                  </ul>
                </div>

                {/* Система 3-х ОДУ */}
                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <div className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    2. Нормальная система 3-х ОДУ 1-го порядка (euler_system3, rk4_system3)
                  </div>
                  <div className="font-mono text-xs sm:text-sm">
                    dx/dt = f₁(t, x, y, z),   dy/dt = f₂(t, x, y, z),   dz/dt = f₃(t, x, y, z)
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    Векторная система интегрируется на отрезке времени <code className="font-mono">t ∈ [t₀; b]</code> с шагом <code className="font-mono">h = (b − t₀) / n</code>. На каждом полушаге метода Рунге — Кутта 4 сначала вычисляются все три компоненты текущего этапа{' '}
                    <code className="font-mono whitespace-nowrap">
                      (k<sub>1x</sub>, k<sub>1y</sub>, k<sub>1z</sub>)
                    </code>
                    , и только затем они одновременно подставляются во все три функции для расчёта следующих этапов{' '}
                    <code className="font-mono whitespace-nowrap">
                      (k<sub>2x</sub>, k<sub>2y</sub>, k<sub>2z</sub>)
                    </code>
                    ,{' '}
                    <code className="font-mono whitespace-nowrap">
                      (k<sub>3x</sub>, k<sub>3y</sub>, k<sub>3z</sub>)
                    </code>{' '}
                    и{' '}
                    <code className="font-mono whitespace-nowrap">
                      (k<sub>4x</sub>, k<sub>4y</sub>, k<sub>4z</sub>)
                    </code>
                    .
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'ode-metrics' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    5. Подробное описание всех выводимых чисел и показателей (ОДУ)
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    В верхней части рабочей области расположены 4 сводных блока ключевых показателей (KPI), а также система контроля погрешности по правилу Рунге.
                  </p>
                </div>

                {/* 4 карточки KPI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="apple-squircle-icon w-7 h-7 flex items-center justify-center text-sm font-serif italic shrink-0"
                        style={{ background: 'linear-gradient(180deg, #38a1ff 0%, #0071e3 100%)' }}
                      >
                        y
                      </span>
                      <span className="font-semibold">
                        1. Численное в b (y<sub>числ</sub>(b))
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Значение численного решения в конечной точке отрезка <code className="font-mono">x = b</code> (или выбранной компоненты <code className="font-mono">x(b), y(b), z(b)</code> для системы 3-х ОДУ) с точностью до 6 знаков после запятой (<code className="font-mono">toFixed(6)</code>). В нижней подписи отображается активный метод.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="apple-squircle-icon w-7 h-7 flex items-center justify-center text-xs font-serif italic shrink-0"
                        style={{ background: 'linear-gradient(180deg, #a970ff 0%, #7d3aed 100%)' }}
                      >
                        y*
                      </span>
                      <span className="font-semibold">
                        2. Эталон (SymPy / РК4) (y<sub>точн</sub>(b))
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Точное эталонное значение в правом конце отрезка <code className="font-mono">b</code>. Если <code className="font-mono">sympy.dsolve</code> нашёл замкнутое аналитическое решение, под числом выводится символьная формула <code className="font-mono">y(x) = ...</code>; иначе — границы отрезка <code className="font-mono">[x₀; b]</code>.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="apple-squircle-icon w-7 h-7 flex items-center justify-center text-xs font-mono font-semibold shrink-0"
                        style={{ background: 'linear-gradient(180deg, #34d058 0%, #248a3d 100%)' }}
                      >
                        Δ
                      </span>
                      <span className="font-semibold">3. Макс. погр. |Δ|</span>
                    </div>
                    <div className="font-mono text-xs overflow-x-auto whitespace-nowrap">
                      max |Δ| = max<sub>0 ≤ i ≤ n</sub> |y<sub>точн</sub>(x<sub>i</sub>) − y<sub>числ</sub>(x<sub>i</sub>)|
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Максимальное по модулю отклонение численного решения от эталонного по всем узлам сетки <code className="font-mono">i = 0, …, n</code> (для системы 3-х ОДУ — максимум чебышёвской нормы <code className="font-mono">max(|Δxᵢ|, |Δyᵢ|, |Δzᵢ|)</code>). В подписи под числом выводится максимальная апостериорная оценка по правилу Рунге.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="apple-squircle-icon w-7 h-7 flex items-center justify-center text-xs font-mono font-semibold shrink-0"
                        style={{ background: 'linear-gradient(180deg, #ffab2e 0%, #ef8600 100%)' }}
                      >
                        h
                      </span>
                      <span className="font-semibold">4. Шаг сетки h и число разбиений n</span>
                    </div>
                    <div className="font-mono text-xs">
                      h = (b − x₀) / n
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Отображает величину шага интегрирования <code className="font-mono">h</code> с точностью до 5 знаков после запятой и общее число шагов <code className="font-mono">n</code> (включая автоматически подобранное <code className="font-mono">n</code> после выполнения п. 3.4).
                    </p>
                  </div>
                </div>

                {/* Правило Рунге и пункт 3.4 */}
                <div className="apple-well rounded-2xl p-5 space-y-3">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    Апостериорная оценка погрешности по правилу Рунге и алгоритм п. 3.4:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Правило Рунге на сетках h и h/2:</b> одновременно с основным расчётом (на <code className="font-mono">n</code> шагах с шагом <code className="font-mono">h</code>) сервер выполняет контрольный расчёт с половинным шагом <code className="font-mono">h/2</code> (на <code className="font-mono">2n</code> шагах). В каждом основном узле <code className="font-mono">x<sub>i</sub></code> оценка погрешности вычисляется по формуле{' '}
                      <code className="font-mono whitespace-nowrap">
                        R<sub>i</sub> = |y<sub>i</sub><sup>(h)</sup> − y<sub>2i</sub><sup>(h/2)</sup>| / (2<sup>p</sup> − 1)
                      </code>
                      , где <code className="font-mono whitespace-nowrap">2<sup>p</sup> − 1 = 1</code> для Эйлера (<code className="font-mono">p = 1</code>) и <code className="font-mono whitespace-nowrap">2<sup>p</sup> − 1 = 15</code> для Рунге — Кутта 4 (<code className="font-mono">p = 4</code>).
                    </li>
                    <li>
                      <b style={{ color: 'var(--apple-text)' }}>Алгоритм подбора шага Эйлера (п. 3.4 методички):</b> при нажатии кнопки <b>«Подобрать шаг Эйлера (п. 3.4)»</b> для ОДУ 1-го порядка число разбиений последовательно удваивается (<code className="font-mono whitespace-nowrap">n = 10 · 2<sup>k</sup> = 10, 20, 40, 80, 160, 320, 640…</code>), пока максимальное расхождение в контрольных узлах{' '}
                      <code className="font-mono whitespace-nowrap">
                        max<sub>i</sub> |y<sub>Эйлер</sub>(x<sub>i</sub>) − y<sub>РК4</sub>(x<sub>i</sub>)|
                      </code>{' '}
                      не станет меньше <code className="font-mono">0.001</code>.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'ode-journal' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    6. График интегральных кривых, Таблица узлов и Журнал расчётов ОДУ
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Описание всех визуальных элементов графика, столбцов таблицы узлов решения и журнала экспериментов.
                  </p>
                </div>

                {/* График интегральных кривых */}
                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    1. Интерактивный SVG-график интегральных кривых:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b>Изумрудная сплошная кривая (Эталон)</b> — гладкая траектория точного аналитического решения SymPy (или эталонного решения РК4 из 200 плотных точек).
                    </li>
                    <li>
                      <b>Янтарная пунктирная ломаная с узлами (Эйлер)</b> — приближённое решение методом Эйлера 1-го порядка, наглядно демонстрирующее накопление погрешности при крупном шаге <code className="font-mono">h</code>.
                    </li>
                    <li>
                      <b>Голубая сплошная кривая с узлами (РК4)</b> — приближённое решение методом Рунге — Кутта 4-го порядка, практически сливающееся с эталонной кривой даже при <code className="font-mono">n = 10</code>.
                    </li>
                    <li>
                      <b>Переключатель <code className="font-mono">x(t) / y(t) / z(t)</code></b> — появляется в шапке графика при решении системы 3-х ОДУ и позволяет поочерёдно исследовать каждую из трёх фазовых координат.
                    </li>
                    <li>
                      <b>Двусторонняя синхронизация с таблицей узлов</b> — при наведении мыши на узел графика или строку таблицы на графике появляется вертикальная линия сечения <code className="font-mono">x = xᵢ</code>, а активные точки Эйлера и РК4 увеличиваются в размере.
                    </li>
                  </ul>
                </div>

                {/* Таблица узлов решения */}
                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    2. Все столбцы «Таблицы узлов решения» (с кнопкой «На весь экран»):
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <div>• <b><code className="font-mono">i</code></b> — порядковый номер узла сетки (<code className="font-mono">0, 1, …, n</code>).</div>
                    <div>• <b><code className="font-mono">xᵢ</code> (или <code className="font-mono">tᵢ</code>)</b> — координата узла независимой переменной <code className="font-mono">x₀ + i·h</code>.</div>
                    <div>• <b><code className="font-mono">yᵢ (шаг h)</code></b> — численное значение выбранного метода на основной сетке с шагом <code className="font-mono">h</code> (выделено синим цветом).</div>
                    <div>• <b><code className="font-mono">yᵢ (шаг h/2)</code></b> — уточнённое численное значение в том же узле <code className="font-mono">xᵢ</code>, полученное при прогоне с половинным шагом <code className="font-mono">h/2</code>.</div>
                    <div>• <b><code className="font-mono">y&apos;ᵢ = zᵢ</code></b> (для ОДУ 2-го порядка) — численное значение первой производной в узле <code className="font-mono">xᵢ</code>.</div>
                    <div>• <b><code className="font-mono">yᵢ (Эйлер)</code> и <code className="font-mono">yᵢ (РК4)</code></b> (или <code className="font-mono">xᵢ, yᵢ, zᵢ</code> для системы 3-х ОДУ) — значения обоих методов в узле для прямого сопоставления.</div>
                    <div>• <b><code className="font-mono">Эталон</code></b> — точное значение <code className="font-mono">y<sub>точн</sub>(x<sub>i</sub>)</code> в узле.</div>
                    <div>• <b><code className="font-mono">Рунге</code></b> — апостериорная оценка погрешности{' '}
                      <code className="font-mono whitespace-nowrap">
                        |y<sub>i</sub><sup>(h)</sup> − y<sub>2i</sub><sup>(h/2)</sup>| / (2<sup>p</sup> − 1)
                      </code>{' '}
                      в экспоненциальной форме.
                    </div>
                    <div>• <b><code className="font-mono">|Δᵢ|</code></b> — истинная абсолютная погрешность{' '}
                      <code className="font-mono whitespace-nowrap">
                        |y<sub>точн</sub>(x<sub>i</sub>) − y<sub>i</sub>|
                      </code>{' '}
                      в данном узле.
                    </div>
                  </div>
                </div>

                {/* Журнал расчётов ОДУ */}
                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <h4 className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    3. «Журнал расчётов ОДУ», полоса «Лучший результат», CSV и полноэкранный режим:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      <b>Автоматическая классификация (<code className="font-mono">Лучший / Средний / Худший</code>):</b> внутри каждой задачи (одинаковый тип, уравнение и интервал) строка с наименьшей максимальной погрешностью <code className="font-mono">max |Δ|</code> получает синий бейдж <b>«Лучший»</b>, с наибольшей — красный бейдж <b>«Худший»</b>, промежуточные — янтарный <b>«Средний»</b>.
                    </li>
                    <li>
                      <b>Сводная полоса «Лучший результат»:</b> постоянно отображает наиболее точный метод и сетку, минимальную достигнутую погрешность <code className="font-mono">Мин. абс. погр. |Δ|</code> и максимальную погрешность <code className="font-mono">Макс. абс. погр. |Δ|</code>.
                    </li>
                    <li>
                      <b>Кнопки «На весь экран», «CSV» и «Очистить»:</b> позволяют развернуть журнал в большое модальное окно (<code className="font-mono">max-w-[1720px]</code>), выгрузить все эксперименты в файл <code className="font-mono">ode_calculations_YYYY-MM-DD.csv</code> (<code className="font-mono">UTF-8 с BOM</code> для Excel / Numbers) или очистить историю.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'ode-backend' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    7. Программная реализация модуля ОДУ (Функции Backend и REST API)
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Все алгоритмы численного и символьного интегрирования задач Коши сосредоточены в модуле <code className="font-mono">backend/ode_engine.py</code> и доступны через REST-эндпоинты в <code className="font-mono">backend/main.py</code>:
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      1. Парсер и символьный решатель — backend/ode_engine.py
                    </div>
                    <ul className="list-disc pl-5 space-y-1 font-mono text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      <li>_normalize_ode_expression(expr_str) — нормализация ^ → **, типографских минусов и неявного умножения с сохранением научной нотации (1e-3)</li>
                      <li>compile_ode_function(expr_str, allowed_vars) — проверка разрешённых переменных (x,y), (x,y,z) или (t,x,y,z) и компиляция безопасной функции с контролем math.isfinite</li>
                      <li>try_symbolic_exact_ode1(expr, sym_vars, x0, y0) — аналитическое решение задачи Коши через sympy.dsolve с подстановкой начального условия y(x0) = y0</li>
                    </ul>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      2. Вычислительные функции Эйлера и Рунге — Кутта 4 — backend/ode_engine.py
                    </div>
                    <ul className="list-disc pl-5 space-y-1 font-mono text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      <li>euler_ode1(f, x0, y0, b, n) и rk4_ode1(f, x0, y0, b, n) — базовые решатели ОДУ 1-го порядка</li>
                      <li>solve_ode1(func_str, x0, y0, b, n, method) — полный расчёт на сетках h и h/2, аналитический эталон SymPy / РК4, правило Рунге и плотная кривая dense_curve (201 точка)</li>
                      <li>match_euler_to_rk4_ode1(func_str, x0, y0, b, n_rk4=10, target_diff=0.001) — итеративное удвоение сетки Эйлера n = 10·2^k до сближения с РК4 (п. 3.4)</li>
                      <li>euler_ode2, rk4_ode2, solve_ode2(func_str, x0, y0, z0, b, n, method) — решение ОДУ 2-го порядка сведением к системе y&apos; = z, z&apos; = f(x, y, z)</li>
                      <li>euler_system3, rk4_system3, solve_system3(f1, f2, f3, t0, x0, y0, z0, b, n, method) — синхронное векторное интегрирование системы 3-х ОДУ</li>
                    </ul>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      3. HTTP Эндпоинты FastAPI — backend/main.py
                    </div>
                    <ul className="list-disc pl-5 space-y-1 font-mono text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      <li>POST /api/ode/first — решение задачи Коши для ОДУ 1-го порядка</li>
                      <li>POST /api/ode/first/match — автоматический подбор шага h метода Эйлера под точность РК4 (п. 3.4)</li>
                      <li>POST /api/ode/second — решение задачи Коши для ОДУ 2-го порядка</li>
                      <li>POST /api/ode/system — решение задачи Коши для системы 3-х ОДУ 1-го порядка</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
