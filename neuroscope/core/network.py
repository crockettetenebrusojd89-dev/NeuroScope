"""MLP engine built from Linear layers + activations (NumPy only).

Binary-classification MLP with sigmoid output fused with BCE, or softmax
output fused with cross-entropy. Supports optional L1/L2 penalties and
inverted dropout for the Regularization Lab.

Backward pass (binary case, fused sigmoid+BCE)::

    dL/dz_out = (sigmoid(z_out) - y) / n
    then per layer:  dz = dL/da * act'(z);  dW = a_prev^T dz;  da_prev = dz W^T
"""

import numpy as np

from neuroscope.core.activations import get as get_activation, sigmoid, softmax
from neuroscope.layers.linear import Linear
from neuroscope.losses import losses


class MLP:
    def __init__(
        self,
        layer_sizes,
        hidden_activation="relu",
        output_mode="binary",
        init="he",
        seed=None,
        l1=0.0,
        l2=0.0,
        dropout=0.0,
    ):
        """
        layer_sizes: e.g. [2, 8, 8, 1]
        output_mode: "binary" (last dim 1, sigmoid+BCE) or "softmax" (dim C, CE)
        """
        self.layer_sizes = list(layer_sizes)
        self.hidden_activation = hidden_activation
        self.output_mode = output_mode
        self.l1 = float(l1)
        self.l2 = float(l2)
        self.dropout = float(dropout)
        self.rng = np.random.default_rng(seed)
        self.act_fn, self.act_grad = get_activation(hidden_activation)

        self.layers = [
            Linear(layer_sizes[i], layer_sizes[i + 1], rng=self.rng, init=init)
            for i in range(len(layer_sizes) - 1)
        ]
        # caches
        self._z = []          # pre-activations, one per layer
        self._a = []          # post-activations, a[0] == network input
        self._drop_masks = []  # dropout masks per hidden layer (training only)

    # ------------------------------------------------------------------ forward
    def forward(self, X, training=False):
        self._z = []
        self._a = [X]
        self._drop_masks = []
        a = X
        for i, layer in enumerate(self.layers):
            z = layer.forward(a)
            self._z.append(z)
            is_last = i == len(self.layers) - 1
            if is_last:
                self._a.append(z)  # logits; probabilities computed on demand
            else:
                h = self.act_fn(z)
                if training and self.dropout > 0.0:
                    keep = 1.0 - self.dropout
                    mask = (self.rng.random(h.shape) < keep).astype(np.float64) / keep
                    h = h * mask
                    self._drop_masks.append(mask)
                else:
                    self._drop_masks.append(None)
                self._a.append(h)
                a = h
        return z  # logits

    def predict_proba(self, X):
        logits = self.forward(X, training=False)
        if self.output_mode == "binary":
            return sigmoid(logits).ravel()
        return softmax(logits)

    def predict(self, X):
        if self.output_mode == "binary":
            return (self.predict_proba(X) >= 0.5).astype(int)
        return np.argmax(self.predict_proba(X), axis=1)

    def accuracy(self, X, y):
        return float(np.mean(self.predict(X) == np.asarray(y).ravel()))

    # -------------------------------------------------------------------- loss
    def loss(self, X, y):
        logits = self.forward(X, training=False)
        y = np.asarray(y).ravel()
        if self.output_mode == "binary":
            base = losses.bce_with_logits(logits.ravel(), y.astype(np.float64))
        else:
            base = losses.cross_entropy(logits, y)
        return base + self._reg_penalty()

    def _reg_penalty(self):
        pen = 0.0
        for layer in self.layers:
            if self.l2 > 0.0:
                pen += 0.5 * self.l2 * float(np.sum(layer.W * layer.W))
            if self.l1 > 0.0:
                pen += self.l1 * float(np.sum(np.abs(layer.W)))
        return pen

    # ----------------------------------------------------------------- backward
    def backward(self, X, y):
        """Run forward (training mode) + backward; populate dW/db per layer.

        Returns the scalar loss for this batch.
        """
        logits = self.forward(X, training=True)
        y = np.asarray(y).ravel()
        n = X.shape[0]
        if self.output_mode == "binary":
            grad = (sigmoid(logits).ravel() - y.astype(np.float64)) / n
            grad = grad.reshape(-1, 1)
            base_loss = losses.bce_with_logits(logits.ravel(), y.astype(np.float64))
        else:
            grad = losses.cross_entropy_grad(logits, y)
            base_loss = losses.cross_entropy(logits, y)

        for i in reversed(range(len(self.layers))):
            layer = self.layers[i]
            is_last = i == len(self.layers) - 1
            if not is_last:
                grad = grad * self.act_grad(self._z[i])
                mask = self._drop_masks[i]
                if mask is not None:
                    grad = grad * mask
            grad = layer.backward(grad)
            if self.l2 > 0.0:
                layer.dW += self.l2 * layer.W
            if self.l1 > 0.0:
                layer.dW += self.l1 * np.sign(layer.W)
        return base_loss + self._reg_penalty()

    # ------------------------------------------------------------------ update
    def params_and_grads(self):
        pg = []
        for layer in self.layers:
            pg.extend(layer.params_and_grads())
        return pg

    def step(self, optimizer, X, y):
        """One gradient step on a batch. Returns batch loss."""
        loss = self.backward(X, y)
        optimizer.step(self.params_and_grads())
        return loss
