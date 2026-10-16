/* All three games share one offline installation. */
'use strict';
const CACHE=__VERSION__;
const ASSETS=__ASSETS__;
const ROOT=new URL('./',self.registration.scope);
const URLS=ASSETS.map(path=>new URL(path,ROOT).href);
function canonical(raw){const u=new URL(raw);if(u.origin!==ROOT.origin||!u.pathname.startsWith(ROOT.pathname))return null;u.search='';u.hash='';if(u.pathname.endsWith('/'))u.pathname+='index.html';return URLS.includes(u.href)?u.href:null;}
async function complete(){const cache=await caches.open(CACHE);return (await Promise.all(URLS.map(url=>cache.match(url)))).every(Boolean);}
async function notify(client){const type=await complete()?'BUK_OFFLINE_READY':'BUK_OFFLINE_UNAVAILABLE';client?.postMessage({type});}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{
  await Promise.all(URLS.map(async url=>{
   const fetchUrl=url.endsWith('/index.html')?url.slice(0,-10):url;
   const response=await fetch(fetchUrl,{cache:'reload',credentials:'same-origin'});
   if(!response.ok||response.redirected)throw Error('Could not cache '+new URL(url).pathname);
   const type=response.headers.get('content-type')||'';
   if(url.endsWith('.html')){const text=await response.clone().text();if(!text.includes('BUKLABS'))throw Error('Unexpected HTML');}
   else if(/\.(js|css|png|svg|webmanifest)$/.test(new URL(url).pathname)&&type.includes('text/html'))throw Error('Unexpected response');
   await cache.put(url,response);
  }));
  if(!await complete())throw Error('Incomplete cache');
  await self.skipWaiting();
 }catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await self.clients.claim();
 for(const key of await caches.keys())if(key.startsWith('buklabs-play-')&&key!==CACHE)await caches.delete(key);
 for(const client of await self.clients.matchAll())await notify(client);
})()));
self.addEventListener('message',event=>{if(event.data?.type==='BUK_OFFLINE_STATUS')event.waitUntil(notify(event.source));});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=canonical(event.request.url);if(!url)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);const saved=await cache.match(url);if(saved)return saved;
  try{return await fetch(event.request);}catch{return new Response('Abre BUKLABS Play con internet para guardar este juego.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
 })());
});
