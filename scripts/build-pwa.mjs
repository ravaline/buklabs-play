import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const project=fileURLToPath(new URL('../',import.meta.url));
const root=path.join(project,'dist');
async function walk(dir){const files=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())files.push(...await walk(p));else if(p!==path.join(root,'sw.js'))files.push('./'+path.relative(root,p).split(path.sep).join('/'));}return files;}
const assets=(await walk(root)).sort();const hash=createHash('sha256');
for(const asset of assets){hash.update(asset);hash.update(await readFile(path.join(root,asset)));}
const version='buklabs-play-'+hash.digest('hex').slice(0,12);
const template=await readFile(path.join(project,'scripts/sw-template.js'),'utf8');
await writeFile(path.join(root,'sw.js'),template.replace('__VERSION__',JSON.stringify(version)).replace('__ASSETS__',JSON.stringify(assets,null,2)));
console.log(`${version}: ${assets.length} archivos preparados para uso sin conexión.`);
