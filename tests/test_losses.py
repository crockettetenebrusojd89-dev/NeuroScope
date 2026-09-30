"""Loss function tests: hand-computed values + numerical gradient checks."""

import numpy as np

from neuroscope.losses import losses


def test_mse_value_and_grad():
    pred = np.array([1.0, 2.0, 4.0])
    target = np.array([0.0, 2.0, 0.0])
    assert losses.mse(pred, target) == (1.0 + 0.0 + 16.0) / 3.0
    np.testing.assert_allclose(
        losses.mse_grad(pred, target), 2 * (pred - target) / 3.0
    )


def test_bce_value():
    p = np.array([0.9, 0.1])
    y = np.array([1.0, 0.0])
    expected = -np.log(0.9)  # both samples contribute -log(0.9)
    assert abs(losses.binary_cross_entropy(p, y) - expected) < 1e-10


def test_cross_entropy_value():
    logits = np.array([[2.0, 0.0], [0.0, 2.0]])
    y = np.array([0, 1])
    p = np.exp(2) / (np.exp(2) + 1)
    expected = -np.log(p)
    assert abs(losses.cross_entropy(logits, y) - expected) < 1e-10


def test_cross_entropy_grad_numerical():
    rng = np.random.default_rng(2)
    logits = rng.standard_normal((4, 3))
    y = np.array([0, 2, 1, 0])
    grad = losses.cross_entropy_grad(logits, y)
    num = np.zeros_like(logits)
    eps = 1e-6
    for i in range(logits.shape[0]):
        for j in range(logits.shape[1]):
            old = logits[i, j]
            logits[i, j] = old + eps
            f1 = losses.cross_entropy(logits, y)
            logits[i, j] = old - eps
            f2 = losses.cross_entropy(logits, y)
            logits[i, j] = old
            num[i, j] = (f1 - f2) / (2 * eps)
    np.testing.assert_allclose(grad, num, rtol=1e-4, atol=1e-6)


def test_bce_with_logits_grad_numerical():
    rng = np.random.default_rng(3)
    z = rng.standard_normal(6)
    y = (rng.random(6) > 0.5).astype(float)
    grad = losses.bce_with_logits_grad(z, y)
    num = np.zeros_like(z)
    eps = 1e-6
    for i in range(z.size):
        old = z[i]
        z[i] = old + eps
        f1 = losses.bce_with_logits(z, y)
        z[i] = old - eps
        f2 = losses.bce_with_logits(z, y)
        z[i] = old
        num[i] = (f1 - f2) / (2 * eps)
    np.testing.assert_allclose(grad, num, rtol=1e-4, atol=1e-6)
