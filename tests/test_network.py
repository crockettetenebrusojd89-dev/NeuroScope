"""MLP tests: forward shapes, numerical gradient check, learning on XOR."""

import numpy as np

from neuroscope.core.network import MLP
from neuroscope.optimizers import optimizers
from neuroscope.datasets import datasets


def test_forward_shapes():
    net = MLP([2, 5, 1], hidden_activation="tanh", output_mode="binary", seed=0)
    X = np.random.default_rng(0).standard_normal((7, 2))
    logits = net.forward(X)
    assert logits.shape == (7, 1)
    p = net.predict_proba(X)
    assert p.shape == (7,)
    assert np.all((p >= 0) & (p <= 1))


def test_backward_numerical_gradient():
    rng = np.random.default_rng(1)
    net = MLP([2, 4, 1], hidden_activation="tanh", output_mode="binary", seed=3)
    X = rng.standard_normal((5, 2))
    y = (rng.random(5) > 0.5).astype(int)
    net.backward(X, y)

    eps = 1e-6
    layer = net.layers[0]
    num_dW = np.zeros_like(layer.W)
    for i in range(layer.W.shape[0]):
        for j in range(layer.W.shape[1]):
            old = layer.W[i, j]
            layer.W[i, j] = old + eps
            f1 = net.loss(X, y)
            layer.W[i, j] = old - eps
            f2 = net.loss(X, y)
            layer.W[i, j] = old
            num_dW[i, j] = (f1 - f2) / (2 * eps)
    np.testing.assert_allclose(layer.dW, num_dW, rtol=1e-3, atol=1e-6)


def test_softmax_mode_backward():
    rng = np.random.default_rng(2)
    net = MLP([2, 6, 3], hidden_activation="relu", output_mode="softmax", seed=4)
    X = rng.standard_normal((8, 2))
    y = rng.integers(0, 3, 8)
    loss = net.backward(X, y)
    assert np.isfinite(loss)
    assert net.layers[-1].dW.shape == (6, 3)


def test_xor_learning_smoke():
    X, y = datasets.make_dataset("xor", n_samples=600, noise=0.05, seed=42)
    net = MLP([2, 8, 8, 1], hidden_activation="tanh", output_mode="binary", seed=0)
    opt = optimizers.Adam(lr=0.02)
    first, last = None, None
    for epoch in range(600):
        last = net.step(opt, X, y)
        if first is None:
            first = last
    assert last < first
    assert net.accuracy(X, y) > 0.85


def test_regularization_changes_loss():
    X = np.random.default_rng(0).standard_normal((10, 2))
    y = (np.random.default_rng(1).random(10) > 0.5).astype(int)
    plain = MLP([2, 4, 1], seed=0)
    reg = MLP([2, 4, 1], seed=0, l2=0.1)
    assert reg.loss(X, y) > plain.loss(X, y)
