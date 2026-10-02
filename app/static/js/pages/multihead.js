import { api } from '../api.js';
import { t } from '../i18n.js';
import { table, numberField, error, invalidJson, esc } from '../lab.js';
import { attentionMap, attentionStages } from '../attention-view.js';

export async function render(root){
  root.innerHTML=`<div class="panel"><div class="controls"><div class="field"><label for="mh-tokens">${t('attention.tokens')}</label><input type="text" id="mh-tokens" value="我 学习 注意力"></div><div class="field"><label for="mh-values">X [N,d_model] (JSON)</label><textarea id="mh-values" rows="4" cols="36">[[1,0,0,1],[0,1,0,1],[0,0,1,1]]</textarea></div>${numberField('mh-heads','multihead.heads',2,1,8)}${numberField('mh-seed','attention.seed',0,0,4294967295)}<button id="mh-run">${t('common.compute')}</button></div><p class="hint lab-note">${t('attention.note')}</p><p class="hint">${t('multihead.note')}</p><div id="mh-error"></div></div><div id="mh-result"></div>`;
  const $=id=>root.querySelector(id);let data,version=0;
  async function run(){error($('#mh-error'),null);let values;try{values=JSON.parse($('#mh-values').value);}catch{invalidJson($('#mh-error'));return;}
    const request=++version;$('#mh-run').disabled=true;
    try{const r=await api('/multihead',{values,tokens:$('#mh-tokens').value.trim().split(/\s+/),num_heads:+$('#mh-heads').value,seed:+$('#mh-seed').value});if(!root.isConnected||request!==version)return;data=r;
      $('#mh-result').innerHTML=`<div class="panel"><p class="lab-formula">d_model = ${r.d_model} · h = ${r.num_heads} · d_k = d_v = ${r.d_head}</p><p class="lab-formula">head_i = softmax(XWq_i · (XWk_i)ᵀ / √d_k) XWv_i</p><p class="lab-formula">Concat(head_0,…,head_${r.num_heads-1}) [${r.tokens.length},${r.d_model}] · Wo [${r.d_model},${r.d_model}] → Y [${r.tokens.length},${r.d_model}]</p><div class="controls"><div class="field"><label for="mh-query">${t('attention.query')}</label><select id="mh-query">${r.tokens.map((x,i)=>`<option value="${i}">${i}: ${esc(x)}</option>`).join('')}</select></div><div class="field"><label for="mh-head">${t('multihead.inspect')}</label><select id="mh-head">${r.heads.map((_,i)=>`<option value="${i}">${t('multihead.head',{i})}</option>`).join('')}</select></div></div></div><div id="mh-views"></div>`;
      $('#mh-query').onchange=draw;$('#mh-head').onchange=draw;draw();
    }catch(e){if(root.isConnected&&request===version)error($('#mh-error'),e);}finally{if(request===version)$('#mh-run').disabled=false;}
  }
  function draw(){const r=data,query=+$('#mh-query').value,head=+$('#mh-head').value,h=r.heads[head];
    $('#mh-views').innerHTML=`<div class="grid-2">${r.heads.map((v,i)=>`<div class="panel"><h3>${t('multihead.head',{i})} · A [${r.tokens.length},${r.tokens.length}]</h3>${attentionMap(v.weights,r.tokens,query)}<h3>${t('multihead.headOutput')} [${r.tokens.length},${r.d_head}]</h3>${table(v.output,i=>i===query)}</div>`).join('')}</div>
      <div class="grid-3"><div class="panel"><h3>${t('multihead.concat')} [${r.tokens.length},${r.d_model}]</h3>${table(r.concat,i=>i===query)}</div><div class="panel"><h3>Wo [${r.d_model},${r.d_model}]</h3>${table(r.Wo)}</div><div class="panel"><h3>${t('multihead.projected')} Y = Concat · Wo</h3>${table(r.output,i=>i===query)}</div></div>
      <div class="panel"><h3>${t('multihead.head',{i:head})} · ${t('multihead.projections')}</h3><div class="grid-3">${['Wq','Wk','Wv'].map(k=>`<div><p class="lab-formula">${k}_${head} [${r.d_model},${r.d_head}]</p>${table(h[k])}</div>`).join('')}</div></div><div id="mh-stages">${attentionStages(h,r.tokens,query)}</div>`;
  }
  $('#mh-run').onclick=run;await run();
}
