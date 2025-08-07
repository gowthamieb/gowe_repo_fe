/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'gym-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-gym.png',
//   '/icons/icon-512x512.png',
];

// ✅ Install event: Cache essential static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('[SW] Install failed:', err);
      })
  );
});

// ✅ Activate event: Remove old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ✅ Fetch event: Serve cached resources or fall back to network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore requests with unsupported protocols (e.g., chrome-extension://)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(networkResponse => {
            // Only cache valid responses
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== 'basic'
            ) {
              return networkResponse;
            }

            // Clone and store in cache
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clonedResponse);
            });

            return networkResponse;
          });
      })
      .catch(() => {
        // Serve offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});
