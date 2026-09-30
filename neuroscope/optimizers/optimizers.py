"""Gradient-based optimizers, all operating on (param, grad) array pairs.

The same implementation drives both the MLP training sessions and the 2D
loss-landscape visualizations (a 2D point is just a parameter array of
shape (2,)).
"""

import numpy as np


class Optimizer:
    name = "base"

    def step(self, params_and_grads):
        raise NotImplementedError

    def reset(self):
        self._state = {}


class SGD(Optimizer):
    name = "sgd"

    def __init__(self, lr=0.1):
        self.lr = float(lr)
        self._state = {}

    def step(self, params_and_grads):
        for p, g in params_and_grads:
            p -= self.lr * g


class Momentum(Optimizer):
    name = "momentum"

    def __init__(self, lr=0.1, momentum=0.9):
        self.lr = float(lr)
        self.momentum = float(momentum)
        self._state = {}

    def step(self, params_and_grads):
        for p, g in params_and_grads:
            key = id(p)
            v = self._state.get(key)
            if v is None:
                v = np.zeros_like(p)
            v = self.momentum * v - self.lr * g
            p += v
            self._state[key] = v


class RMSProp(Optimizer):
    name = "rmsprop"

    def __init__(self, lr=0.01, beta=0.9, eps=1e-8):
        self.lr = float(lr)
        self.beta = float(beta)
        self.eps = float(eps)
        self._state = {}

    def step(self, params_and_grads):
        for p, g in params_and_grads:
            key = id(p)
            s = self._state.get(key)
            if s is None:
                s = np.zeros_like(p)
            s = self.beta * s + (1.0 - self.beta) * g * g
            p -= self.lr * g / (np.sqrt(s) + self.eps)
            self._state[key] = s


class Adam(Optimizer):
    name = "adam"

    def __init__(self, lr=0.01, beta1=0.9, beta2=0.999, eps=1e-8):
        self.lr = float(lr)
        self.beta1 = float(beta1)
        self.beta2 = float(beta2)
        self.eps = float(eps)
        self._state = {}

    def step(self, params_and_grads):
        for p, g in params_and_grads:
            key = id(p)
            m, v, t = self._state.get(key, (np.zeros_like(p), np.zeros_like(p), 0))
            t += 1
            m = self.beta1 * m + (1.0 - self.beta1) * g
            v = self.beta2 * v + (1.0 - self.beta2) * g * g
            m_hat = m / (1.0 - self.beta1 ** t)
            v_hat = v / (1.0 - self.beta2 ** t)
            p -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)
            self._state[key] = (m, v, t)


def make_optimizer(name, lr=0.1, momentum=0.9, beta1=0.9, beta2=0.999):
    name = (name or "sgd").lower()
    if name == "sgd":
        return SGD(lr=lr)
    if name == "momentum":
        return Momentum(lr=lr, momentum=momentum)
    if name == "rmsprop":
        return RMSProp(lr=lr, beta=beta2)
    if name == "adam":
        return Adam(lr=lr, beta1=beta1, beta2=beta2)
    raise ValueError(f"unknown optimizer: {name!r}")
