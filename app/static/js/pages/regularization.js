import { api } from '../api.js';
import { lineChart, boundaryPlot } from '../plot.js';

const KINDS = ['none', 'l1', 'l2', 'dropout'];
const COLORS = { none: '#8b93a3', l1: '#f7a24f', l2: '#4f8ff7', dropout: '#3fb96f' };

export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>Epochs</label>
          <input type="number" id="r-epochs" value="300" min="20" max="1500" style="width:80px"/></div>
        <button id="r-run">Run comparison</button>
        <span class="hint">An over-parameterized ReLU MLP (24-24-24) on very noisy moons — perfect overfitting conditions. Takes a few seconds.</span>
      </div>
      <div id="r-error"></div>
    </div>
    <div class="panel"><h3>Accuracy (solid = train, dashed view below)</h3>
      <canvas id="r-train" class="plot"></canvas>
      <h3 style="margin-top:14px">Validation accuracy</h3>
      <canvas id="r-val" class="plot"></canvas></div>
    <div class="grid-4" id="r-bounds"></div>`;

  const $ = id => root.querySelector(id);

  $('#r-run').onclick = async () => {
    $('#r-error').innerHTML = '';
    $('#r-run').disabled = true;
    try {
      const r = await api('/regularization', { epochs: +$('#r-epochs').value });
      const res = r.results;
      const xs = res.none.history.train_acc.map((_, i) => i);
      lineChart($('#r-train'), KINDS.map(k => ({
        x: xs, y: res[k].history.train_acc, label: k, color: COLORS[k],
      })), { height: 220, yMin: 0.4, yMax: 1 });
      lineChart($('#r-val'), KINDS.map(k => ({
        x: xs, y: res[k].history.val_acc, label: k, color: COLORS[k],
      })), { height: 220, yMin: 0.4, yMax: 1 });

      const bounds = $('#r-bounds');
      bounds.innerHTML = '';
      KINDS.forEach(k => {
        const card = document.createElement('div');
        card.className = 'panel';
        card.innerHTML = `<h3 style="color:${COLORS[k]}">${k.toUpperCase()}</h3>
          <canvas class="plot" id="r-b-${k}"></canvas>
          <p class="hint" style="margin-top:8px">train ${(res[k].final_train_acc * 100).toFixed(1)}% ·
            val ${(res[k].final_val_acc * 100).toFixed(1)}%</p>`;
        bounds.appendChild(card);
        boundaryPlot(card.querySelector(`#r-b-${k}`), res[k].boundary, r.extent,
          r.data.X, r.data.y, { height: 220 });
      });
    } catch (err) {
      $('#r-error').innerHTML = `<div class="error-box">${err.message}</div>`;
    } finally {
      $('#r-run').disabled = false;
    }
  };
}
