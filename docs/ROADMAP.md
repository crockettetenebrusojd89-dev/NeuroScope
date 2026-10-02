# Roadmap

Status legend: ✅ shipped · 🚧 planned

## P0 — Fundamentals ✅ (v0.1.0)

- ✅ Tensor & Shape Lab
- ✅ Neural Network Playground (XOR / Moons / Circles / Spiral / Blobs)
- ✅ Activations Lab
- ✅ Loss Lab
- ✅ NumPy MLP engine (forward / backward)
- ✅ Computational Graph (step forward / backward)
- ✅ Backpropagation Visualizer (summary + drill-down)
- ✅ Optimization Lab (SGD / Momentum / RMSProp / Adam + 2D landscapes)
- ✅ Training Playground (Start / Pause / Resume / Reset)
- ✅ Live Decision Boundary

## P1 — Training dynamics & convolution ✅ (v0.1.0)

- ✅ Initialization Lab (zeros / random / xavier / he)
- ✅ Gradient Diagnostics (norms, vanishing/exploding flags)
- ✅ Learning Rate Lab
- ✅ Regularization Lab (none / L1 / L2 / dropout)
- ✅ CNN Convolution Lab
- ✅ Pooling Lab

## P2 — Advanced ✅ (implemented)

- ✅ **Normalization Lab** — BatchNorm vs LayerNorm: distributions, mean and
  variance before/after normalization.
- ✅ **Receptive Field Lab** — click a deep feature, highlight its receptive
  field on the input image as CNN depth grows.
- ✅ **Residual Connection Lab** — plain vs residual network: `F(x) + x` and
  real gradient transport under shared weights.
- ✅ **Attention Lab** — self-attention step by step: Q, K, V, QKᵀ, scaling,
  softmax, weights, weighted sum; heatmap over supplied numeric embeddings with token labels.
- ✅ **Multi-Head Attention** — per-head attention weight inspection.

## v0.3.0 — release preparation

- Learning Path home and three recommended routes through existing labs.
- Lightweight CS231n topic mapping, product README, authentic screenshots and GIFs.
- CI/local validation alignment, owner publishing steps, native deployment guide.
- Prepared release notes; public repository/tag/Release remain owner decisions.

## Feature Freeze — v0.3.x

Only polish, bug fixes, learning UX, accessibility, documentation, tests, and
performance improvements. No new DL Lab is being added in this series.

Priorities: improve narrow controls and keyboard/screen-reader affordances,
retain useful page state during language switches, strengthen legacy API input
limits, and review shared-session cleanup before a broad unattended demo.

## v0.4 — undecided

Whether to add new knowledge modules is not decided. Earlier exploratory ideas
are not commitments and are deferred during feature freeze.
