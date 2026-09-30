import { api } from '../api.js';
import { heatmap } from '../plot.js';

// Pooling Lab with sliding-window animation.
export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <div class="field"><label>Mode</label>
          <select id="pl-mode"><option>max</option><option>avg</option></select></div>
        <div class="field"><label>Window size</label>
          <select id="pl-size"><option>2</option><option>3</option><option>4</option></select></div>
        <div class="field"><label>Stride</label>
          <select id="pl-stride"><option value="">= size</option><option>1</option><option>2</option><option>3</option></select></div>
        <button id="pl-run">Compute</button>
        <button id="pl-play" class="secondary">▶ Animate window</button>
        <div class="field"><span class="metric-label">output shape</span>
          <span class="metric" id="pl-shape">–</span></div>
      </div>
      <div id="pl-error"></div>
    </div>
    <div class="grid-2">
      <div class="panel"><h3>Input feature map</h3><canvas id="pl-in" class="plot"></canvas></div>
      <div class="panel"><h3>Pooled output</h3><canvas id="pl-out" class="plot"></canvas></div>
    </div>
    <div class="panel"><h3>Current window</h3><p class="hint" id="pl-detail">Press “Animate window”.</p></div>`;

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
      $('#pl-error').innerHTML = `<div class="error-box">${err.message}</div>`;
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
      const [OW] = [data.output_shape[1]];
      $('#pl-detail').innerHTML =
        `Window (row ${r}, col ${c}): ${region.map(row => '[' + row.map(v => v.toFixed(1)).join(', ') + ']').join(' ')}` +
        ` → ${mode} = <b>${val.toFixed(2)}</b> → output[${Math.floor(highlightIdx / OW)}, ${highlightIdx % OW}]`;
    }
  }

  function partial(upto) {
    const [OH, OW] = data.output_shape;
    return data.output.map((row, i) => row.map((v, j) =>
      i * OW + j <= upto ? v : 0));
  }

  function play() {
    if (!data) return;
    if (timer) { stop(); return; }
    $('#pl-play').textContent = '⏸ Stop';
    timer = setInterval(() => {
      drawAll(stepIdx);
      stepIdx++;
      if (stepIdx >= data.windows.length) { stop(); drawAll(-1); }
    }, 400);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; $('#pl-play').textContent = '▶ Animate window'; }
  }

  $('#pl-run').onclick = compute;
  $('#pl-play').onclick = play;
  await compute();
}
