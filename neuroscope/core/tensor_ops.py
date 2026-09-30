"""Tensor & Shape Lab operations (P0).

Thin, well-documented wrappers around NumPy shape mechanics so the UI can
show before/after shapes for reshape, transpose, matmul, broadcasting and
axis reductions.

All user-facing text is returned as *structured* data (an i18n key plus
parameters); the frontend renders it in the user's language. Errors are
raised as :class:`TensorOpError` for the same reason.
"""

import numpy as np


class TensorOpError(ValueError):
    """A shape error carrying an i18n key and parameters for the UI."""

    def __init__(self, key, **params):
        super().__init__(key)
        self.key = key
        self.params = params


def _to_array(values):
    arr = np.asarray(values, dtype=np.float64)
    if arr.size == 0:
        raise TensorOpError("tensor.err.empty")
    return arr


def apply_operation(op, values, params):
    """Apply ``op`` to ``values``.

    Returns ``(result_array, explanation)`` where ``explanation`` is a dict
    ``{"key": <i18n key>, "params": {...}}`` rendered client-side.
    """
    a = _to_array(values)
    params = params or {}

    if op == "reshape":
        shape = [int(s) for s in params.get("shape", [])]
        if not shape or int(np.prod(shape)) != a.size:
            raise TensorOpError(
                "tensor.err.reshape_size", size=int(a.size), shape=shape
            )
        out = a.reshape(shape)
        return out, {
            "key": "tensor.explain.reshape",
            "params": {"size": int(a.size), "out": list(out.shape)},
        }

    if op == "transpose":
        axes = params.get("axes")
        axes = [int(x) for x in axes] if axes else None
        try:
            out = np.transpose(a, axes=axes)
        except ValueError as exc:
            raise TensorOpError(
                "tensor.err.transpose_axes", ndim=int(a.ndim)
            ) from exc
        perm = list(axes) if axes else list(reversed(range(a.ndim)))
        return out, {
            "key": "tensor.explain.transpose",
            "params": {
                "in": list(a.shape),
                "out": list(out.shape),
                "perm": perm,
            },
        }

    if op == "matmul":
        b = _to_array(params.get("b", []))
        if a.ndim != 2 or b.ndim != 2:
            raise TensorOpError("tensor.err.matmul_2d")
        if a.shape[1] != b.shape[0]:
            raise TensorOpError(
                "tensor.err.matmul_dim",
                a=list(a.shape),
                b=list(b.shape),
            )
        out = a @ b
        return out, {
            "key": "tensor.explain.matmul",
            "params": {
                "a": list(a.shape),
                "b": list(b.shape),
                "out": list(out.shape),
                "k": int(a.shape[1]),
            },
        }

    if op == "broadcast_add":
        b = _to_array(params.get("b", []))
        try:
            out = a + b
        except ValueError as exc:
            raise TensorOpError(
                "tensor.err.broadcast", a=list(a.shape), b=list(b.shape)
            ) from exc
        return out, {
            "key": "tensor.explain.broadcast",
            "params": {
                "a": list(a.shape),
                "b": list(b.shape),
                "out": list(out.shape),
            },
        }

    if op == "reduce_sum":
        axis = params.get("axis")
        axis = None if axis in (None, "", "none") else int(axis)
        try:
            out = a.sum(axis=axis)
        except np.exceptions.AxisError as exc:
            raise TensorOpError(
                "tensor.err.axis", axis=axis, ndim=int(a.ndim)
            ) from exc
        return np.asarray(out), {
            "key": "tensor.explain.reduce_sum",
            "params": {
                "axis": "all" if axis is None else int(axis),
                "in": list(a.shape),
                "out": list(np.asarray(out).shape),
            },
        }

    raise TensorOpError("tensor.err.unknown_op", op=op)


def random_tensor(shape, seed=None):
    rng = np.random.default_rng(seed)
    return np.round(rng.uniform(-2, 2, size=[int(s) for s in shape]), 2)
