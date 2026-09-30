# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-09-30

Initial public release.

### Added
- **P0 modules**: Tensor & Shape Lab, Neural Network Playground (XOR / Moons /
  Circles / Spiral / Blobs), Activations Lab (ReLU, Sigmoid, Tanh, Leaky ReLU,
  GELU, Softmax), Loss Lab (MSE, BCE, Cross Entropy), NumPy MLP engine with
  forward/backward, interactive Computational Graph, Backpropagation
  Visualizer (summary + drill-down), Optimization Lab (SGD, Momentum, RMSProp,
  Adam on 2D landscapes), Training Playground with Start/Pause/Resume/Reset,
  live Decision Boundary rendering.
- **P1 modules**: Initialization Lab, Gradient Diagnostics, Learning Rate Lab,
  Regularization Lab (None / L1 / L2 / Dropout), CNN Convolution Lab,
  Pooling Lab.
- NumPy-only core engine (`neuroscope/`) fully separated from the UI (`app/`).
- FastAPI backend + dependency-free vanilla-JS single-page frontend.
- Test suite: 28 tests including numerical gradient checking for Linear,
  activations, losses, MLP backward, plus CNN convolution/pooling tests.
- GitHub Actions workflow running the test suite on Python 3.11–3.13.
- `start.bat` one-click launcher for Windows (creates a project-local venv).
