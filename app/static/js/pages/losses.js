import { api } from '../api.js';
import { lineChart } from '../plot.js';
import { t } from '../i18n.js';

export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>${t('losses.loss')}</label>
          <select id="l-name">
            <option value="mse">${t('losses.options.mse')}</option>
            <option value="bce">${t('losses.options.bce')}</option>
            <option value="cross_entropy">${t('losses.options.cross_entropy')}</option>
          </select></div>
        <div class="field"><label>${t('losses.prediction')}<span id="l-pv">0.70</span></label>
          <input type="range" id="l-p" min="0.01" max="0.99" step="0.01" value="0.7" style="width:240px"/></div>
        <div class="field"><label>${t('losses.target')}</label>
          <select id="l-t"><option value="1">${t('losses.targetPos')}</option>
            <option value="0">${t('losses.targetNeg')}</option></select></div>
        <div class="field"><span class="metric-label">${t('losses.lossValue')}</span><span class="metric" id="l-loss">–</span></div>
        <div class="field"><span class="metric-label">${t('losses.gradValue')}</span><span class="metric" id="l-grad">–</span></div>
      </div>
      <p class="hint" style="margin-top:8px" id="l-note"></p>
    </div>
    <div class="panel"><h3>${t('losses.chartTitle')}</h3>
      <canvas id="l-canvas" class="plot"></canvas></div>`;

  const $ = id => root.querySelector(id);

  async function update() {
    const name = $('#l-name').value;
    // The three-class example fixes class 0; a binary target selector does not apply.
    $('#l-t').disabled = name === 'cross_entropy';
    $('#l-note').textContent = t(`losses.notes.${name}`);
    const prediction = parseFloat($('#l-p').value);
    $('#l-pv').textContent = prediction.toFixed(2);
    const r = await api('/losses/eval', {
      name, prediction, target: parseFloat($('#l-t').value),
    });
    $('#l-loss').textContent = r.loss.toFixed(4);
    $('#l-grad').textContent = r.grad.toFixed(4);
    let best = 0, bd = 1e9;
    r.curve_x.forEach((v, i) => { const d = Math.abs(v - prediction); if (d < bd) { bd = d; best = i; } });
    lineChart($('#l-canvas'), [
      { x: r.curve_x, y: r.curve_y, label: 'loss(p)', color: '#a371f7', marker: best },
    ], { height: 320, xMin: 0, xMax: 1 });
  }
  ['#l-name', '#l-p', '#l-t'].forEach(id => { $(id).oninput = update; });
  await update();
}
