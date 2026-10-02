import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const base = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function files(dir) { return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(resolve(dir,e.name)):[resolve(dir,e.name)]); }
const js = files(resolve(base,'app/static/js')).filter(f=>f.endsWith('.js'));
for(const f of js) { const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'}); assert.equal(r.status,0,r.stderr); }
async function locale(name) { return (await import('data:text/javascript;base64,'+Buffer.from(readFileSync(resolve(base,'app/static/js/locales',name),'utf8')).toString('base64'))).default; }
function flatten(o,p='') { return Object.fromEntries(Object.entries(o).flatMap(([k,v])=>typeof v==='object'?Object.entries(flatten(v,p+k+'.')):[[p+k,v]])); }
const zh=flatten(await locale('zh-CN.js')), en=flatten(await locale('en-US.js'));
assert.deepEqual(Object.keys(zh).sort(),Object.keys(en).sort());
for(const k of Object.keys(zh)) assert.deepEqual([...zh[k].matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),[...en[k].matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),k);
for (const f of js) {
  for (const m of readFileSync(f,'utf8').matchAll(/\bt\(\s*['"]([\w.]+)['"]/g)) assert.ok(m[1] in zh, `Missing locale key: ${m[1]}`);
}
class Element { constructor(){this.children=[];this.dataset={};this.classList={toggle(){}};} replaceChildren(...cs){this.children=cs;} addEventListener(){} }
const els = Object.fromEntries(['nav','brand-sub','sidebar-footer','page-title','page-desc','page-content'].map(k=>[k,new Element()]));
let release; const delayed = new Promise(r=>{release=r;}); let oldRoot, newRoot, disposed=0;
const ctx = vm.createContext({document:{getElementById:k=>els[k],querySelectorAll:()=>[],createElement:()=>new Element(),documentElement:{}},window:{addEventListener(){},scrollTo(){}},location:{hash:'#tensor'},console,t:k=>zh[k]??k,raw:k=>({zh:zh[k],en:en[k]}),getMode:()=> 'zh',setMode(){},onLanguageChange(){},loadModule:async mod=>mod==='tensor'?delayed:{render:async root=>{newRoot=root;return ()=>disposed++;}}});
let shell = readFileSync(resolve(base,'app/static/js/app.js'),'utf8').replace(/^import .*;$/m,'').replace('await import(`./pages/${mod}.js`)','await loadModule(mod)');
vm.runInContext(shell+'\nglobalThis.navigate=showPage;',ctx);
await ctx.navigate('activations');
release({render:async root=>{oldRoot=root;}});
await new Promise(r=>setImmediate(r));
assert.equal(oldRoot,undefined,'stale import must not render');
assert.equal(els['page-content'].children[0],newRoot);
await ctx.navigate('tensor');
assert.equal(disposed,1,'navigation disposes active page');
assert.notEqual(oldRoot,newRoot,'async callbacks must retain a dedicated mount');
await ctx.navigate('');
assert.equal(els['page-title'].textContent,zh['pages.home.title'],'empty route opens Learning Path');
await ctx.navigate('missing-page');
assert.equal(els['page-title'].textContent,zh['pages.home.title'],'unknown route opens Learning Path');
const home = readFileSync(resolve(base,'app/static/js/pages/home.js'),'utf8');
const steps = JSON.parse(home.match(/LEARNING_STEPS = (.*);/)[1]);
assert.equal(steps.length,15);
for(const [id,level,topic] of steps) {
  assert.ok(new RegExp(`\\b${id}:`).test(shell),`Unknown lab link: ${id}`);
  for(const k of [`nav.${id}`,`home.steps.${id}`,`home.level.${level}`,`home.topic.${topic}`]) assert.ok(k in zh,k);
}
const paths = JSON.parse(home.match(/RECOMMENDED_PATHS = (.*);/)[1]);
assert.deepEqual(Object.keys(paths),['foundations','vision','attention']);
for(const [id,labs] of Object.entries(paths)) {
  assert.equal(labs[0],'tensor');
  for(const lab of labs) assert.ok(steps.some(step=>step[0]===lab),`Unknown recommended link: ${lab}`);
  for(const field of ['title','desc','hint']) assert.ok(`home.paths.${id}.${field}` in zh);
}
// Execute the actual animation renderer with a known padded identity-kernel fixture.
// Original bug read unpadded values: output[0,4]=0.4, displayed sum=0.
const cnnSource = readFileSync(resolve(base,'app/static/js/pages/cnn.js'),'utf8').replace(/^import .*;$/gm,'').replace('export async function render','async function render');
const cnnEls = Object.fromEntries(['c-preset','c-stride','c-padding','c-error','c-sv','c-pv','c-shape','c-formula','c-in','c-k','c-out','c-detail','c-run','c-play'].map(id=>[id,{value:id==='c-padding'?'1':'1'}]));
const image = [[0,0.4],[0,1]], padded = [[0,0,0,0],[0,0,0.4,0],[0,0,1,0],[0,0,0,0]];
let tick, cancelled=false, drawnInput;
const cnnContext=vm.createContext({api:async()=>({input:image,padded_input:padded,kernel:[[0,0,0],[0,1,0],[0,0,0]],input_shape:[2,2],output_shape:[2,2],windows:[[0,0],[0,1],[1,0],[1,1]],output:[[0,0.4],[0,1]]}),heatmap:(el,values)=>{if(el===cnnEls['c-in'])drawnInput=values;},t:(key,args)=>key==='cnn.sum'?'SUM=':key==='cnn.products'?args.products:key,errText:String,setInterval:fn=>{tick=fn;return 1;},clearInterval:()=>{cancelled=true;}});
vm.runInContext(cnnSource+'\nglobalThis.renderCNN=render;',cnnContext);
const disposeCNN=await cnnContext.renderCNN({querySelector:id=>cnnEls[id.slice(1)]});
cnnEls['c-play'].onclick(); tick(); tick();
assert.ok(cnnEls['c-detail'].innerHTML.includes('SUM=<b>0.400</b>'),'animated window must match padded output');
assert.deepEqual(drawnInput,padded,'input visualization includes real zero padding');
disposeCNN(); assert.equal(cancelled,true,'leaving CNN stops animation');
console.log(`JS syntax: ${js.length} passed; i18n: ${Object.keys(zh).length} keys aligned, placeholders aligned; lifecycle: 6 assertions passed; Learning Path: 15 valid lab links, 3 valid recommended routes; CNN animation: 3 regressions passed`);
