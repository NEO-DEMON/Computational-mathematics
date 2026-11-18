from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from parser import parse_and_evaluate
import math_engine as me
import ode_engine as ode

app = FastAPI()

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
    n: int = Field(..., ge=1, le=1000000)
    method: int  # 1 - левые прямоугольники, 2 - правые, 3 - трапеции, 4 - Симпсон


class VarStepRequest(BaseModel):
    func: str
    a: float
    b: float
    eps: float = Field(..., gt=0, le=10.0)
    algo_type: int  # 1 - Двойной пересчет, 2 - Адаптивный алгоритм


class CompareAllRequest(BaseModel):
    func: str
    a: float
    b: float
    n: int = Field(default=10, ge=1, le=1000000)
    eps: float = Field(default=0.001, gt=0, le=10.0)


class ODE1Request(BaseModel):
    func: str
    x0: float
    y0: float
    b: float
    n: int = Field(default=10, ge=1, le=100000)
    method: str = "euler"  # "euler" или "rk4"


class ODE1MatchRequest(BaseModel):
    func: str
    x0: float
    y0: float
    b: float
    n_rk4: int = Field(default=10, ge=1, le=10000)
    target_diff: float = Field(default=0.001, gt=0, le=10.0)


class ODE2Request(BaseModel):
    func: str
    x0: float
    y0: float
    z0: float
    b: float
    n: int = Field(default=10, ge=1, le=100000)
    method: str = "euler"  # "euler" или "rk4"


class System3Request(BaseModel):
    f1: str
    f2: str
    f3: str
    t0: float
    x0: float
    y0: float
    z0: float
    b: float
    n: int = Field(default=10, ge=1, le=100000)
    method: str = "euler"  # "euler" или "rk4"


def _compute_errors(res: float, exact: float):
    abs_err = abs(exact - res)
    rel_err = (abs_err / abs(exact)) * 100.0 if abs(exact) > 1e-15 else 0.0
    return abs_err, rel_err


@app.post("/api/integrate/const")
def integrate_const(req: ConstStepRequest):
    try:
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
            res = me.simpson(f, req.a, req.b, actual_n)
        elif req.method == 5:
            res = me.mid_rect(f, req.a, req.b, req.n)
        else:
            raise ValueError("Неизвестный метод интегрирования (допустимы значения 1..5)")

        abs_err, rel_err = _compute_errors(res, exact)
        return {
            "result": res,
            "exact": exact,
            "abs_error": abs_err,
            "rel_error": rel_err,
            "n": actual_n,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/integrate/variable")
def integrate_variable(req: VarStepRequest):
    try:
        f, exact = parse_and_evaluate(req.func, req.a, req.b)
        segments_list = []
        if req.algo_type == 1:
            res, final_n, runge_err = me.runge_algorithm_left_rect(f, req.a, req.b, req.eps)
            extra_info = f"eps={req.eps} (n={final_n})"
            if runge_err > req.eps and abs(req.b - req.a) > 1e-15:
                extra_info = f"eps={req.eps} (n={final_n}, лимит шагов)"
        elif req.algo_type == 2:
            res, segs, evals, segments_list = me.adaptive_algorithm_left_rect(
                f, req.a, req.b, req.eps, return_segments=True
            )
            final_n = segs
            extra_info = f"eps={req.eps} (уч={segs}, f()={evals})"
        else:
            raise ValueError("Неизвестный алгоритм переменного шага (допустимы значения 1 или 2)")

        abs_err, rel_err = _compute_errors(res, exact)
        return {
            "result": res,
            "exact": exact,
            "abs_error": abs_err,
            "rel_error": rel_err,
            "info": extra_info,
            "n": final_n,
            "segments": segments_list,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/integrate/compare")
def integrate_compare(req: CompareAllRequest):
    try:
        f, exact = parse_and_evaluate(req.func, req.a, req.b)
        items = []

        const_methods = [
            (1, "Левые прямоугольники"),
            (2, "Правые прямоугольники"),
            (3, "Трапеции"),
            (4, "Параболы (Симпсон)"),
        ]

        for m_id, m_name in const_methods:
            actual_n = req.n
            if m_id == 1:
                res = me.left_rect(f, req.a, req.b, req.n)
            elif m_id == 2:
                res = me.right_rect(f, req.a, req.b, req.n)
            elif m_id == 3:
                res = me.trapezoid(f, req.a, req.b, req.n)
            else:
                if actual_n % 2 != 0:
                    actual_n += 1
                res = me.simpson(f, req.a, req.b, actual_n)

            abs_err, rel_err = _compute_errors(res, exact)
            items.append(
                {
                    "algo": "Постоянный шаг",
                    "methodName": m_name,
                    "step": f"n={actual_n}",
                    "n": actual_n,
                    "result": res,
                    "exact": exact,
                    "abs_error": abs_err,
                    "rel_error": rel_err,
                }
            )

        res_runge, n_runge, runge_err = me.runge_algorithm_left_rect(f, req.a, req.b, req.eps)
        abs_r, rel_r = _compute_errors(res_runge, exact)
        runge_step = (
            f"eps={req.eps} (n={n_runge}, лимит шагов)"
            if runge_err > req.eps and abs(req.b - req.a) > 1e-15
            else f"eps={req.eps} (n={n_runge})"
        )
        items.append(
            {
                "algo": "Переменный (Рунге)",
                "methodName": "Прямоугольники (Левые)",
                "step": runge_step,
                "n": n_runge,
                "result": res_runge,
                "exact": exact,
                "abs_error": abs_r,
                "rel_error": rel_r,
            }
        )

        res_adap, segs, evals, seg_bounds = me.adaptive_algorithm_left_rect(
            f, req.a, req.b, req.eps, return_segments=True
        )
        abs_a, rel_a = _compute_errors(res_adap, exact)
        items.append(
            {
                "algo": "Переменный (Адаптивный)",
                "methodName": "Прямоугольники (Левые)",
                "step": f"eps={req.eps} (уч={segs}, f()={evals})",
                "n": segs,
                "result": res_adap,
                "exact": exact,
                "abs_error": abs_a,
                "rel_error": rel_a,
                "segments": seg_bounds,
            }
        )

        return {"exact": exact, "items": items}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ode/first")
def solve_ode_first(req: ODE1Request):
    try:
        return ode.solve_ode1(req.func, req.x0, req.y0, req.b, req.n, req.method)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ode/first/match")
def match_ode_first(req: ODE1MatchRequest):
    try:
        return ode.match_euler_to_rk4_ode1(req.func, req.x0, req.y0, req.b, req.n_rk4, req.target_diff)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ode/second")
def solve_ode_second(req: ODE2Request):
    try:
        return ode.solve_ode2(req.func, req.x0, req.y0, req.z0, req.b, req.n, req.method)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/ode/system")
def solve_ode_system(req: System3Request):
    try:
        return ode.solve_system3(req.f1, req.f2, req.f3, req.t0, req.x0, req.y0, req.z0, req.b, req.n, req.method)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
