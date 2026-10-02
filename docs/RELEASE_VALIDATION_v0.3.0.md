# v0.3.0 release-preparation validation

## Baseline (independently rechecked)

- Starting HEAD: `86c651a`; original worktree clean, no remote configured.
- Prior i18n baseline remains `0464a17` in the preserved history.
- Python: 106 passed in 0.80 s.
- Frontend: 26 JS syntax checks; 298 aligned locale keys/placeholders; four routing assertions.
- Live HTTP: 28 POST checks, 23 successful / five expected localized 400;
  health/no-cache and finite values passed.
- Real browser: 18 existing labs in bilingual mode; zero visible errors,
  NaN/Infinity/undefined or console errors.

## Completed changes

Learning Path home, three existing-lab routes, official CS231n topic companions,
mobile navigation, product README, real screenshots/GIFs, release/publishing/
deployment guides, and CI alignment. No new DL lab or architecture rewrite.

## Final verification

Prepared code/CI commit: `3ed32a5`. Local Windows Python 3.13.14, NumPy 2.5.3,
FastAPI 0.142.2, uvicorn 0.54.0; Node 24.16.0. Original numerical architecture
and 18 labs are retained; Home is one navigation view, not a new DL module.

| Actual command / check | Measured result |
|---|---|
| `python -B -m pytest -q -p no:cacheprovider` (original venv) | **107 passed in 1.12 s** on the complete prepared code |
| `node tests/validate_frontend.mjs` | **27 JS files**; **357 locale keys** and placeholders aligned; six SPA routing assertions; 15 valid concept links / three valid routes; CNN three, Playground two, Backprop two rendered regression assertions |
| `node tests/validate_docs.mjs` | **15 Markdown files**, **36 local links**, **14 image references**; six primary JPEGs and three GIF headers valid |
| `python -B tests/validate_live.py` | Starts a new server on an available loopback port; **29 static/UI GET checks**, **29 POST checks (24 success, five expected localized 400)**; health, no-cache, finite results; verified shutdown |
| `git diff --check` / tracked-file audit | No whitespace errors; no tracked venv, bytecode, cache/log/IDE or release scratch files |
| Workflow YAML | Parsed successfully; same four validation commands; Linux 3.11/3.12/3.13 and Windows 3.13 jobs configured. **No remote Actions run** claimed |
| Version metadata | `/openapi.json` and sidebar report **0.3.0**, prepared/unreleased |

### Clean-copy installation

Created a local Git clone of `3ed32a5` under the ignored `.release-work/` folder
inside this repository and created a brand-new venv there. Installed only
`requirements.txt` with no package cache and all installer temp paths inside
this project. Verified engine and NumPy imports resolve to that clone/venv.

- Installation completed; `pip check`: **No broken requirements found**.
- Fresh-copy pytest: **107 passed in 3.00 s**.
- Frontend and documentation results match the table above.
- Isolated server startup/static files/real HTTP and shutdown all pass.
- Clone worktree clean after checks. Removed the verification clone and temporary
  launcher-check files after confirming their absolute path was inside this project.
- This is a local clean-clone check, not a claim of remote CI or Linux execution.

### Real browser

- Rechecked all **19 views × three language modes = 57 page checks** at the
  configured 1440 × 1100 viewport: no error boxes, missing translation-key text,
  NaN/Infinity/undefined, or horizontal page overflow.
- Chinese, bilingual, and English selection each retained after full reload.
- **27 narrow checks**: Home, Playground, Backprop, CNN, all five P2 labs ×
  three modes at 390 × 844. Client/scroll widths equal (375 or 390, depending
  on scrollbar). Navigation expands/collapses, all 19 destinations remain available.
- Followed **all 15 Learning Path nodes** in the browser to the correct labs;
  selected A/B/C routes with Enter (six/seven/six valid links), tested Start
  Learning and Explore the path, and verified focus moves to the first node.
- Playground Build/Start/Pause/Resume/Reset: paused epoch 21, resumed to 41,
  reset to 1 in the final control check. Screenshot run independently paused
  at epoch 41, loss 0.2489, validation accuracy 92%; not a benchmark claim.
- Backprop computed real gradients and expanded a layer's matrices (24 cells).
- CNN padding regression: identity/padding=1 `output[0,4]` and animation sum
  both **0.4** after fix, rather than the previous displayed **0.000**.
- Residual depth 4, scale 0, seed 3: plain input-gradient norm 0; residual
  gradient norms 0.408248 at each depth, as expected for an identity path.
  Attention query 2 displays row sum 1 and real weighted output.
- MHA changed to four heads: d_model=4, d_head=1, concat/output [3,4]; head
  and query selections work. These are real calculations, not mocks.
- Browser error logs after the matrix and focused controls: **zero errors**.
  Static/API smoke returned no unexpected 404 or 500 responses.

## Bugs independently found and fixed this round

| Commit | Reproduced issue / correction |
|---|---|
| `21bff22` | CNN explained unpadded values against padded outputs; now displays/multiplies the actual padded input and stops its animation on navigation |
| `a5f96c1` | Switching moons → xor rebuilt the model but retained moons points; rebuilding now reloads the selected dataset |
| `56e1d1a` | Backprop layer labels/arrows reversed the gradient flow; now Loss → last layer → first layer → Input |
| `a597247` | Batch-block `%errorlevel%` used a stale value and chose missing py; real cmd reproduction verifies the corrected current-errorlevel fallback |

## Commits created

Existing history was neither squashed nor overwritten.

| Hash | Change |
|---|---|
| `940d05a` | Accessible default Learning Path home |
| `140cb55` | Three recommended existing-lab routes |
| `33ef341` | Verified CS231n topic mapping and learning-order docs |
| `21bff22` | CNN padding animation fix |
| `a5f96c1` | Playground dataset visualization fix |
| `56e1d1a` | Backprop gradient-flow labeling fix |
| `a597247` | Windows launcher fallback fix |
| `5823cea` | Mobile first-visit navigation UX |
| `76e0c0a` | Product README, authentic assets, release/publishing/deployment guides |
| `3ed32a5` | v0.3.0 metadata, local/CI validation alignment, ignore/contributing rules |

This report is committed in a final documentation-only commit; see Git history
for its hash, avoiding a self-referential commit hash in the document.

## Screenshots and demos

Seven new JPEGs: `home-en`, `home-zh`, `playground-en`, `backprop-en`, `cnn-en`,
`attention-en`, `multihead-en`, all under `docs/screenshots/`. Four earlier
Chinese/bilingual assets preserved. The final screenshot set shows prepared
v0.3.0. Each image was visually reviewed as a real rendered page.

Three real GIFs under `docs/demos/`, decoded with Pillow and checked for changing
frames: decision-boundary **11 frames / 4.35 s**, optimizer-comparison **five /
4.90 s**, attention-visualization **six / 5.69 s**. GIFs predate the version-label
bump; their v0.2.0 footer is intentionally retained rather than edited.
Recording parameters and semantics are in `DEMO_RECORDING.md`.

## Publishing / deployment state and remaining owner actions

- Original repository still has **no remote**. Local content is ready for target
  selection; no repository creation, push, tag, or Release was performed.
- Owner must choose/create the intended GitHub repository, confirm its URL,
  push main, and inspect remote CI. Then finalize date/status and intentionally
  publish a tag/Release using `GITHUB_PUBLISHING.md`.
- Native Render/Railway Python deployment is documented using official sources;
  no hosting account/service was created and no cloud deployment is claimed.
  Owner must choose a platform/plan, verify the real deployed URL, then add it
  to README. No Dockerfile: Docker command is unavailable, so build/run was
  not possible. Included GIFs do not need manual recording.
- All edited/created project files are inside `E:\NeuroScope`; WeatherSeg was
  not read or modified. Temporary recording receivers stopped after use.

## Known limits / freeze

BatchNorm: 2D current batch with scalar γ/β, no running statistics. Residual:
controlled fixed-objective gradient experiment. Attention: untrained projections,
no tokenizer/positions/causal mask. No complete Transformer or production model
training. Sessions are in-memory/shared and lost on restart; one worker required.
Legacy API validation/resource limits and session cleanup need review before a
broad unattended public demo. Language changes can reset controls. Dependency
minimum ranges remain unpinned; future dependency upgrades must pass validation.

v0.3.x is frozen to polish, bugs, accessibility, performance, docs, tests and
learning UX. v0.4 knowledge expansion is undecided. No phase/module is left
partially implemented; account-dependent publication and deployment are deferred
owner actions, with explicit instructions.
