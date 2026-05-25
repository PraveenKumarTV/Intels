const CACHE_NAME = 'notes-pwa-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',

  // External CDN assets
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];


// ======================
// INSTALL
// ======================
self.addEventListener('install', (event) => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});


// ======================
// ACTIVATE
// ======================
self.addEventListener('activate', (event) => {

  event.waitUntil(
    caches.keys().then((cacheNames) => {

      return Promise.all(
        cacheNames.map((cacheName) => {

          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }

        })
      );

    })
  );

  self.clients.claim();
});


// ======================
// FETCH
// ======================
self.addEventListener('fetch', (event) => {

  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }


  // Ignore Firebase & Google APIs
  if (
    event.request.url.includes('firebase') ||
    event.request.url.includes('googleapis') ||
    event.request.url.includes('gstatic')
  ) {
    return;
  }


  // ======================
  // API REQUESTS
  // NETWORK FIRST
  // ======================
  if (event.request.url.includes('/api/')) {

    event.respondWith(

      fetch(event.request)

        .then((networkResponse) => {

          // Cache successful API responses
          if (
            networkResponse &&
            networkResponse.status === 200
          ) {

            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });

          }

          return networkResponse;
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


  // ======================
  // HTML PAGES
  // NETWORK FIRST
  // ======================
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document'
  ) {

    event.respondWith(

      fetch(event.request)

        .then((networkResponse) => {

          // Cache latest HTML
          if (
            networkResponse &&
            networkResponse.status === 200
          ) {

            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });

          }

          return networkResponse;
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


  // ======================
  // STATIC ASSETS
  // STALE WHILE REVALIDATE
  // ======================
  event.respondWith(

    caches.match(event.request)

      .then((cachedResponse) => {

        const fetchPromise = fetch(event.request)

          .then((networkResponse) => {

            // Cache successful responses only
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {

              const responseClone = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });

            }

            return networkResponse;
          })

          .catch(() => {
            return cachedResponse;
          });

        // Return cached immediately, update in background
        return cachedResponse || fetchPromise;

      })

  );

});