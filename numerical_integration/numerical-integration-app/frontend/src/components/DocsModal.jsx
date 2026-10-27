import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SECTIONS = [
  { id: 'overview', title: '1. Обзор системы', short: 'Архитектура и возможности' },
  { id: 'syntax', title: '2. Блок «Параметры расчёта» и синтаксис', short: 'Все поля, пресеты, ползунки, n, h, ε' },
  { id: 'const-methods', title: '3. Методы с постоянным шагом', short: '4 классические формулы' },
  { id: 'var-methods', title: '4. Алгоритмы с переменным шагом', short: 'Двойной пересчёт и адаптивный' },
  { id: 'metrics', title: '5. Выводимые числа и погрешности', short: 'Карточки KPI, Δ, δ, SymPy' },
  { id: 'journal', title: '6. График и Журнал вычислений', short: 'Визуализация, оценки, CSV' },
  { id: 'backend', title: '7. Программная реализация (Backend / API)', short: 'Функции Python и эндпоинты' },
];

export default function DocsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
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
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Справочная документация комплекса"
        className="apple-kpi-card rounded-2xl w-full max-w-[1480px] h-[88vh] flex flex-col"
      >
        {/* Шапка окна документации */}
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

          <button
            type="button"
            onClick={onClose}
            className="apple-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Закрыть</span>
            <span className="font-mono opacity-80">Esc</span>
          </button>
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
            {SECTIONS.map((sec) => {
              const active = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveTab(sec.id)}
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
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 lg:shrink ${
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
                    <span className="font-mono font-medium" style={{ color: 'var(--apple-text)' }}>
                      I = ∫[a..b] f(x) dx
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
                      Реализованы 4 квадратурные формулы с постоянным шагом (левые, правые, средние прямоугольники, трапеции, параболы Симпсона) и 2 автоматических алгоритма с переменным шагом (правило Рунге двойного пересчёта и локально-адаптивное дробление).
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
                      <b>Кнопка <code className="font-mono">⇅ a ↔ b</code></b> (в правом верхнем углу блока) — мгновенно меняет местами значения нижнего (<code className="font-mono">a</code>) и верхнего (<code className="font-mono">b</code>) пределов интегрирования для проверки свойства антисимметрии <code className="font-mono">∫[a..b] f(x) dx = -∫[b..a] f(x) dx</code>.
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
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>x² + 1</span> (<code className="font-mono">x^2 + 1</code>) на <code className="font-mono">[0; 3]</code> — квадратичная парабола (на ней метод Симпсона даёт 0% погрешности даже при минимальном <code className="font-mono">n=2</code>).
                    </div>
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>e^(-x²)</span> (<code className="font-mono">exp(-x^2)</code>) на <code className="font-mono">[-2; 2]</code> — кривая Гаусса (интеграл Пуассона / функция ошибок <code className="font-mono">erf</code>, не берущийся в элементарных функциях).
                    </div>
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>1 / (1 + x²)</span> на <code className="font-mono">[-2; 2]</code> — классическая функция Рунге (производная <code className="font-mono">atan(x)</code>).
                    </div>
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>x · sin(x)</span> (<code className="font-mono">x * sin(x)</code>) на <code className="font-mono">[0; 6.28]</code> — знакопеременная функция с растущей амплитудой.
                    </div>
                    <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--apple-border)', backgroundColor: 'var(--apple-card)' }}>
                      <span className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>cos(2x) + x/2</span> на <code className="font-mono">[0; 4]</code> — наложение быстрой косинусоиды на линейный рост.
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
                      <b style={{ color: 'var(--apple-text)' }}>Интерактивный ползунок и поле ввода <code className="font-mono">Разбиения (n)</code></b> — ползунок позволяет плавно менять <code className="font-mono">n</code> от <code className="font-mono">2</code> до <code className="font-mono">100</code>, наблюдая за перестроением прямоугольников/трапеций/парабол на графике в реальном времени, а числовое поле справа позволяет ввести любое значение <code className="font-mono">n</code> вплоть до <code className="font-mono">100 000</code>.
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
                    <code className="font-mono font-semibold">h = (b - a) / n</code> и узлами{' '}
                    <code className="font-mono">x_i = a + i·h</code>.
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
                      I ≈ h · Σ[i = 0 .. n-1] f(a + i·h)
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      На каждом элементарном участке функция заменяется константой, равной её значению в левой границе участка <code className="font-mono">x_i</code>.
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
                      I ≈ h · Σ[i = 1 .. n] f(a + i·h)
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Высота каждого прямоугольника берётся в правой точке элементарного отрезка <code className="font-mono">x_(i+1)</code>.
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
                      I ≈ h · [ (f(a) + f(b)) / 2 + Σ[i = 1 .. n-1] f(a + i·h) ]
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Дуга графика на каждом шаге аппроксимируется хордой (прямолинейной трапецией), соединяющей точки <code className="font-mono">(x_i, f(x_i))</code> и <code className="font-mono">(x_(i+1), f(x_(i+1)))</code>.
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
                      I ≈ (h / 3) · [ f(a) + f(b) + 4·Σ(нечёт) f(x_i) + 2·Σ(чёт) f(x_i) ]
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      На каждой паре соседних участков функция приближается квадратичной параболой Лагранжа по трём узлам. Обладает наивысшей точностью <code className="font-mono">O(h⁴)</code> среди методов постоянного шага.
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
                    1. Алгоритм двойного пересчёта (var_1 — правило Рунге)
                  </div>
                  <div className="font-mono text-xs sm:text-sm">
                    Условие остановки: |I_(2n) - I_n| ≤ ε
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    Расчёт начинается с <code className="font-mono">n = 1</code> и шага <code className="font-mono">h = b - a</code>. На каждой итерации шаг делится пополам (<code className="font-mono">n ← 2n</code>, <code className="font-mono">h ← h/2</code>), вычисляется новое приближение <code className="font-mono">I_new</code> по формуле левых прямоугольников и сравнивается с предыдущим <code className="font-mono">I_old</code>. Как только разница становится не больше <code className="font-mono">ε</code>, алгоритм возвращает достигнутое значение и итоговое число разбиений <code className="font-mono">n</code>.
                  </p>
                </div>

                <div className="apple-well rounded-2xl p-5 space-y-2.5">
                  <div className="font-semibold" style={{ color: 'var(--apple-blue)' }}>
                    2. Локально-адаптивный алгоритм (var_2 — адаптивное дробление)
                  </div>
                  <div className="font-mono text-xs sm:text-sm">
                    Локальный критерий на отрезке [x, x+h]: |I_1 - I_2| ≤ ε · (h / (b - a))
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    На каждом текущем участке <code className="font-mono">[x, x+h]</code> сравниваются площадь одного прямоугольника <code className="font-mono">I_1 = f(x)·h</code> и сумма двух половинных прямоугольников <code className="font-mono">I_2 = (f(x) + f(x + h/2))·(h/2)</code>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
                    <li>
                      Если погрешность превышает локальный допуск, шаг <code className="font-mono">h</code> уменьшается вдвое ровно на этом сложном участке.
                    </li>
                    <li>
                      Если условие выполнено, площадь <code className="font-mono">I_2</code> добавляется в общую сумму, а отрезок сохраняется для отрисовки на графике.
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
                      <span className="font-semibold">1. Численный результат (I_calc)</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Приближённое значение определённого интеграла, вычисленное выбранным численным методом с точностью до 7 знаков после запятой. Под числом выводится название применённого метода.
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
                      <span className="font-semibold">2. Точное (SymPy) (I_exact)</span>
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
                      <span className="font-semibold">3. Абсолютная погрешность (Δ, absErr)</span>
                    </div>
                    <div className="font-mono text-xs">
                      Δ = |I_exact - I_calc|
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
                      <span className="font-semibold">4. Относительная погрешность (δ, relErr)</span>
                    </div>
                    <div className="font-mono text-xs">
                      δ = ( |I_exact - I_calc| / |I_exact| ) · 100%
                    </div>
                    <p className="text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      Отношение абсолютной погрешности к модулю точного значения, выраженное в процентах с точностью до 4 знаков (<code className="font-mono">toFixed(4)%</code>). При <code className="font-mono">I_exact = 0</code> полагается равным <code className="font-mono">0.0000%</code>. В нижней строке карточки выводится тип алгоритма шага.
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
                        <li>Для двойного пересчёта (Рунге): <code className="font-mono">eps=0.001 (n=1024)</code> — заданная точность <code className="font-mono">ε</code> и итоговое число разбиений <code className="font-mono">n = 2^k</code>, на котором сработало условие остановки <code className="font-mono">|I_2n - I_n| ≤ ε</code>.</li>
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
                      <b>7. Абс. погр. (Δ, <code className="font-mono">absErr</code>)</b> — абсолютная погрешность <code className="font-mono">|I_exact - I_calc|</code> в научной экспоненциальной форме с 4 значащими цифрами мантиссы (<code className="font-mono">toExponential(4)</code>, например <code className="font-mono">1.7290e-7</code> = <code className="font-mono">1.7290 × 10⁻⁷</code>).
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
                      <b>Если в журнале всего 1 запись:</b> оценка ставится по порогу относительной погрешности <code className="font-mono">δ</code>: при <code className="font-mono">δ &lt; 0.05%</code> — <b>Лучший</b>, при <code className="font-mono">0.05% ≤ δ &lt; 1.5%</code> — <b>Средний</b>, при <code className="font-mono">δ ≥ 1.5%</code> — <b>Худший</b>.
                    </li>
                    <li>
                      <b>Если в журнале 2 и более записей:</b> находятся минимальная <code className="font-mono">minErr = min(Δ)</code> и максимальная <code className="font-mono">maxErr = max(Δ)</code> абсолютные погрешности по всему журналу:
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
                    7. Программная реализация (Функции Backend и REST API)
                  </h3>
                  <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>
                    Серверная часть реализована на Python (<code className="font-mono">FastAPI + SymPy</code>) и разделена на три модуля:
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      backend/parser.py — parse_and_evaluate(func_str, a, b)
                    </div>
                    <p style={{ color: 'var(--apple-text-secondary)' }}>
                      Нормализует синтаксис (<code className="font-mono">^ → **</code>, <code className="font-mono">ln → log</code>, неявное умножение <code className="font-mono">2x → 2*x</code>), строит символьное дерево SymPy, проверяет отсутствие посторонних переменных, создаёт быструю численную функцию <code className="font-mono">f(x)</code> с проверкой области определения (<code className="font-mono">math.isfinite</code>) и вычисляет точный интеграл <code className="font-mono">sympy.integrate</code>.
                    </p>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      backend/math_engine.py — Численные методы
                    </div>
                    <ul className="list-disc pl-5 space-y-1 font-mono text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      <li>left_rect(f, a, b, n), right_rect(f, a, b, n), trapezoid(f, a, b, n), simpson(f, a, b, n) — 4 квадратурные формулы с постоянным шагом</li>
                      <li>runge_algorithm_left_rect(f, a, b, eps) — правило Рунге двойного пересчёта с удвоением сетки n → 2n</li>
                      <li>adaptive_algorithm_left_rect(f, a, b, eps, return_segments=True) — локально-адаптивное интегрирование с возвратом списка подотрезков [x0, x1]</li>
                    </ul>
                  </div>

                  <div className="apple-well rounded-2xl p-4 space-y-1.5">
                    <div className="font-mono font-semibold" style={{ color: 'var(--apple-blue)' }}>
                      backend/main.py — HTTP Эндпоинты FastAPI
                    </div>
                    <ul className="list-disc pl-5 space-y-1 font-mono text-xs" style={{ color: 'var(--apple-text-secondary)' }}>
                      <li>POST /api/integrate/const — расчёт выбранным методом с постоянным шагом (method = 1..4)</li>
                      <li>POST /api/integrate/variable — расчёт алгоритмом с переменным шагом (algo_type = 1 Рунге, 2 Адаптивный)</li>
                      <li>POST /api/integrate/compare — пакетный расчёт всеми 6 методами одновременно для сравнительного анализа</li>
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
