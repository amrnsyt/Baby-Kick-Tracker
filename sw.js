const CACHE_NAME = 'little-kicks-cache-v2';
const ASSETS = [
  '/Baby-Kick-Tracker/',
  '/Baby-Kick-Tracker/index.html',
  '/Baby-Kick-Tracker/manifest.json',
  '/Baby-Kick-Tracker/icon.svg'
];

// Install Event - Cache Core Assets securely
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Evict old cache configurations
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => clients.claim())
  );
});

// Fetch Event - Absolute validation layer required by Chrome
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then(response => {
        if (response) return response;
        return new Response('Asset not tracked in offline matrix cache.');
      });
    })
  );
});

// Push Notification Listener
self.addEventListener('push', e => {
  const options = {
    body: e.data ? e.data.text() : 'New activity synced!',
    icon: '/Baby-Kick-Tracker/icon.svg',
    vibrate: [300, 100, 300],
    badge: '/Baby-Kick-Tracker/icon.svg'
  };
  e.waitUntil(self.registration.showNotification('Little Kicks Tracker', options));
});
