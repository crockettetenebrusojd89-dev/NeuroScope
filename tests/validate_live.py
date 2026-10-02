"""Start an isolated local server, run real HTTP checks, and always stop it.
Run from the repository root: python tests/validate_live.py
Standard library only; useful in CI without shell-specific background jobs.
"""
from pathlib import Path
import json
import os
import socket
import subprocess
import sys
import time
import urllib.request

# Direct script execution puts tests/ on sys.path.
import live_smoke


def main():
    root = Path(__file__).resolve().parents[1]
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    base = f"http://127.0.0.1:{port}"
    env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
    process = subprocess.Popen(
        [sys.executable, "-B", "-m", "uvicorn", "app.main:app", "--host",
         "127.0.0.1", "--port", str(port), "--workers", "1", "--no-access-log"],
        cwd=root, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True,
    )
    succeeded = False
    try:
        deadline = time.monotonic() + 20
        while time.monotonic() < deadline:
            if process.poll() is not None:
                raise RuntimeError("Local server exited during startup")
            try:
                with urllib.request.urlopen(base + "/api/health", timeout=0.5) as r:
                    if json.load(r) == {"status": "ok"}:
                        break
            except (OSError, ValueError):
                time.sleep(0.1)
        else:
            raise RuntimeError("Local server did not become ready within 20 seconds")
        live_smoke.BASE = base
        live_smoke.count = 0
        live_smoke.main()
        succeeded = True
    finally:
        process.terminate()
        try:
            output, _ = process.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            output, _ = process.communicate()
        if not succeeded:
            print(output, file=sys.stderr)
    print("Isolated app startup and shutdown passed")


if __name__ == "__main__":
    main()
