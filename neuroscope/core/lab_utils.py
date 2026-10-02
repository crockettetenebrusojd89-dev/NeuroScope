"""Small teaching-lab input contracts; never replace nonfinite math with fake numbers."""
import numpy as np


class LabError(ValueError):
    def __init__(self, key, field=""):
        super().__init__(key)
        self.key, self.field = key, field


def matrix(values, field="X", limit=1024):
    try:
        x = np.asarray(values, dtype=np.float64)
    except (ValueError, TypeError):
        raise LabError("p2.err.matrix", field) from None
    if x.ndim != 2 or min(x.shape) < 1 or x.size > limit:
        raise LabError("p2.err.matrix", field)
    if not np.isfinite(x).all() or np.max(np.abs(x)) > 1e6:
        raise LabError("p2.err.finite", field)
    return x


def scalar(value, field, lo, hi):
    try:
        v = float(value)
    except (ValueError, TypeError, OverflowError):
        raise LabError("p2.err.config", field) from None
    if not np.isfinite(v) or not lo <= v <= hi:
        raise LabError("p2.err.config", field)
    return v


def integer(value, field, lo, hi):
    v = scalar(value, field, lo, hi)
    if v != int(v):
        raise LabError("p2.err.config", field)
    return int(v)


def finite_result(x):
    """Fail visibly on numerical overflow instead of silently sanitizing it."""
    if isinstance(x, dict):
        return {k: finite_result(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [finite_result(v) for v in x]
    if isinstance(x, np.ndarray):
        if not np.isfinite(x).all():
            raise LabError("p2.err.finite", "result")
        return x.tolist()
    if isinstance(x, (float, np.floating)):
        if not np.isfinite(x):
            raise LabError("p2.err.finite", "result")
        return float(x)
    if isinstance(x, np.integer):
        return int(x)
    return x
