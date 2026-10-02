# Deployment readiness

The current single FastAPI service serves both the static SPA and numerical API.
No architecture change, database, Kubernetes, or microservice split is needed.
A static-only host such as GitHub Pages cannot execute these APIs.

## Two suitable options

Official documentation checked on 2026-10-02. Platform prices/limits can change;
review the linked pages before creating a service or paying.

| Option | Fit | Cost / operating tradeoff |
|---|---|---|
| **Render Python Web Service** | Simple Git-backed native Python deployment | Free web service option; sleeps after 15 minutes idle and can take about a minute to wake. Restart/sleep loses in-memory sessions. |
| **Railway Python service** | Native Git deployment with configurable start/health checks | Hobby base subscription is $5/month, including $5 usage; excess resource usage costs more. This is an optional paid alternative, not a free hosting promise. |

Sources: [Render FastAPI deployment](https://render.com/docs/deploy-fastapi),
[Render free-service limits](https://render.com/docs/free),
[Railway FastAPI guide](https://docs.railway.com/guides/fastapi),
[Railway pricing](https://docs.railway.com/pricing/plans).

## Shared settings

- Repository root: this project root (contains `requirements.txt` and `app/`).
- Build: `python -m pip install -r requirements.txt`.
- Select a platform-supported released **Python 3.13.x** patch; the local
  verification environment uses 3.13.14. See [Render version settings](https://render.com/docs/python-version)
  or the corresponding Railway build settings. Do not rely on a platform default
  that may select an untested Python minor version.
- Start (platform Linux shell expands `$PORT`):

```sh
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --limit-concurrency 16
```

- Health check: `/api/health`.
- One instance, one worker. Session dictionaries are process-local; multiple
  workers/replicas can send a session request to a process that does not have it.
- Let the platform supply PORT and HTTPS. Do not deploy as a Static Site.
- No extra database, persistent volume or frontend build is required.

### Render

Create a Python Web Service from the confirmed repository, set the build/start
commands above and the Python version, choose the desired instance plan, and
set the health path. Review free limits and wake behavior before choosing Free.

### Railway

Deploy the confirmed GitHub repository as a Python service, inspect the generated
build, set the explicit start command above and health path, and generate the
public domain in its networking settings. Review spending settings before enabling
it. Use one replica and one worker.

## Readiness and practical limits

The native startup, static files, and real API requests are checked locally with
`python tests/validate_live.py`. No cloud service was provisioned or tested in
this environment, so this is **deployment preparation**, not a deployed Live Demo.

This application is an educational demo, with shared in-memory teaching sessions,
no authentication/ownership enforcement, no session eviction, and no durable state.
Legacy APIs are not uniformly resource-bounded. The concurrency option bounds
simultaneous connections but does not cap stored sessions or validate large inputs.
For a broadly accessible unattended demo, review API input/resource limits and
session cleanup first; begin with a small supervised audience. Restarts clear state.
Do not claim production multi-user training or store private datasets in this demo.

## Docker decision

Docker is not installed/available in the current environment (`docker` command
not found), and native Python hosting supports the existing service directly.
No Dockerfile is included because docker build/run could not be verified and
would add an unnecessary step for these options. If container deployment later
becomes necessary, add it as a focused change with actual build and run checks.

## Verify after deployment

Check the real URL before adding it to README: `/api/health`, Home, Start Learning,
Playground Build/Start/Pause/Reset, Backprop, CNN padding animation, Residual,
Attention/MHA query controls, three languages and refresh persistence. Check
console and network failures and narrow screens. Expect old session IDs to fail
after a restart; build a new session rather than treating this as durable storage.
