// Numerical attention views shared by single- and multi-head labs.
import { t } from './i18n.js';
import { table, fmt, esc } from './lab.js';
export function attentionMap(weights,tokens,query){
  return `<div class="lab-scroll"><table class="matrix-table attention-map"><tr><th>Q ↓ / K →</th>${tokens.map(x=>`<th>${esc(x)}</th>`).join('')}</tr>${weights.map((row,i)=>`<tr class="${i===query?'query-row':''}"><th>${esc(tokens[i])}</th>${row.map(v=>`<td style="background:rgb(${Math.round(30+220*v)},${Math.round(60+120*v)},${Math.round(220-130*v)})">${fmt(v)}</td>`).join('')}</tr>`).join('')}</table></div><p class="hint lab-note">${t('attention.legend')}</p>`;
}
export function attentionStages(r,tokens,query){
  const contributions=r.V.map((v,j)=>v.map(x=>x*r.weights[query][j]));
  return `<div class="grid-3">${['Q','K','V'].map(k=>`<div class="panel"><h3>${k} [${r[k].length},${r[k][0].length}]</h3>${table(r[k],i=>i===query)}</div>`).join('')}</div>
    <div class="grid-2"><div class="panel"><h3>${t('attention.raw')} S = QKᵀ</h3>${table(r.raw_scores,i=>i===query)}</div><div class="panel"><h3>${t('attention.scaled')} S / √d_k · √d_k = ${fmt(r.scale)}</h3>${table(r.scaled_scores,i=>i===query)}</div></div>
    <div class="panel"><h3>${t('attention.weights')} A = softmax(S/√d_k)</h3>${attentionMap(r.weights,tokens,query)}<p class="lab-formula">Σ A[${query},:] = ${fmt(r.weights[query].reduce((a,b)=>a+b,0))}</p></div>
    <div class="grid-2"><div class="panel"><h3>${t('attention.contributions',{token:esc(tokens[query])})}</h3><p class="lab-formula">A[${query},j] · V[j,:]</p>${table(contributions)}<p class="hint lab-note">${t('attention.sum')}</p><p class="lab-formula">Y[${query},:] = [${r.output[query].map(fmt)}]</p></div><div class="panel"><h3>${t('attention.output')} Y = AV [${r.output.length},${r.output[0].length}]</h3>${table(r.output,i=>i===query)}</div></div>`;
}
