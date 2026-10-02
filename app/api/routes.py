"""NeuroScope HTTP API.

Thin layer over the ``neuroscope`` NumPy engine: every endpoint validates
input, calls into the engine and returns JSON-safe payloads. No math lives
here — the UI/core separation is intentional.
"""

import numpy as np
from fastapi import APIRouter, Body, HTTPException

from neuroscope.core import activations as A
from neuroscope.core import tensor_ops
from neuroscope.core.graph import run_graph
from neuroscope.core.network import MLP
from neuroscope.cnn.conv import KERNEL_PRESETS, conv2d, pool2d, sample_image
from neuroscope.datasets.datasets import (
    DATASET_NAMES,
    make_dataset,
    train_test_split,
)
from neuroscope.diagnostics.gradients import (
    gradient_health,
    init_lab_run,
    layer_gradient_report,
)
from neuroscope.losses import losses
from neuroscope.optimizers.optimizers import make_optimizer

from app import state

router = APIRouter(prefix="/api")


def _clean(x):
    """Recursively convert numpy values to JSON-safe Python values."""
    if isinstance(x, np.ndarray):
        return np.nan_to_num(x, nan=0.0, posinf=1e12, neginf=-1e12).tolist()
    if isinstance(x, (np.floating, np.integer)):
        return float(x)
    if isinstance(x, dict):
        return {k: _clean(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [_clean(v) for v in x]
    return x


def _err(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except (ValueError, KeyError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# ---------------------------------------------------------------- tensor lab
@router.post("/tensor/op")
def tensor_op(payload: dict = Body(...)):
    op = payload.get("op", "reshape")
    values = payload.get("values")
    params = payload.get("params", {})
    if values is None:
        raise HTTPException(400, "missing 'values'")
    try:
        out, explanation = tensor_ops.apply_operation(op, values, params)
    except tensor_ops.TensorOpError as exc:
        # structured detail: the client localizes it via its i18n resources
        raise HTTPException(
            400, detail={"i18n": exc.key, "params": exc.params}
        ) from exc
    except (ValueError, TypeError) as exc:
        raise HTTPException(400, detail=str(exc)) from exc
    return _clean(
        {
            "input_shape": list(np.asarray(values, dtype=float).shape),
            "output_shape": list(np.asarray(out).shape),
            "output": np.round(np.asarray(out), 4),
            "explanation": explanation,
        }
    )


@router.post("/tensor/random")
def tensor_random(payload: dict = Body(default={})):
    shape = payload.get("shape", [2, 3])
    seed = payload.get("seed")
    if any(int(s) <= 0 for s in shape) or int(np.prod(shape)) > 4096:
        raise HTTPException(400, "invalid shape (positive, <= 4096 elements)")
    return _clean({"values": tensor_ops.random_tensor(shape, seed=seed)})


# ------------------------------------------------------------------ datasets
@router.post("/datasets")
def datasets(payload: dict = Body(...)):
    name = payload.get("name", "moons")
    n = int(payload.get("n_samples", 400))
    noise = float(payload.get("noise", 0.1))
    split = float(payload.get("test_split", 0.25))
    seed = payload.get("seed", 42)
    n = max(40, min(n, 5000))
    X, y = _err(make_dataset, name, n, noise, seed)
    Xtr, Xte, ytr, yte = train_test_split(X, y, split, seed=seed)
    return _clean(
        {
            "names": DATASET_NAMES,
            "train": {"X": np.round(Xtr, 4), "y": ytr},
            "test": {"X": np.round(Xte, 4), "y": yte},
            "extent": _data_extent(X),
        }
    )


def _data_extent(X, pad=0.6):
    lo = X.min(axis=0) - pad
    hi = X.max(axis=0) + pad
    return [float(lo[0]), float(hi[0]), float(lo[1]), float(hi[1])]


def _boundary_grid(net, extent, res=60):
    x0, x1, y0, y1 = extent
    xs = np.linspace(x0, x1, res)
    ys = np.linspace(y0, y1, res)
    gx, gy = np.meshgrid(xs, ys)
    pts = np.c_[gx.ravel(), gy.ravel()]
    p = net.predict_proba(pts)
    return p.reshape(res, res)


# ----------------------------------------------------------------- playground
@router.post("/playground/create")
def playground_create(payload: dict = Body(...)):
    ds = payload.get("dataset", {})
    X, y = _err(
        make_dataset,
        ds.get("name", "moons"),
        int(ds.get("n_samples", 400)),
        float(ds.get("noise", 0.1)),
        int(ds.get("seed", 42)),
    )
    Xtr, Xte, ytr, yte = train_test_split(
        X, y, float(ds.get("test_split", 0.25)), seed=int(ds.get("seed", 42))
    )

    hidden = payload.get("hidden_layers", [8, 8])
    hidden = [max(1, min(int(h), 64)) for h in hidden][:6]
    reg = payload.get("regularization", {})
    seed = int(payload.get("seed", 0))
    net = MLP(
        [2, *hidden, 1],
        hidden_activation=payload.get("activation", "tanh"),
        output_mode="binary",
        init=payload.get("init", "xavier"),
        seed=seed,
        l1=float(reg.get("l1", 0.0)) if reg.get("kind") == "l1" else 0.0,
        l2=float(reg.get("l2", 0.01)) if reg.get("kind") == "l2" else 0.0,
        dropout=float(reg.get("dropout", 0.3)) if reg.get("kind") == "dropout" else 0.0,
    )
    opt = make_optimizer(
        payload.get("optimizer", "adam"),
        lr=float(payload.get("lr", 0.03)),
        momentum=float(payload.get("momentum", 0.9)),
        beta1=float(payload.get("beta1", 0.9)),
        beta2=float(payload.get("beta2", 0.999)),
    )
    sess = {
        "net": net,
        "opt": opt,
        "data": (Xtr, Xte, ytr, yte),
        "extent": _data_extent(X),
        "epoch": 0,
        "history": {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []},
        "config": payload,
    }
    sid = state.create_session(sess)
    return {"session_id": sid, "extent": sess["extent"]}


@router.post("/playground/step")
def playground_step(payload: dict = Body(...)):
    sess = state.get_session(payload.get("session_id", ""))
    if sess is None:
        raise HTTPException(404, "unknown session_id")
    epochs = max(1, min(int(payload.get("epochs", 5)), 200))
    net, opt = sess["net"], sess["opt"]
    Xtr, Xte, ytr, yte = sess["data"]
    for _ in range(epochs):
        net.step(opt, Xtr, ytr)
        sess["epoch"] += 1
        sess["history"]["train_loss"].append(net.loss(Xtr, ytr))
        sess["history"]["val_loss"].append(net.loss(Xte, yte))
        sess["history"]["train_acc"].append(net.accuracy(Xtr, ytr))
        sess["history"]["val_acc"].append(net.accuracy(Xte, yte))
    h = sess["history"]
    return _clean(
        {
            "epoch": sess["epoch"],
            "history": h,
            "boundary": _boundary_grid(net, sess["extent"]),
            "extent": sess["extent"],
        }
    )


@router.post("/playground/reset")
def playground_reset(payload: dict = Body(...)):
    sess = state.get_session(payload.get("session_id", ""))
    if sess is None:
        raise HTTPException(404, "unknown session_id")
    cfg = dict(sess["config"])
    state.drop_session(payload["session_id"])
    return playground_create(cfg)


@router.post("/backprop/summary")
def backprop_summary(payload: dict = Body(...)):
    """One forward+backward on the training batch; per-layer gradient stats."""
    sess = state.get_session(payload.get("session_id", ""))
    if sess is None:
        raise HTTPException(404, "unknown session_id")
    net = sess["net"]
    Xtr, _, ytr, _ = sess["data"]
    batch = min(64, Xtr.shape[0])
    loss = net.backward(Xtr[:batch], ytr[:batch])
    report = layer_gradient_report(net)
    return _clean(
        {
            "loss": loss,
            "layers": report,
            "health": gradient_health(report),
            "layer_sizes": net.layer_sizes,
        }
    )


@router.post("/diagnostics")
def diagnostics(payload: dict = Body(...)):
    return backprop_summary(payload)


# ---------------------------------------------------------------- activations
@router.post("/activations/curve")
def activation_curve(payload: dict = Body(...)):
    name = payload.get("name", "relu")
    x_min, x_max = float(payload.get("x_min", -5)), float(payload.get("x_max", 5))
    fn, grad = _err(A.get, name)
    x = np.linspace(x_min, x_max, 400)
    if name == "softmax":
        # show softmax of [x, 0, 0]: a meaningful 1-D slice
        z = np.stack([x, np.zeros_like(x), np.zeros_like(x)], axis=1)
        y = fn(z)[:, 0]
        dy = y * (1 - y)
    else:
        y, dy = fn(x), grad(x)
    return _clean({"x": x, "y": y, "dy": dy, "list": A.list_activations()})


@router.post("/activations/eval")
def activation_eval(payload: dict = Body(...)):
    name = payload.get("name", "relu")
    x = float(payload.get("x", 0.0))
    fn, grad = _err(A.get, name)
    if name == "softmax":
        z = np.array([x, 0.0, 0.0])
        y = float(fn(z)[0])
        dy = y * (1 - y)
    else:
        y, dy = float(fn(x)), float(grad(x))
    return {"x": x, "y": y, "dy": dy}


# ---------------------------------------------------------------------- loss
@router.post("/losses/eval")
def loss_eval(payload: dict = Body(...)):
    name = payload.get("name", "mse")
    pred = float(payload.get("prediction", 0.5))
    target = float(payload.get("target", 1.0))
    p = np.linspace(1e-4, 1 - 1e-4, 300)

    if name == "mse":
        loss = losses.mse(np.array([pred]), np.array([target]))
        grad = float(losses.mse_grad(np.array([pred]), np.array([target]))[0])
        curve = (p - target) ** 2
    elif name == "bce":
        loss = losses.binary_cross_entropy(np.array([pred]), np.array([target]))
        grad = float(
            losses.binary_cross_entropy_grad(np.array([pred]), np.array([target]))[0]
        )
        curve = -(target * np.log(p) + (1 - target) * np.log(1 - p))
    elif name == "cross_entropy":
        # 3-class CE with logits [pred*4-2, 0, 0]; target class 0
        z = np.stack([p * 4 - 2, np.zeros_like(p), np.zeros_like(p)], axis=1)
        loss = losses.cross_entropy(np.array([[pred * 4 - 2, 0.0, 0.0]]), np.array([0]))
        # The slider controls p, while z0=4p-2: apply dz0/dp=4.
        grad = 4.0 * float(losses.cross_entropy_grad(np.array([[pred * 4 - 2, 0.0, 0.0]]), np.array([0]))[0, 0])
        curve = np.array(
            [losses.cross_entropy(z[i : i + 1], np.array([0])) for i in range(len(p))]
        )
    else:
        raise HTTPException(400, f"unknown loss: {name}")
    return _clean({"loss": loss, "grad": grad, "curve_x": p, "curve_y": curve})


# ---------------------------------------------------------------------- graph
@router.post("/graph/run")
def graph_run(payload: dict = Body(default={})):
    return _clean(_err(run_graph, payload.get("example", "neuron")))


# --------------------------------------------------------------- optimization
_LANDSCAPES = {
    "quadratic": lambda x, y: 0.4 * x ** 2 + 4.0 * y ** 2,
    "rosenbrock": lambda x, y: (1 - x) ** 2 + 8.0 * (y - x ** 2) ** 2,
    "saddle": lambda x, y: x ** 2 - 2.0 * y ** 2 + 0.3 * x * y,
}


@router.post("/optimizers/path")
def optimizer_path(payload: dict = Body(...)):
    fname = payload.get("function", "quadratic")
    if fname not in _LANDSCAPES:
        raise HTTPException(400, f"unknown function: {fname}")
    f = _LANDSCAPES[fname]
    steps = max(2, min(int(payload.get("steps", 60)), 500))
    start = payload.get("start", [-2.2, 1.8])

    lim = 2.6 if fname != "rosenbrock" else 2.2
    xs = np.linspace(-lim, lim, 120)
    ys = np.linspace(-lim, lim, 120)
    gx, gy = np.meshgrid(xs, ys)
    grid = f(gx, gy)

    def grad_f(pt):
        eps = 1e-6
        x, y = float(pt[0]), float(pt[1])
        return np.array(
            [
                (f(x + eps, y) - f(x - eps, y)) / (2 * eps),
                (f(x, y + eps) - f(x, y - eps)) / (2 * eps),
            ]
        )

    opt = make_optimizer(
        payload.get("optimizer", "sgd"),
        lr=float(payload.get("lr", 0.1)),
        momentum=float(payload.get("momentum", 0.9)),
        beta1=float(payload.get("beta1", 0.9)),
        beta2=float(payload.get("beta2", 0.999)),
    )
    pt = np.array(start, dtype=float)
    path = [pt.copy()]
    losses_path = [float(f(pt[0], pt[1]))]
    for _ in range(steps - 1):
        opt.step([(pt, grad_f(pt))])
        pt = np.clip(pt, -lim, lim)
        path.append(pt.copy())
        losses_path.append(float(f(pt[0], pt[1])))
    return _clean(
        {
            "grid": grid,
            "extent": [-lim, lim, -lim, lim],
            "path": np.array(path),
            "losses": losses_path,
        }
    )


# ------------------------------------------------------------- P1: init / lr / reg
@router.post("/init-lab")
def init_lab(payload: dict = Body(default={})):
    activation = payload.get("activation", "tanh")
    results = {}
    for init in ["zeros", "random", "xavier", "he"]:
        results[init] = _err(init_lab_run, init, activation)
    return _clean(results)


@router.post("/lr-lab")
def lr_lab(payload: dict = Body(default={})):
    """Train the same small MLP with 3 learning rates; return loss curves."""
    lrs = payload.get("lrs", [0.001, 0.05, 0.5])
    epochs = max(10, min(int(payload.get("epochs", 200)), 1000))
    X, y = make_dataset("moons", 500, 0.12, seed=7)
    Xtr, Xte, ytr, yte = train_test_split(X, y, 0.25, seed=7)
    curves = {}
    for lr in lrs[:4]:
        net = MLP([2, 12, 12, 1], hidden_activation="tanh", init="xavier", seed=1)
        opt = make_optimizer("sgd", lr=float(lr))
        hist = []
        for _ in range(epochs):
            net.step(opt, Xtr, ytr)
            hist.append(net.loss(Xtr, ytr))
        curves[str(lr)] = {"train_loss": hist, "val_acc": net.accuracy(Xte, yte)}
    return _clean(curves)


@router.post("/regularization")
def regularization(payload: dict = Body(default={})):
    """Compare none / l1 / l2 / dropout on a noisy moons dataset."""
    epochs = max(20, min(int(payload.get("epochs", 300)), 1500))
    X, y = make_dataset("moons", 320, 0.3, seed=11)
    Xtr, Xte, ytr, yte = train_test_split(X, y, 0.3, seed=11)
    extent = _data_extent(X)
    kinds = {
        "none": {},
        "l1": {"l1": 0.001},
        "l2": {"l2": 0.01},
        "dropout": {"dropout": 0.25},
    }
    results = {}
    for kind, kw in kinds.items():
        net = MLP(
            [2, 24, 24, 24, 1], hidden_activation="relu", init="he", seed=5, **kw
        )
        opt = make_optimizer("adam", lr=0.01)
        hist = {"train_acc": [], "val_acc": []}
        for e in range(epochs):
            net.step(opt, Xtr, ytr)
            if e % 5 == 0 or e == epochs - 1:
                hist["train_acc"].append(net.accuracy(Xtr, ytr))
                hist["val_acc"].append(net.accuracy(Xte, yte))
        results[kind] = {
            "history": hist,
            "boundary": _boundary_grid(net, extent, res=50),
            "final_train_acc": net.accuracy(Xtr, ytr),
            "final_val_acc": net.accuracy(Xte, yte),
        }
    return _clean({"extent": extent, "results": results, "data": {"X": X, "y": y}})


# -------------------------------------------------------------------- CNN lab
@router.post("/cnn/conv")
def cnn_conv(payload: dict = Body(default={})):
    img = payload.get("image")
    image = np.array(img, dtype=float) if img else sample_image(9)
    if payload.get("kernel"):
        kernel = np.array(payload["kernel"], dtype=float)
    else:
        kernel = np.array(KERNEL_PRESETS[payload.get("preset", "edge_vertical")], dtype=float)
    stride = int(payload.get("stride", 1))
    padding = int(payload.get("padding", 0))
    out, windows = _err(conv2d, image, kernel, stride, padding)
    return _clean(
        {
            "input": image,
            "padded_input": np.pad(image, padding, mode="constant") if padding > 0 else image,
            "kernel": kernel,
            "output": np.round(out, 4),
            "windows": windows,
            "input_shape": list(image.shape),
            "output_shape": list(out.shape),
            "presets": list(KERNEL_PRESETS.keys()),
        }
    )


@router.post("/cnn/pool")
def cnn_pool(payload: dict = Body(default={})):
    img = payload.get("image")
    image = np.array(img, dtype=float) if img else sample_image(8)
    size = int(payload.get("size", 2))
    stride = int(payload.get("stride") or size)  # stride may be null → default to size
    mode = payload.get("mode", "max")
    if mode not in ("max", "avg"):
        raise HTTPException(400, "mode must be 'max' or 'avg'")
    out, windows = _err(pool2d, image, size, stride, mode)
    return _clean(
        {
            "input": image,
            "output": np.round(out, 4),
            "windows": windows,
            "input_shape": list(image.shape),
            "output_shape": list(out.shape),
        }
    )
