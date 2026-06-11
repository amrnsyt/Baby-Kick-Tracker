const CACHE_NAME = 'little-kicks-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install Event - Cache Core Assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// Fetch Event - Crucial for Chrome PWA Installation validation
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Push Notification Listener
self.addEventListener('push', e => {
  const options = {
    body: e.data ? e.data.text() : 'New activity synced!',
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 192 192%22><rect fill=%22%23FF7A90%22 width=%22192%22 height=%22192%22/><text x=%2296%22 y=%22140%22 font-size=%22100%22 text-anchor=%22middle%22 fill=%22white%22>👶</text></svg>',
    vibrate: [300, 100, 300],
    badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 192 192%22><rect fill=%22%23FF7A90%22 width=%22192%22 height=%22192%22/></svg>'
  };
  e.waitUntil(self.registration.showNotification('Little Kicks Tracker', options));
});
