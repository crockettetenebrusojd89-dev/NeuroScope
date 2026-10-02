"""Plain/residual tanh stacks with an explicit, inspectable backward pass.

F(x)=tanh(xW+b); plain y=F(x); residual y=F(x)+x (no post-add activation).
For upstream G, dz=G*(1-F²), dW=x.T@dz, db=sum(dz),
dx_F=dz@W.T; dx=dx_F+G in the residual case.
Both models share parameters and the same linear probe L=sum(Y*G).
This is gradient transport, not a training/accuracy benchmark.
"""
import numpy as np
from neuroscope.core.lab_utils import LabError, matrix, integer, scalar


def stack_forward_backward(values, weights, biases, upstream, residual=False):
    x = matrix(values)
    g = matrix(upstream, "G")
    if g.shape != x.shape or not weights or len(weights) != len(biases):
        raise LabError("p2.err.config", "shapes")
    records, a = [], x
    for W, b in zip(weights, biases):
        W, b = np.asarray(W, dtype=float), np.asarray(b, dtype=float)
        if W.shape != (x.shape[1], x.shape[1]) or b.shape != (x.shape[1],):
            raise LabError("p2.err.config", "W/b")
        if not np.isfinite(W).all() or not np.isfinite(b).all():
            raise LabError("p2.err.finite", "W/b")
        f = np.tanh(a @ W + b)
        y = f + a if residual else f
        records.append({"input": a, "F": f, "output": y, "W": W, "b": b})
        a = y
    loss = float(np.sum(a*g))
    norms = [0.0]*(len(records)+1)
    norms[-1] = float(np.linalg.norm(g))
    for i in range(len(records)-1, -1, -1):
        rec = records[i]
        dz = g*(1-rec['F']**2)
        branch = dz @ rec['W'].T
        skip = g.copy() if residual else np.zeros_like(g)
        rec.update({"dy":g, "dx_F":branch, "dx_skip":skip,
                    "dW":rec['input'].T@dz, "db":dz.sum(axis=0)})
        g = branch+skip
        rec['dx'] = g
        norms[i] = float(np.linalg.norm(g))
    return {"output":a, "loss":loss, "dx":g, "gradient_norms":norms,
            "weight_gradient_norms":[float(np.linalg.norm(r['dW'])) for r in records],
            "activation_norms":[float(np.linalg.norm(x))]+[float(np.linalg.norm(r['output'])) for r in records],
            "blocks":records}


def residual_lab(values, depth=8, seed=0, scale=0.8):
    x = matrix(values)
    if x.shape[0]>16 or x.shape[1]>16:
        raise LabError("p2.err.config", "X [N<=16,D<=16]")
    depth=integer(depth, "depth",1,32)
    seed=integer(seed,"seed",0,2**32-1)
    scale=scalar(scale,"scale",0,3)
    rng=np.random.default_rng(seed)
    weights=[rng.standard_normal((x.shape[1],x.shape[1]))*scale/np.sqrt(x.shape[1]) for _ in range(depth)]
    biases=[np.zeros(x.shape[1]) for _ in range(depth)]
    upstream=np.ones_like(x)/x.size
    return {"input":x,"upstream":upstream,"depth":depth,"seed":seed,"scale":scale,
            "plain":stack_forward_backward(x,weights,biases,upstream,False),
            "residual":stack_forward_backward(x,weights,biases,upstream,True)}
