const CACHE_NAME = 'paidegua-cache-20260814-final-entrega-v8';
const CORE = ['/', '/index.html', '/css/styles.css?v=20260814-final-entrega-v8', '/js/menu.js?v=20260814-final-entrega-v8', '/js/app.js?v=20260814-final-entrega-v8', '/manifest.webmanifest', '/assets/brand/logo-pizza-official.png', '/assets/brand/icon-256.png'];
self.addEventListener('install', event => { event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await Promise.allSettled(CORE.map(url=>cache.add(url)));self.skipWaiting();})()); });
self.addEventListener('activate', event => { event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();})()); });
self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        const cache=await caches.open(CACHE_NAME);
        cache.put('/index.html',fresh.clone());
        return fresh;
      }catch{
        return (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(req);
    const refresh=fetch(req).then(async fresh=>{
      if(fresh.ok){
        const cache=await caches.open(CACHE_NAME);
        await cache.put(req,fresh.clone());
      }
      return fresh;
    }).catch(()=>null);

    if(cached){
      event.waitUntil(refresh);
      return cached;
    }
    return (await refresh) || new Response('',{status:504,statusText:'Offline'});
  })());
});
