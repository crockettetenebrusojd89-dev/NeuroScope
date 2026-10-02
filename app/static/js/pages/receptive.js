import { api } from '../api.js';
import { t } from '../i18n.js';
import { numberField, error } from '../lab.js';

export async function render(root) {
  root.innerHTML=`<div class="panel"><div class="controls">${numberField('rf-size','rf.inputSize',16,1,32)}${numberField('rf-depth','rf.depth',3,1,8)}<button id="rf-run">${t('common.compute')}</button></div><div id="rf-config" class="controls lab-note"></div><p class="hint">${t('rf.note')}</p><div id="rf-error"></div></div><div id="rf-result"></div>`;
  const $=id=>root.querySelector(id);
  let configs=[{kernel:3,stride:1,padding:1},{kernel:3,stride:2,padding:1},{kernel:3,stride:1,padding:0}],data,version=0;
  function readConfigs(){return configs.map((_,i)=>({kernel:+$(`#rf-k-${i}`).value,stride:+$(`#rf-s-${i}`).value,padding:+$(`#rf-p-${i}`).value}));}
  function controls(){
    $('#rf-config').innerHTML=configs.map((c,i)=>`<div class="panel"><h3>${t('rf.layer',{i:i+1})}</h3><div class="controls">${numberField(`rf-k-${i}`,'rf.kernel',c.kernel,1,7)}${numberField(`rf-s-${i}`,'rf.stride',c.stride,1,4)}${numberField(`rf-p-${i}`,'rf.padding',c.padding,0,3)}</div></div>`).join('');
  }
  $('#rf-depth').oninput=()=>{configs=readConfigs();const n=+$('#rf-depth').value;if(!Number.isInteger(n)||n<1||n>8){error($('#rf-error'),new Error(t('p2.err.config',{field:'depth'})));return;}configs=Array.from({length:n},(_,i)=>configs[i]||{kernel:3,stride:1,padding:1});controls();};controls();
  async function run(selected=null,row=0,col=0){
    const depth=+$('#rf-depth').value;
    if(!Number.isInteger(depth)||depth<1||depth>8){error($('#rf-error'),new Error(t('p2.err.config',{field:'depth'})));return;}
    configs=readConfigs();
    if(configs.length!==depth){configs=Array.from({length:depth},(_,i)=>configs[i]||{kernel:3,stride:1,padding:1});controls();}
    const request=++version;error($('#rf-error'),null);$('#rf-run').disabled=true;
    try{const r=await api('/receptive-field',{input_size:+$('#rf-size').value,layers:readConfigs(),selected_layer:selected,row,col});if(!root.isConnected||request!==version)return;data=r;draw();}
    catch(e){if(root.isConnected&&request===version)error($('#rf-error'),e);}finally{if(request===version)$('#rf-run').disabled=false;}
  }
  function draw(){
    const r=data, s=r.states[r.selected_layer];
    $('#rf-result').innerHTML=`<div class="panel"><p class="lab-formula">n′ = ⌊(n + 2p − k)/s⌋ + 1 · j′ = j·s · r′ = r + (k−1)·j</p><div class="lab-scroll"><table class="matrix-table"><tr><th>${t('rf.layer',{i:''})}</th><th>${t('rf.mapSize')}</th><th>jump</th><th>receptive field</th><th>offset</th></tr>${r.states.map((v,i)=>`<tr><td>${i}</td><td>${v.size}×${v.size}</td><td>${v.jump}</td><td>${v.rf}×${v.rf}</td><td>${v.offset}</td></tr>`).join('')}</table></div></div>
      <div class="grid-2"><div class="panel"><h3>${t('rf.feature')}</h3><div class="field"><label for="rf-layer">${t('rf.selectLayer')}</label><select id="rf-layer">${r.layers.map((_,i)=>`<option value="${i+1}" ${i+1===r.selected_layer?'selected':''}>${t('rf.layer',{i:i+1})}</option>`).join('')}</select></div><div class="lab-grid" id="rf-features" style="grid-template-columns:repeat(${s.size},1fr)">${Array.from({length:s.size*s.size},(_,i)=>`<button data-r="${Math.floor(i/s.size)}" data-c="${i%s.size}" aria-label="${Math.floor(i/s.size)},${i%s.size}" class="${Math.floor(i/s.size)===r.row&&i%s.size===r.col?'selected':''}">${s.size<=12?`${Math.floor(i/s.size)},${i%s.size}`:''}</button>`).join('')}</div></div>
      <div class="panel"><h3>${t('rf.input')}</h3><div class="lab-grid" style="grid-template-columns:repeat(${r.input_size},1fr)">${r.mask.flat().map((v,i)=>`<span class="rf-pixel ${v?'covered':''}" title="${Math.floor(i/r.input_size)},${i%r.input_size}"></span>`).join('')}</div><p class="hint">${t('rf.support',{layer:r.selected_layer,row:r.row,col:r.col,count:r.covered_pixels})}</p><p class="lab-formula">[top,left,bottom,right) = [${r.bounds}]</p><p class="hint">${t('rf.boundsNote')}</p></div></div>`;
    $('#rf-layer').onchange=()=>run(+$('#rf-layer').value);
    $('#rf-features').onclick=e=>{const b=e.target.closest('button');if(b)run(r.selected_layer,+b.dataset.r,+b.dataset.c);};
  }
  $('#rf-run').onclick=()=>run();await run();
}
