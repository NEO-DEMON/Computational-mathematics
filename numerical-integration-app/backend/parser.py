import math
import re
import sympy as sp


def _normalize_expression(func_str: str) -> str:
    if not func_str or not func_str.strip():
        raise ValueError("Введите подынтегральную функцию f(x)")
    s = func_str.strip().replace("^", "**")
    # Поддержка неявного умножения: 2x -> 2*x, 2sin(x) -> 2*sin(x), )x -> )*x, )( -> )*(
    s = re.sub(r"(\d)\s*([a-zA-Z(])", r"\1*\2", s)
    s = re.sub(r"(\))\s*([a-zA-Z0-9(])", r"\1*\2", s)
    s = re.sub(r"\bx\s*\(", "x*(", s)
    return s


def parse_and_evaluate(func_str, a, b):
    if not (math.isfinite(a) and math.isfinite(b)):
        raise ValueError("Пределы интегрирования a и b должны быть конечными числами")

    x = sp.Symbol("x", real=True)
    normalized = _normalize_expression(func_str)

    local_dict = {
        "x": x,
        "ln": sp.log,
        "log": sp.log,
        "sin": sp.sin,
        "cos": sp.cos,
        "tan": sp.tan,
        "asin": sp.asin,
        "acos": sp.acos,
        "atan": sp.atan,
        "sinh": sp.sinh,
        "cosh": sp.cosh,
        "tanh": sp.tanh,
        "exp": sp.exp,
        "sqrt": sp.sqrt,
        "abs": sp.Abs,
        "pi": sp.pi,
        "PI": sp.pi,
        "e": sp.E,
        "E": sp.E,
    }

    try:
        expr = sp.sympify(normalized, locals=local_dict)
    except Exception as e:
        raise ValueError(f"Синтаксическая ошибка в записи функции f(x): {e}")

    extra_symbols = expr.free_symbols - {x}
    if extra_symbols:
        names = ", ".join(sorted(str(s) for s in extra_symbols))
        raise ValueError(f"В функции разрешена только переменная x (неизвестные символы: {names})")

    raw_callable = sp.lambdify(x, expr, modules=["math"])

    def f_callable(val):
        try:
            y = float(raw_callable(float(val)))
        except (ValueError, ZeroDivisionError, OverflowError, TypeError) as err:
            raise ValueError(
                f"Функция f(x) не определена в точке x = {val:.6g} (выход из области определения или деление на ноль)"
            ) from err
        if not math.isfinite(y):
            raise ValueError(f"Функция f(x) принимает бесконечное или нечисловое значение в точке x = {val:.6g}")
        return y

    if a == b:
        exact_val = 0.0
    else:
        try:
            exact_sym = sp.integrate(expr, (x, a, b))
            exact_eval = exact_sym.evalf()
            if getattr(exact_eval, "is_real", True) is False or exact_eval.has(sp.I):
                raise ValueError("Интеграл функции на заданном отрезке принимает комплексное значение (выход из области определения)")
            exact_val = float(exact_eval)
        except ValueError:
            raise
        except Exception as err:
            raise ValueError(f"Не удалось вычислить точное значение интеграла на отрезке [{a}; {b}]: {err}") from err

        if not math.isfinite(exact_val):
            raise ValueError(f"Интеграл расходится или не определён на отрезке [{a}; {b}]")

    return f_callable, exact_val
