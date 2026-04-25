self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estratégia network-first para API, cache-first para assets estáticos
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.url.includes('/api/') || req.url.includes('/auth/')) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((response) => {
        const clone = response.clone();
        caches.open('preprueba-v1').then((cache) => {
          cache.put(req, clone);
        });
        return response;
      }).catch(() => {
        if (req.destination === 'document') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
