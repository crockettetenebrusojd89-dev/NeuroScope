# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed
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
