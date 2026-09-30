import { api } from '../api.js';
import { lineChart } from '../plot.js';

export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>Loss</label>
          <select id="l-name"><option value="mse">MSE</option>
            <option value="bce">Binary Cross Entropy</option>
            <option value="cross_entropy">Cross Entropy (3-class)</option></select></div>
        <div class="field"><label>Prediction p = <span id="l-pv">0.70</span></label>
          <input type="range" id="l-p" min="0.01" max="0.99" step="0.01" value="0.7" style="width:240px"/></div>
        <div class="field"><label>Target y</label>
          <select id="l-t"><option value="1">1 (positive)</option><option value="0">0 (negative)</option></select></div>
        <div class="field"><span class="metric-label">loss</span><span class="metric" id="l-loss">–</span></div>
        <div class="field"><span class="metric-label">∂loss/∂p</span><span class="metric" id="l-grad">–</span></div>
      </div>
      <p class="hint" style="margin-top:8px" id="l-note"></p>
    </div>
    <div class="panel"><h3>Loss as a function of the prediction</h3>
      <canvas id="l-canvas" class="plot"></canvas></div>`;

  const $ = id => root.querySelector(id);
  const NOTES = {
    mse: 'MSE = mean((p − y)²). Gradient grows linearly with the error.',
    bce: 'BCE = −[y·log p + (1−y)·log(1−p)]. Confident wrong predictions are punished harshly.',
    cross_entropy: '3-class CE with logits [4p−2, 0, 0], true class 0. The x-axis acts as the model\'s confidence.',
  };

  async function update() {
    const name = $('#l-name').value;
    $('#l-note').textContent = NOTES[name];
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
