import { api, NS } from '../api.js';
import { barChart } from '../plot.js';
import { t, errText } from '../i18n.js';

// Gradient diagnostics: per-layer norms + vanishing/exploding flags.
export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <button id="d-run">${t('diagnostics.run')}</button>
        <span class="hint">${t('diagnostics.hint')}</span>
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
    NS.sessionId = r.session_id;
    return r.session_id;
  }

  $('#d-run').onclick = async () => {
    $('#d-error').innerHTML = '';
    try {
      const sid = await ensureSession();
      const r = await api('/diagnostics', { session_id: sid });
      draw(r);
    } catch (err) {
      $('#d-error').innerHTML = `<div class="error-box">${errText(err)}</div>`;
    }
  };

  function draw(r) {
    const el = $('#d-result');
    const colors = r.health.map(hf =>
      hf.status === 'ok' ? '#3fb96f' : hf.status === 'vanishing' ? '#f7a24f' : '#e5534b');
    el.innerHTML = `
      <div class="panel"><h3>${t('diagnostics.barsTitle')}</h3><canvas id="d-bars" class="plot"></canvas></div>
      <div class="panel"><h3>${t('diagnostics.reportTitle')}</h3>
        <table class="matrix-table" style="font-family:inherit">
          <tr><td style="text-align:left"><b>${t('diagnostics.colLayer')}</b></td><td><b>‖dW‖</b></td><td><b>${t('diagnostics.colMean')}</b></td><td><b>${t('diagnostics.colStatus')}</b></td></tr>
          ${r.health.map((hf, i) => `
            <tr><td style="text-align:left">Layer ${i} (${r.layers[i].shape.join('×')})</td>
              <td>${hf.norm.toExponential(3)}</td>
              <td>${r.layers[i].dW.mean_abs.toExponential(3)}</td>
              <td><span class="pill ${hf.status}">${t(`diagnostics.status.${hf.status}`)}</span></td></tr>`).join('')}
        </table>
        <p class="hint" style="margin-top:10px">${t('diagnostics.footerHint')}</p></div>`;
    barChart(el.querySelector('#d-bars'), r.health.map(hf => hf.norm), {
      labels: r.health.map(hf => `L${hf.layer}`), colors, height: 200,
    });
  }
}
