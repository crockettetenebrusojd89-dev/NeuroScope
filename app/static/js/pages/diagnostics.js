import { api, NS } from '../api.js';
import { barChart } from '../plot.js';

// Gradient diagnostics: per-layer norms + vanishing/exploding flags.
export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <button id="d-run">Run diagnostics</button>
        <span class="hint">Performs one backward pass on the current Playground session and inspects every layer's gradient.</span>
      </div>
      <div id="d-error"></div>
    </div>
    <div id="d-result"></div>`;

  const $ = id => root.querySelector(id);

  async function ensureSession() {
    if (NS.sessionId) return NS.sessionId;
    const r = await api('/playground/create', {
      dataset: { name: 'spiral', n_samples: 500, noise: 0.06, test_split: 0.25 },
      hidden_layers: [16, 16, 16, 16], activation: 'sigmoid', init: 'random',
      optimizer: 'sgd', lr: 0.1,
    });
    NS.sessionId = r.sessionId;
    return r.sessionId;
  }

  $('#d-run').onclick = async () => {
    $('#d-error').innerHTML = '';
    try {
      const sid = await ensureSession();
      const r = await api('/diagnostics', { session_id: sid });
      draw(r);
    } catch (err) {
      $('#d-error').innerHTML = `<div class="error-box">${err.message}</div>`;
    }
  };

  function draw(r) {
    const el = $('#d-result');
    const colors = r.health.map(hf =>
      hf.status === 'ok' ? '#3fb96f' : hf.status === 'vanishing' ? '#f7a24f' : '#e5534b');
    el.innerHTML = `
      <div class="panel"><h3>‖dW‖ per layer</h3><canvas id="d-bars" class="plot"></canvas></div>
      <div class="panel"><h3>Health report</h3>
        <table class="matrix-table" style="font-family:inherit">
          <tr><td style="text-align:left"><b>Layer</b></td><td><b>‖dW‖</b></td><td><b>mean |dW|</b></td><td><b>status</b></td></tr>
          ${r.health.map((hf, i) => `
            <tr><td style="text-align:left">Layer ${i} (${r.layers[i].shape.join('×')})</td>
              <td>${hf.norm.toExponential(3)}</td>
              <td>${r.layers[i].dW.mean_abs.toExponential(3)}</td>
              <td><span class="pill ${hf.status}">${hf.status}</span></td></tr>`).join('')}
        </table>
        <p class="hint" style="margin-top:10px">Rules of thumb: ‖dW‖ &lt; 1e-6 → vanishing; ‖dW‖ &gt; 1e3 → exploding.
        Try a deep sigmoid network with random init in the Playground to see vanishing gradients live.</p></div>`;
    barChart($('#d-bars'), r.health.map(hf => hf.norm), {
      labels: r.health.map(hf => `L${hf.layer}`), colors, height: 200,
    });
  }
}
