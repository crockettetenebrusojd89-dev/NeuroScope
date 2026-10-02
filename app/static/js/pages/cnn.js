import { api } from '../api.js';
import { heatmap } from '../plot.js';
import { t, errText } from '../i18n.js';

// Convolution Lab with sliding-window animation.
export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>${t('cnn.kernelPreset')}</label>
          <select id="c-preset"><option>edge_vertical</option><option>edge_horizontal</option>
            <option>sharpen</option><option>box_blur</option><option>ridge</option><option>identity</option></select></div>
        <div class="field"><label>${t('cnn.stride')}<span id="c-sv">1</span></label>
          <input type="range" id="c-stride" min="1" max="3" value="1"/></div>
        <div class="field"><label>${t('cnn.padding')}<span id="c-pv">0</span></label>
          <input type="range" id="c-padding" min="0" max="2" value="0"/></div>
        <button id="c-run">${t('common.compute')}</button>
        <button id="c-play" class="secondary">${t('common.animate')}</button>
        <div class="field"><span class="metric-label">${t('common.outputShape')}</span>
          <span class="metric" id="c-shape">–</span></div>
      </div>
      <div id="c-error"></div>
    </div>
    <div class="grid-3">
      <div class="panel"><h3>${t('cnn.inputImage')}</h3><canvas id="c-in" class="plot"></canvas></div>
      <div class="panel"><h3>${t('cnn.kernel')}</h3><canvas id="c-k" class="plot"></canvas>
        <p class="hint" style="margin-top:8px" id="c-formula"></p></div>
      <div class="panel"><h3>${t('cnn.featureMap')}</h3><canvas id="c-out" class="plot"></canvas></div>
    </div>
    <div class="panel"><h3>${t('cnn.detailTitle')}</h3><p class="hint" id="c-detail">${t('common.pressAnimate')}</p></div>`;

  const $ = id => root.querySelector(id);
  let data = null, timer = null, stepIdx = 0;

  async function compute() {
    stop();
    $('#c-error').innerHTML = '';
    $('#c-sv').textContent = $('#c-stride').value;
    $('#c-pv').textContent = $('#c-padding').value;
    try {
      data = await api('/cnn/conv', {
        preset: $('#c-preset').value,
        stride: +$('#c-stride').value, padding: +$('#c-padding').value,
      });
      $('#c-shape').textContent = data.output_shape.join('×');
      const [H] = data.input_shape, KH = data.kernel.length;
      $('#c-formula').textContent = t('cnn.formula', {
        H, P: +$('#c-padding').value, K: KH, S: +$('#c-stride').value,
        out: data.output_shape[0],
      });
      drawAll(-1);
      stepIdx = 0;
    } catch (err) {
      $('#c-error').innerHTML = `<div class="error-box">${errText(err)}</div>`;
    }
  }

  function drawAll(highlightIdx) {
    if (!data) return;
    const win = highlightIdx >= 0 ? data.windows[highlightIdx] : null;
    const k = data.kernel.length;
    heatmap($('#c-in'), data.padded_input, {
      height: 280, showValues: true,
      highlight: win ? [win[0], win[1], k] : null,
    });
    heatmap($('#c-k'), data.kernel, { height: 280, showValues: true });
    const outSoFar = highlightIdx >= 0 ? partialOutput(highlightIdx) : data.output;
    heatmap($('#c-out'), outSoFar, { height: 280, showValues: true, highlight: null });
    if (win) {
      const [r, c] = win;
      const region = data.padded_input.slice(r, r + k).map(row => row.slice(c, c + k));
      const products = region.map((row, i) => row.map((v, j) => v * data.kernel[i][j]));
      const sum = products.flat().reduce((a, b) => a + b, 0);
      const OW = data.output_shape[1];
      $('#c-detail').innerHTML =
        t('cnn.windowAt', { r, c, i: Math.floor(highlightIdx / OW), j: highlightIdx % OW }) + '<br>' +
        t('cnn.products', { products: products.map(row => '[' + row.map(v => v.toFixed(1)).join(', ') + ']').join(' ') }) +
        `<br>${t('cnn.sum')}<b>${sum.toFixed(3)}</b>`;
    } else {
      $('#c-detail').textContent = t('common.pressAnimate');
    }
  }

  function partialOutput(upto) {
    const OW = data.output_shape[1];
    return data.output.map((row, i) => row.map((v, j) =>
      i * OW + j <= upto ? v : 0));
  }

  function play() {
    if (!data) return;
    if (timer) { stop(); return; }
    $('#c-play').textContent = t('common.stop');
    timer = setInterval(() => {
      drawAll(stepIdx);
      stepIdx++;
      if (stepIdx >= data.windows.length) { stop(); drawAll(-1); }
    }, 350);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; $('#c-play').textContent = t('common.animate'); }
  }

  $('#c-run').onclick = compute;
  $('#c-play').onclick = play;
  await compute();
  return stop;
}
