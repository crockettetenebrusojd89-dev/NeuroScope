// Verify repo-local Markdown links and release image files without network access.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const docs=[...readdirSync(root).filter(f=>f.endsWith('.md')).map(f=>resolve(root,f)),...readdirSync(resolve(root,'docs')).filter(f=>f.endsWith('.md')).map(f=>resolve(root,'docs',f))];
let links=0, images=0;
for(const file of docs){
  const source=readFileSync(file,'utf8').replace(/```[\s\S]*?```/g,'');
  for(const match of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
    const target=match[1].split('#')[0];
    if(!target||/^[a-z]+:/i.test(target))continue;
    const path=resolve(dirname(file),target);
    assert.ok(existsSync(path),`${file}: broken link ${target}`);links++;
    if(['.jpg','.png','.gif'].includes(extname(path)))images++;
  }
}
const shots=['home','playground','backprop','cnn','attention','multihead'];
for(const name of shots){const bytes=readFileSync(resolve(root,`docs/screenshots/${name}-en.jpg`));assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);}
for(const name of ['decision-boundary','optimizer-comparison','attention-visualization']){const bytes=readFileSync(resolve(root,`docs/demos/${name}.gif`));assert.match(bytes.subarray(0,6).toString(),/^GIF8[79]a$/);}
console.log(`Documentation: ${docs.length} files, ${links} local links (${images} image references), 6 primary screenshots and 3 GIFs passed`);
