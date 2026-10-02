# Contributing to NeuroScope

NeuroScope is a learning tool. Favor readable calculations and useful experiments.

## Feature freeze

v0.3.x accepts bug fixes, learning UX, accessibility, documentation, tests,
and performance improvements. No new deep learning labs are planned for this
series. The scope of v0.4 is undecided; discuss scope before implementing more models.

## Design rules

- Keep the mathematical engine in `neuroscope/`, NumPy-only and independent of UI code.
- Keep JSON API adapters in `app/api/` and presentation in `app/static/`.
- Use the existing `i18n.js` and both locale dictionaries for every new UI label.
  Do not add page-level language conditionals. Formulas, shapes and API names stay invariant.
- Any backward-pass change needs a numerical gradient check; fix regressions with focused tests.
- All displayed results, screenshots, and demos must come from real computations.
- Preserve Git history and use focused commits. Fix pre-existing bugs separately.

## Development setup

Follow the [README](README.md) Quick Start. The runtime is Python 3.11–3.13;
Node 24 runs validation and is not a browser/runtime dependency. There is no
frontend build or package installation.

```sh
python -m pytest -q
node tests/validate_frontend.mjs
node tests/validate_docs.mjs
python tests/validate_live.py
```

The last command launches its own server on an available loopback port, checks
static files and real API responses, and shuts it down. For an existing server
on port 8000 use `python tests/live_smoke.py` instead. GitHub Actions runs the
same checks on Linux (Python 3.11/3.12/3.13) and Windows (3.13). A configured
workflow is not evidence of a successful remote run.

## Review checklist

- Run all four validation commands above.
- Open changed UI in a real browser in Chinese, bilingual and English; check
  refresh persistence, links, keyboard access, narrow layout, and console errors.
- Keep both locale keys and interpolation parameters aligned.
- Update CHANGELOG under Unreleased; document limitations honestly.
- Record parameters for any changed screenshots or GIFs.
- Do not commit venv, caches, logs, `.env`, IDE settings, or recording scratch.

[Release preparation validation](docs/RELEASE_VALIDATION_v0.3.0.md) records local
results; [publishing instructions](docs/GITHUB_PUBLISHING.md) describe the owner steps.
