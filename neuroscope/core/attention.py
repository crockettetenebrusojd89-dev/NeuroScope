"""Scaled dot-product self-attention, with seeded untrained projections.

Q=XWq, K=XWk, V=XWv; S=QK.T; A=softmax(S/sqrt(d_k)); Y=AV.
Token strings are labels for supplied numerical embeddings, not a language model.
"""
import numpy as np
from neuroscope.core.lab_utils import LabError, matrix, integer
from neuroscope.core.activations import softmax


def scaled_attention(q, k, v):
    q,k,v=matrix(q,'Q'),matrix(k,'K'),matrix(v,'V')
    if q.shape[1]!=k.shape[1] or k.shape[0]!=v.shape[0]:
        raise LabError('p2.err.config','Q/K/V shapes')
    raw=q@k.T
    scale=float(np.sqrt(q.shape[1]))
    scaled=raw/scale
    weights=softmax(scaled)
    output=weights@v
    return {'Q':q,'K':k,'V':v,'raw_scores':raw,'scale':scale,
            'scaled_scores':scaled,'weights':weights,'output':output}


def attention_input(values, tokens, seed):
    x=matrix(values)
    if max(x.shape)>16:
        raise LabError('p2.err.config','X [N<=16,D<=16]')
    if not isinstance(tokens,list) or len(tokens)!=x.shape[0] or any(not isinstance(t,str) or not t.strip() or len(t)>32 for t in tokens):
        raise LabError('attention.err.tokens','tokens')
    seed=integer(seed,'seed',0,2**32-1)
    return x,np.random.default_rng(seed)


def self_attention(values,tokens,dk=2,seed=0):
    x,rng=attention_input(values,tokens,seed)
    dk=integer(dk,'d_k',1,16)
    wq,wk,wv=[rng.standard_normal((x.shape[1],dk))/np.sqrt(x.shape[1]) for _ in range(3)]
    r=scaled_attention(x@wq,x@wk,x@wv)
    return dict(r,input=x,tokens=tokens,Wq=wq,Wk=wk,Wv=wv,dk=dk,seed=seed)
