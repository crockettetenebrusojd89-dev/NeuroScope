import { api } from '../api.js';
import { t } from '../i18n.js';
import { table, numberField, fmt, error, invalidJson } from '../lab.js';
import { lineChart } from '../plot.js';

export async function render(root){
  root.innerHTML=`<div class="panel"><div class="controls"><div class="field"><label for="rs-values">X [N,D] (JSON)</label><textarea id="rs-values" rows="3" cols="30">[[0.2,-0.4,0.6],[1,-1,0.5]]</textarea></div>${numberField('rs-depth','residual.depth',8,1,32)}${numberField('rs-seed','residual.seed',0,0,4294967295)}${numberField('rs-scale','residual.scale',0.8,0,3,0.1)}<button id="rs-run">${t('common.compute')}</button></div><p class="hint lab-note">${t('residual.note')}</p><div id="rs-error"></div></div><div id="rs-result"></div>`;
  const $=id=>root.querySelector(id);let data,version=0;
  async function run(){
    let values;error($('#rs-error'),null);try{values=JSON.parse($('#rs-values').value);}catch{invalidJson($('#rs-error'));return;}
    const request=++version;$('#rs-run').disabled=true;
    try{const r=await api('/residual',{values,depth:+$('#rs-depth').value,seed:+$('#rs-seed').value,scale:+$('#rs-scale').value});if(!root.isConnected||request!==version)return;data=r;
      $('#rs-result').innerHTML=`<div class="panel"><p class="lab-formula">F(x) = tanh(xW + b) · Plain: y = F(x) · Residual: y = F(x) + x</p><p class="lab-formula">L = mean(Y) · G = ∂L/∂Y = 1/(N·D) · W ~ N(0, scale²/D)</p><p class="hint">${t('residual.fair')}</p></div><div class="grid-2"><div class="panel"><h3>${t('residual.gradNorm')}</h3><canvas id="rs-grad" class="plot"></canvas></div><div class="panel"><h3>${t('residual.actNorm')}</h3><canvas id="rs-act" class="plot"></canvas></div></div>
      <div class="panel"><h3>${t('residual.stats')}</h3><div class="lab-scroll"><table class="matrix-table"><tr><th>${t('residual.depth')}</th><th>Plain ‖dL/da‖</th><th>Residual ‖dL/da‖</th><th>Plain ‖dW‖</th><th>Residual ‖dW‖</th></tr>${r.plain.gradient_norms.map((v,i)=>`<tr><td>${i}</td><td>${fmt(v)}</td><td>${fmt(r.residual.gradient_norms[i])}</td><td>${i<r.depth?fmt(r.plain.weight_gradient_norms[i]):'—'}</td><td>${i<r.depth?fmt(r.residual.weight_gradient_norms[i]):'—'}</td></tr>`).join('')}</table></div></div>
      <div class="panel"><div class="field"><label for="rs-block">${t('residual.block')}</label><select id="rs-block">${r.plain.blocks.map((_,i)=>`<option value="${i}">${i+1}</option>`).join('')}</select></div><div id="rs-weights"></div></div><div class="grid-2" id="rs-blocks"></div>`;
      for(const [id,key] of [['#rs-grad','gradient_norms'],['#rs-act','activation_norms']])lineChart($(id),['plain','residual'].map(kind=>({x:r[kind][key].map((_,i)=>i),y:r[kind][key],label:kind==='plain'?'Plain':'Residual'})),{height:260});
      $('#rs-block').onchange=draw;draw();
    }catch(e){if(root.isConnected&&request===version)error($('#rs-error'),e);}finally{if(request===version)$('#rs-run').disabled=false;}
  }
  function draw(){const i=+$('#rs-block').value,b=data.plain.blocks[i];$('#rs-weights').innerHTML=`<p class="lab-formula">W [${b.W.length},${b.W.length}]</p>${table(b.W)}<p class="lab-formula">b = [${b.b.map(fmt)}]</p>`;
    $('#rs-blocks').innerHTML=['plain','residual'].map(kind=>{const b=data[kind].blocks[i];return `<div class="panel"><h3>${kind==='plain'?'Plain':'Residual'} · L = ${fmt(data[kind].loss)}</h3><p class="lab-formula">${kind==='plain'?'x → F(x) → y':'x → F(x) → (+ x) → y'}</p><p class="hint">${t('residual.forward')}</p><p>x</p>${table(b.input)}<p>F(x)</p>${table(b.F)}<p>y</p>${table(b.output)}<p class="hint lab-note">${t('residual.backward')}</p><p>G = dL/dy</p>${table(b.dy)}<p>dL/dx_F = (G ⊙ (1 − F²)) Wᵀ</p>${table(b.dx_F)}<p>dL/dx_skip = ${kind==='plain'?'0':'G'}</p>${table(b.dx_skip)}<p>dL/dx = dL/dx_F + dL/dx_skip</p>${table(b.dx)}</div>`;}).join('');}
  $('#rs-run').onclick=run;await run();
}
