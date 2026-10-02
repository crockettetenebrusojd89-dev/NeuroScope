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
class Element { constructor(){this.children=[];this.dataset={};this.classList={toggle(){}};} replaceChildren(...cs){this.children=cs;} addEventListener(){} }
const els = Object.fromEntries(['nav','brand-sub','sidebar-footer','page-title','page-desc','page-content'].map(k=>[k,new Element()]));
let release; const delayed = new Promise(r=>{release=r;}); let oldRoot, newRoot, disposed=0;
const ctx = vm.createContext({document:{getElementById:k=>els[k],querySelectorAll:()=>[],createElement:()=>new Element(),documentElement:{}},window:{addEventListener(){}},location:{hash:'#tensor'},console,t:k=>zh[k]??k,raw:k=>({zh:zh[k],en:en[k]}),getMode:()=> 'zh',setMode(){},onLanguageChange(){},loadModule:async mod=>mod==='tensor'?delayed:{render:async root=>{newRoot=root;return ()=>disposed++;}}});
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
console.log(`JS syntax: ${js.length} passed; i18n: ${Object.keys(zh).length} keys aligned, placeholders aligned; lifecycle: 4 assertions passed`);
