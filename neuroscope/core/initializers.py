"""Weight initialization strategies (P1 Initialization Lab).

- zeros:      every weight is 0 (breaks learning: perfect symmetry)
- random:     N(0, 1) scaled by 0.5 — naive, tends to explode/vanish when deep
- xavier:     Xavier/Glorot normal, keeps variance stable for tanh/sigmoid
- he:         He/Kaiming normal, designed for ReLU-family activations
"""

import numpy as np


def zeros(fan_in, fan_out, rng):
    return np.zeros((fan_in, fan_out))


def random(fan_in, fan_out, rng):
    return rng.standard_normal((fan_in, fan_out)) * 0.5


def xavier(fan_in, fan_out, rng):
    std = np.sqrt(2.0 / (fan_in + fan_out))
    return rng.standard_normal((fan_in, fan_out)) * std


def he(fan_in, fan_out, rng):
    std = np.sqrt(2.0 / fan_in)
    return rng.standard_normal((fan_in, fan_out)) * std


INITIALIZERS = {
    "zeros": zeros,
    "random": random,
    "xavier": xavier,
    "he": he,
}


def init_weights(name, fan_in, fan_out, rng):
    if name not in INITIALIZERS:
        raise ValueError(f"unknown initializer: {name!r}")
    return INITIALIZERS[name](fan_in, fan_out, rng)
