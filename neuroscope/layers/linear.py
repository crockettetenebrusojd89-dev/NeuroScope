"""Fully-connected (dense) layer with forward / backward passes.

Math
----
forward:   y = x W + b
backward:  dW = x^T @ grad_out
           db = sum(grad_out, axis=0)
           dx = grad_out @ W^T
"""

import numpy as np

from neuroscope.core.initializers import init_weights


class Linear:
    def __init__(self, in_features, out_features, rng=None, init="he"):
        self.in_features = int(in_features)
        self.out_features = int(out_features)
        self.rng = rng if rng is not None else np.random.default_rng()
        self.W = init_weights(init, self.in_features, self.out_features, self.rng)
        self.b = np.zeros(self.out_features)
        # caches / gradients
        self.x = None
        self.dW = None
        self.db = None

    def forward(self, x):
        self.x = x
        return x @ self.W + self.b

    def backward(self, grad_out):
        self.dW = self.x.T @ grad_out
        self.db = grad_out.sum(axis=0)
        return grad_out @ self.W.T

    def params_and_grads(self):
        return [(self.W, self.dW), (self.b, self.db)]

    def __repr__(self):
        return f"Linear({self.in_features} -> {self.out_features})"
