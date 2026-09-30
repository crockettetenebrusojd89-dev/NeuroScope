"""Convolution / pooling output tests (hand-computed references)."""

import numpy as np

from neuroscope.cnn.conv import conv2d, pool2d


def test_conv_identity_kernel():
    x = np.arange(16, dtype=float).reshape(4, 4)
    k = np.array([[0, 0, 0], [0, 1, 0], [0, 0, 0]])
    out, windows = conv2d(x, k, stride=1, padding=0)
    np.testing.assert_allclose(out, x[1:3, 1:3])
    assert len(windows) == out.size


def test_conv_hand_computed():
    x = np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]])
    k = np.ones((2, 2))
    out, _ = conv2d(x, k)
    np.testing.assert_allclose(out, [[12.0, 16.0], [24.0, 28.0]])


def test_conv_output_shape_with_stride_padding():
    x = np.zeros((8, 8))
    k = np.ones((3, 3))
    out, _ = conv2d(x, k, stride=2, padding=1)
    assert out.shape == ((8 + 2 - 3) // 2 + 1, (8 + 2 - 3) // 2 + 1)


def test_conv_invalid_config_raises():
    try:
        conv2d(np.zeros((3, 3)), np.ones((5, 5)))
        assert False, "should raise"
    except ValueError:
        pass


def test_max_pool():
    x = np.array([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0],
                  [9.0, 10.0, 11.0, 12.0], [13.0, 14.0, 15.0, 16.0]])
    out, _ = pool2d(x, size=2, stride=2, mode="max")
    np.testing.assert_allclose(out, [[6.0, 8.0], [14.0, 16.0]])


def test_avg_pool():
    x = np.array([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0],
                  [9.0, 10.0, 11.0, 12.0], [13.0, 14.0, 15.0, 16.0]])
    out, _ = pool2d(x, size=2, stride=2, mode="avg")
    np.testing.assert_allclose(out, [[3.5, 5.5], [11.5, 13.5]])
