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

export function createMathEvaluator(funcStr) {
  if (!funcStr || !funcStr.trim()) return null;
  try {
    let expr = funcStr
      .trim()
      .replace(/\^/g, '**')
      .replace(/\bln\s*\(/g, 'log(')
      .replace(/(\d)\s*([a-zA-Z(])/g, '$1*$2')
      .replace(/(\))\s*([a-zA-Z0-9(])/g, '$1*$2')
      .replace(/\bx\s*\(/g, 'x*(');

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
