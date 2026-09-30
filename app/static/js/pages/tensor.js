import { api } from '../api.js';

const OPS = {
  reshape:        { b: false, hint: 'New shape (comma separated, e.g. 3,2). Element count must match.' },
  transpose:      { b: false, hint: 'Axis order (comma separated, e.g. 1,0). Leave empty to reverse.' },
  matmul:         { b: true,  hint: 'Matrix B as rows, e.g. [[5,6],[7,8]]. Inner dims must match.' },
  broadcast_add:  { b: true,  hint: 'Tensor B, e.g. [[10,20,30]]. Watch B stretch across rows.' },
  reduce_sum:     { b: false, hint: 'Axis to sum over (0, 1, ...). Empty = sum everything.' },
};

let current = { values: [[1, 2, 3], [4, 5, 6]], op: 'reshape' };

export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <h3>Input tensor</h3>
      <div class="controls">
        <div class="field"><label>Values (JSON)</label>
          <textarea id="t-values" rows="3" cols="34">[[1,2,3],[4,5,6]]</textarea></div>
        <div class="field"><label>Operation</label>
          <select id="t-op">${Object.keys(OPS).map(o => `<option>${o}</option>`).join('')}</select></div>
        <div class="field"><label id="t-param-label">Parameter</label>
          <input type="text" id="t-param" value="3,2" size="22"/></div>
        <button id="t-random" class="secondary">Random 2×3</button>
        <button id="t-run">Apply</button>
      </div>
      <p class="hint" id="t-hint" style="margin-top:10px">${OPS.reshape.hint}</p>
    </div>
    <div class="grid-2">
      <div class="panel"><h3>Before <span class="shape-badge" id="t-in-shape"></span></h3><div id="t-in"></div></div>
      <div class="panel"><h3>After <span class="shape-badge" id="t-out-shape"></span></h3><div id="t-out"></div></div>
    </div>
    <div class="panel"><h3>What just happened?</h3><p class="hint" id="t-explain"></p></div>
    <div id="t-error"></div>`;

  const $ = id => root.querySelector(id);
  const opSel = $('#t-op');
  opSel.onchange = () => { $('#t-hint').textContent = OPS[opSel.value].hint; };

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
    catch { $('#t-error').innerHTML = '<div class="error-box">Invalid JSON for tensor values.</div>'; return; }
    const op = opSel.value;
    const raw = $('#t-param').value.trim();
    const params = {};
    try {
      if (op === 'reshape') params.shape = raw.split(',').map(Number);
      if (op === 'transpose' && raw) params.axes = raw.split(',').map(Number);
      if (op === 'reduce_sum' && raw) params.axis = raw;
      if (op === 'matmul' || op === 'broadcast_add') params.b = JSON.parse(raw);
      const r = await api('/tensor/op', { op, values, params });
      $('#t-in-shape').textContent = `(${r.input_shape.join(' × ')})`;
      $('#t-out-shape').textContent = `(${r.output_shape.join(' × ')})`;
      $('#t-in').innerHTML = matrixTable(values);
      $('#t-out').innerHTML = matrixTable(r.output);
      $('#t-explain').textContent = r.explanation;
    } catch (err) {
      $('#t-error').innerHTML = `<div class="error-box">${err.message}</div>`;
    }
  }
}

function matrixTable(m) {
  if (!Array.isArray(m)) return `<div class="metric">${m}</div>`;
  if (!Array.isArray(m[0])) m = [m];
  return `<table class="matrix-table">${m.map(row =>
    `<tr>${row.map(v => `<td>${(+v).toFixed ? (+v).toFixed(2) : v}</td>`).join('')}</tr>`).join('')}</table>`;
}
