import numpy as np
import pytest
from neuroscope.core.attention import scaled_attention, self_attention
from neuroscope.core.lab_utils import LabError


def test_hand_attention_scaled_softmax_output():
    q=np.eye(2);k=np.eye(2);v=np.array([[1,2],[3,4]])
    r=scaled_attention(q,k,v)
    a=np.exp(1/np.sqrt(2))/(np.exp(1/np.sqrt(2))+1)
    np.testing.assert_array_equal(r['raw_scores'],np.eye(2))
    np.testing.assert_allclose(r['scaled_scores'],np.eye(2)/np.sqrt(2))
    np.testing.assert_allclose(r['weights'],[[a,1-a],[1-a,a]])
    np.testing.assert_allclose(r['output'],[[3-2*a,4-2*a],[1+2*a,2+2*a]])


def test_uniform_weights_and_single_token():
    r=scaled_attention(np.zeros((2,3)),np.ones((3,3)),[[1],[2],[6]])
    np.testing.assert_allclose(r['weights'],1/3)
    np.testing.assert_allclose(r['output'],[[3],[3]])
    r=scaled_attention([[2]],[[3]],[[7,8]])
    np.testing.assert_array_equal(r['output'],[[7,8]])


def test_stable_large_scores():
    r=scaled_attention([[1e6,1e6]],[[1e6,1e6],[-1e6,-1e6]],[[1],[2]])
    assert np.isfinite(r['weights']).all()
    np.testing.assert_allclose(r['weights'].sum(axis=1),1)
    np.testing.assert_allclose(r['output'],[[1]])


def test_projection_shapes_and_reproducibility():
    x=np.array([[1,0,2],[0,1,-1]])
    r=self_attention(x,['a','b'],dk=4,seed=5)
    other=self_attention(x,['a','b'],dk=4,seed=5)
    for key,w in [('Q','Wq'),('K','Wk'),('V','Wv')]:
        np.testing.assert_allclose(r[key],x@r[w]);assert r[key].shape==(2,4)
    np.testing.assert_array_equal(r['weights'],other['weights'])
    np.testing.assert_allclose(r['weights'].sum(axis=1),1)
    np.testing.assert_allclose(r['output'],r['weights']@r['V'])


def test_tokens_only_labels():
    r=self_attention([[1,0],[0,1]],['甲','乙']);s=self_attention([[1,0],[0,1]],['foo','bar'])
    np.testing.assert_array_equal(r['output'],s['output'])


@pytest.mark.parametrize('q,k,v',[([[1,2]],[[1]],[[1]]),([[1]],[[1],[2]],[[1]]),([[np.nan]],[[1]],[[1]])])
def test_attention_shapes_rejected(q,k,v):
    with pytest.raises(LabError):scaled_attention(q,k,v)


@pytest.mark.parametrize('kw',[{'tokens':[]},{'tokens':['a']},{'tokens':['a',1]},{'dk':0},{'dk':17},{'seed':-1}])
def test_self_validation(kw):
    cfg={'values':[[1,0],[0,1]],'tokens':['a','b']};cfg.update(kw)
    with pytest.raises(LabError):self_attention(**cfg)
