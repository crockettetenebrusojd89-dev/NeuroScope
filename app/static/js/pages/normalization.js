import { api } from '../api.js';
import { t } from '../i18n.js';
import { table, numberField, fmt, error, invalidJson } from '../lab.js';
import { histChart } from '../plot.js';

export async function render(root) {
  root.innerHTML = `<div class="panel"><div class="controls">
    <div class="field"><label for="n-values">${t('normalization.values')}</label><textarea id="n-values" rows="4" cols="34">[[1,10,100],[3,14,80],[5,18,60],[7,22,40]]</textarea></div>
    <div class="field"><label for="n-kind">${t('normalization.kind')}</label><select id="n-kind"><option value="batch">BatchNorm</option><option value="layer">LayerNorm</option></select></div>
    ${numberField('n-eps','normalization.epsilon',0.00001,1e-12,1,0.00001)}
    ${numberField('n-gamma','normalization.gamma',1,-100,100,0.1)}
    ${numberField('n-beta','normalization.beta',0,-100,100,0.1)}
    <button id="n-run">${t('common.compute')}</button></div><p class="hint lab-note">${t('normalization.scope')}</p><div id="n-error"></div></div>
    <div id="n-result"></div>`;
  const $ = id => root.querySelector(id);
  let data, version=0;
  async function run() {
    const request=++version;
    error($('#n-error'), null);
    let values; try {values=JSON.parse($('#n-values').value);} catch {invalidJson($('#n-error')); return;}
    $('#n-run').disabled=true;
    try {
      const r=await api('/normalization',{values,kind:$('#n-kind').value,epsilon:+$('#n-eps').value,gamma:+$('#n-gamma').value,beta:+$('#n-beta').value});
      if(!root.isConnected || request!==version) return;
      data=r;
      $('#n-result').innerHTML=`<div class="panel"><p class="hint">${t(r.axis===0?'normalization.batchAxis':'normalization.layerAxis')}</p><p class="lab-formula">y = γ · (x − μ) / √(σ² + ε) + β</p><div class="field"><label for="n-group">${t('normalization.group')}</label><select id="n-group">${r.groups.map(g=>`<option value="${g.index}">${t(r.axis===0?'normalization.feature':'normalization.sample',{i:g.index})}</option>`).join('')}</select></div></div>
        <div class="grid-2"><div class="panel"><h3>${t('p2.before')} X [${r.shape}]</h3><div id="n-before"></div></div><div class="panel"><h3>${t('p2.after')} Y [${r.shape}]</h3><div id="n-after"></div></div></div>
        <div class="panel"><h3>${t('normalization.stats')}</h3><div class="lab-scroll"><table class="matrix-table"><thead><tr><th>${t('normalization.group')}</th><th>μ(X)</th><th>σ²(X)</th><th>μ(Y)</th><th>σ²(Y)</th></tr></thead><tbody>${r.groups.map(g=>`<tr><td>${g.index}</td><td>${fmt(g.before_mean)}</td><td>${fmt(g.before_var)}</td><td>${fmt(g.after_mean)}</td><td>${fmt(g.after_var)}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="grid-2"><div class="panel"><h3>${t('normalization.beforeHist')}</h3><canvas class="plot" id="n-hx"></canvas></div><div class="panel"><h3>${t('normalization.afterHist')}</h3><canvas class="plot" id="n-hy"></canvas></div></div>`;
      $('#n-group').onchange=draw;draw();
    } catch(e) {if(root.isConnected && request===version) error($('#n-error'),e);}
    finally {if(request===version) $('#n-run').disabled=false;}
  }
  function draw() {
    const index=+$('#n-group').value, g=data.groups[index];
    const selected=(i,j)=>data.axis===0?j===index:i===index;
    $('#n-before').innerHTML=table(data.input,selected);$('#n-after').innerHTML=table(data.output,selected);
    histChart($('#n-hx'),g.before_hist,g.edges,{color:'#4f8ff7',height:200});
    histChart($('#n-hy'),g.after_hist,g.edges,{color:'#f7a24f',height:200});
  }
  $('#n-run').onclick=run;await run();
}
