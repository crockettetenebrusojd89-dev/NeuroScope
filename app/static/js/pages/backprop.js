import { api, NS } from '../api.js';
import { histChart, barChart } from '../plot.js';

// Backpropagation visualizer: summary-first, drill-down into small matrices.
export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <button id="b-run">Compute one backward pass</button>
        <span class="hint">Uses the current Playground session (trains on a batch of 64). Create/train a network in the Playground first — or one will be built automatically.</span>
      </div>
      <div id="b-error"></div>
    </div>
    <div id="b-result"></div>`;

  const $ = id => root.querySelector(id);

  async function ensureSession() {
    if (NS.sessionId) return NS.sessionId;
    const r = await api('/playground/create', {
      dataset: { name: 'moons', n_samples: 400, noise: 0.12, test_split: 0.25 },
      hidden_layers: [8, 8], activation: 'tanh', init: 'xavier',
      optimizer: 'adam', lr: 0.03,
    });
    NS.sessionId = r.sessionId;
    return r.sessionId;
  }

  $('#b-run').onclick = async () => {
    $('#b-error').innerHTML = '';
    try {
      const sid = await ensureSession();
      const r = await api('/backprop/summary', { session_id: sid });
      renderResult(r);
    } catch (err) {
      $('#b-error').innerHTML = `<div class="error-box">${err.message}</div>`;
    }
  };

  function renderResult(r) {
    const container = $('#b-result');
    const chain = ['Loss', ...r.layers.map((_, i) => `L${r.layers.length - 1 - i}`).reverse(), 'Input'];
    container.innerHTML = `
      <div class="panel">
        <h3>Gradient flow — batch loss ${r.loss.toFixed(5)}</h3>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-family:var(--mono);font-size:12.5px">
          ${chain.map(c => `<span class="shape-badge">${c}</span>`).join('<span style="color:var(--text-dim)">←</span>')}
        </div>
      </div>
      <div class="panel"><h3>‖dW‖ per layer (log-friendly view)</h3>
        <canvas id="b-norms" class="plot"></canvas></div>
      <div class="grid-2" id="b-cards"></div>`;

    barChart($('#b-norms'), r.layers.map(l => l.dW.norm), {
      labels: r.layers.map((l, i) => `L${i} ${l.shape.join('×')}`),
      colors: r.layers.map(l => l.dW.norm < 1e-6 ? '#f7a24f' : '#4f8ff7'),
      height: 180,
    });

    const cards = $('#b-cards');
    r.layers.forEach((l, i) => {
      const card = document.createElement('div');
      card.className = 'panel';
      card.innerHTML = `
        <h3>Layer ${i} — Linear ${l.shape.join(' → ')}</h3>
        <div class="grid-2">
          <div><div class="metric-label">‖dW‖ = ${fmt(l.dW.norm)} · max|dW| = ${fmt(l.dW.max_abs)}</div>
            <canvas id="b-hw-${i}" class="plot"></canvas></div>
          <div><div class="metric-label">‖db‖ = ${fmt(l.db.norm)} · max|db| = ${fmt(l.db.max_abs)}</div>
            <canvas id="b-hb-${i}" class="plot"></canvas></div>
        </div>
        <button class="secondary" id="b-drill-${i}" style="margin-top:8px">Drill down</button>
        <div id="b-matrix-${i}" style="margin-top:10px;overflow-x:auto"></div>`;
      cards.appendChild(card);
      histChart(card.querySelector(`#b-hw-${i}`), l.dW.hist, l.dW.hist_edges, { color: '#4f8ff7' });
      histChart(card.querySelector(`#b-hb-${i}`), l.db.hist, l.db.hist_edges, { color: '#a371f7' });
      card.querySelector(`#b-drill-${i}`).onclick = () => {
        const target = card.querySelector(`#b-matrix-${i}`);
        if (target.innerHTML) { target.innerHTML = ''; return; }
        if (!l.dW.matrix) {
          target.innerHTML = '<p class="hint">Matrix too large to display — use the summary statistics and histograms instead.</p>';
          return;
        }
        target.innerHTML = `<p class="hint">dW (${l.shape.join('×')}):</p>${matrixTable(l.dW.matrix)}
          <p class="hint" style="margin-top:8px">db:</p>${matrixTable([l.db.matrix || []])}`;
      };
    });
  }
}

function matrixTable(m) {
  return `<table class="matrix-table">${m.map(row =>
    `<tr>${row.map(v => `<td>${(+v).toExponential(2)}</td>`).join('')}</tr>`).join('')}</table>`;
}
function fmt(v) { return v >= 1000 || (v < 0.001 && v > 0) ? v.toExponential(2) : v.toFixed(5); }
