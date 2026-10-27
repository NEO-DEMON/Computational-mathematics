from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from parser import parse_and_evaluate
import math_engine as me

app = FastAPI(title="Numerical Integration API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConstStepRequest(BaseModel):
    func: str
    a: float
    b: float
    n: int
    method: int


class VarStepRequest(BaseModel):
    func: str
    a: float
    b: float
    eps: float
    algo_type: int


class CompareAllRequest(BaseModel):
    func: str
    a: float
    b: float
    n: int = 10
    eps: float = 0.001


@app.post("/api/integrate/const")
def integrate_const(req: ConstStepRequest):
    try:
        if req.n < 1:
            raise ValueError("Число разбиений n должно быть положительным (n >= 1)")
        if req.n > 500000:
            raise ValueError("Число разбиений n слишком велико (макс. 500 000)")

        f, exact = parse_and_evaluate(req.func, req.a, req.b)
        actual_n = req.n

        if req.method == 1:
            res = me.left_rect(f, req.a, req.b, req.n)
        elif req.method == 2:
            res = me.right_rect(f, req.a, req.b, req.n)
        elif req.method == 3:
            res = me.trapezoid(f, req.a, req.b, req.n)
        elif req.method == 4:
            if actual_n % 2 != 0:
                actual_n += 1
            res = me.simpson(f, req.a, req.b, req.n)
        else:
            raise HTTPException(400, "Неизвестный метод")

        abs_err = abs(exact - res)
        rel_err = (abs_err / abs(exact)) * 100 if exact != 0 else 0.0

        return {
            "result": res,
            "exact": exact,
            "abs_error": abs_err,
            "rel_error": rel_err,
            "n": actual_n,
            "h": (req.b - req.a) / actual_n if actual_n else 0.0,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/integrate/variable")
def integrate_variable(req: VarStepRequest):
    try:
        if req.eps <= 0:
            raise ValueError("Точность eps должна быть строго больше 0")

        f, exact = parse_and_evaluate(req.func, req.a, req.b)
        segments = []
        final_n = 0
        n_evals = 0

        if req.algo_type == 1:
            res, final_n, R = me.runge_algorithm_left_rect(f, req.a, req.b, req.eps)
            n_evals = final_n
            step_info = f"eps={req.eps} (n={final_n})"
        else:
            res, n_segments, n_evals, segments = me.adaptive_algorithm_left_rect(
                f, req.a, req.b, req.eps, return_segments=True
            )
            final_n = n_segments
            step_info = f"eps={req.eps} (уч={n_segments}, f()={n_evals})"

        abs_err = abs(exact - res)
        rel_err = (abs_err / abs(exact)) * 100 if exact != 0 else 0.0

        return {
            "result": res,
            "exact": exact,
            "info": step_info,
            "n": final_n,
            "evals": n_evals,
            "segments": segments,
            "abs_error": abs_err,
            "rel_error": rel_err,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/integrate/compare")
def integrate_compare(req: CompareAllRequest):
    try:
        if req.n < 1 or req.n > 500000:
            raise ValueError("Число разбиений n должно быть от 1 до 500 000")
        if req.eps <= 0:
            raise ValueError("Точность eps должна быть строго больше 0")

        f, exact = parse_and_evaluate(req.func, req.a, req.b)
        items = []

        const_methods = [
            (1, "Левые прямоугольники", me.left_rect),
            (2, "Правые прямоугольники", me.right_rect),
            (3, "Трапеции", me.trapezoid),
            (4, "Параболы (Симпсон)", me.simpson),
        ]
        for m_id, m_name, fn in const_methods:
            actual_n = req.n + 1 if (m_id == 4 and req.n % 2 != 0) else req.n
            val = fn(f, req.a, req.b, req.n)
            abs_err = abs(exact - val)
            rel_err = (abs_err / abs(exact)) * 100 if exact != 0 else 0.0
            items.append(
                {
                    "algo": "Постоянный шаг",
                    "methodName": m_name,
                    "step": f"n={actual_n}",
                    "result": val,
                    "exact": exact,
                    "abs_error": abs_err,
                    "rel_error": rel_err,
                    "n": actual_n,
                }
            )

        res_runge, n_runge, _ = me.runge_algorithm_left_rect(f, req.a, req.b, req.eps)
        abs_runge = abs(exact - res_runge)
        rel_runge = (abs_runge / abs(exact)) * 100 if exact != 0 else 0.0
        items.append(
            {
                "algo": "Переменный (Рунге)",
                "methodName": "Прямоугольники (Левые)",
                "step": f"eps={req.eps} (n={n_runge})",
                "result": res_runge,
                "exact": exact,
                "abs_error": abs_runge,
                "rel_error": rel_runge,
                "n": n_runge,
            }
        )

        res_adapt, n_seg, n_evals, segments = me.adaptive_algorithm_left_rect(
            f, req.a, req.b, req.eps, return_segments=True
        )
        abs_adapt = abs(exact - res_adapt)
        rel_adapt = (abs_adapt / abs(exact)) * 100 if exact != 0 else 0.0
        items.append(
            {
                "algo": "Переменный (Адаптивный)",
                "methodName": "Прямоугольники (Левые)",
                "step": f"eps={req.eps} (уч={n_seg}, f()={n_evals})",
                "result": res_adapt,
                "exact": exact,
                "abs_error": abs_adapt,
                "rel_error": rel_adapt,
                "n": n_seg,
                "segments": segments,
            }
        )

        return {"exact": exact, "items": items}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
