import numpy as np
import pytest
from neuroscope.cnn.receptive_field import receptive_field
from neuroscope.core.lab_utils import LabError


def test_size_jump_rf():
    r = receptive_field(16, [{"kernel":3,"stride":2,"padding":1},{"kernel":3,"stride":1,"padding":0}])
    assert [(s['size'],s['jump'],s['rf'],s['offset']) for s in r['states']] == [(16,1,1,0),(8,2,3,-1),(6,2,7,-1)]
    assert r['bounds']==[-1,-1,6,6]


def test_stride_holes_are_not_filled():
    r = receptive_field(12,[{"kernel":1,"stride":3},{"kernel":2}],row=1,col=1)
    assert r['rows']==[3,6] and r['cols']==[3,6]
    assert r['covered_pixels']==4
    assert r['states'][-1]['rf']==4


def test_padding_clipped_at_each_layer():
    r=receptive_field(1,[{"kernel":1,"padding":1},{"kernel":3}])
    assert r['covered_pixels']==1
    r=receptive_field(1,[{"kernel":1,"padding":1}],row=0,col=0)
    assert r['covered_pixels']==0


def test_exact_mask_against_brute_dependency_propagation():
    configs=[{"kernel":3,"stride":2,"padding":1},{"kernel":2,"stride":1,"padding":1}]
    n=5
    grid=[[{(r,c)} for c in range(n)] for r in range(n)]
    for cfg in configs:
        old=grid;n=(len(old)+2*cfg['padding']-cfg['kernel'])//cfg['stride']+1
        grid=[[set() for _ in range(n)] for _ in range(n)]
        for r in range(n):
            for c in range(n):
                for u in range(cfg['kernel']):
                    for v in range(cfg['kernel']):
                        rr=r*cfg['stride']-cfg['padding']+u;cc=c*cfg['stride']-cfg['padding']+v
                        if 0<=rr<len(old) and 0<=cc<len(old):grid[r][c]|=old[rr][cc]
    for r in range(n):
        for c in range(n):
            result=receptive_field(5,configs,row=r,col=c)
            assert set(map(tuple,np.argwhere(result['mask'])))==grid[r][c]


@pytest.mark.parametrize('kwargs',[{'input_size':0},{'layers':[]},{'layers':[{'kernel':7}]},{'layers':[{'stride':0}]},{'row':99},{'selected_layer':0},{'layers':[{'stride':1.5}]}])
def test_invalid_geometry(kwargs):
    args={'input_size':4,'layers':[{'kernel':3}]};args.update(kwargs)
    with pytest.raises(LabError):receptive_field(**args)
