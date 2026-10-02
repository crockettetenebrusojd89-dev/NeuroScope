# Takeover and P2 validation — 2026-10-02

Baseline: `0464a172c4f6e00075f117eedbe83d7412a69335` (v0.2.0), clean worktree.
History contains two commits, with initial P0/P1 at `83539db`. Existing history retained.
Inspected tracked engine, API/state/static source, tests, docs, CI and launch script.
Architecture: independent NumPy engine, thin FastAPI JSON API, vanilla ES-module SPA,
central `i18n.js` with zh/bi/en modes. No framework or rebuild introduced.

## Baseline verification

- Python 3.13.14; NumPy 2.5.3; FastAPI 0.142.2; uvicorn 0.54.0.
- `python -m pytest -q -p no:cacheprovider`: **29 passed in 1.49s** before edits.
- All **19 JS files** passed `node --check`; **217 locale keys** and placeholders aligned.
- No server running at takeover; project venv starts uvicorn at 127.0.0.1:8000 successfully.
- Real browser opened all 13 pages; verified English/bilingual reload persistence.
- Tensor default reshape computes correct values and localized explanation;
  activations scalar eval and pooling default render without HTTP 500.
- Playground build/start/pause produced real epoch progression; backprop and
  diagnostics produced nonzero numerical gradient reports; regularization ran all four models.
- Found reproducible navigation race: leave Learning Rate before response returns,
  callback accesses removed elements and throws `Cannot set properties of null`.
  The previous agent's unconditional clean-console claim is therefore disproved.

## Baseline bug fix

Each navigation has its own page root; stale imports cannot overwrite a newer page.
Leaving Playground or Graph stops the active timer/playback. No engine math changed.
`node tests/validate_frontend.mjs`: 19 syntax checks, 217-key/placeholder parity,
4 lifecycle assertions passed. Full pytest: **29 passed in 0.39s**.
Real-browser post-fix巡检: **13 pages × 3 modes**, zero error boxes or console errors,
including rapid navigation away from auto-running Learning Rate.

## P2 progress

All five modules pending until recorded below. No claims based on prior agent screenshots.

### P2-1 Normalization — completed

Full pytest: **45 passed in 0.71s**. Frontend: **21 JS files**, **240 keys**,
placeholder parity, **4 lifecycle assertions** passed. Browser tested every
visible lab control: JSON, method, ε/γ/β, Compute, group selector.
BatchNorm column highlighting counted 4 cells; LayerNorm row highlighting 2.
Hand reference X=[[1,3],[10,14]], ε=.01, γ=2, β=3 gave means 3 and
variances 3.960396/3.990025. Invalid JSON and epsilon=0 show localized errors.
All three modes persist after reload; zero console errors.

### P2-2 Receptive Field — completed

Full pytest **56 passed in 0.66s**; **22 JS files**, **256 locale keys**
and routing regression passed. Real browser tested input size, layer count,
all kernel/stride/padding controls on three layers, Compute, layer selector,
interior and boundary feature clicks. X=12, k1=1/s1=3/p1=0, k2=2/s2=1/p2=0
with feature [1,1] showed box [3,3,7,7) and exactly **4 highlighted pixels**.
All three modes rendered with zero error boxes and no console errors.
Browser QA found and corrected depth-field synchronization before commit.

### P2-3 Residual Connection — completed

Full pytest **71 passed in 0.73s**; **23 JS files**, **270 locale keys**
and routing regression passed. Numerical central differences verify every
input/weight/bias gradient for both plain and residual two-block networks.
Browser tested JSON, depth, seed, scale, Compute and block selector.
At X=[[1,2]], depth=3, scale=0, plain output/dx were [0,0]; residual
output was [1,2] and dx [0.5,0.5], exactly the identity path reference.
Depth=16, scale=1.5, seed=1 rendered finite norms. All three language
modes and console checks passed.
