"""Tensor & Shape Lab operations (P0).

Thin, well-documented wrappers around NumPy shape mechanics so the UI can
show before/after shapes for reshape, transpose, matmul, broadcasting and
axis reductions.
"""

import numpy as np


def _to_array(values):
    arr = np.asarray(values, dtype=np.float64)
    if arr.size == 0:
        raise ValueError("empty tensor")
    return arr


def apply_operation(op, values, params):
    """Apply ``op`` to ``values`` and return (result_array, explanation)."""
    a = _to_array(values)
    params = params or {}

    if op == "reshape":
        shape = [int(s) for s in params.get("shape", [])]
        if not shape or int(np.prod(shape)) != a.size:
            raise ValueError(
                f"cannot reshape size-{a.size} tensor into shape {shape}"
            )
        out = a.reshape(shape)
        return out, (
            f"reshape keeps the {a.size} elements in row-major order and "
            f"re-groups them as {list(out.shape)}."
        )

    if op == "transpose":
        axes = params.get("axes")
        axes = [int(x) for x in axes] if axes else None
        out = np.transpose(a, axes=axes)
        return out, (
            f"transpose permutes axes {list(range(a.ndim))} -> "
            f"{list(axes) if axes else list(reversed(range(a.ndim)))}, "
            f"shape {list(a.shape)} -> {list(out.shape)}."
        )

    if op == "matmul":
        b = _to_array(params.get("b", []))
        if a.ndim != 2 or b.ndim != 2:
            raise ValueError("matmul demo expects two 2D matrices")
        if a.shape[1] != b.shape[0]:
            raise ValueError(
                f"inner dimensions must match: {a.shape} x {b.shape}"
            )
        out = a @ b
        return out, (
            f"({a.shape[0]}x{a.shape[1]}) @ ({b.shape[0]}x{b.shape[1]}) = "
            f"({out.shape[0]}x{out.shape[1]}); the shared dimension "
            f"{a.shape[1]} is contracted."
        )

    if op == "broadcast_add":
        b = _to_array(params.get("b", []))
        try:
            out = a + b
        except ValueError as exc:
            raise ValueError(f"cannot broadcast {a.shape} with {b.shape}") from exc
        return out, (
            f"broadcasting aligns trailing dimensions: {list(a.shape)} + "
            f"{list(b.shape)} -> {list(out.shape)}. Dimensions of size 1 "
            f"are stretched; missing leading dims are treated as 1."
        )

    if op == "reduce_sum":
        axis = params.get("axis")
        axis = None if axis in (None, "", "none") else int(axis)
        out = a.sum(axis=axis)
        return np.asarray(out), (
            f"sum over axis {axis}: shape {list(a.shape)} -> "
            f"{list(np.asarray(out).shape)}. Reducing an axis removes it."
        )

    raise ValueError(f"unknown tensor op: {op!r}")


def random_tensor(shape, seed=None):
    rng = np.random.default_rng(seed)
    return np.round(rng.uniform(-2, 2, size=[int(s) for s in shape]), 2)
