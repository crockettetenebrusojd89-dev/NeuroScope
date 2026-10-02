import numpy as np
import pytest
from neuroscope.core.residual import stack_forward_backward, residual_lab
from neuroscope.core.lab_utils import LabError


@pytest.mark.parametrize('skip',[False,True])
def test_every_backward_gradient_numerical(skip):
    rng=np.random.default_rng(4)
    x=rng.normal(size=(2,2)); weights=[rng.normal(size=(2,2))*.3 for _ in range(2)]; biases=[rng.normal(size=2)*.1 for _ in range(2)];upstream=rng.normal(size=(2,2))
    r=stack_forward_backward(x,weights,biases,upstream,skip)
    def objective():return stack_forward_backward(x,weights,biases,upstream,skip)['loss']
    for arr,grad in [(x,r['dx'])]+[(w,b['dW']) for w,b in zip(weights,r['blocks'])]+[(bias,b['db']) for bias,b in zip(biases,r['blocks'])]:
        num=np.zeros_like(arr)
        for idx in np.ndindex(arr.shape):
            old=arr[idx];arr[idx]=old+1e-6;p=objective();arr[idx]=old-1e-6;m=objective();arr[idx]=old;num[idx]=(p-m)/2e-6
        np.testing.assert_allclose(grad,num,rtol=1e-5,atol=1e-7)


def test_identity_path_zero_weights():
    x=np.array([[1.,2.]])
    w=[np.zeros((2,2))]*3;b=[np.zeros(2)]*3;g=np.array([[.3,.7]])
    plain=stack_forward_backward(x,w,b,g,False);skip=stack_forward_backward(x,w,b,g,True)
    np.testing.assert_array_equal(plain['output'],np.zeros_like(x));np.testing.assert_array_equal(plain['dx'],np.zeros_like(x))
    np.testing.assert_array_equal(skip['output'],x);np.testing.assert_array_equal(skip['dx'],g)


def test_one_block_hand_reference():
    x=np.array([[.2,-.4]]);w=np.eye(2)*.5;g=np.ones_like(x)
    r=stack_forward_backward(x,[w],[np.zeros(2)],g,True)
    f=np.tanh(x*.5)
    np.testing.assert_allclose(r['output'],f+x)
    np.testing.assert_allclose(r['dx'],(1-f*f)*.5+1)


def test_shared_parameters_reproducible_no_selection():
    a=residual_lab([[1,2,3]],5,seed=12);b=residual_lab([[1,2,3]],5,seed=12)
    for i in range(5):
        np.testing.assert_array_equal(a['plain']['blocks'][i]['W'],a['residual']['blocks'][i]['W'])
        np.testing.assert_array_equal(a['plain']['blocks'][i]['W'],b['plain']['blocks'][i]['W'])
    assert a['plain']['gradient_norms'][-1]==a['residual']['gradient_norms'][-1]
    assert len(a['plain']['gradient_norms'])==6


@pytest.mark.parametrize('seed',[0,1,2,3,4])
def test_finite_deep_runs(seed):
    r=residual_lab([[1,-2,.5]],32,seed,3)
    for kind in ['plain','residual']:
        assert np.isfinite(r[kind]['gradient_norms']).all()
        assert np.isfinite(r[kind]['output']).all()


@pytest.mark.parametrize('kw',[{'depth':0},{'depth':33},{'seed':-1},{'scale':4},{'values':[[1]*17]}])
def test_invalid_residual(kw):
    cfg={'values':[[1,2]]};cfg.update(kw)
    with pytest.raises(LabError):residual_lab(**cfg)
