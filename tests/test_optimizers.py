"""Each optimizer must decrease a simple convex objective."""

import numpy as np

from neuroscope.optimizers import optimizers


def _run(opt, steps=300):
    # minimize f(w) = sum((w - target)^2)
    w = np.array([3.0, -4.0, 2.0])
    target = np.array([1.0, 2.0, -1.0])
    history = [np.sum((w - target) ** 2)]
    for _ in range(steps):
        grad = 2 * (w - target)
        opt.step([(w, grad)])
        history.append(np.sum((w - target) ** 2))
    return history


def test_sgd_decreases_loss():
    h = _run(optimizers.SGD(lr=0.1))
    assert h[-1] < 1e-6


def test_momentum_decreases_loss():
    h = _run(optimizers.Momentum(lr=0.05, momentum=0.9))
    assert h[-1] < h[0] * 1e-3


def test_rmsprop_decreases_loss():
    h = _run(optimizers.RMSProp(lr=0.05, beta=0.9))
    assert h[-1] < h[0] * 1e-2


def test_adam_decreases_loss():
    h = _run(optimizers.Adam(lr=0.1))
    assert h[-1] < h[0] * 1e-3


def test_make_optimizer_factory():
    assert optimizers.make_optimizer("sgd").name == "sgd"
    assert optimizers.make_optimizer("adam").name == "adam"
    try:
        optimizers.make_optimizer("nope")
        assert False, "should raise"
    except ValueError:
        pass
