// Thin fetch wrapper for the NeuroScope JSON API.
export async function api(path, payload = {}) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data = null;
  try { data = await res.json(); } catch (_) { /* non-JSON error body */ }
  if (!res.ok) {
    const detail = data && data.detail;
    // structured details ({i18n, params}) are localized by i18n.errText()
    const err = new Error(typeof detail === 'string' ? detail : `HTTP ${res.status}`);
    if (detail && typeof detail === 'object') err.i18n = detail;
    throw err;
  }
  return data;
}

// Shared client-side state (playground session id is reused across pages).
export const NS = {
  sessionId: null,
  playgroundConfig: null,
};
