import { api } from '../api.js';
import { lineChart } from '../plot.js';
import { t } from '../i18n.js';

export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>${t('activations.activation')}</label>
          <select id="a-name">
            <option>relu</option><option>sigmoid</option><option>tanh</option>
            <option>leaky_relu</option><option>gelu</option><option>softmax</option>
          </select></div>
        <div class="field"><label>${t('activations.inputX')}<span id="a-xv">1.00</span></label>
          <input type="range" id="a-x" min="-5" max="5" step="0.05" value="1" style="width:260px"/></div>
        <div class="field"><span class="metric-label">${t('activations.outputY')}</span><span class="metric" id="a-y">–</span></div>
        <div class="field"><span class="metric-label">${t('activations.gradient')}</span><span class="metric" id="a-dy">–</span></div>
      </div>
    </div>
    <div class="panel"><h3>${t('activations.chartTitle')}</h3><canvas id="a-canvas" class="plot"></canvas>
      <p class="hint" style="margin-top:8px">${t('activations.note')}</p></div>`;

  const $ = id => root.querySelector(id);
  let curve = null, markerIdx = 0;

  async function load() {
    curve = await api('/activations/curve', { name: $('#a-name').value });
    draw();
    await updateEval();
  }
  function draw() {
    if (!curve) return;
    lineChart($('#a-canvas'), [
      { x: curve.x, y: curve.y, label: 'f(x)', color: '#4f8ff7', marker: markerIdx },
      { x: curve.x, y: curve.dy, label: "f′(x)", color: '#f7a24f' },
    ], { height: 340 });
  }
  async function updateEval() {
    const x = parseFloat($('#a-x').value);
    $('#a-xv').textContent = x.toFixed(2);
    const r = await api('/activations/eval', { name: $('#a-name').value, x });
    $('#a-y').textContent = r.y.toFixed(4);
    $('#a-dy').textContent = r.dy.toFixed(4);
    if (curve) {
      let best = 0, bd = 1e9;
      curve.x.forEach((v, i) => { const d = Math.abs(v - x); if (d < bd) { bd = d; best = i; } });
      markerIdx = best;
      draw();
    }
  }
  $('#a-name').onchange = load;
  $('#a-x').oninput = updateEval;
  await load();
}
