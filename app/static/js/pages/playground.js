import { api, NS } from '../api.js';
import { lineChart, boundaryPlot } from '../plot.js';
import { t, errText } from '../i18n.js';

// Training Playground: configure an MLP, train it live, watch the boundary.
export async function render(root) {
  root.innerHTML = `
    <div class="panel">
      <h3>${t('playground.dataset')}</h3>
      <div class="controls">
        <div class="field"><label>${t('playground.dataset')}</label>
          <select id="p-ds"><option>xor</option><option selected>moons</option>
            <option>circles</option><option>spiral</option><option>blobs</option></select></div>
        <div class="field"><label>${t('playground.samples')}</label><input type="number" id="p-n" value="400" min="40" max="5000" style="width:80px"/></div>
        <div class="field"><label>${t('playground.noise')}</label><input type="number" id="p-noise" value="0.12" step="0.02" min="0" max="1" style="width:70px"/></div>
        <div class="field"><label>${t('playground.testSplit')}</label><input type="number" id="p-split" value="0.25" step="0.05" min="0.1" max="0.5" style="width:70px"/></div>
      </div>
    </div>
    <div class="panel">
      <h3>${t('playground.archTitle')}</h3>
      <div class="controls" id="p-layers"></div>
      <div class="controls" style="margin-top:10px">
        <button class="secondary" id="p-add-layer">${t('playground.addLayer')}</button>
        <div class="field"><label>${t('playground.activation')}</label>
          <select id="p-act"><option>tanh</option><option>relu</option><option>sigmoid</option><option>leaky_relu</option><option>gelu</option></select></div>
        <div class="field"><label>${t('playground.init')}</label>
          <select id="p-init"><option>xavier</option><option>he</option><option>random</option></select></div>
      </div>
    </div>
    <div class="panel">
      <h3>${t('playground.optimizer')}</h3>
      <div class="controls">
        <div class="field"><label>${t('playground.algorithm')}</label>
          <select id="p-opt"><option>adam</option><option>sgd</option><option>momentum</option><option>rmsprop</option></select></div>
        <div class="field"><label>${t('playground.lr')}</label><input type="number" id="p-lr" value="0.03" step="0.01" style="width:80px"/></div>
        <div class="field"><label>${t('playground.momentum')}</label><input type="number" id="p-mom" value="0.9" step="0.05" style="width:70px"/></div>
        <div class="field"><label>β1</label><input type="number" id="p-b1" value="0.9" step="0.01" style="width:70px"/></div>
        <div class="field"><label>β2</label><input type="number" id="p-b2" value="0.999" step="0.001" style="width:80px"/></div>
        <button id="p-create">${t('playground.build')}</button>
        <button id="p-start" disabled>${t('playground.start')}</button>
        <button id="p-pause" class="secondary" disabled>${t('playground.pause')}</button>
        <button id="p-reset" class="secondary" disabled>${t('common.reset')}</button>
        <span class="hint" id="p-status">${t('playground.notBuilt')}</span>
      </div>
    </div>
    <div class="grid-2">
      <div class="panel"><h3>${t('playground.boundary')}</h3><canvas id="p-boundary" class="plot"></canvas></div>
      <div class="panel"><h3>${t('playground.loss')}</h3><canvas id="p-loss" class="plot"></canvas>
        <h3 style="margin-top:14px">${t('playground.accuracy')}</h3><canvas id="p-acc" class="plot"></canvas></div>
    </div>
    <div class="panel">
      <div class="controls">
        <div class="field"><span class="metric-label">${t('playground.epoch')}</span><span class="metric" id="p-epoch">0</span></div>
        <div class="field"><span class="metric-label">${t('playground.trainLoss')}</span><span class="metric" id="p-tl">–</span></div>
        <div class="field"><span class="metric-label">${t('playground.valLoss')}</span><span class="metric" id="p-vl">–</span></div>
        <div class="field"><span class="metric-label">${t('common.trainAcc')}</span><span class="metric" id="p-ta">–</span></div>
        <div class="field"><span class="metric-label">${t('common.valAcc')}</span><span class="metric" id="p-va">–</span></div>
      </div>
    </div>
    <div id="p-error"></div>`;

  const $ = id => root.querySelector(id);
  let hiddenLayers = [8, 8];
  let sessionId = null, extent = null, dataCache = null, timer = null;

  function drawLayersEditor() {
    $('#p-layers').innerHTML = hiddenLayers.map((n, i) => `
      <div class="field"><label>${t('playground.hiddenN', { i: i + 1 })}</label>
        <div style="display:flex;gap:6px">
          <input type="number" data-i="${i}" class="hl-n" value="${n}" min="1" max="64" style="width:70px"/>
          <button class="secondary hl-del" data-i="${i}">×</button>
        </div></div>`).join('');
    $('#p-layers').querySelectorAll('.hl-n').forEach(inp =>
      inp.onchange = () => { hiddenLayers[+inp.dataset.i] = Math.max(1, Math.min(64, +inp.value)); });
    $('#p-layers').querySelectorAll('.hl-del').forEach(btn =>
      btn.onclick = () => { hiddenLayers.splice(+btn.dataset.i, 1); drawLayersEditor(); });
  }
  drawLayersEditor();
  $('#p-add-layer').onclick = () => {
    if (hiddenLayers.length < 6) { hiddenLayers.push(8); drawLayersEditor(); }
  };

  async function loadData() {
    dataCache = await api('/datasets', {
      name: $('#p-ds').value, n_samples: +$('#p-n').value,
      noise: +$('#p-noise').value, test_split: +$('#p-split').value,
    });
    extent = dataCache.extent;
  }

  function drawDataset() {
    if (!dataCache) return;
    const X = [...dataCache.train.X, ...dataCache.test.X];
    const y = [...dataCache.train.y, ...dataCache.test.y];
    boundaryPlot($('#p-boundary'), midGrid(), extent, X, y, { height: 380 });
  }

  function midGrid(res = 60) {
    return Array.from({ length: res }, () => Array(res).fill(0.5));
  }

  async function create() {
    stop();
    $('#p-error').innerHTML = '';
    try {
      if (!dataCache) await loadData();
      const cfg = {
        dataset: {
          name: $('#p-ds').value, n_samples: +$('#p-n').value,
          noise: +$('#p-noise').value, test_split: +$('#p-split').value,
        },
        hidden_layers: hiddenLayers.length ? hiddenLayers : [4],
        activation: $('#p-act').value, init: $('#p-init').value,
        optimizer: $('#p-opt').value, lr: +$('#p-lr').value,
        momentum: +$('#p-mom').value, beta1: +$('#p-b1').value, beta2: +$('#p-b2').value,
      };
      const r = await api('/playground/create', cfg);
      sessionId = r.session_id; extent = r.extent;
      NS.sessionId = sessionId; NS.playgroundConfig = cfg;
      ['#p-start', '#p-reset'].forEach(id => { $(id).disabled = false; });
      $('#p-status').textContent = t('playground.ready', { sid: sessionId });
      await step(true);
    } catch (err) {
      $('#p-error').innerHTML = `<div class="error-box">${errText(err)}</div>`;
    }
  }

  async function step(first = false) {
    if (!sessionId) return;
    const r = await api('/playground/step', { session_id: sessionId, epochs: first ? 1 : 5 });
    if (!root.isConnected) return;
    const h = r.history;
    $('#p-epoch').textContent = r.epoch;
    $('#p-tl').textContent = last(h.train_loss).toFixed(4);
    $('#p-vl').textContent = last(h.val_loss).toFixed(4);
    $('#p-ta').textContent = (last(h.train_acc) * 100).toFixed(1) + '%';
    $('#p-va').textContent = (last(h.val_acc) * 100).toFixed(1) + '%';
    const X = [...dataCache.train.X, ...dataCache.test.X];
    const y = [...dataCache.train.y, ...dataCache.test.y];
    boundaryPlot($('#p-boundary'), r.boundary, r.extent, X, y, { height: 380 });
    const xs = h.train_loss.map((_, i) => i + 1);
    lineChart($('#p-loss'), [
      { x: xs, y: h.train_loss, label: t('common.train'), color: '#4f8ff7' },
      { x: xs, y: h.val_loss, label: t('common.val'), color: '#f7a24f' },
    ], { height: 170 });
    lineChart($('#p-acc'), [
      { x: xs, y: h.train_acc, label: t('common.train'), color: '#3fb96f' },
      { x: xs, y: h.val_acc, label: t('common.val'), color: '#a371f7' },
    ], { height: 150, yMin: 0, yMax: 1 });
  }

  function start() {
    if (timer || !sessionId) return;
    $('#p-pause').disabled = false; $('#p-start').disabled = true;
    $('#p-status').textContent = t('playground.training', { sid: sessionId });
    timer = setInterval(async () => {
      if (!root.isConnected) { stop(); return; }
      try { await step(); } catch (e) { stop(); errBox(e); }
    }, 220);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    if ($('#p-start')) { $('#p-pause').disabled = true; $('#p-start').disabled = !sessionId; }
    if (sessionId && $('#p-status')) $('#p-status').textContent = t('playground.paused', { sid: sessionId });
  }
  function errBox(e) { $('#p-error').innerHTML = `<div class="error-box">${errText(e)}</div>`; }

  $('#p-create').onclick = create;
  $('#p-start').onclick = start;
  $('#p-pause').onclick = stop;
  $('#p-reset').onclick = async () => {
    stop();
    if (!sessionId) return;
    const r = await api('/playground/reset', { session_id: sessionId });
    sessionId = r.session_id; NS.sessionId = sessionId;
    await step(true);
  };

  // auto-preview the dataset on first visit
  await loadData();
  drawDataset();
  return stop;
}

function last(arr) { return arr[arr.length - 1]; }
