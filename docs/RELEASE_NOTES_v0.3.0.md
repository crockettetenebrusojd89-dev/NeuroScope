# NeuroScope v0.3.0

Release notes for the v0.3.0 publication.

## Highlights

- 18 interactive learning labs covering P0/P1/P2 fundamentals, training, CNNs,
  residual connections, normalization, self-attention and multi-head attention.
- Chinese, bilingual page titles, and English UI, with persistent language selection.
- Learning Path home: a complete concept sequence and three recommended routes
  through existing labs. Mobile navigation keeps the first learning action visible.
- Plain NumPy educational engine, FastAPI JSON layer, vanilla JavaScript SPA.
- Real numerical visualizations, six primary English screenshots, a Chinese home
  screenshot, and three authentic browser-frame GIF recordings.
- CS231n topic companions and official reading links, without copied course material.
- Broader local/CI validation: JS/i18n and rendered regressions, documentation assets,
  isolated app startup, static files, and real API smoke checks.

## Bug fixes

Since v0.2.0:

- Isolate SPA mounts and stop stale graph/training activity after navigation.
- Correct the CE slider chain rule (`dL/dp = 4*dL/dz0`).
- Contain wide lab matrices within their panels.
- Match CNN animation windows/products to the actual zero-padded input;
  stop its timer when leaving the page.
- Refresh plotted dataset points when rebuilding Playground after a configuration change.
- Show backward flow in the correct order: Loss → final layer → first layer → Input.
- Use the current command errorlevel for the Windows py/python fallback.

The earlier v0.2.0 release corrected Playground session-key handling,
scalar ReLU derivatives and null pooling stride. See [CHANGELOG](../CHANGELOG.md)
for historical separation.

## Known limitations

- BatchNorm mainly teaches **2D batches** `X[N,D]`, current-batch population statistics
  and scalar γ/β; there are no running statistics or train/eval modes.
- Residual Lab is a **controlled gradient experiment**, not trained ResNet or accuracy evidence.
- Attention projections are **untrained**. Supplied numeric embeddings determine results;
  token text is a row label. No tokenizer, position encoding or causal mask.
- No complete Transformer and no production-grade model training.
- In-memory sessions are lost on restart; one worker/instance is required.
  Session state is not isolated by user accounts and is not durable.
- Original APIs have more limited validation than P2. Numerical safeguards in some
  legacy routes sanitize nonfinite results; P2 rejects them explicitly.
- Language switching may reset page controls. There is no saved learning progress.
- Hosting configuration is documented; no cloud deployment is provided.

## Installation

Python 3.11–3.13 and a modern browser. From the extracted/cloned source folder:

```sh
python -m venv venv
# Activate venv using the platform-specific command in README.
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1
```

Open http://127.0.0.1:8000/. Windows users may use `start.bat` instead.
[Quick Start](../README.md#quick-start) · [Publishing](GITHUB_PUBLISHING.md)
· [Validation](RELEASE_VALIDATION_v0.3.0.md)

## Next maintenance series

v0.3.x is in feature freeze: bugs, polish, accessibility, performance,
documentation and learning UX. Future v0.4 module additions are undecided.
