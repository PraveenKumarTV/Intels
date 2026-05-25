const CACHE_NAME = 'notes-pwa-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', (event) => {

  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  // API requests → NETWORK FIRST
  if (event.request.url.includes('/api/')) {

    event.respondWith(
      fetch(event.request)
        .then((response) => {

          // Update cache with latest API response
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(async () => {

          // Offline fallback
          const cachedResponse = await caches.match(event.request);

          return (
            cachedResponse ||
            new Response(
              JSON.stringify({
                error: 'Offline - API unavailable'
              }),
              {
                status: 503,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            )
          );
        })
    );

    return;
  }

  // HTML pages → NETWORK FIRST
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document'
  ) {

    event.respondWith(
      fetch(event.request)
        .then((response) => {

          // Save latest page in cache
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(async () => {

          // Offline fallback
          return (
            await caches.match(event.request) ||
            caches.match('/index.html')
          );
        })
    );

    return;
  }

  // Static assets → STALE WHILE REVALIDATE
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });

          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});