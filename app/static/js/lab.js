// Shared P2 rendering primitives; numbers arrive from the NumPy API.
import { t, errText } from './i18n.js';
export const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fmt = v => Math.abs(v) > 1e4 || (v !== 0 && Math.abs(v) < 1e-4) ? v.toExponential(4) : (+v.toFixed(6)).toString();
export function table(m, highlight = () => false) {
  return `<div class="lab-scroll"><table class="matrix-table">${m.map((r,i)=>`<tr>${r.map((v,j)=>`<td class="${highlight(i,j)?'hl':''}">${fmt(v)}</td>`).join('')}</tr>`).join('')}</table></div>`;
}
export function numberField(id, key, value, min, max, step=1) {
  return `<div class="field"><label for="${id}">${t(key)}</label><input type="number" id="${id}" value="${value}" min="${min}" max="${max}" step="${step}" style="width:100px"></div>`;
}
export function error(el, err) { el.textContent = err ? errText(err) : ''; el.className = err ? 'error-box' : ''; }
export function invalidJson(el) { error(el, new Error(t('p2.err.json'))); }

