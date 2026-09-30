"""Activation function tests with numerical gradient checking."""

import numpy as np

from neuroscope.core import activations as A


def numerical_grad(fn, x, eps=1e-5):
    x = np.asarray(x, dtype=np.float64)
    grad = np.zeros_like(x)
    it = np.nditer(x, flags=["multi_index"])
    while not it.finished:
        i = it.multi_index
        old = x[i]
        x[i] = old + eps
        f_plus = fn(x).sum() if np.ndim(fn(x)) else fn(x)
        x[i] = old - eps
        f_minus = fn(x).sum() if np.ndim(fn(x)) else fn(x)
        x[i] = old
        grad[i] = (f_plus - f_minus) / (2 * eps)
        it.iternext()
    return grad


def test_relu_values():
    x = np.array([-2.0, -0.5, 0.0, 0.5, 3.0])
    np.testing.assert_allclose(A.relu(x), [0, 0, 0, 0.5, 3.0])
    np.testing.assert_allclose(A.relu_grad(x), [0, 0, 0, 1, 1])


def test_sigmoid_bounds_and_symmetry():
    x = np.linspace(-10, 10, 50)
    s = A.sigmoid(x)
    assert np.all(s > 0) and np.all(s < 1)
    np.testing.assert_allclose(A.sigmoid(np.array([0.0])), [0.5])


def test_softmax_rows_sum_to_one():
    x = np.random.default_rng(0).standard_normal((5, 4))
    p = A.softmax(x)
    np.testing.assert_allclose(p.sum(axis=1), np.ones(5), atol=1e-12)


def test_numerical_gradients():
    rng = np.random.default_rng(1)
    x = rng.uniform(-2, 2, size=6)
    x[x == 0] = 0.3  # avoid kinks exactly at 0
    for name in ["sigmoid", "tanh", "leaky_relu", "gelu", "relu"]:
        fn, grad = A.get(name)
        num = numerical_grad(fn, x.copy())
        np.testing.assert_allclose(grad(x), num, rtol=1e-4, atol=1e-5, err_msg=name)


def test_gelu_known_values():
    np.testing.assert_allclose(A.gelu(np.array([0.0])), [0.0], atol=1e-12)
    assert A.gelu(np.array([3.0]))[0] > 2.99  # ≈ identity for large x


def test_scalar_inputs():
    """Activations and grads must accept plain Python floats (API eval path)."""
    for name in ["relu", "sigmoid", "tanh", "leaky_relu", "gelu"]:
        fn, grad = A.get(name)
        float(fn(1.0))
        float(grad(1.0))
