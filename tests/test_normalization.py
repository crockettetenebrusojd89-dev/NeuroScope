import numpy as np
import pytest
from neuroscope.core.normalization import batch_norm, layer_norm, normalization_lab
from neuroscope.core.lab_utils import LabError, finite_result
from app.api.p2 import normalization
from fastapi import HTTPException


def test_batch_reference():
    x = [[1, 10], [3, 14]]
    np.testing.assert_allclose(batch_norm(x), [[-1/np.sqrt(1+1e-5), -2/np.sqrt(4+1e-5)],
                                              [1/np.sqrt(1+1e-5), 2/np.sqrt(4+1e-5)]])


def test_layer_reference_and_affine():
    x = np.array([[1, 3], [10, 14]])
    expected = np.array([[-1, 1], [-2, 2]]) / np.sqrt([[1+1e-5], [4+1e-5]])
    np.testing.assert_allclose(layer_norm(x, gamma=2, beta=3), expected*2+3)


@pytest.mark.parametrize("kind,axis", [("batch", 0), ("layer", 1)])
def test_axes_stats_and_histograms(kind, axis):
    x = np.arange(12).reshape(4, 3)
    r = normalization_lab(x, kind)
    assert r['axis'] == axis
    np.testing.assert_allclose(r['output'].mean(axis=axis), 0, atol=1e-12)
    np.testing.assert_allclose(r['output'].var(axis=axis), x.var(axis=axis)/(x.var(axis=axis)+1e-5))
    for g in r['groups']:
        assert sum(g['before_hist']) == x.shape[axis]
        assert sum(g['after_hist']) == x.shape[axis]


@pytest.mark.parametrize("fn", [batch_norm, layer_norm])
def test_constant_and_singleton(fn):
    np.testing.assert_array_equal(fn([[7]], beta=2), [[2]])
    assert np.isfinite(fn(np.ones((3, 4)))).all()


@pytest.mark.parametrize("values", [[], [1, 2], [[1], [2, 3]], [[float('inf')]], [[float('nan')]]])
def test_bad_tensor(values):
    with pytest.raises(LabError):
        batch_norm(values)


@pytest.mark.parametrize("kwargs", [{"epsilon": 0}, {"epsilon": None}, {"gamma": float('inf')}, {"beta": 101}])
def test_bad_params(kwargs):
    with pytest.raises(LabError):
        layer_norm([[1, 2]], **kwargs)


def test_api_and_finite_contract():
    r = normalization({"values": [[1, 3], [3, 7]]})
    assert r['axis'] == 0
    assert isinstance(r['output'], list)
    with pytest.raises(HTTPException) as exc:
        normalization({"values": [[1]], "epsilon": 0})
    assert exc.value.status_code == 400
    assert exc.value.detail['i18n'] == 'p2.err.config'
    with pytest.raises(LabError):
        finite_result(np.array([np.inf]))
