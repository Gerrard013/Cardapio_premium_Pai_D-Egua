const VERSION = "paidegua-v7.0.0-ultra-final-groq";
const CORE_CACHE = `${VERSION}-core`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const CORE = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/assets/css/styles.css",
  "/assets/css/modelo-2.css",
  "/assets/css/ultra-final.css",
  "/assets/css/variables.css",
  "/assets/css/base.css",
  "/assets/css/components.css",
  "/assets/css/responsive.css",
  "/assets/js/store-config.js",
  "/assets/js/ultra-data.js",
  "/assets/js/units.js",
  "/assets/js/menu.js",
  "/assets/js/pwa.js",
  "/assets/js/app.js",
  "/assets/js/modelo-2.js",
  "/assets/js/ultra-final.js",
  "/assets/img/hero/hero-pizza.webp",
  "/assets/img/ultra/rute-cley-historia.webp",
  "/assets/img/ultra/aniversario-paidegua.webp",
  "/assets/img/social/og-paidegua.webp",
  "/icons/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => ![CORE_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/index.html")) || caches.match("/offline.html"))
    );
    return;
  }

  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
      return response;
    }))
  );
});
