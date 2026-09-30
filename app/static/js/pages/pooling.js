import { api } from '../api.js';
import { heatmap } from '../plot.js';
import { t, errText } from '../i18n.js';

// Pooling Lab with sliding-window animation.
export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>${t('pooling.mode')}</label>
          <select id="pl-mode"><option>max</option><option>avg</option></select></div>
        <div class="field"><label>${t('pooling.windowSize')}</label>
          <select id="pl-size"><option>2</option><option>3</option><option>4</option></select></div>
        <div class="field"><label>${t('pooling.stride')}</label>
          <select id="pl-stride"><option value="">${t('pooling.strideAuto')}</option><option>1</option><option>2</option><option>3</option></select></div>
        <button id="pl-run">${t('common.compute')}</button>
        <button id="pl-play" class="secondary">${t('common.animate')}</button>
        <div class="field"><span class="metric-label">${t('common.outputShape')}</span>
          <span class="metric" id="pl-shape">–</span></div>
      </div>
      <div id="pl-error"></div>
    </div>
    <div class="grid-2">
      <div class="panel"><h3>${t('pooling.inputMap')}</h3><canvas id="pl-in" class="plot"></canvas></div>
      <div class="panel"><h3>${t('pooling.outputMap')}</h3><canvas id="pl-out" class="plot"></canvas></div>
    </div>
    <div class="panel"><h3>${t('pooling.detailTitle')}</h3><p class="hint" id="pl-detail">${t('common.pressAnimate')}</p></div>`;

  const $ = id => root.querySelector(id);
  let data = null, timer = null, stepIdx = 0;

  async function compute() {
    stop();
    $('#pl-error').innerHTML = '';
    try {
      data = await api('/cnn/pool', {
        mode: $('#pl-mode').value, size: +$('#pl-size').value,
        stride: $('#pl-stride').value ? +$('#pl-stride').value : null,
      });
      $('#pl-shape').textContent = data.output_shape.join('×');
      drawAll(-1);
      stepIdx = 0;
    } catch (err) {
      $('#pl-error').innerHTML = `<div class="error-box">${errText(err)}</div>`;
    }
  }

  function drawAll(highlightIdx) {
    if (!data) return;
    const size = +$('#pl-size').value;
    const win = highlightIdx >= 0 ? data.windows[highlightIdx] : null;
    heatmap($('#pl-in'), data.input, {
      height: 300, showValues: true,
      highlight: win ? [win[0], win[1], size] : null,
    });
    const shown = highlightIdx >= 0 ? partial(highlightIdx) : data.output;
    heatmap($('#pl-out'), shown, { height: 300, showValues: true });
    if (win) {
      const [r, c] = win;
      const region = data.input.slice(r, r + size).map(row => row.slice(c, c + size));
      const mode = $('#pl-mode').value;
      const val = mode === 'max'
        ? Math.max(...region.flat())
        : region.flat().reduce((a, b) => a + b, 0) / (size * size);
      const OW = data.output_shape[1];
      $('#pl-detail').innerHTML = t('pooling.windowDetail', {
        r, c,
        region: region.map(row => '[' + row.map(v => v.toFixed(1)).join(', ') + ']').join(' '),
        mode, val: `<b>${val.toFixed(2)}</b>`,
        i: Math.floor(highlightIdx / OW), j: highlightIdx % OW,
      });
    }
  }

  function partial(upto) {
    const OW = data.output_shape[1];
    return data.output.map((row, i) => row.map((v, j) =>
      i * OW + j <= upto ? v : 0));
  }

  function play() {
    if (!data) return;
    if (timer) { stop(); return; }
    $('#pl-play').textContent = t('common.stop');
    timer = setInterval(() => {
      drawAll(stepIdx);
      stepIdx++;
      if (stepIdx >= data.windows.length) { stop(); drawAll(-1); }
    }, 400);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; $('#pl-play').textContent = t('common.animate'); }
  }

  $('#pl-run').onclick = compute;
  $('#pl-play').onclick = play;
  await compute();
}
