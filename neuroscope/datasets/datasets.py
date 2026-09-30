"""2D toy classification datasets for the Neural Network Playground.

All generators return ``X`` of shape (n, 2) and integer labels ``y`` of
shape (n,). Everything is NumPy-only and seedable for reproducibility.
"""

import numpy as np

DATASET_NAMES = ["xor", "moons", "circles", "spiral", "blobs"]


def make_xor(n=400, noise=0.1, rng=None):
    rng = rng or np.random.default_rng()
    X = rng.uniform(-1.0, 1.0, size=(n, 2))
    y = ((X[:, 0] > 0) ^ (X[:, 1] > 0)).astype(int)
    X = X + rng.normal(0.0, noise, size=X.shape)
    return X, y


def make_moons(n=400, noise=0.1, rng=None):
    rng = rng or np.random.default_rng()
    n_out, n_in = n // 2, n - n // 2
    t_out = rng.uniform(0.0, np.pi, n_out)
    t_in = rng.uniform(0.0, np.pi, n_in)
    outer = np.c_[np.cos(t_out), np.sin(t_out)]
    inner = np.c_[1.0 - np.cos(t_in), 1.0 - np.sin(t_in) - 0.5]
    X = np.vstack([outer, inner])
    y = np.array([0] * n_out + [1] * n_in)
    X = X + rng.normal(0.0, noise, size=X.shape)
    return X, y


def make_circles(n=400, noise=0.08, rng=None, factor=0.5):
    rng = rng or np.random.default_rng()
    n_out, n_in = n // 2, n - n // 2
    t_out = rng.uniform(0.0, 2 * np.pi, n_out)
    t_in = rng.uniform(0.0, 2 * np.pi, n_in)
    outer = np.c_[np.cos(t_out), np.sin(t_out)]
    inner = factor * np.c_[np.cos(t_in), np.sin(t_in)]
    X = np.vstack([outer, inner])
    y = np.array([0] * n_out + [1] * n_in)
    X = X + rng.normal(0.0, noise, size=X.shape)
    return X, y


def make_spiral(n=400, noise=0.08, rng=None):
    rng = rng or np.random.default_rng()
    n_half = n // 2
    t = np.sqrt(rng.uniform(0.0, 1.0, n_half)) * 3 * np.pi
    r = t / (3 * np.pi) * 2.0  # radius in [0, 2]
    x1 = r * np.sin(t) + rng.normal(0.0, noise, n_half)
    y1 = r * np.cos(t) + rng.normal(0.0, noise, n_half)
    x2 = r * np.sin(t + np.pi) + rng.normal(0.0, noise, n_half)
    y2 = r * np.cos(t + np.pi) + rng.normal(0.0, noise, n_half)
    X = np.vstack([np.c_[x1, y1], np.c_[x2, y2]])
    y = np.array([0] * n_half + [1] * n_half)
    return X, y


def make_blobs(n=400, noise=0.25, rng=None):
    rng = rng or np.random.default_rng()
    n_half = n // 2
    c0 = np.array([[-1.0, -1.0], [1.0, 1.0]])
    c1 = np.array([[-1.0, 1.0], [1.0, -1.0]])
    X0 = c0[rng.integers(0, 2, n_half)] + rng.normal(0.0, noise, (n_half, 2))
    X1 = c1[rng.integers(0, 2, n - n_half)] + rng.normal(0.0, noise, (n - n_half, 2))
    X = np.vstack([X0, X1])
    y = np.array([0] * n_half + [1] * (n - n_half))
    return X, y


_GENERATORS = {
    "xor": make_xor,
    "moons": make_moons,
    "circles": make_circles,
    "spiral": make_spiral,
    "blobs": make_blobs,
}


def make_dataset(name, n_samples=400, noise=0.1, seed=None):
    if name not in _GENERATORS:
        raise ValueError(f"unknown dataset: {name!r}")
    rng = np.random.default_rng(seed)
    X, y = _GENERATORS[name](n=int(n_samples), noise=float(noise), rng=rng)
    # shuffle once so downstream splits are random
    idx = rng.permutation(len(y))
    return X[idx], y[idx]


def train_test_split(X, y, test_ratio=0.25, seed=None):
    rng = np.random.default_rng(seed)
    n = len(y)
    idx = rng.permutation(n)
    n_test = max(1, int(round(n * float(test_ratio))))
    test_idx, train_idx = idx[:n_test], idx[n_test:]
    return X[train_idx], X[test_idx], y[train_idx], y[test_idx]
