# NeuroScope

**An interactive deep learning visualization laboratory.**

NeuroScope helps learners build real intuition for the core concepts of deep
learning — tensors, activations, losses, backpropagation, optimization and
convolution — by making every one of them *something you can touch*.

The entire numerical engine is written in **plain NumPy** (no deep-learning
frameworks), so every forward pass and every gradient can be read, printed
and checked by hand.

![python](https://img.shields.io/badge/python-3.11%2B-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![tests](https://img.shields.io/badge/tests-28%20passing-brightgreen)

---

## Features

### Fundamentals
- **Tensor & Shape Lab** — reshape, transpose, matmul, broadcasting and axis
  reductions with live before/after shapes.
- **Activations Lab** — ReLU, Sigmoid, Tanh, Leaky ReLU, GELU, Softmax: curves,
  derivatives, and live `f(x)` / `f′(x)` readouts.
- **Loss Lab** — MSE, Binary Cross Entropy, Cross Entropy: drag the prediction,
  watch the loss and its gradient respond.
- **Computational Graph** — step through a forward pass, then a backward pass;
  local gradients on every edge make the chain rule explicit.

### Networks
- **Neural Network Playground** — XOR / Moons / Circles / Spiral / Blobs with
  adjustable size, noise and train/test split. Build `Input → Hidden → Output`
  with configurable layer count, neurons and activation.
- **Training Playground** — live training/validation loss, accuracy and
  decision boundary with **Start / Pause / Resume / Reset**.
- **Backpropagation Visualizer** — loss → output gradient → per-layer `dW`/`db`,
  summary first (norms, histograms) with drill-down into small matrices.
- **Gradient Diagnostics** — per-layer gradient norms with vanishing /
  exploding detection.

### Training dynamics
- **Optimization Lab** — SGD, Momentum, RMSProp and Adam racing across 2D loss
  landscapes (elongated bowl, Rosenbrock, saddle) with tunable hyperparameters.
- **Initialization Lab** — Zeros vs Random vs Xavier vs He through a 10-layer
  network: activation variance and gradient norms per layer.
- **Learning Rate Lab** — too small / appropriate / too large learning rates
  side by side.
- **Regularization Lab** — None vs L1 vs L2 vs Dropout: train/val accuracy and
  decision-boundary complexity.

### Convolution
- **Convolution Lab** — sliding-window animation: kernel, element-wise
  products, summation, feature map; kernel size/stride/padding with live
  output-shape formula.
- **Pooling Lab** — max and average pooling, window by window.

## Screenshots

> Placeholders — real screenshots/GIFs will be added from actual runs
> (see [CONTRIBUTING](CONTRIBUTING.md): no fabricated results).

| Playground | Computational Graph | Optimization Lab |
|---|---|---|
| `docs/screenshots/playground.png` *(todo)* | `docs/screenshots/graph.png` *(todo)* | `docs/screenshots/optimizers.png` *(todo)* |

## Installation

Requires **Python 3.11+** and a browser. Nothing else.

```bash
git clone https://github.com/<your-org>/neuroscope.git
cd neuroscope
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
```

## Quick Start

### Windows (one click)

Double-click **`start.bat`**. It creates/uses the project-local `venv`,
installs dependencies, starts the server and opens your browser.

### Any platform

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
# then open http://127.0.0.1:8000
```

### Run the tests

```bash
pytest -q
```

28 tests, including **numerical gradient checking** for every backward pass
and hand-computed convolution/pooling references.

## Architecture

```
neuroscope/                 # NumPy engine — no UI code here
  core/
    activations.py          # ReLU/Sigmoid/Tanh/LeakyReLU/GELU/Softmax + grads
    initializers.py         # zeros / random / xavier / he
    network.py              # MLP: forward, backward, dropout, L1/L2
    graph.py                # tiny computational-graph engine
    tensor_ops.py           # reshape/transpose/matmul/broadcast/axis ops
  layers/linear.py          # Linear layer: forward / backward
  losses/losses.py          # MSE, BCE, Cross Entropy (fused, stable)
  optimizers/optimizers.py  # SGD, Momentum, RMSProp, Adam
  datasets/datasets.py      # XOR, moons, circles, spiral, blobs
  diagnostics/gradients.py  # gradient reports, health, init-lab runs
  cnn/conv.py               # conv2d / pool2d with explicit loops
app/
  main.py                   # FastAPI entry (serves API + static UI)
  api/routes.py             # thin JSON layer over the engine
  static/                   # dependency-free vanilla-JS SPA
    js/pages/               # one module per lab
tests/                      # pytest, incl. numerical gradient checking
docs/                       # ARCHITECTURE / MATH_NOTES / ROADMAP / report
examples/                   # runnable scripts using the engine directly
```

Design rules:

1. **UI and core are strictly separated** — the engine never imports the app.
2. **Math must be readable** — formulas live in docstrings, loops are explicit.
3. **No fabricated results** — everything the UI shows comes from a real run.

## Learning modules

| Module | Concept | Interaction |
|---|---|---|
| Tensor & Shape Lab | shapes, broadcasting, axes | edit tensors, apply ops |
| Activations Lab | nonlinearity, derivatives | slider over x, live f(x)/f′(x) |
| Loss Lab | loss surfaces | drag prediction |
| Computational Graph | chain rule | step forward/backward |
| Playground | representation learning | build & train an MLP live |
| Backprop Visualizer | gradient flow | per-layer drill-down |
| Optimization Lab | optimizer dynamics | race optimizers on landscapes |
| Initialization Lab | variance flow | compare 4 initializers |
| Learning Rate Lab | step size | compare loss curves |
| Regularization Lab | overfitting | compare boundaries |
| Convolution Lab | feature extraction | animate the sliding window |
| Pooling Lab | downsampling | animate max/avg windows |

## Roadmap

P2 modules are planned but **not yet implemented** — see
[docs/ROADMAP.md](docs/ROADMAP.md): Normalization Lab (BatchNorm/LayerNorm),
Receptive Field Lab, Residual Connection Lab, Attention & Multi-Head
Attention visualizations.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The short version: NumPy-only engine,
numerical gradient checks for every backward pass, no fabricated results.

## License

[MIT](LICENSE) © 2026 NeuroScope contributors
