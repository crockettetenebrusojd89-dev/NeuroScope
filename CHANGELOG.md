# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Responsive navigation toggle: the full sidebar remains available while narrow-screen first visits lead with the project and Start Learning.
- CS231n topic companions with official reading links, plus documented learning order; no copied course material or guessed lecture numbers.
- Three selectable recommended routes: deep learning, computer vision and attention foundations, using existing labs only.
- Default Learning Path home: 15 ordered concept links with descriptions, difficulty and topics; three companion labs; accessible sidebar links and Start Learning.
- Multi-Head Attention Lab: independent per-head Q/K/V projections and maps,
  full concatenation/output projection, query/head selection and strict
  d_model/head divisibility; 14 shape/numerical/API validation tests.
- Self-Attention Lab: seeded NumPy Q/K/V projections, raw dot products,
  sqrt(d_k) scaling, stable softmax, fixed-scale true attention heatmaps,
  token selection and explicit weighted contributions/output; 14 tests.
- Residual Connection Lab: seeded shared-weight plain/residual tanh stacks,
  identical linear output probe, real gradient norms and per-block forward /
  nonlinear-branch / identity-skip backward values; 15 tests including full
  input, weight and bias numerical gradient checks.
- Receptive Field Lab: configurable square CNN layers, real size/jump/RF
  calculations, feature selection and exact input support (including stride
  holes and padding at intermediate layers); 11 tests added.
- Normalization Lab: real NumPy training-batch BatchNorm/LayerNorm on X[N,D],
  axis/group highlighting, editable epsilon/gamma/beta, before/after group
  mean/variance and shared-bin histograms; fully localized. 16 new numerical
  and validation tests; no nonfinite result clamping in P2 APIs.

### Fixed
- Windows launcher checks the current command errorlevel when selecting py/python; avoid stale expansion inside a batch block and quote the project directory. Verified with a real cmd missing-launcher case.
- Backprop gradient-flow labels now run Loss → last layer → first layer → Input, with arrows following the actual backward direction. Two rendered-JS regressions added.
- Playground reloads dataset points when building a changed configuration, so the boundary and displayed samples refer to the same dataset. Two rendered-JS regression assertions added.
- CNN animation now displays and multiplies the actual zero-padded input, matching feature-map values at every window. Stop animation on navigation; API and rendered-JS regressions added.
- Keep wide lab matrices scrollable within their panels instead of overflowing
  the entire page. Verified all five P2 pages at desktop and mobile widths.
- Correct CE Loss Lab slider gradient: z0=4p−2 requires dL/dp=4*dL/dz0.
  Disable the binary target selector for the fixed-class CE example and
  clarify the formula in both languages. Seven API regression tests added.
- Isolate each SPA page mount and ignore stale module imports so delayed API
  responses cannot update a replacement page. Stop training and graph playback
  when leaving their pages. Independently reproduced during takeover.

## [0.2.0] - 2026-09-30

### Added
- **Full UI internationalization** with three language modes: 中文 (default),
  中英双语 (bilingual), English.
  - Centralized i18n system: `app/static/js/i18n.js` + locale resources
    `locales/zh-CN.js` / `locales/en-US.js` (217 keys each, parity-checked).
  - Language switcher in the sidebar; the choice persists via localStorage
    and applies instantly without a page reload.
  - Bilingual mode renders main page titles in both languages and keeps
    normal UI text uncluttered.
  - Terminology policy: natural Chinese for UI text, 「中文（English）」 for
    first-occurrence technical terms; code identifiers, formulas, API and
    model names stay in English.
- Tensor Lab explanations and shape errors are now returned by the backend as
  structured i18n keys + params and rendered client-side in the active
  language (e.g. reshape mismatch errors are fully localized).
- Chinese font stack (PingFang SC / Microsoft YaHei / Noto Sans SC) and a
  responsive layout for narrow screens.

### Changed
- All 13 lab pages now source every user-visible string from the locale
  resources — no per-page hardcoded UI text.

### Fixed
- **Playground never trained from the browser**: the frontend read
  `r.sessionId` while the API returns `session_id` — sessions silently
  failed. Found and fixed via real-browser end-to-end verification.
- `relu_grad` crashed on scalar (Python float) inputs
  (`/api/activations/eval`).
- `/api/cnn/pool` returned HTTP 500 when `stride` was sent as `null`
  (pooling page default).
- Static assets are now served with `Cache-Control: no-cache` so UI updates
  reach the browser without a hard refresh.

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
