// Thin fetch wrapper for the NeuroScope JSON API.
export async function api(path, payload = {}) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { detail = (await res.json()).detail || detail; } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}

// Shared client-side state (playground session id is reused across pages).
export const NS = {
  sessionId: null,
  playgroundConfig: null,
};
