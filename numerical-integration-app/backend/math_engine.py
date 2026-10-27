def left_rect(f, a, b, n):
    if a == b:
        return 0.0
    h = (b - a) / n
    s = sum(f(a + i * h) for i in range(n))
    return s * h


def right_rect(f, a, b, n):
    if a == b:
        return 0.0
    h = (b - a) / n
    s = sum(f(a + i * h) for i in range(1, n + 1))
    return s * h


def trapezoid(f, a, b, n):
    if a == b:
        return 0.0
    h = (b - a) / n
    s = (f(a) + f(b)) / 2.0
    s += sum(f(a + i * h) for i in range(1, n))
    return s * h


def simpson(f, a, b, n):
    if a == b:
        return 0.0
    if n % 2 != 0:
        n += 1
    h = (b - a) / n
    s = f(a) + f(b)
    for i in range(1, n):
        if i % 2 == 0:
            s += 2 * f(a + i * h)
        else:
            s += 4 * f(a + i * h)
    return s * h / 3.0


def runge_algorithm_left_rect(f, a, b, eps, n_start=4, max_iter=15):
    if a == b:
        return 0.0, n_start, 0.0
    n = n_start
    I_prev = left_rect(f, a, b, n)
    R = float("inf")
    I_curr = I_prev

    for _ in range(max_iter):
        n *= 2
        I_curr = left_rect(f, a, b, n)
        R = abs(I_curr - I_prev)
        if R < eps:
            return I_curr, n, R
        I_prev = I_curr
    return I_curr, n, R


def adaptive_algorithm_left_rect(f, a, b, eps, h_start=0.5, return_segments=False):
    if abs(b - a) < 1e-15:
        return (0.0, 0, 0, []) if return_segments else (0.0, 0, 0)

    sign = 1.0
    low, high = a, b
    if a > b:
        low, high = b, a
        sign = -1.0

    span = high - low
    x = low
    total = 0.0
    h = min(h_start, span)
    n_segments = 0
    n_evals = 0
    h_min = max(span / 50000.0, 1e-10)
    max_iters = 150000
    iters = 0
    segments = []

    while x < high - 1e-12 and iters < max_iters:
        iters += 1
        x_right = min(x + h, high)
        h_actual = x_right - x
        if h_actual <= 1e-15:
            break

        fx = f(x)
        fx_mid = f(x + h_actual / 2.0)
        I1 = fx * h_actual
        I2 = (fx + fx_mid) * h_actual / 2.0
        n_evals += 2

        diff = abs(I2 - I1)

        if diff > eps and h_actual > h_min:
            h = h_actual / 2.0
            continue
        else:
            total += I2
            n_segments += 1
            if return_segments and len(segments) < 500:
                segments.append(
                    {
                        "x0": x,
                        "x1": x_right,
                        "y0": fx,
                        "yMid": fx_mid,
                    }
                )
            x = x_right

            if diff < eps / 2.0:
                h = min(h * 2.0, high - x) if x < high else h
            else:
                h = h_actual

    result = sign * total
    if return_segments:
        return result, n_segments, n_evals, segments
    return result, n_segments, n_evals
