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

All five modules completed in the required order, each after the previous
module passed tests and real-browser QA. No partial or unstarted modules remain.

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

### P2-4 Self-Attention — completed

Full pytest **85 passed in 0.69s**; **25 JS files**, **286 locale keys**
and routing regression passed. Tests include hand-computed scaling/softmax
weighted sums, uniform/single-token cases, large-score stability, projection
shapes and token-only-label invariance. Browser tested tokens, X, d_k, seed,
Compute and query selector. For X=I₂, d_k=3, seed=4, displayed contribution
row sums matched displayed output [0.949006,-0.547649,-0.083942] within
1.1e-6 (rounding). All three modes and zero-console checks passed.

### P2-5 Multi-Head Attention — completed

Full pytest **99 passed in 0.69s**; **26 JS files**, **298 locale keys**
and routing regression passed. Tested N/D/heads combinations including
N=1,D=1,h=1 and N=2,D=16,h=8; verified each projection, attention row sum,
head output, concat order, Wo shape, output product, independent heads
and reproducible seeds. Invalid h=3 for D=4 is a localized HTTP 400.
Browser tested tokens, X, heads, seed, Compute, query and head selectors,
with h=2 and h=4. Screen-derived Concat@Wo matched displayed output within
7.2e-7. All three modes rendered with zero error boxes and console errors.

### Additional baseline bug — CE slider gradient

The existing CE route displayed dL/dlogit0 as dL/dp although logit0=4p−2.
At p=.7 the old gradient was −.473312 while central difference gave
−1.893249. Fixed the route chain-rule factor, without modifying the core
loss implementation. The fixed-class CE example now disables the irrelevant
binary target selector and explains the derivative in both locales.
Full pytest **106 passed in 0.81s**; frontend static keys/parity/lifecycle
checks passed. Browser displayed −1.8932 at p=.70, −1.8534 at p=.71,
and restored the target selector for BCE. All six activations were also
checked with slider changes, producing finite values with zero console errors.
Added regressions for scalar ReLU and null pool stride from v0.2.0.

## Final cross-module validation

- Full unit/numerical/API regression suite: **106 passed in 0.75s**.
- `node tests/validate_frontend.mjs`: **26 JS syntax checks**, **298 aligned
  locale keys**, placeholder parity, literal translation-key existence,
  and **4 lifecycle assertions** passed.
- `python tests/live_smoke.py`: **28 real HTTP POST checks passed**:
  23 successful computations across P0/P1/P2 and 5 expected localized HTTP 400
  rejections. Health and no-cache headers passed; all response values finite.
- Real browser: **18 pages × zh/bi/en = 54 checks**, zero error boxes,
  NaN/Infinity display or console errors. Bilingual mode persisted after reload.
- Every new lab control exercised; numeric display references recorded per module.
- Additional original-page regression: all tensor operations yielded expected
  shapes; training reached epoch **6**, train loss **0.3307**, validation accuracy
  **88.0%**; Pause worked; Reset recreated a session at epoch **1** as designed.
  The graph completed forward and backward steps without errors.
- Wide matrix panels no longer overflow the page. On all 5 new pages, desktop
  scrollWidth=clientWidth=1265; mobile viewport override 390×844 produced
  scrollWidth=clientWidth=375 (excluding scrollbar). Override reset after testing.
- Actual screenshot saved as `docs/screenshots/multihead-bi.jpg`.
- No original commits squashed or rewritten. Project changes only in E:\NeuroScope.

## Commits created

| Commit | Logical change |
|---|---|
| 519bab7 | Fix old SPA navigation race and stop departed-page activity |
| fba771f | P2-1 Normalization; full suite 45 passed |
| f5073a7 | P2-2 Receptive Field; full suite 56 passed |
| d8b683f | P2-3 Residual Connection; full suite 71 passed |
| 7a9545b | P2-4 Self-Attention; full suite 85 passed |
| 2a9c2ba | P2-5 Multi-Head Attention; full suite 99 passed |
| 5304361 | Fix old CE slider chain rule; full suite 106 passed |
| Final commit (see Git log) | `fix: contain lab tables and record final takeover validation` |

## Remaining limits

- BatchNorm is training-batch 2D [N,D], scalar gamma/beta, no running statistics
  or inference mode. LayerNorm is over the row feature dimension.
- RF uses square kernels, symmetric padding and no dilation; both theoretical
  box and exact sparse real input support are shown.
- Residual uses tanh square blocks and a fixed linear probe, not trained models
  or an accuracy comparison. Results depend on seed/scale/depth without filtering.
- Attention uses supplied numeric embeddings and untrained seeded projections;
  token text is labels only, with no positional encoding or causal masking.
- Existing behavior: switching languages re-renders lab controls and resets
  unsaved values; only language mode persists. Playground sessions are in memory.
- Existing P0/P1 `_clean` sanitizes nonfinite arrays; P2 strictly rejects them.
  This takeover verifies teaching workflows, not exhaustive adversarial input
  fuzzing, security, long-running concurrency or performance on large workloads.
