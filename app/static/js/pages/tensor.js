import { api } from '../api.js';
import { t, errText, fmtShape } from '../i18n.js';

const OPS = ['reshape', 'transpose', 'matmul', 'broadcast_add', 'reduce_sum'];
// which ops need a second tensor / a text parameter
const NEEDS_B = { matmul: true, broadcast_add: true };

export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <h3>${t('tensor.inputTensor')}</h3>
      <div class="controls">
        <div class="field"><label>${t('tensor.valuesJson')}</label>
          <textarea id="t-values" rows="3" cols="34">[[1,2,3],[4,5,6]]</textarea></div>
        <div class="field"><label>${t('tensor.operation')}</label>
          <select id="t-op">${OPS.map(o => `<option>${o}</option>`).join('')}</select></div>
        <div class="field"><label id="t-param-label">${t('tensor.parameter')}</label>
          <input type="text" id="t-param" value="3,2" size="22"/></div>
        <button id="t-random" class="secondary">${t('tensor.random')}</button>
        <button id="t-run">${t('tensor.apply')}</button>
      </div>
      <p class="hint" id="t-hint" style="margin-top:10px"></p>
    </div>
    <div class="grid-2">
      <div class="panel"><h3>${t('tensor.before')} <span class="shape-badge" id="t-in-shape"></span></h3><div id="t-in"></div></div>
      <div class="panel"><h3>${t('tensor.after')} <span class="shape-badge" id="t-out-shape"></span></h3><div id="t-out"></div></div>
    </div>
    <div class="panel"><h3>${t('tensor.whatHappened')}</h3><p class="hint" id="t-explain"></p></div>
    <div id="t-error"></div>`;

  const $ = id => root.querySelector(id);
  const opSel = $('#t-op');
  const setHint = () => { $('#t-hint').textContent = t(`tensor.hints.${opSel.value}`); };
  opSel.onchange = setHint;
  setHint();

  $('#t-random').onclick = async () => {
    const r = await api('/tensor/random', { shape: [2, 3] });
    $('#t-values').value = JSON.stringify(r.values);
  };
  $('#t-run').onclick = run;
  await run();

  async function run() {
    $('#t-error').innerHTML = '';
    let values;
    try { values = JSON.parse($('#t-values').value); }
    catch { $('#t-error').innerHTML = `<div class="error-box">${t('tensor.invalidJson')}</div>`; return; }
    const op = opSel.value;
    const raw = $('#t-param').value.trim();
    const params = {};
    try {
      if (op === 'reshape') params.shape = raw.split(',').map(Number);
      if (op === 'transpose' && raw) params.axes = raw.split(',').map(Number);
      if (op === 'reduce_sum' && raw) params.axis = raw;
      if (NEEDS_B[op]) params.b = JSON.parse(raw);
      const r = await api('/tensor/op', { op, values, params });
      $('#t-in-shape').textContent = `(${r.input_shape.join(' × ')})`;
      $('#t-out-shape').textContent = `(${r.output_shape.join(' × ')})`;
      $('#t-in').innerHTML = matrixTable(values);
      $('#t-out').innerHTML = matrixTable(r.output);
      $('#t-explain').textContent = explainText(r.explanation);
    } catch (err) {
      $('#t-error').innerHTML = `<div class="error-box">${errText(err)}</div>`;
    }
  }
}

// Render the structured explanation returned by the engine in the current language.
function explainText(ex) {
  const p = { ...ex.params };
  for (const k of ['in', 'out', 'a', 'b']) {
    if (Array.isArray(p[k])) p[k] = fmtShape(p[k]);
  }
  if (Array.isArray(p.shape)) p.shape = fmtShape(p.shape);
  return t(ex.key, p);
}

function matrixTable(m) {
  if (!Array.isArray(m)) return `<div class="metric">${m}</div>`;
  if (!Array.isArray(m[0])) m = [m];
  return `<table class="matrix-table">${m.map(row =>
    `<tr>${row.map(v => `<td>${(+v).toFixed ? (+v).toFixed(2) : v}</td>`).join('')}</tr>`).join('')}</table>`;
}
