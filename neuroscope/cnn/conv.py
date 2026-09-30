"""2D convolution and pooling, implemented with explicit loops (P1).

Loops are intentional: this module is a teaching tool, not a fast conv
library. Shapes follow the standard formulas::

    out = floor((H + 2P - K) / S) + 1
"""

import numpy as np


def conv2d(x, kernel, stride=1, padding=0):
    """Single-channel 2D cross-correlation (deep-learning 'convolution').

    x: (H, W) array; kernel: (K, K) array. Returns (output, windows) where
    windows[i] = (row, col) top-left of the i-th sliding-window position.
    """
    x = np.asarray(x, dtype=np.float64)
    kernel = np.asarray(kernel, dtype=np.float64)
    stride = int(stride)
    padding = int(padding)
    if x.ndim != 2 or kernel.ndim != 2:
        raise ValueError("conv2d expects 2D input and 2D kernel")
    if stride < 1:
        raise ValueError("stride must be >= 1")

    if padding > 0:
        x = np.pad(x, padding, mode="constant")

    H, W = x.shape
    KH, KW = kernel.shape
    out_h = (H - KH) // stride + 1
    out_w = (W - KW) // stride + 1
    if out_h < 1 or out_w < 1:
        raise ValueError(
            f"kernel {kernel.shape} with stride {stride} and padding "
            f"{padding} does not fit input"
        )

    out = np.zeros((out_h, out_w))
    windows = []
    for i in range(out_h):
        for j in range(out_w):
            r, c = i * stride, j * stride
            region = x[r : r + KH, c : c + KW]
            out[i, j] = float(np.sum(region * kernel))
            windows.append([int(r), int(c)])
    return out, windows


def pool2d(x, size=2, stride=None, mode="max"):
    """2D pooling. Returns (output, windows) like :func:`conv2d`."""
    x = np.asarray(x, dtype=np.float64)
    size = int(size)
    stride = int(stride) if stride else size
    H, W = x.shape
    out_h = (H - size) // stride + 1
    out_w = (W - size) // stride + 1
    if out_h < 1 or out_w < 1:
        raise ValueError("pooling window does not fit input")

    out = np.zeros((out_h, out_w))
    windows = []
    for i in range(out_h):
        for j in range(out_w):
            r, c = i * stride, j * stride
            region = x[r : r + size, c : c + size]
            out[i, j] = float(region.max() if mode == "max" else region.mean())
            windows.append([int(r), int(c)])
    return out, windows


KERNEL_PRESETS = {
    "identity": [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    "edge_vertical": [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
    "edge_horizontal": [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
    "sharpen": [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    "box_blur": (np.ones((3, 3)) / 9.0).tolist(),
    "ridge": [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
}


def sample_image(size=9):
    """A small synthetic grayscale image with clear edges (values 0..1)."""
    img = np.zeros((size, size))
    img[2 : size - 2, 2 : size - 2] = 1.0
    img[size // 2, :] = 0.6
    img[:, size // 2] = np.maximum(img[:, size // 2], 0.4)
    return np.round(img, 2)
