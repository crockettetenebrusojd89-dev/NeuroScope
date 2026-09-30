"""Linear layer forward/backward tests with numerical gradient checking."""

import numpy as np

from neuroscope.layers.linear import Linear


def test_forward_matches_manual():
    rng = np.random.default_rng(0)
    layer = Linear(3, 2, rng=rng, init="xavier")
    x = rng.standard_normal((4, 3))
    out = layer.forward(x)
    np.testing.assert_allclose(out, x @ layer.W + layer.b)
    assert out.shape == (4, 2)


def test_backward_numerical():
    rng = np.random.default_rng(1)
    layer = Linear(3, 2, rng=rng, init="xavier")
    x = rng.standard_normal((5, 3))
    upstream = rng.standard_normal((5, 2))

    out = layer.forward(x)
    dx = layer.backward(upstream)

    eps = 1e-6
    num_dW = np.zeros_like(layer.W)
    for i in range(layer.W.shape[0]):
        for j in range(layer.W.shape[1]):
            old = layer.W[i, j]
            layer.W[i, j] = old + eps
            f1 = np.sum(layer.forward(x) * upstream)
            layer.W[i, j] = old - eps
            f2 = np.sum(layer.forward(x) * upstream)
            layer.W[i, j] = old
            num_dW[i, j] = (f1 - f2) / (2 * eps)

    num_db = np.zeros_like(layer.b)
    for j in range(layer.b.shape[0]):
        old = layer.b[j]
        layer.b[j] = old + eps
        f1 = np.sum(layer.forward(x) * upstream)
        layer.b[j] = old - eps
        f2 = np.sum(layer.forward(x) * upstream)
        layer.b[j] = old
        num_db[j] = (f1 - f2) / (2 * eps)

    num_dx = np.zeros_like(x)
    for i in range(x.shape[0]):
        for j in range(x.shape[1]):
            old = x[i, j]
            x[i, j] = old + eps
            f1 = np.sum((x @ layer.W + layer.b) * upstream)
            x[i, j] = old - eps
            f2 = np.sum((x @ layer.W + layer.b) * upstream)
            x[i, j] = old
            num_dx[i, j] = (f1 - f2) / (2 * eps)

    layer.forward(x)
    layer.backward(upstream)
    np.testing.assert_allclose(layer.dW, num_dW, rtol=1e-4, atol=1e-6)
    np.testing.assert_allclose(layer.db, num_db, rtol=1e-4, atol=1e-6)
    np.testing.assert_allclose(dx, num_dx, rtol=1e-4, atol=1e-6)
    assert out.shape == (5, 2)
