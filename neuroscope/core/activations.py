"""Activation functions and their derivatives, implemented with NumPy.

Every activation exposes ``fn(x)`` and ``grad(x)`` where ``grad`` is the
derivative evaluated at the *pre-activation* value ``x``. For softmax the
full derivative is a Jacobian; for per-element display and for the fused
softmax+cross-entropy trick we only need the diagonal ``s*(1-s)`` term,
which is what ``softmax_grad`` returns.
"""

import numpy as np

_SQRT_2_OVER_PI = np.sqrt(2.0 / np.pi)


def relu(x):
    return np.maximum(0.0, x)


def relu_grad(x):
    return (x > 0.0).astype(np.float64)


def sigmoid(x):
    x = np.clip(x, -500.0, 500.0)
    return 1.0 / (1.0 + np.exp(-x))


def sigmoid_grad(x):
    s = sigmoid(x)
    return s * (1.0 - s)


def tanh(x):
    return np.tanh(x)


def tanh_grad(x):
    t = np.tanh(x)
    return 1.0 - t * t


def leaky_relu(x, alpha=0.01):
    return np.where(x > 0.0, x, alpha * x)


def leaky_relu_grad(x, alpha=0.01):
    return np.where(x > 0.0, 1.0, alpha).astype(np.float64)


def gelu(x):
    """Gaussian Error Linear Unit (tanh approximation, as in BERT/GPT)."""
    inner = _SQRT_2_OVER_PI * (x + 0.044715 * x ** 3)
    return 0.5 * x * (1.0 + np.tanh(inner))


def gelu_grad(x):
    inner = _SQRT_2_OVER_PI * (x + 0.044715 * x ** 3)
    t = np.tanh(inner)
    sech2 = 1.0 - t * t
    return 0.5 * (1.0 + t) + 0.5 * x * sech2 * _SQRT_2_OVER_PI * (
        1.0 + 3.0 * 0.044715 * x ** 2
    )


def softmax(x):
    """Row-wise (last-axis) numerically stable softmax."""
    x = np.asarray(x, dtype=np.float64)
    x = x - np.max(x, axis=-1, keepdims=True)
    e = np.exp(x)
    return e / np.sum(e, axis=-1, keepdims=True)


def softmax_grad(x):
    """Diagonal of the softmax Jacobian: ds_i/dx_i = s_i (1 - s_i)."""
    s = softmax(x)
    return s * (1.0 - s)


FUNCTIONS = {
    "relu": (relu, relu_grad),
    "sigmoid": (sigmoid, sigmoid_grad),
    "tanh": (tanh, tanh_grad),
    "leaky_relu": (leaky_relu, leaky_relu_grad),
    "gelu": (gelu, gelu_grad),
    "softmax": (softmax, softmax_grad),
}

LABELS = {
    "relu": "ReLU",
    "sigmoid": "Sigmoid",
    "tanh": "Tanh",
    "leaky_relu": "Leaky ReLU",
    "gelu": "GELU",
    "softmax": "Softmax",
}


def get(name):
    """Return ``(fn, grad)`` for an activation name."""
    if name not in FUNCTIONS:
        raise ValueError(f"unknown activation: {name!r}")
    return FUNCTIONS[name]


def list_activations():
    return [{"id": k, "label": LABELS[k]} for k in FUNCTIONS]
