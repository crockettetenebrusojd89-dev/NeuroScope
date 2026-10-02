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

## P2 — Advanced (in progress)

- ✅ **Normalization Lab** — BatchNorm vs LayerNorm: distributions, mean and
  variance before/after normalization.
- ✅ **Receptive Field Lab** — click a deep feature, highlight its receptive
  field on the input image as CNN depth grows.
- 🚧 **Residual Connection Lab** — plain vs residual network: `F(x) + x` and
  the gradient-highway difference.
- 🚧 **Attention Lab** — self-attention step by step: Q, K, V, QKᵀ, scaling,
  softmax, weights, weighted sum; heatmap over a typed token sequence.
- 🚧 **Multi-Head Attention** — per-head attention weight inspection.

## Beyond P2 (ideas, unscheduled)

- Save/share playground configurations as URLs
- Export a trained MLP's weights as JSON
- More computational-graph examples (user-editable graphs)
- Extended localization (three UI modes already shipped in v0.2.0)
- GPU-free "MNIST-in-the-browser" demo using the NumPy engine
