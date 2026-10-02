import numpy as np
import pytest
from app.api.routes import loss_eval,activation_eval,cnn_pool


@pytest.mark.parametrize('name,p,target',[('mse',.2,1),('bce',.3,0),('cross_entropy',.2,0),('cross_entropy',.5,0),('cross_entropy',.8,0)])
def test_loss_slider_gradient_matches_numerical(name,p,target):
    def run(value):return loss_eval({'name':name,'prediction':value,'target':target})
    result=run(p)
    num=(run(p+1e-6)['loss']-run(p-1e-6)['loss'])/(2e-6)
    np.testing.assert_allclose(result['grad'],num,rtol=1e-6,atol=1e-7)


def test_scalar_relu_api_regression():
    assert activation_eval({'name':'relu','x':-2})['dy']==0
    assert activation_eval({'name':'relu','x':2})['dy']==1


def test_null_pool_stride_api_regression():
    r=cnn_pool({'image':[[1,2],[3,4]],'size':2,'stride':None})
    assert r['output']==[[4.0]]


def test_cnn_animation_windows_use_padded_values():
    from app.api.routes import cnn_conv
    import numpy as np
    for padding in (0, 1, 2):
        for stride in (1, 2, 3):
            result = cnn_conv({"preset": "identity", "padding": padding, "stride": stride})
            image = np.asarray(result["input"])
            padded = np.asarray(result["padded_input"])
            np.testing.assert_array_equal(padded, np.pad(image, padding))
            kernel = np.asarray(result["kernel"])
            output = np.asarray(result["output"])
            for index, (row, col) in enumerate(result["windows"]):
                window = padded[row:row+3, col:col+3]
                assert np.sum(window * kernel) == output.flat[index]
