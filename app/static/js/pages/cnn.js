import { api } from '../api.js';
import { heatmap } from '../plot.js';

// Convolution Lab with sliding-window animation.
export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>Kernel preset</label>
          <select id="c-preset"><option>edge_vertical</option><option>edge_horizontal</option>
            <option>sharpen</option><option>box_blur</option><option>ridge</option><option>identity</option></select></div>
        <div class="field"><label>Stride = <span id="c-sv">1</span></label>
          <input type="range" id="c-stride" min="1" max="3" value="1"/></div>
        <div class="field"><label>Padding = <span id="c-pv">0</span></label>
          <input type="range" id="c-padding" min="0" max="2" value="0"/></div>
        <button id="c-run">Compute</button>
        <button id="c-play" class="secondary">▶ Animate window</button>
        <div class="field"><span class="metric-label">output shape</span>
          <span class="metric" id="c-shape">–</span></div>
      </div>
      <div id="c-error"></div>
    </div>
    <div class="grid-3">
      <div class="panel"><h3>Input image</h3><canvas id="c-in" class="plot"></canvas></div>
      <div class="panel"><h3>Kernel</h3><canvas id="c-k" class="plot"></canvas>
        <p class="hint" style="margin-top:8px" id="c-formula"></p></div>
      <div class="panel"><h3>Feature map</h3><canvas id="c-out" class="plot"></canvas></div>
    </div>
    <div class="panel"><h3>Current window computation</h3><p class="hint" id="c-detail">Press “Animate window”.</p></div>`;

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
      $('#c-shape').textContent = `${data.output_shape.join('×')}`;
      const [H, W] = data.input_shape, [KH] = [data.kernel.length];
      const P = +$('#c-padding').value, S = +$('#c-stride').value;
      $('#c-formula').textContent =
        `out = ⌊(${H} + 2·${P} − ${KH}) / ${S}⌋ + 1 = ${data.output_shape[0]}`;
      drawAll(-1);
      stepIdx = 0;
    } catch (err) {
      $('#c-error').innerHTML = `<div class="error-box">${err.message}</div>`;
    }
  }

  function drawAll(highlightIdx) {
    if (!data) return;
    const win = highlightIdx >= 0 ? data.windows[highlightIdx] : null;
    const k = data.kernel.length;
    heatmap($('#c-in'), data.input, {
      height: 280, showValues: true,
      highlight: win ? [win[0], win[1], k] : null,
    });
    heatmap($('#c-k'), data.kernel, { height: 280, showValues: true });
    const outSoFar = highlightIdx >= 0 ? partialOutput(highlightIdx) : data.output;
    heatmap($('#c-out'), outSoFar, { height: 280, showValues: true, highlight: null });
    if (win) {
      const [r, c] = win;
      const region = data.input.slice(r, r + k).map(row => row.slice(c, c + k));
      const products = region.map((row, i) => row.map((v, j) => v * data.kernel[i][j]));
      const sum = products.flat().reduce((a, b) => a + b, 0);
      const [OH, OW] = data.output_shape;
      $('#c-detail').innerHTML =
        `Window at (row ${r}, col ${c}) → output[${Math.floor(highlightIdx / OW)}, ${highlightIdx % OW}]<br>` +
        `element-wise products: ${products.map(row => '[' + row.map(v => v.toFixed(1)).join(', ') + ']').join(' ')}` +
        `<br>Σ = <b>${sum.toFixed(3)}</b>`;
    } else {
      $('#c-detail').textContent = 'Press “Animate window”.';
    }
  }

  function partialOutput(upto) {
    const [OH, OW] = data.output_shape;
    const out = data.output.map(row => row.map(() => null));
    for (let idx = 0; idx <= upto; idx++) {
      const i = Math.floor(idx / OW), j = idx % OW;
      out[i][j] = data.output[i][j];
    }
    return out.map(row => row.map(v => v === null ? 0 : v));
  }

  function play() {
    if (!data) return;
    if (timer) { stop(); return; }
    $('#c-play').textContent = '⏸ Stop';
    timer = setInterval(() => {
      drawAll(stepIdx);
      stepIdx++;
      if (stepIdx >= data.windows.length) { stop(); drawAll(-1); }
    }, 350);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; $('#c-play').textContent = '▶ Animate window'; }
  }

  $('#c-run').onclick = compute;
  $('#c-play').onclick = play;
  await compute();
}
