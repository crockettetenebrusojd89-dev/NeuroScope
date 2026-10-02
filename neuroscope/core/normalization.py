"""Training-batch normalization for X[N,D]; population variance (ddof=0).

BatchNorm reduces axis 0 independently for each feature D.
LayerNorm reduces axis 1 independently for each sample N.
y = gamma * (x - mean) / sqrt(var + epsilon) + beta.
No running statistics or inference-mode BatchNorm in this teaching lab.
"""
import numpy as np
from neuroscope.core.lab_utils import LabError, matrix, scalar


def _normalize(values, axis, epsilon=1e-5, gamma=1.0, beta=0.0):
    x = matrix(values)
    epsilon = scalar(epsilon, "epsilon", 1e-12, 1)
    gamma = scalar(gamma, "gamma", -100, 100)
    beta = scalar(beta, "beta", -100, 100)
    mean = x.mean(axis=axis, keepdims=True)
    variance = x.var(axis=axis, keepdims=True)
    normalized = (x - mean) / np.sqrt(variance + epsilon)
    out = gamma * normalized + beta
    return x, mean, variance, normalized, out


def batch_norm(values, epsilon=1e-5, gamma=1.0, beta=0.0):
    return _normalize(values, 0, epsilon, gamma, beta)[-1]


def layer_norm(values, epsilon=1e-5, gamma=1.0, beta=0.0):
    return _normalize(values, 1, epsilon, gamma, beta)[-1]


def normalization_lab(values, kind="batch", epsilon=1e-5, gamma=1.0, beta=0.0):
    if kind not in ("batch", "layer"):
        raise LabError("p2.err.config", "kind")
    axis = 0 if kind == "batch" else 1
    x, mean, variance, normalized, out = _normalize(values, axis, epsilon, gamma, beta)
    groups = []
    for i in range(x.shape[1-axis]):
        before = x[:, i] if axis == 0 else x[i, :]
        after = out[:, i] if axis == 0 else out[i, :]
        # Common bin edges make before/after distributions directly comparable.
        edges = np.histogram_bin_edges(np.r_[before, after], bins=12)
        groups.append({"index": i, "before_mean": before.mean(),
                       "before_var": before.var(), "after_mean": after.mean(),
                       "after_var": after.var(), "edges": edges,
                       "before_hist": np.histogram(before, bins=edges)[0],
                       "after_hist": np.histogram(after, bins=edges)[0]})
    return {"input": x, "output": out, "normalized": normalized,
            "shape": list(x.shape), "axis": axis, "mean": mean,
            "variance": variance, "groups": groups}
