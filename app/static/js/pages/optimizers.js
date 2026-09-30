import { api } from '../api.js';
import { contourPlot, lineChart } from '../plot.js';
import { t, errText } from '../i18n.js';

const OPT_COLORS = { sgd: '#4f8ff7', momentum: '#f7a24f', rmsprop: '#3fb96f', adam: '#a371f7' };

export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>${t('optimizers.landscape')}</label>
          <select id="o-fn"><option value="quadratic">${t('optimizers.fn.quadratic')}</option>
            <option value="rosenbrock">${t('optimizers.fn.rosenbrock')}</option>
            <option value="saddle">${t('optimizers.fn.saddle')}</option></select></div>
        <div class="field"><label>${t('optimizers.optimizer')}</label>
          <select id="o-opt"><option>sgd</option><option>momentum</option><option>rmsprop</option><option>adam</option></select></div>
        <div class="field"><label>lr</label><input type="number" id="o-lr" value="0.1" step="0.01" style="width:70px"/></div>
        <div class="field"><label>momentum</label><input type="number" id="o-mom" value="0.9" step="0.05" style="width:70px"/></div>
        <div class="field"><label>β1</label><input type="number" id="o-b1" value="0.9" step="0.01" style="width:70px"/></div>
        <div class="field"><label>β2</label><input type="number" id="o-b2" value="0.999" step="0.001" style="width:80px"/></div>
        <div class="field"><label>${t('optimizers.steps')}</label><input type="number" id="o-steps" value="60" min="5" max="500" style="width:70px"/></div>
        <button id="o-run">${t('optimizers.run')}</button>
        <button id="o-compare" class="secondary">${t('optimizers.compareAll')}</button>
      </div>
    </div>
    <div class="grid-2">
      <div class="panel"><h3>${t('optimizers.mapTitle')}</h3><canvas id="o-map" class="plot"></canvas></div>
      <div class="panel"><h3>${t('optimizers.lossTitle')}</h3><canvas id="o-loss" class="plot"></canvas>
        <p class="hint" style="margin-top:8px">${t('optimizers.clickHint')}</p></div>
    </div>
    <div id="o-error"></div>`;

  const $ = id => root.querySelector(id);
  let start = [-2.2, 1.8];
  let lastResult = null;

  function basePayload() {
    return {
      function: $('#o-fn').value, steps: +$('#o-steps').value, start,
      lr: +$('#o-lr').value, momentum: +$('#o-mom').value,
      beta1: +$('#o-b1').value, beta2: +$('#o-b2').value,
    };
  }

  async function runOne(name) {
    return api('/optimizers/path', { ...basePayload(), optimizer: name });
  }

  async function run(compareAll) {
    $('#o-error').innerHTML = '';
    try {
      const names = compareAll ? ['sgd', 'momentum', 'rmsprop', 'adam'] : [$('#o-opt').value];
      const results = [];
      for (const n of names) results.push([n, await runOne(n)]);
      lastResult = results[0][1];
      const paths = results.map(([n, r]) => ({
        points: r.path, color: OPT_COLORS[n], label: n,
      }));
      contourPlot($('#o-map'), lastResult.grid, lastResult.extent, paths, { height: 380 });
      lineChart($('#o-loss'), results.map(([n, r]) => ({
        x: r.losses.map((_, i) => i + 1), y: r.losses.map(v => Math.max(v, 1e-12)),
        label: n, color: OPT_COLORS[n],
      })), { height: 280 });
    } catch (err) {
      $('#o-error').innerHTML = `<div class="error-box">${errText(err)}</div>`;
    }
  }

  $('#o-map').addEventListener('click', e => {
    if (!lastResult) return;
    const rect = e.target.getBoundingClientRect();
    const [x0, x1, y0, y1] = lastResult.extent;
    start = [
      x0 + (e.clientX - rect.left) / rect.width * (x1 - x0),
      y1 - (e.clientY - rect.top) / rect.height * (y1 - y0),
    ];
    run(false);
  });

  $('#o-run').onclick = () => run(false);
  $('#o-compare').onclick = () => run(true);
  await run(false);
}
