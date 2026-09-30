# Contributing to NeuroScope

Thanks for your interest! NeuroScope is a learning tool — clarity beats
cleverness in every contribution.

## Ground rules

1. **Core math stays in `neuroscope/` and stays NumPy-only.** No deep-learning
   frameworks in the engine — the point is readable forward/backward code.
2. **UI stays in `app/`.** The frontend talks to the engine only through the
   JSON API in `app/api/routes.py`.
3. **Every new backward pass needs a numerical gradient check** in `tests/`.
4. **Don't fabricate results.** Screenshots, metrics and examples must come
   from real runs.
5. Keep modules small and focused; avoid single files that do everything.

## Development setup

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
pytest -q
uvicorn app.main:app --reload
```

## Pull request checklist

- [ ] `pytest -q` passes locally
- [ ] New math has docstrings with the formulas
- [ ] New backward pass has a numerical gradient check
- [ ] UI changes were opened in a real browser
- [ ] CHANGELOG.md updated under "Unreleased"

## Proposing new labs

Open an issue first with: the concept being taught, the interaction the
learner performs, and what is visualized. Labs exist to build intuition —
if a proposed lab is mostly decoration, it will be rejected.
