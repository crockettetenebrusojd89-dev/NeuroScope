# NeuroScope Architecture

## Goals

1. A learner can *interact* with every core deep-learning concept.
2. Every number on screen comes from real computation, not fixtures.
3. The math is readable enough to serve as course material.

## Two worlds, one contract

```
┌─────────────────────────────┐        JSON / HTTP         ┌────────────────────────┐
│  app/  (UI)                 │  ────────────────────────► │  neuroscope/  (engine) │
│  FastAPI routes + static JS │ ◀────────────────────────  │  NumPy only            │
└─────────────────────────────┘                            └────────────────────────┘
```

- The **engine** (`neuroscope/`) never imports the app. It can be used from
  scripts, notebooks or tests with zero HTTP anywhere (see `examples/`).
- The **API** (`app/api/routes.py`) is deliberately thin: validate → call the
  engine → serialize. No formulas live in the routes.
- The **frontend** (`app/static/`) is a dependency-free ES-module SPA: one JS
  module per lab, canvas-based plotting written by hand. No build step — this
  keeps the project clone-and-run.

## Training sessions

The Playground is stateful. `POST /api/playground/create` builds an `MLP` +
optimizer + dataset split and stores them in an in-memory session registry
(`app/state.py`). `POST /api/playground/step` advances N epochs and returns
loss/accuracy history plus a fresh decision-boundary grid. Pause/resume is
client-side: the browser simply stops/continues calling `step`.

This design trades horizontal scalability (which a teaching app doesn't
need) for a huge win in interaction simplicity: the UI can poll small steps
at ~5 Hz and render smooth live curves.

## Engine layout

| Module | Responsibility |
|---|---|
| `core/activations.py` | elementwise activations + derivatives; stable softmax |
| `core/initializers.py` | zeros / random / xavier / he |
| `core/network.py` | `MLP`: forward, fused-output backward, dropout, L1/L2 |
| `core/graph.py` | tiny node/edge computational-graph engine with per-edge local grads |
| `core/tensor_ops.py` | shape ops for the Tensor Lab |
| `layers/linear.py` | `Linear`: caches input, produces dW/db/dx |
| `losses/losses.py` | MSE, BCE, CE; fused sigmoid+BCE and softmax+CE |
| `optimizers/optimizers.py` | SGD / Momentum / RMSProp / Adam on (param, grad) pairs |
| `datasets/datasets.py` | 2D toy datasets, seeded, with train/test split |
| `diagnostics/gradients.py` | per-layer gradient reports, health flags, init-lab runs |
| `cnn/conv.py` | conv2d / pool2d with explicit loops + window positions for animation |

## Key numerical decisions

- **Fused output layers**: the binary MLP computes `sigmoid(z)` fused with
  BCE, so `dL/dz = (sigmoid(z) − y)/n` directly — stable and matches what the
  docs derive. Same trick for softmax+CE.
- **Inverted dropout** at train time only; masks are applied both to
  activations and to the backpropagated gradient.
- **Numerical gradient checking** (`eps = 1e-6`, central differences) backs
  every backward implementation in the test suite.
- **CNN loops are explicit** on purpose: `conv2d` returns both the output and
  the window coordinates so the UI can replay the computation step by step.

## What is deliberately absent

- No autograd framework, no GPU, no async task queue, no database, no build
  tooling. Each would raise the floor for contributors without teaching
  anything about deep learning.
