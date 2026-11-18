const API_PORTS = ['http://127.0.0.1:8001', 'http://127.0.0.1:8000'];

async function postApi(path, payload) {
  let lastErr = null;
  for (const base of API_PORTS) {
    try {
      const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let detailMsg = 'Ошибка сервера при расчёте';
        if (typeof errData.detail === 'string') {
          detailMsg = errData.detail;
        } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
          detailMsg = errData.detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
        }
        throw new Error(detailMsg);
      }
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
    }
  }
  throw lastErr || new Error('Не удалось подключиться к серверу API');
}

function validateCommonInputs(func, a, b) {
  if (!func || !String(func).trim()) {
    throw new Error('Введите подынтегральную функцию f(x)');
  }
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (!Number.isFinite(numA) || !Number.isFinite(numB)) {
    throw new Error('Введите корректные числовые значения для пределов a и b');
  }
  return { numA, numB };
}

export async function integrateConst({ func, a, b, n, method }) {
  const { numA, numB } = validateCommonInputs(func, a, b);
  const numN = parseInt(n, 10);
  if (!Number.isFinite(numN) || numN < 1) {
    throw new Error('Число разбиений n должно быть целым положительным числом (n ≥ 1)');
  }
  return postApi('/api/integrate/const', {
    func,
    a: numA,
    b: numB,
    n: numN,
    method: parseInt(method, 10),
  });
}

export async function integrateVariable({ func, a, b, eps, algo_type }) {
  const { numA, numB } = validateCommonInputs(func, a, b);
  const numEps = parseFloat(eps);
  if (!Number.isFinite(numEps) || numEps <= 0) {
    throw new Error('Требуемая точность ε должна быть положительным числом (ε > 0)');
  }
  return postApi('/api/integrate/variable', {
    func,
    a: numA,
    b: numB,
    eps: numEps,
    algo_type: parseInt(algo_type, 10),
  });
}

export async function integrateCompare({ func, a, b, n, eps }) {
  const { numA, numB } = validateCommonInputs(func, a, b);
  const numN = parseInt(n, 10) || 10;
  const numEps = parseFloat(eps) || 0.001;
  return postApi('/api/integrate/compare', {
    func,
    a: numA,
    b: numB,
    n: numN,
    eps: numEps,
  });
}

export async function solveOdeFirst({ func, x0, y0, b, n, method }) {
  if (!func || !String(func).trim()) {
    throw new Error('Введите правую часть уравнения f(x, y)');
  }
  const numX0 = parseFloat(x0);
  const numY0 = parseFloat(y0);
  const numB = parseFloat(b);
  const numN = parseInt(n, 10);
  if (!Number.isFinite(numX0) || !Number.isFinite(numY0) || !Number.isFinite(numB)) {
    throw new Error('Введите корректные числовые значения для x0, y0 и b');
  }
  if (!Number.isFinite(numN) || numN < 1) {
    throw new Error('Число разбиений n должно быть целым положительным числом (n ≥ 1)');
  }
  return postApi('/api/ode/first', {
    func,
    x0: numX0,
    y0: numY0,
    b: numB,
    n: numN,
    method,
  });
}

export async function matchOdeFirst({ func, x0, y0, b, n_rk4 = 10, target_diff = 0.001 }) {
  if (!func || !String(func).trim()) {
    throw new Error('Введите правую часть уравнения f(x, y)');
  }
  const numX0 = parseFloat(x0);
  const numY0 = parseFloat(y0);
  const numB = parseFloat(b);
  const numNRk4 = parseInt(n_rk4, 10) || 10;
  const numTargetDiff = parseFloat(target_diff) || 0.001;
  if (!Number.isFinite(numX0) || !Number.isFinite(numY0) || !Number.isFinite(numB)) {
    throw new Error('Введите корректные числовые значения для x0, y0 и b');
  }
  if (!Number.isFinite(numNRk4) || numNRk4 < 1) {
    throw new Error('Число разбиений n должно быть целым положительным числом (n ≥ 1)');
  }
  return postApi('/api/ode/first/match', {
    func,
    x0: numX0,
    y0: numY0,
    b: numB,
    n_rk4: numNRk4,
    target_diff: numTargetDiff,
  });
}

export async function solveOdeSecond({ func, x0, y0, z0, b, n, method }) {
  if (!func || !String(func).trim()) {
    throw new Error("Введите правую часть уравнения y'' = f(x, y, z)");
  }
  const numX0 = parseFloat(x0);
  const numY0 = parseFloat(y0);
  const numZ0 = parseFloat(z0);
  const numB = parseFloat(b);
  const numN = parseInt(n, 10);
  if (!Number.isFinite(numX0) || !Number.isFinite(numY0) || !Number.isFinite(numZ0) || !Number.isFinite(numB)) {
    throw new Error('Введите корректные числовые значения для x0, y(x0), y\'(x0) и b');
  }
  if (!Number.isFinite(numN) || numN < 1) {
    throw new Error('Число разбиений n должно быть целым положительным числом (n ≥ 1)');
  }
  return postApi('/api/ode/second', {
    func,
    x0: numX0,
    y0: numY0,
    z0: numZ0,
    b: numB,
    n: numN,
    method,
  });
}

export async function solveOdeSystem({ f1, f2, f3, t0, x0, y0, z0, b, n, method }) {
  if (!f1?.trim() || !f2?.trim() || !f3?.trim()) {
    throw new Error('Заполните все три уравнения системы');
  }
  const numT0 = parseFloat(t0);
  const numX0 = parseFloat(x0);
  const numY0 = parseFloat(y0);
  const numZ0 = parseFloat(z0);
  const numB = parseFloat(b);
  const numN = parseInt(n, 10);
  if (
    !Number.isFinite(numT0) ||
    !Number.isFinite(numX0) ||
    !Number.isFinite(numY0) ||
    !Number.isFinite(numZ0) ||
    !Number.isFinite(numB)
  ) {
    throw new Error('Введите корректные числовые значения для t0, x(t0), y(t0), z(t0) и b');
  }
  if (!Number.isFinite(numN) || numN < 1) {
    throw new Error('Число разбиений n должно быть целым положительным числом (n ≥ 1)');
  }
  return postApi('/api/ode/system', {
    f1,
    f2,
    f3,
    t0: numT0,
    x0: numX0,
    y0: numY0,
    z0: numZ0,
    b: numB,
    n: numN,
    method,
  });
}

function wrapExponentiation(str) {
  let s = str;
  // Заменяем все операторы ** на Math.pow(base, exp), чтобы корректно обрабатывать вложенные степени и унарный минус (-x^2 -> -Math.pow(x, 2))
  let guard = 0;
  while (s.includes('**') && guard < 50) {
    guard++;
    const idx = s.lastIndexOf('**');
    if (idx === -1) break;

    // 1. Находим левый операнд (основание степени) без захвата унарного минуса/плюса
    let leftEnd = idx - 1;
    while (leftEnd >= 0 && /\s/.test(s[leftEnd])) leftEnd--;
    if (leftEnd < 0) break;

    let leftStart = leftEnd;
    if (s[leftEnd] === ')') {
      let depth = 0;
      while (leftStart >= 0) {
        if (s[leftStart] === ')') depth++;
        else if (s[leftStart] === '(') {
          depth--;
          if (depth === 0) break;
        }
        leftStart--;
      }
      if (leftStart < 0) break;
      // Если перед скобками стоит имя функции (например sin(x)^2 или Math.pow(x, 2)), захватываем его
      let fnStart = leftStart - 1;
      while (fnStart >= 0 && /\s/.test(s[fnStart])) fnStart--;
      if (fnStart >= 0 && /[a-zA-Z0-9_.]/.test(s[fnStart])) {
        while (fnStart >= 0 && /[a-zA-Z0-9_.]/.test(s[fnStart])) fnStart--;
        leftStart = fnStart + 1;
      }
    } else {
      while (leftStart >= 0 && /[a-zA-Z0-9_.]/.test(s[leftStart])) leftStart--;
      leftStart++;
    }

    // 2. Находим правый операнд (показатель степени), включая возможный унарный знак
    let rightStart = idx + 2;
    while (rightStart < s.length && /\s/.test(s[rightStart])) rightStart++;
    if (rightStart >= s.length) break;

    let rightEnd = rightStart;
    while (rightEnd < s.length && (s[rightEnd] === '+' || s[rightEnd] === '-' || /\s/.test(s[rightEnd]))) {
      rightEnd++;
    }
    if (rightEnd >= s.length) break;

    if (s[rightEnd] === '(') {
      let depth = 0;
      while (rightEnd < s.length) {
        if (s[rightEnd] === '(') depth++;
        else if (s[rightEnd] === ')') {
          depth--;
          if (depth === 0) {
            rightEnd++;
            break;
          }
        }
        rightEnd++;
      }
    } else {
      while (rightEnd < s.length && /[a-zA-Z0-9_.]/.test(s[rightEnd])) rightEnd++;
      if (rightEnd < s.length && s[rightEnd] === '(') {
        let depth = 0;
        while (rightEnd < s.length) {
          if (s[rightEnd] === '(') depth++;
          else if (s[rightEnd] === ')') {
            depth--;
            if (depth === 0) {
              rightEnd++;
              break;
            }
          }
          rightEnd++;
        }
      }
    }

    const baseExpr = s.slice(leftStart, idx).trim();
    const expExpr = s.slice(idx + 2, rightEnd).trim();
    if (!baseExpr || !expExpr) break;
    s = `${s.slice(0, leftStart)}Math.pow(${baseExpr}, ${expExpr})${s.slice(rightEnd)}`;
  }
  return s;
}

export function createMathEvaluator(funcStr) {
  if (!funcStr || !funcStr.trim()) return null;
  try {
    let expr = funcStr
      .trim()
      .replace(/[−–—]/g, '-')
      .replace(/\^/g, '**')
      .replace(/\bln\s*\(/g, 'log(')
      .replace(/(\d+(?:\.\d+)?[eE][+-]?\d+)\s*([a-zA-Z(])/g, '$1*$2')
      .replace(/(?<![a-zA-Z_\d])(\d+(?:\.\d+)?)(?![eE][+-]?\d|\.\d)\s*([a-zA-Z(])/g, '$1*$2')
      .replace(/(\))\s*([a-zA-Z0-9(])/g, '$1*$2')
      .replace(/\b(x|pi|PI|e|E)\s*\(/g, '$1*(')
      .replace(/\b(x|pi|PI|e|E)\s+(?=[a-zA-Z(])/g, '$1*');

    expr = wrapExponentiation(expr);

    const mathScope = {
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      sinh: Math.sinh,
      cosh: Math.cosh,
      tanh: Math.tanh,
      exp: Math.exp,
      log: Math.log,
      log10: Math.log10,
      sqrt: Math.sqrt,
      cbrt: Math.cbrt,
      abs: Math.abs,
      pi: Math.PI,
      PI: Math.PI,
      e: Math.E,
      E: Math.E,
    };

    const keys = Object.keys(mathScope);
    const values = Object.values(mathScope);
    const fn = new Function(...keys, 'x', `"use strict"; return (${expr});`);

    fn(...values, 1);

    return (xVal) => {
      try {
        const y = fn(...values, xVal);
        return Number.isFinite(y) ? y : null;
      } catch {
        return null;
      }
    };
  } catch {
    return null;
  }
}

export function formatMathFormula(expr) {
  if (!expr) return '';
  const supMap = {
    0: '⁰',
    1: '¹',
    2: '²',
    3: '³',
    4: '⁴',
    5: '⁵',
    6: '⁶',
    7: '⁷',
    8: '⁸',
    9: '⁹',
  };
  return String(expr)
    .replace(/\*\*/g, '^')
    .replace(/\^(\d+)/g, (_, digits) =>
      digits
        .split('')
        .map((d) => supMap[d] || d)
        .join('')
    )
    .replace(/\*/g, '·')
    .replace(/(?<![eE])-/g, '−');
}

export function getStatusMeta(status) {
  if (status === 'best') {
    return {
      label: 'Лучший',
      rowBg: 'var(--apple-blue-tint)',
      badgeStyle: {
        backgroundColor: 'var(--apple-blue)',
        color: '#ffffff',
      },
    };
  }
  if (status === 'worst') {
    return {
      label: 'Худший',
      rowBg: 'var(--apple-red-tint)',
      badgeStyle: {
        backgroundColor: 'var(--apple-red-badge)',
        color: 'var(--apple-red)',
      },
    };
  }
  return {
    label: 'Средний',
    rowBg: 'var(--apple-amber-tint)',
    badgeStyle: {
      backgroundColor: 'var(--apple-amber-badge)',
      color: 'var(--apple-amber)',
    },
  };
}

export function computeStatusMap(rows, getGroupKey, getSingleRowStatus) {
  const map = {};
  if (!rows || rows.length === 0) return map;

  const groups = new Map();
  for (const r of rows) {
    const key = getGroupKey(r);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }

  for (const group of groups.values()) {
    if (group.length === 1) {
      const r = group[0];
      map[r.id] = getSingleRowStatus(r);
      continue;
    }

    const validErrors = group
      .map((r) => Number(r.rawAbsErr))
      .filter((v) => Number.isFinite(v));

    if (validErrors.length === 0) continue;

    const minErr = Math.min(...validErrors);
    const maxErr = Math.max(...validErrors);

    for (const r of group) {
      const val = Number(r.rawAbsErr);
      if (!Number.isFinite(val)) {
        map[r.id] = 'medium';
      } else if (Math.abs(val - minErr) <= 1e-15) {
        map[r.id] = 'best';
      } else if (maxErr > minErr + 1e-15 && Math.abs(val - maxErr) <= 1e-15) {
        map[r.id] = 'worst';
      } else {
        map[r.id] = 'medium';
      }
    }
  }
  return map;
}

export function computeSummaryStats(rows, statusMap) {
  if (!rows || rows.length === 0) return null;
  const bestRow = rows.find((r) => statusMap[r.id] === 'best') || rows[0];
  const worstRow = rows.find((r) => statusMap[r.id] === 'worst') || rows[rows.length - 1];
  return { bestRow, worstRow };
}

export function exportRowsToCsv(filenamePrefix, headers, rowsData) {
  if (!rowsData || rowsData.length === 0) return;
  const csvContent =
    '\uFEFF' + [headers.join(';'), ...rowsData.map((e) => e.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
