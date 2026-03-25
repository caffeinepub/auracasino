// AuraCasino Service Worker
// Cache version is set to a timestamp at install time — each new deploy gets a fresh SW file,
// which triggers a new install and wipes the old cache automatically.
const CACHE_VERSION = 'auracasino-' + Date.now();
const ASSET_CACHE = CACHE_VERSION + '-assets';

// Patterns for immutable hashed assets (Vite injects content hash in filenames)
const HASHED_ASSET_RE = /\/assets\/[^/]+\.[a-f0-9]{8,}\.(js|css|woff2?|png|jpg|svg)$/;

self.addEventListener('install', (event) => {
  // Activate immediately — don't wait for old SW to finish
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith('auracasino-' + Date.now().toString().slice(0, 7)))
          .map((k) => caches.delete(k))
      )
    ).then(() => {
      // Take control of all open tabs immediately
      return self.clients.claim();
    }).then(() => {
      // Notify all clients that a new version is active so they can reload
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never intercept API calls or cross-origin requests
  if (url.pathname.startsWith('/api') || url.hostname !== self.location.hostname) return;

  // NAVIGATION (HTML pages) — always network-first so players see the latest build
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // HASHED ASSETS (JS/CSS with content hash in filename) — cache-first, never expires
  if (HASHED_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // EVERYTHING ELSE (manifest, icons, etc.) — network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(ASSET_CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
