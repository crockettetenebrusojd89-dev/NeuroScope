# Real demo recordings and reproduction

## Provenance

Recorded on 2026-10-02 from the running FastAPI app in a real browser, English
mode, configured viewport **1440 × 1100**. Source captures were untouched JPEG
viewport screenshots. GIF encoding used only proportional downsampling to
1024 pixels wide, GIF palette conversion, and deduplication of repeated frames.
No values, plots, or controls were fabricated. Frame delays derive from actual
capture times; the final frame holds for 1.2 seconds before looping.
Scrollbar/client-area capture dimensions can differ slightly by page. GIFs were
recorded before the release version-label bump, so their footer reads v0.2.0;
the final screenshot set was refreshed with the prepared v0.3.0 label.

| File | Actual recording | Encoded duration / frames |
|---|---|---|
| `demos/decision-boundary.gif` | Continuous live training, epoch 1 → 51; 26 captures, duplicates merged | 4.35 s / 11 |
| `demos/optimizer-comparison.gif` | Actual Compare all 4 calculations at 5, 10, 20, 40, 60 steps | 4.90 s / 5 |
| `demos/attention-visualization.gif` | Query selection and seed change, actual matrices/weights | 5.69 s / 6 |

The optimizer page has no native path playback. Its recording deliberately
shows the steps control changing between separate real API calculations. The
attention model is untrained; query selection highlights an existing row,
whereas changing the seed recomputes projections and weights. These are small
teaching demonstrations, not performance or accuracy claims.

## Manual reproduction / longer recordings

Run the local app, choose English from the sidebar, and use a 1440 × 1100
browser viewport. Capture only the app window with your preferred screen
recorder; do not edit numerical readouts. Keep complete controls visible.

### Decision boundary — recommended 10–15 seconds

1. Open `/#playground`. Choose moons, 400 samples, noise 0.12, test split 0.25.
2. Keep hidden layers `[8,8]`, tanh, Xavier, Adam, lr 0.03, momentum 0.9,
   β1 0.9, β2 0.999.
3. Click Build network. Start capture after the first epoch appears.
4. Click Start, record the changing boundary and loss, then click Pause.
5. End after showing the actual epoch, losses, and accuracies. Do not replace
   the run's values with a better result. Optionally record Resume and Reset.

### Optimizers — recommended 8–12 seconds

1. Open `/#optimizers`, keep Elongated bowl and the default start `[-2.2,1.8]`.
2. Use lr 0.05, momentum 0.9, β1 0.9, β2 0.999.
3. Set steps to 5, click Compare all 4; repeat with 10, 20, 40, 60.
4. Allow each real result to render. Keep the changing steps field and both
   plots visible. Describe it as repeated comparison runs, not native animation.

### Attention — recommended 8–12 seconds

1. Open `/#attention`; token labels `I study attention`.
2. Use `X=[[1,0,0,1],[0,1,0,1],[0,0,1,1]]`, d_k=d_v=2, seed=0, click Compute.
3. Select queries 0, 1, 2, then 0. Pause briefly on each highlighted row.
4. Change seed to 1 and Compute, then select query 2.
5. Keep the controls, Q/K/V, raw/scaled scores and actual attention heatmap
   visible. Scroll to show weighted contributions for a longer recording.

## Screenshots

Six primary English screenshots: home, Playground, Backprop, CNN, Attention,
Multi-Head Attention. `home-zh.jpg` supplements them. Earlier Chinese/bilingual
screenshots are retained as historical assets. Numeric tokens were relabeled
in English using the real input control, without changing the input embeddings.
CNN uses edge_vertical, stride 1, padding 0; attention/MHA use the default
numeric embeddings, seed 0, d_k=2 / heads=2. Backprop is a real computed session
snapshot; its exact values can vary with the current Playground session.
