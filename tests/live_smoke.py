"""Read-only local-app smoke checks (creates ephemeral teaching sessions).
Run with the app on http://127.0.0.1:8000: python tests/live_smoke.py
No external network or file writes; requires only the standard library.
"""
import json, math, urllib.request, urllib.error
from pathlib import Path

BASE='http://127.0.0.1:8000'
count=0

def finite(x):
    if isinstance(x,float):assert math.isfinite(x)
    elif isinstance(x,dict):
        for value in x.values():finite(value)
    elif isinstance(x,list):
        for value in x:finite(value)


def post(path,payload,expected=200):
    global count
    req=urllib.request.Request(BASE+'/api'+path,data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=30) as response:status=response.status;data=json.load(response)
    except urllib.error.HTTPError as exc:status=exc.code;data=json.load(exc)
    assert status==expected,(path,status,data)
    finite(data);count+=1
    return data


def main():
    static_root=Path(__file__).resolve().parents[1]/'app/static'
    paths=['/','/static/css/style.css']+['/static/'+p.relative_to(static_root).as_posix() for p in sorted((static_root/'js').rglob('*.js'))]
    for path in paths:
        with urllib.request.urlopen(BASE+path,timeout=10) as response:
            assert response.status==200,(path,response.status)
            assert response.headers['Cache-Control']=='no-cache'
            assert response.read(),path
    print(f"Static/UI HTTP: {len(paths)} GET checks passed")
    with urllib.request.urlopen(BASE+'/api/health') as r:assert json.load(r)=={'status':'ok'}
    with urllib.request.urlopen(BASE+'/static/js/app.js') as r:assert r.headers['Cache-Control']=='no-cache'
    post('/tensor/op',{'values':[[1,2,3],[4,5,6]],'op':'reshape','params':{'shape':[3,2]}})
    post('/tensor/random',{'shape':[2,3],'seed':0})
    post('/datasets',{'name':'moons','n_samples':40})
    cfg={'dataset':{'name':'moons','n_samples':40,'noise':.12,'test_split':.25},'hidden_layers':[4,4]}
    sid=post('/playground/create',cfg)['session_id']
    r=post('/playground/step',{'session_id':sid,'epochs':5});assert r['epoch']==5
    sid=post('/playground/reset',{'session_id':sid})['session_id']
    post('/backprop/summary',{'session_id':sid})
    post('/diagnostics',{'session_id':sid})
    post('/activations/curve',{'name':'relu'})
    assert post('/activations/eval',{'name':'relu','x':1})['dy']==1
    post('/losses/eval',{'name':'cross_entropy','prediction':.7})
    post('/graph/run',{})
    post('/optimizers/path',{'steps':10})
    post('/init-lab',{})
    post('/lr-lab',{'epochs':10})
    post('/regularization',{'epochs':20})
    post('/cnn/conv',{})
    post('/cnn/pool',{'stride':None})
    padded=post('/cnn/conv',{'preset':'identity','padding':1,'stride':1})
    assert padded['output'][0][4]==0.4
    assert padded['padded_input'][1][5]==0.4
    r=post('/normalization',{'values':[[1,3],[3,7]]});assert r['axis']==0
    post('/receptive-field',{'input_size':16,'layers':[{'kernel':3,'stride':2,'padding':1}]})
    post('/residual',{'values':[[1,2]],'depth':3,'scale':0})
    post('/attention',{'values':[[1,0],[0,1]],'tokens':['a','b']})
    post('/multihead',{'values':[[1,0],[0,1]],'tokens':['a','b'],'num_heads':2})
    # Each new route rejects an invalid contract as localized HTTP 400.
    for path,payload in [('/normalization',{'values':[]}),('/receptive-field',{'layers':[]}),('/residual',{'values':[[1]],'depth':0}),('/attention',{'values':[[1]],'tokens':[]}),('/multihead',{'values':[[1,2]],'tokens':['a'],'num_heads':3})]:
        assert 'i18n' in post(path,payload,400)['detail']
    print(f'Live HTTP: {count} POST checks passed ({count-5} successful, 5 expected localized 400); health and no-cache passed; all results finite')

if __name__=='__main__':main()
