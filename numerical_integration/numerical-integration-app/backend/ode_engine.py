import math
import sympy as sp
from parser import normalize_math_expression, build_sympy_locals


def _normalize_ode_expression(expr_str: str) -> str:
    return normalize_math_expression(
        expr_str,
        allowed_vars=("x", "y", "z", "t"),
        empty_error="Введите правую часть дифференциального уравнения",
    )


def compile_ode_function(expr_str: str, allowed_vars: tuple):
    normalized = _normalize_ode_expression(expr_str)
    sym_vars = {v: sp.Symbol(v, real=True) for v in allowed_vars}
    local_dict = build_sympy_locals(sym_vars)

    try:
        expr = sp.sympify(normalized, locals=local_dict)
    except Exception as err:
        raise ValueError(f"Синтаксическая ошибка в выражении «{expr_str}»: {err}") from err

    extra_symbols = expr.free_symbols - set(sym_vars.values())
    if extra_symbols:
        names = ", ".join(sorted(str(s) for s in extra_symbols))
        allowed_str = ", ".join(allowed_vars)
        raise ValueError(f"Недопустимые переменные ({names}). Разрешены только: {allowed_str}")

    ordered_syms = [sym_vars[v] for v in allowed_vars]
    raw_fn = sp.lambdify(ordered_syms, expr, modules=["math"])

    def safe_fn(*args):
        try:
            val = float(raw_fn(*(float(a) for a in args)))
        except (ValueError, ZeroDivisionError, OverflowError, TypeError) as err:
            raise ValueError(f"Функция не определена в точке {args}: {err}") from err
        if not math.isfinite(val):
            raise ValueError(f"Функция принимает бесконечное значение в точке {args}")
        return val

    return safe_fn, expr, sym_vars


def try_symbolic_exact_ode1(expr, sym_vars, x0: float, y0: float):
    """Пытается найти точное аналитическое решение задачи Коши y' = f(x, y), y(x0) = y0 через SymPy."""
    try:
        x_sym = sym_vars["x"]
        y_sym = sym_vars["y"]
        y_func = sp.Function("y")(x_sym)
        ode_eq = sp.Eq(sp.Derivative(y_func, x_sym), expr.subs(y_sym, y_func))
        sol = sp.dsolve(ode_eq, y_func, ics={y_func.subs(x_sym, sp.nsimplify(x0, rational=True)): sp.nsimplify(y0, rational=True)})
        if isinstance(sol, list):
            sol = sol[0]
        rhs = sp.simplify(sol.rhs)
        if rhs.has(sp.I) or rhs.has(sp.Integral):
            return None, None
        raw_exact = sp.lambdify(x_sym, rhs, modules=["math"])
        test_val = float(raw_exact(float(x0)))
        if not math.isfinite(test_val):
            return None, None

        def exact_callable(xv):
            try:
                v = float(raw_exact(float(xv)))
                return v if math.isfinite(v) else None
            except Exception:
                return None

        formula_str = str(rhs).replace("**", "^")
        return exact_callable, formula_str
    except Exception:
        return None, None


def euler_ode1(f, x0: float, y0: float, b: float, n: int):
    h = (b - x0) / n
    xs = [x0 + i * h for i in range(n + 1)]
    ys = [0.0] * (n + 1)
    ys[0] = float(y0)
    for i in range(n):
        ys[i + 1] = ys[i] + h * f(xs[i], ys[i])
    return xs, ys, h


def rk4_ode1(f, x0: float, y0: float, b: float, n: int):
    h = (b - x0) / n
    xs = [x0 + i * h for i in range(n + 1)]
    ys = [0.0] * (n + 1)
    ys[0] = float(y0)
    for i in range(n):
        xi = xs[i]
        yi = ys[i]
        k1 = h * f(xi, yi)
        k2 = h * f(xi + 0.5 * h, yi + 0.5 * k1)
        k3 = h * f(xi + 0.5 * h, yi + 0.5 * k2)
        k4 = h * f(xi + h, yi + k3)
        ys[i + 1] = yi + (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0
    return xs, ys, h


def solve_ode1(func_str: str, x0: float, y0: float, b: float, n: int, method: str = "euler"):
    if method not in ("euler", "rk4"):
        raise ValueError("Неизвестный численный метод (допустимы 'euler' или 'rk4')")
    if n < 1 or n > 100000:
        raise ValueError("Число разбиений n должно быть в диапазоне от 1 до 100 000")
    if abs(b - x0) < 1e-15:
        raise ValueError("Конец отрезка b должен отличаться от начальной точки x0")

    f, expr, sym_vars = compile_ode_function(func_str, ("x", "y"))

    xs, ys_euler, h = euler_ode1(f, x0, y0, b, n)
    _, ys_rk4, _ = rk4_ode1(f, x0, y0, b, n)

    # Расчёт с половинным шагом h/2 (2n разбиений) для оценки погрешности по правилу Рунге
    _, ys_euler_half, _ = euler_ode1(f, x0, y0, b, 2 * n)
    _, ys_rk4_half, _ = rk4_ode1(f, x0, y0, b, 2 * n)

    # Эталонное (точное) решение: аналитическое через SymPy dsolve, либо РК4 высокой точности
    exact_fn, exact_formula = try_symbolic_exact_ode1(expr, sym_vars, x0, y0)
    ref_mult = min(max(4, int(math.ceil(2000 / n))), max(2, 60000 // n))
    _, ys_ref, _ = rk4_ode1(f, x0, y0, b, n * ref_mult)

    ys_exact = []
    for i, xi in enumerate(xs):
        val = exact_fn(xi) if exact_fn is not None else None
        if val is None:
            val = ys_ref[i * ref_mult]
        ys_exact.append(val)

    # Строим таблицу узлов (включая все столбцы из методички и рукописного конспекта)
    p_order = 1 if method == "euler" else 4
    runge_denom = (2 ** p_order) - 1  # 1 для Эйлера, 15 для РК4

    nodes = []
    max_abs_err = 0.0
    max_runge_err = 0.0
    max_diff_euler_rk4 = 0.0

    for i in range(n + 1):
        y_e = ys_euler[i]
        y_e_half = ys_euler_half[2 * i]
        y_r = ys_rk4[i]
        y_r_half = ys_rk4_half[2 * i]
        y_ex = ys_exact[i]

        y_cur = y_e if method == "euler" else y_r
        y_cur_half = y_e_half if method == "euler" else y_r_half

        runge_err = abs(y_cur - y_cur_half) / runge_denom
        abs_err_h = abs(y_ex - y_cur)
        abs_err_half = abs(y_ex - y_cur_half)
        diff_er = abs(y_r - y_e)

        if abs_err_h > max_abs_err:
            max_abs_err = abs_err_h
        if runge_err > max_runge_err:
            max_runge_err = runge_err
        if diff_er > max_diff_euler_rk4:
            max_diff_euler_rk4 = diff_er

        nodes.append({
            "i": i,
            "x": xs[i],
            "y": y_cur,
            "y_half": y_cur_half,
            "y_euler": y_e,
            "y_euler_half": y_e_half,
            "y_rk4": y_r,
            "y_rk4_half": y_r_half,
            "y_exact": y_ex,
            "runge_err": runge_err,
            "abs_err": abs_err_h,
            "abs_err_half": abs_err_half,
            "diff_euler_rk4": diff_er,
        })

    # Плотная кривая точного решения для гладкой отрисовки на графике
    dense_steps = 200
    xs_dense, ys_dense, _ = rk4_ode1(f, x0, y0, b, dense_steps)
    dense_curve = [
        {
            "x": xs_dense[j],
            "y": (exact_fn(xs_dense[j]) if exact_fn is not None and exact_fn(xs_dense[j]) is not None else ys_dense[j]),
        }
        for j in range(dense_steps + 1)
    ]

    return {
        "problem_type": "ode1",
        "method": method,
        "method_name": "Метод Эйлера" if method == "euler" else "Метод Рунге — Кутта (4-го порядка)",
        "func": func_str,
        "x0": x0,
        "y0": y0,
        "b": b,
        "n": n,
        "h": h,
        "exact_formula": exact_formula or "Численный эталон РК4 (высокой точности)",
        "y_end": nodes[-1]["y"],
        "y_end_half": nodes[-1]["y_half"],
        "y_end_euler": nodes[-1]["y_euler"],
        "y_end_rk4": nodes[-1]["y_rk4"],
        "y_end_exact": nodes[-1]["y_exact"],
        "max_abs_err": max_abs_err,
        "max_runge_err": max_runge_err,
        "max_diff_euler_rk4": max_diff_euler_rk4,
        "nodes": nodes,
        "dense_curve": dense_curve,
    }


def match_euler_to_rk4_ode1(func_str: str, x0: float, y0: float, b: float, n_rk4: int = 10, target_diff: float = 0.001):
    """
    Пункт 3.4 методички: подбирает число разбиений n для метода Эйлера так,
    чтобы отклонение от решения методом Рунге — Кутта (при n_rk4) в контрольных узлах не превышало target_diff.
    """
    f, _, _ = compile_ode_function(func_str, ("x", "y"))
    xs_rk, ys_rk, _ = rk4_ode1(f, x0, y0, b, n_rk4)

    mult = 1
    best_n = n_rk4
    best_diff = float("inf")

    while n_rk4 * mult <= 50000:
        cur_n = n_rk4 * mult
        _, ys_eu, _ = euler_ode1(f, x0, y0, b, cur_n)
        max_d = max(abs(ys_eu[i * mult] - ys_rk[i]) for i in range(n_rk4 + 1))
        best_n = cur_n
        best_diff = max_d
        if max_d <= target_diff:
            break
        mult *= 2

    res = solve_ode1(func_str, x0, y0, b, best_n, method="euler")
    res["matched_n"] = best_n
    res["matched_diff"] = best_diff
    res["target_diff"] = target_diff
    res["converged"] = best_diff <= target_diff
    return res


def euler_ode2(f, x0: float, y0: float, z0: float, b: float, n: int):
    h = (b - x0) / n
    xs = [x0 + i * h for i in range(n + 1)]
    ys = [0.0] * (n + 1)
    zs = [0.0] * (n + 1)
    ys[0] = float(y0)
    zs[0] = float(z0)
    for i in range(n):
        xi, yi, zi = xs[i], ys[i], zs[i]
        ys[i + 1] = yi + h * zi
        zs[i + 1] = zi + h * f(xi, yi, zi)
    return xs, ys, zs, h


def rk4_ode2(f, x0: float, y0: float, z0: float, b: float, n: int):
    h = (b - x0) / n
    xs = [x0 + i * h for i in range(n + 1)]
    ys = [0.0] * (n + 1)
    zs = [0.0] * (n + 1)
    ys[0] = float(y0)
    zs[0] = float(z0)
    for i in range(n):
        xi, yi, zi = xs[i], ys[i], zs[i]
        k1 = h * zi
        l1 = h * f(xi, yi, zi)

        k2 = h * (zi + 0.5 * l1)
        l2 = h * f(xi + 0.5 * h, yi + 0.5 * k1, zi + 0.5 * l1)

        k3 = h * (zi + 0.5 * l2)
        l3 = h * f(xi + 0.5 * h, yi + 0.5 * k2, zi + 0.5 * l2)

        k4 = h * (zi + l3)
        l4 = h * f(xi + h, yi + k3, zi + l3)

        ys[i + 1] = yi + (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0
        zs[i + 1] = zi + (l1 + 2.0 * l2 + 2.0 * l3 + l4) / 6.0
    return xs, ys, zs, h


def solve_ode2(func_str: str, x0: float, y0: float, z0: float, b: float, n: int, method: str = "euler"):
    """
    Решает ОДУ 2-го порядка y'' = f(x, y, z), где z = y', на отрезке [x0, b]
    сведением к системе:
      y' = z
      z' = f(x, y, z)
    """
    if method not in ("euler", "rk4"):
        raise ValueError("Неизвестный численный метод (допустимы 'euler' или 'rk4')")
    if n < 1 or n > 100000:
        raise ValueError("Число разбиений n должно быть в диапазоне от 1 до 100 000")
    if abs(b - x0) < 1e-15:
        raise ValueError("Конец отрезка b должен отличаться от начальной точки x0")

    f, _, _ = compile_ode_function(func_str, ("x", "y", "z"))

    xs, ys_e, zs_e, h = euler_ode2(f, x0, y0, z0, b, n)
    _, ys_r, zs_r, _ = rk4_ode2(f, x0, y0, z0, b, n)
    _, ys_e_half, zs_e_half, _ = euler_ode2(f, x0, y0, z0, b, 2 * n)
    _, ys_r_half, zs_r_half, _ = rk4_ode2(f, x0, y0, z0, b, 2 * n)

    ref_mult = min(max(4, int(math.ceil(2000 / n))), max(2, 60000 // n))
    _, ys_ref, zs_ref, _ = rk4_ode2(f, x0, y0, z0, b, n * ref_mult)

    p_order = 1 if method == "euler" else 4
    runge_denom = (2 ** p_order) - 1

    nodes = []
    max_abs_err = 0.0
    max_runge_err = 0.0
    max_diff_euler_rk4 = 0.0

    for i in range(n + 1):
        y_cur = ys_e[i] if method == "euler" else ys_r[i]
        z_cur = zs_e[i] if method == "euler" else zs_r[i]
        y_cur_half = ys_e_half[2 * i] if method == "euler" else ys_r_half[2 * i]
        y_ex = ys_ref[i * ref_mult]
        z_ex = zs_ref[i * ref_mult]

        runge_err = abs(y_cur - y_cur_half) / runge_denom
        abs_err = abs(y_ex - y_cur)
        diff_er = abs(ys_r[i] - ys_e[i])

        max_abs_err = max(max_abs_err, abs_err)
        max_runge_err = max(max_runge_err, runge_err)
        max_diff_euler_rk4 = max(max_diff_euler_rk4, diff_er)

        nodes.append({
            "i": i,
            "x": xs[i],
            "y": y_cur,
            "z": z_cur,
            "y_half": y_cur_half,
            "y_euler": ys_e[i],
            "z_euler": zs_e[i],
            "y_rk4": ys_r[i],
            "z_rk4": zs_r[i],
            "y_exact": y_ex,
            "z_exact": z_ex,
            "runge_err": runge_err,
            "abs_err": abs_err,
            "diff_euler_rk4": diff_er,
        })

    dense_steps = 200
    xs_d, ys_d, zs_d, _ = rk4_ode2(f, x0, y0, z0, b, dense_steps)
    dense_curve = [{"x": xs_d[j], "y": ys_d[j], "z": zs_d[j]} for j in range(dense_steps + 1)]

    return {
        "problem_type": "ode2",
        "method": method,
        "method_name": "Метод Эйлера" if method == "euler" else "Метод Рунге — Кутта (4-го порядка)",
        "func": func_str,
        "x0": x0,
        "y0": y0,
        "z0": z0,
        "b": b,
        "n": n,
        "h": h,
        "exact_formula": "Эталон РК4 высокой точности (система y' = z, z' = f(x, y, z))",
        "y_end": nodes[-1]["y"],
        "z_end": nodes[-1]["z"],
        "y_end_euler": nodes[-1]["y_euler"],
        "y_end_rk4": nodes[-1]["y_rk4"],
        "y_end_exact": nodes[-1]["y_exact"],
        "max_abs_err": max_abs_err,
        "max_runge_err": max_runge_err,
        "max_diff_euler_rk4": max_diff_euler_rk4,
        "nodes": nodes,
        "dense_curve": dense_curve,
    }


def euler_system3(f1, f2, f3, t0: float, x0: float, y0: float, z0: float, b: float, n: int):
    h = (b - t0) / n
    ts = [t0 + i * h for i in range(n + 1)]
    xs = [0.0] * (n + 1)
    ys = [0.0] * (n + 1)
    zs = [0.0] * (n + 1)
    xs[0], ys[0], zs[0] = float(x0), float(y0), float(z0)
    for i in range(n):
        ti, xi, yi, zi = ts[i], xs[i], ys[i], zs[i]
        xs[i + 1] = xi + h * f1(ti, xi, yi, zi)
        ys[i + 1] = yi + h * f2(ti, xi, yi, zi)
        zs[i + 1] = zi + h * f3(ti, xi, yi, zi)
    return ts, xs, ys, zs, h


def rk4_system3(f1, f2, f3, t0: float, x0: float, y0: float, z0: float, b: float, n: int):
    h = (b - t0) / n
    ts = [t0 + i * h for i in range(n + 1)]
    xs = [0.0] * (n + 1)
    ys = [0.0] * (n + 1)
    zs = [0.0] * (n + 1)
    xs[0], ys[0], zs[0] = float(x0), float(y0), float(z0)
    for i in range(n):
        ti, xi, yi, zi = ts[i], xs[i], ys[i], zs[i]
        k1x = h * f1(ti, xi, yi, zi)
        k1y = h * f2(ti, xi, yi, zi)
        k1z = h * f3(ti, xi, yi, zi)

        k2x = h * f1(ti + 0.5 * h, xi + 0.5 * k1x, yi + 0.5 * k1y, zi + 0.5 * k1z)
        k2y = h * f2(ti + 0.5 * h, xi + 0.5 * k1x, yi + 0.5 * k1y, zi + 0.5 * k1z)
        k2z = h * f3(ti + 0.5 * h, xi + 0.5 * k1x, yi + 0.5 * k1y, zi + 0.5 * k1z)

        k3x = h * f1(ti + 0.5 * h, xi + 0.5 * k2x, yi + 0.5 * k2y, zi + 0.5 * k2z)
        k3y = h * f2(ti + 0.5 * h, xi + 0.5 * k2x, yi + 0.5 * k2y, zi + 0.5 * k2z)
        k3z = h * f3(ti + 0.5 * h, xi + 0.5 * k2x, yi + 0.5 * k2y, zi + 0.5 * k2z)

        k4x = h * f1(ti + h, xi + k3x, yi + k3y, zi + k3z)
        k4y = h * f2(ti + h, xi + k3x, yi + k3y, zi + k3z)
        k4z = h * f3(ti + h, xi + k3x, yi + k3y, zi + k3z)

        xs[i + 1] = xi + (k1x + 2.0 * k2x + 2.0 * k3x + k4x) / 6.0
        ys[i + 1] = yi + (k1y + 2.0 * k2y + 2.0 * k3y + k4y) / 6.0
        zs[i + 1] = zi + (k1z + 2.0 * k2z + 2.0 * k3z + k4z) / 6.0
    return ts, xs, ys, zs, h


def solve_system3(
    f1_str: str,
    f2_str: str,
    f3_str: str,
    t0: float,
    x0: float,
    y0: float,
    z0: float,
    b: float,
    n: int,
    method: str = "euler",
):
    if method not in ("euler", "rk4"):
        raise ValueError("Неизвестный численный метод (допустимы 'euler' или 'rk4')")
    if n < 1 or n > 100000:
        raise ValueError("Число разбиений n должно быть в диапазоне от 1 до 100 000")
    if abs(b - t0) < 1e-15:
        raise ValueError("Конец отрезка b должен отличаться от начального момента t0")

    allowed = ("t", "x", "y", "z")
    f1, _, _ = compile_ode_function(f1_str, allowed)
    f2, _, _ = compile_ode_function(f2_str, allowed)
    f3, _, _ = compile_ode_function(f3_str, allowed)

    ts, xs_e, ys_e, zs_e, h = euler_system3(f1, f2, f3, t0, x0, y0, z0, b, n)
    _, xs_r, ys_r, zs_r, _ = rk4_system3(f1, f2, f3, t0, x0, y0, z0, b, n)

    ref_mult = min(max(4, int(math.ceil(2000 / n))), max(2, 60000 // n))
    _, xs_ref, ys_ref, zs_ref, _ = rk4_system3(f1, f2, f3, t0, x0, y0, z0, b, n * ref_mult)

    nodes = []
    max_abs_err = 0.0

    for i in range(n + 1):
        xc = xs_e[i] if method == "euler" else xs_r[i]
        yc = ys_e[i] if method == "euler" else ys_r[i]
        zc = zs_e[i] if method == "euler" else zs_r[i]

        x_ex = xs_ref[i * ref_mult]
        y_ex = ys_ref[i * ref_mult]
        z_ex = zs_ref[i * ref_mult]

        err_norm = max(abs(x_ex - xc), abs(y_ex - yc), abs(z_ex - zc))
        if err_norm > max_abs_err:
            max_abs_err = err_norm

        nodes.append({
            "i": i,
            "t": ts[i],
            "x": xc,
            "y": yc,
            "z": zc,
            "x_euler": xs_e[i],
            "y_euler": ys_e[i],
            "z_euler": zs_e[i],
            "x_rk4": xs_r[i],
            "y_rk4": ys_r[i],
            "z_rk4": zs_r[i],
            "x_exact": x_ex,
            "y_exact": y_ex,
            "z_exact": z_ex,
            "abs_err": err_norm,
        })

    dense_steps = 200
    ts_d, xs_d, ys_d, zs_d, _ = rk4_system3(f1, f2, f3, t0, x0, y0, z0, b, dense_steps)
    dense_curve = [{"t": ts_d[j], "x": xs_d[j], "y": ys_d[j], "z": zs_d[j]} for j in range(dense_steps + 1)]

    return {
        "problem_type": "system3",
        "method": method,
        "method_name": "Метод Эйлера" if method == "euler" else "Метод Рунге — Кутта (4-го порядка)",
        "f1": f1_str,
        "f2": f2_str,
        "f3": f3_str,
        "t0": t0,
        "x0": x0,
        "y0": y0,
        "z0": z0,
        "b": b,
        "n": n,
        "h": h,
        "x_end": nodes[-1]["x"],
        "y_end": nodes[-1]["y"],
        "z_end": nodes[-1]["z"],
        "x_end_exact": nodes[-1]["x_exact"],
        "y_end_exact": nodes[-1]["y_exact"],
        "z_end_exact": nodes[-1]["z_exact"],
        "max_abs_err": max_abs_err,
        "nodes": nodes,
        "dense_curve": dense_curve,
    }
