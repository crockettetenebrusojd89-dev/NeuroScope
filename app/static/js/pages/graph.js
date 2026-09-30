import { api } from '../api.js';
import { t } from '../i18n.js';

// Interactive computational graph: step forward, then backward.
export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <div class="controls">
        <button id="g-fwd">${t('graph.stepFwd')}</button>
        <button id="g-bwd" disabled>${t('graph.stepBwd')}</button>
        <button id="g-auto" class="secondary">${t('graph.autoPlay')}</button>
        <button id="g-reset" class="secondary">${t('common.reset')}</button>
        <span class="hint" id="g-status"></span>
      </div>
    </div>
    <div class="panel"><h3>${t('graph.panelTitle')}</h3>
      <canvas id="g-canvas" class="plot" style="height:420px"></canvas>
      <p class="hint" style="margin-top:8px" id="g-detail">${t('graph.initialHint')}</p>
    </div>`;

  const $ = id => root.querySelector(id);
  const canvas = $('#g-canvas');
  const data = await api('/graph/run', {});
  const pos = layout(data.nodes.map(n => n.name));
  const done = new Set();
  const gradDone = new Set();
  let fwdQueue = [...data.forward_steps];
  let bwdQueue = [...data.backward_steps];
  let playing = false;

  const nodeByName = Object.fromEntries(data.nodes.map(n => [n.name, n]));

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = 420;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    data.edges.forEach(e => {
      const a = pos[e.from], b = pos[e.to];
      ctx.strokeStyle = '#3a4254'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.fillStyle = '#8b93a3'; ctx.font = '10px monospace';
      ctx.fillText(e.local_grad.toFixed(3), mx + 4, my - 4);
    });

    Object.entries(pos).forEach(([name, p]) => {
      const n = nodeByName[name];
      const hasVal = done.has(name) || n.kind === 'input';
      const hasGrad = gradDone.has(name);
      const colors = { input: '#2a3140', op: '#1d3557', loss: '#4a2545' };
      ctx.fillStyle = hasVal ? (colors[n.kind] || '#2a3140') : '#161b22';
      ctx.strokeStyle = hasGrad ? '#f7a24f' : (hasVal ? '#4f8ff7' : '#3a4254');
      ctx.lineWidth = hasGrad || hasVal ? 2.2 : 1.2;
      roundRect(ctx, p.x - 58, p.y - 26, 116, 52, 9); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e6e9ef'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(name, p.x, p.y - 8);
      ctx.font = '10.5px monospace';
      ctx.fillStyle = hasVal ? '#7fb3ff' : '#555f70';
      ctx.fillText(hasVal ? `v=${n.value.toFixed(4)}` : 'v=?', p.x, p.y + 7);
      ctx.fillStyle = hasGrad ? '#f7a24f' : '#555f70';
      ctx.fillText(hasGrad ? `g=${n.grad.toFixed(4)}` : 'g=?', p.x, p.y + 20);
    });
    ctx.textAlign = 'left';
  }

  function status(msg) { $('#g-status').textContent = msg; }

  function stepForward() {
    if (!fwdQueue.length) { status(t('graph.fwdDone')); $('#g-bwd').disabled = false; return; }
    const name = fwdQueue.shift();
    done.add(name);
    const n = nodeByName[name];
    $('#g-detail').textContent = t('graph.fwdStep', { name, value: n.value.toFixed(5) });
    status(t('graph.fwdProgress', { done: data.forward_steps.length - fwdQueue.length, total: data.forward_steps.length }));
    if (!fwdQueue.length) { $('#g-bwd').disabled = false; }
    draw();
  }

  function stepBackward() {
    if (!bwdQueue.length) { status(t('graph.bwdDone')); return; }
    const name = bwdQueue.shift();
    gradDone.add(name);
    const n = nodeByName[name];
    $('#g-detail').textContent = t('graph.bwdStep', { name, value: n.grad.toFixed(5) });
    status(t('graph.bwdProgress', { done: data.backward_steps.length - bwdQueue.length, total: data.backward_steps.length }));
    draw();
  }

  function reset() {
    done.clear(); gradDone.clear();
    fwdQueue = [...data.forward_steps];
    bwdQueue = [...data.backward_steps];
    $('#g-bwd').disabled = true;
    status('');
    $('#g-detail').textContent = t('graph.initialHint');
    draw();
  }

  $('#g-fwd').onclick = stepForward;
  $('#g-bwd').onclick = stepBackward;
  $('#g-reset').onclick = reset;
  $('#g-auto').onclick = async () => {
    if (playing) { playing = false; return; }
    playing = true;
    while (playing && (fwdQueue.length || bwdQueue.length)) {
      fwdQueue.length ? stepForward() : stepBackward();
      await new Promise(r => setTimeout(r, 650));
    }
    playing = false;
  };

  draw();
}

function layout(names) {
  // Hand-tuned positions for the neuron graph (fraction of canvas).
  const P = {
    'x':               [0.08, 0.14], 'w1': [0.08, 0.38], 'b1': [0.08, 0.62],
    'z1 = w1·x + b1':  [0.27, 0.38],
    'a1 = tanh(z1)':   [0.45, 0.38],
    'w2':              [0.45, 0.78], 'b2': [0.62, 0.78],
    'z2 = w2·a1 + b2': [0.63, 0.38],
    'a2 = σ(z2)':      [0.80, 0.38],
    'y':               [0.80, 0.72],
    'L = ½(a2 − y)²':  [0.93, 0.55],
  };
  const out = {};
  names.forEach(n => {
    const [fx, fy] = P[n] || [Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1];
    out[n] = { fx, fy, get x() { return fx * (document.querySelector('#g-canvas').clientWidth || 800); }, get y() { return fy * 420; } };
  });
  return out;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
