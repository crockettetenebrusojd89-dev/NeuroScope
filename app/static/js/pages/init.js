import { api } from '../api.js';
import { lineChart } from '../plot.js';
import { t, errText } from '../i18n.js';

const COLORS = { zeros: '#8b93a3', random: '#e5534b', xavier: '#4f8ff7', he: '#3fb96f' };

export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>${t('init.hiddenAct')}</label>
          <select id="i-act"><option>tanh</option><option>relu</option><option>sigmoid</option></select></div>
        <button id="i-run">${t('init.run')}</button>
        <span class="hint">${t('init.hint')}</span>
      </div>
      <div id="i-error"></div>
    </div>
    <div class="grid-2">
      <div class="panel"><h3>${t('init.varTitle')}</h3><canvas id="i-var" class="plot"></canvas>
        <p class="hint" style="margin-top:8px">${t('init.varHint')}</p></div>
      <div class="panel"><h3>${t('init.gradTitle')}</h3><canvas id="i-grad" class="plot"></canvas>
        <p class="hint" style="margin-top:8px">${t('init.gradHint')}</p></div>
    </div>`;

  const $ = id => root.querySelector(id);

  async function run() {
    $('#i-error').innerHTML = '';
    try {
      const r = await api('/init-lab', { activation: $('#i-act').value });
      const names = ['zeros', 'random', 'xavier', 'he'];
      lineChart($('#i-var'), names.map(n => ({
        x: r[n].activations.map(a => a.layer),
        y: r[n].activations.map(a => a.var),
        label: n, color: COLORS[n],
      })), { height: 300 });
      lineChart($('#i-grad'), names.map(n => ({
        x: r[n].grad_norms.map((_, i) => i),
        y: r[n].grad_norms.map(v => Math.log10(v + 1e-20)),
        label: n, color: COLORS[n],
      })), { height: 300 });
    } catch (err) {
      $('#i-error').innerHTML = `<div class="error-box">${errText(err)}</div>`;
    }
  }
  $('#i-run').onclick = run;
  await run();
}
