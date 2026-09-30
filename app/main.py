"""NeuroScope FastAPI entry point.

Serves the static single-page UI and the JSON API under /api.
Run:  uvicorn app.main:app --host 127.0.0.1 --port 8000
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router

STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(title="NeuroScope", version="0.1.0")
app.include_router(router)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
def health():
    return {"status": "ok"}
