import numpy as np
import pytest
from neuroscope.core.attention import multi_head_attention,self_attention
from neuroscope.core.lab_utils import LabError
from app.api.p2 import multihead
from fastapi import HTTPException


@pytest.mark.parametrize('n,d,h',[(1,1,1),(3,4,2),(4,8,4),(2,16,8),(2,6,3)])
def test_multihead_shapes_and_true_values(n,d,h):
    x=np.arange(n*d).reshape(n,d)/10
    r=multi_head_attention(x,[str(i) for i in range(n)],h,seed=8)
    assert r['d_head']==d//h
    assert len(r['heads'])==h
    for head in r['heads']:
        for key,w in [('Q','Wq'),('K','Wk'),('V','Wv')]:
            assert head[w].shape==(d,d//h)
            np.testing.assert_allclose(head[key],x@head[w])
        assert head['weights'].shape==(n,n)
        np.testing.assert_allclose(head['weights'].sum(axis=1),1)
        np.testing.assert_allclose(head['output'],head['weights']@head['V'])
    np.testing.assert_allclose(r['concat'],np.concatenate([head['output'] for head in r['heads']],axis=1))
    assert r['concat'].shape==(n,d)
    assert r['Wo'].shape==(d,d)
    assert r['output'].shape==(n,d)
    np.testing.assert_allclose(r['output'],r['concat']@r['Wo'])


def test_independent_projections_and_reproducible_seed():
    r=multi_head_attention(np.eye(4),list('abcd'),2,seed=2)
    s=multi_head_attention(np.eye(4),list('abcd'),2,seed=2)
    assert not np.array_equal(r['heads'][0]['Wq'],r['heads'][1]['Wq'])
    assert not np.array_equal(r['heads'][0]['weights'],r['heads'][1]['weights'])
    np.testing.assert_array_equal(r['output'],s['output'])


def test_single_head_matches_self_before_output_projection():
    x=np.eye(3);r=multi_head_attention(x,list('abc'),1,seed=6);s=self_attention(x,list('abc'),3,seed=6)
    np.testing.assert_array_equal(r['heads'][0]['weights'],s['weights'])
    np.testing.assert_array_equal(r['concat'],s['output'])
    np.testing.assert_allclose(r['output'],s['output']@r['Wo'])


@pytest.mark.parametrize('heads',[0,3,5,9,1.5,None])
def test_invalid_heads(heads):
    with pytest.raises(LabError):multi_head_attention(np.eye(4),list('abcd'),heads)


def test_api_localized_shape_rejection():
    with pytest.raises(HTTPException) as exc:multihead({'values':np.eye(4).tolist(),'tokens':list('abcd'),'num_heads':3})
    assert exc.value.status_code==400
    assert exc.value.detail['i18n']=='multihead.err.divisible'
