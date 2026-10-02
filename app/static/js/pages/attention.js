import { api } from '../api.js';
import { t } from '../i18n.js';
import { table, numberField, error, invalidJson, esc } from '../lab.js';
import { attentionStages } from '../attention-view.js';

export async function render(root){
  root.innerHTML=`<div class="panel"><div class="controls"><div class="field"><label for="at-tokens">${t('attention.tokens')}</label><input type="text" id="at-tokens" value="我 学习 注意力"></div><div class="field"><label for="at-values">X [N,D] (JSON)</label><textarea id="at-values" rows="4" cols="36">[[1,0,0,1],[0,1,0,1],[0,0,1,1]]</textarea></div>${numberField('at-dk','attention.dk',2,1,16)}${numberField('at-seed','attention.seed',0,0,4294967295)}<button id="at-run">${t('common.compute')}</button></div><p class="hint lab-note">${t('attention.note')}</p><div id="at-error"></div></div><div id="at-result"></div>`;
  const $=id=>root.querySelector(id);let data,version=0;
  async function run(){error($('#at-error'),null);let values;try{values=JSON.parse($('#at-values').value);}catch{invalidJson($('#at-error'));return;}
    const request=++version;$('#at-run').disabled=true;
    try{const r=await api('/attention',{values,tokens:$('#at-tokens').value.trim().split(/\s+/),dk:+$('#at-dk').value,seed:+$('#at-seed').value});if(!root.isConnected||request!==version)return;data=r;
      $('#at-result').innerHTML=`<div class="panel"><p class="lab-formula">Q = XWq · K = XWk · V = XWv · Y = softmax(QKᵀ/√d_k)V</p><div class="field"><label for="at-query">${t('attention.query')}</label><select id="at-query">${r.tokens.map((x,i)=>`<option value="${i}">${i}: ${esc(x)}</option>`).join('')}</select></div></div><div class="grid-3">${['Wq','Wk','Wv'].map(k=>`<div class="panel"><h3>${k} [${r[k].length},${r.dk}]</h3>${table(r[k])}</div>`).join('')}</div><div id="at-stages"></div>`;
      $('#at-query').onchange=draw;draw();
    }catch(e){if(root.isConnected&&request===version)error($('#at-error'),e);}finally{if(request===version)$('#at-run').disabled=false;}
  }
  function draw(){$('#at-stages').innerHTML=attentionStages(data,data.tokens,+$('#at-query').value);}
  $('#at-run').onclick=run;await run();
}
