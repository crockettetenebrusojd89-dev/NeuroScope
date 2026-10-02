"""NeuroScope FastAPI entry point.

Serves the static single-page UI and the JSON API under /api.
Run:  uvicorn app.main:app --host 127.0.0.1 --port 8000
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.api.p2 import router as p2_router

STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(title="NeuroScope", version="0.2.0")
app.include_router(router)
app.include_router(p2_router)


@app.middleware("http")
async def no_cache_static(request, call_next):
    """Static assets must revalidate so UI updates reach browsers at once."""
    response = await call_next(request)
    if request.url.path.startswith("/static") or request.url.path == "/":
        response.headers["Cache-Control"] = "no-cache"
    return response


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
def health():
    return {"status": "ok"}
