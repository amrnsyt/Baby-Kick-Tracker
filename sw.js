const CACHE_NAME = 'little-kicks-v3';
const ASSETS = [
  '/Baby-Kick-Tracker/',
  '/Baby-Kick-Tracker/index.html',
  '/Baby-Kick-Tracker/manifest.json',
  '/Baby-Kick-Tracker/icon.svg'
];

// 1. Install Service Worker & Cache Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Little Kicks PWA: Assets caching success');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Service Worker & Clear Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Little Kicks PWA: Clearing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Network First, Fallback to Cache
self.addEventListener('fetch', event => {
  // Hanya intercept request daripada origin yang sama (elakkan isu Firebase/External API)
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});
