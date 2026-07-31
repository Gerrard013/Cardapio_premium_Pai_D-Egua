const CACHE='paidegua-final-2026-07-31-v4';
const CORE=[
  '/',
  '/index.html',
  '/offline.html',
  '/assets/css/styles.css?v=20260731-final4',
  '/assets/css/intro-3d.css?v=20260731-final4',
  '/assets/css/product-motion.css?v=20260731-final4',
  '/assets/js/app.js?v=20260731-final4',
  '/assets/js/intro-3d.js?v=20260731-final4',
  '/assets/js/product-motion.js?v=20260731-final4',
  '/content/site-data.json',
  '/content/catalogo-final.json',
  '/assets/img/brand/logo-light.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put('/index.html',copy));
          return response;
        })
        .catch(()=>caches.match('/index.html').then(hit=>hit||caches.match('/offline.html')))
    );
    return;
  }

  const isImage=event.request.destination==='image';
  if(isImage){
    event.respondWith(
      caches.match(event.request).then(hit=>{
        if(hit)return hit;
        return fetch(event.request).then(response=>{
          if(response&&response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});
