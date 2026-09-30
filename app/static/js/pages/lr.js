import { api } from '../api.js';
import { lineChart } from '../plot.js';
import { t, errText } from '../i18n.js';

const COLORS = ['#8b93a3', '#3fb96f', '#e5534b', '#a371f7'];

export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>${t('lr.listLabel')}</label>
          <input type="text" id="lr-list" value="0.001, 0.05, 0.5" size="24"/></div>
        <div class="field"><label>${t('common.epochs')}</label>
          <input type="number" id="lr-epochs" value="200" min="10" max="1000" style="width:80px"/></div>
        <button id="lr-run">${t('lr.trainAll')}</button>
        <span class="hint">${t('lr.hint')}</span>
      </div>
      <div id="lr-error"></div>
    </div>
    <div class="panel"><h3>${t('lr.curvesTitle')}</h3><canvas id="lr-canvas" class="plot"></canvas></div>
    <div class="panel"><h3>${t('lr.accTitle')}</h3><div id="lr-acc" class="controls"></div></div>`;

  const $ = id => root.querySelector(id);

  $('#lr-run').onclick = async () => {
    $('#lr-error').innerHTML = '';
    const lrs = $('#lr-list').value.split(',').map(Number).filter(v => v > 0).slice(0, 4);
    if (!lrs.length) { $('#lr-error').innerHTML = `<div class="error-box">${t('lr.emptyErr')}</div>`; return; }
    try {
      const r = await api('/lr-lab', { lrs, epochs: +$('#lr-epochs').value });
      const keys = Object.keys(r);
      lineChart($('#lr-canvas'), keys.map((k, i) => ({
        x: r[k].train_loss.map((_, j) => j + 1),
        y: r[k].train_loss.map(v => Math.max(v, 1e-12)),
        label: `lr=${k}`, color: COLORS[i % COLORS.length],
      })), { height: 340 });
      $('#lr-acc').innerHTML = keys.map((k, i) => `
        <div class="field"><span class="metric-label">lr=${k}</span>
          <span class="metric" style="color:${COLORS[i % COLORS.length]}">${(r[k].val_acc * 100).toFixed(1)}%</span></div>`).join('');
    } catch (err) {
      $('#lr-error').innerHTML = `<div class="error-box">${errText(err)}</div>`;
    }
  };
  $('#lr-run').click();
}
