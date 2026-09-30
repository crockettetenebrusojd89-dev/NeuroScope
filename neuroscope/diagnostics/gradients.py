"""Gradient diagnostics helpers (P0 Backprop Visualizer, P1 Diagnostics).

Summaries first (norms, means, max, histograms); raw matrices only when
small enough — the UI drills down instead of dumping huge arrays.
"""

import numpy as np

_MATRIX_LIMIT = 12 * 12  # only ship full matrices smaller than this


def _stats(arr):
    arr = np.asarray(arr, dtype=np.float64)
    flat = np.abs(arr).ravel()
    hist, edges = np.histogram(flat, bins=20)
    out = {
        "norm": float(np.linalg.norm(arr)),
        "mean_abs": float(np.mean(flat)) if flat.size else 0.0,
        "max_abs": float(np.max(flat)) if flat.size else 0.0,
        "hist": hist.tolist(),
        "hist_edges": edges.tolist(),
    }
    if arr.size <= _MATRIX_LIMIT:
        out["matrix"] = np.round(arr, 5).tolist()
    return out


def layer_gradient_report(mlp):
    """Per-layer dW/db statistics after a ``backward`` call."""
    report = []
    for i, layer in enumerate(mlp.layers):
        report.append(
            {
                "layer": i,
                "shape": list(layer.W.shape),
                "dW": _stats(layer.dW),
                "db": _stats(layer.db),
            }
        )
    return report


def gradient_health(report):
    """Flag vanishing / exploding gradients from a report (P1)."""
    norms = [r["dW"]["norm"] for r in report]
    flags = []
    for i, n in enumerate(norms):
        status = "ok"
        if n < 1e-6:
            status = "vanishing"
        elif n > 1e3:
            status = "exploding"
        flags.append({"layer": i, "norm": n, "status": status})
    return flags


def init_lab_run(initializer, activation="tanh", depth=10, width=32, seed=0):
    """Forward+backward through a deep MLP with a given initializer (P1).

    Returns per-layer activation mean/var and dW norm so the UI can show
    vanishing/exploding behaviour for zeros / random / xavier / he.
    """
    from neuroscope.core.network import MLP

    rng = np.random.default_rng(seed)
    sizes = [width] * (depth + 1)
    sizes[0] = width
    sizes[-1] = 1
    net = MLP(
        sizes,
        hidden_activation=activation,
        output_mode="binary",
        init=initializer,
        seed=seed,
    )
    X = rng.standard_normal((64, width))
    y = (rng.random(64) > 0.5).astype(int)

    net.forward(X, training=False)
    acts = []
    for i in range(1, len(net._a) - 1):  # hidden activations only
        a = net._a[i]
        acts.append(
            {
                "layer": i - 1,
                "mean": float(np.mean(a)),
                "var": float(np.var(a)),
                "hist": np.histogram(a, bins=30, range=(-3, 3))[0].tolist(),
            }
        )
    net.backward(X, y)
    grad_norms = [
        float(np.linalg.norm(layer.dW)) if layer.dW is not None else 0.0
        for layer in net.layers[:-1]
    ]
    return {"activations": acts, "grad_norms": grad_norms}
