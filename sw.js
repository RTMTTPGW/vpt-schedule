const CACHE_NAME = 'vpt-v1';
const STATIC = [
  '/vpt-schedule/',
  '/vpt-schedule/index.html',
  '/vpt-schedule/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // API запросы — только сеть
  if (e.request.url.includes('railway.app')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Статика — кэш с обновлением
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
        return res;
      });
      return cached || network;
    })
  );
});
