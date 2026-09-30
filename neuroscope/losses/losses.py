"""Loss functions with gradients (NumPy).

Conventions
-----------
- ``mse(pred, target)``          elementwise regression loss
- ``binary_cross_entropy(p, y)`` p are probabilities in (0, 1)
- ``cross_entropy(logits, y)``   fused softmax + NLL, y are class indices
- ``bce_with_logits(z, y)``      fused sigmoid + BCE, numerically stable

Fused versions return the gradient with respect to the *logits*, which is
what a network's backward pass actually needs.
"""

import numpy as np

from neuroscope.core.activations import sigmoid, softmax

_EPS = 1e-12


# --------------------------------------------------------------------- MSE
def mse(pred, target):
    pred = np.asarray(pred, dtype=np.float64)
    target = np.asarray(target, dtype=np.float64)
    return float(np.mean((pred - target) ** 2))


def mse_grad(pred, target):
    pred = np.asarray(pred, dtype=np.float64)
    target = np.asarray(target, dtype=np.float64)
    return 2.0 * (pred - target) / pred.size


# --------------------------------------------------------- binary cross-entropy
def binary_cross_entropy(p, y):
    p = np.clip(np.asarray(p, dtype=np.float64), _EPS, 1.0 - _EPS)
    y = np.asarray(y, dtype=np.float64)
    return float(-np.mean(y * np.log(p) + (1.0 - y) * np.log(1.0 - p)))


def binary_cross_entropy_grad(p, y):
    p = np.clip(np.asarray(p, dtype=np.float64), _EPS, 1.0 - _EPS)
    y = np.asarray(y, dtype=np.float64)
    return -(y / p - (1.0 - y) / (1.0 - p)) / p.size


def bce_with_logits(z, y):
    """Stable sigmoid+BCE:  mean(max(z,0) - z*y + log(1+exp(-|z|)))."""
    z = np.asarray(z, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    loss = np.maximum(z, 0.0) - z * y + np.log1p(np.exp(-np.abs(z)))
    return float(np.mean(loss))


def bce_with_logits_grad(z, y):
    """d(BCE)/dz = sigmoid(z) - y   (per-sample mean)."""
    z = np.asarray(z, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    return (sigmoid(z) - y) / z.shape[0] if z.ndim > 1 else (sigmoid(z) - y) / z.size


# ------------------------------------------------------------- cross-entropy
def cross_entropy(logits, y):
    """Fused softmax + negative log-likelihood.

    ``logits``: (n, C) array, ``y``: (n,) integer class indices.
    """
    logits = np.asarray(logits, dtype=np.float64)
    y = np.asarray(y).astype(int).ravel()
    probs = softmax(logits)
    n = logits.shape[0]
    return float(-np.mean(np.log(probs[np.arange(n), y] + _EPS)))


def cross_entropy_grad(logits, y):
    """d(CE)/d(logits) = (softmax(logits) - onehot(y)) / n."""
    logits = np.asarray(logits, dtype=np.float64)
    y = np.asarray(y).astype(int).ravel()
    probs = softmax(logits)
    n = logits.shape[0]
    probs[np.arange(n), y] -= 1.0
    return probs / n
