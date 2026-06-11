const CACHE_NAME = 'little-kicks-cache-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon.svg'
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
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => clients.claim())
  );
});

// Fetch Event - Crucial for Chrome PWA Installation validation
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then(response => {
        if (response) return response;
        return new Response('Offline asset not found.');
      });
    })
  );
});

// Push Notification Listener
self.addEventListener('push', e => {
  const options = {
    body: e.data ? e.data.text() : 'New activity synced!',
    icon: 'icon.svg',
    vibrate: [300, 100, 300],
    badge: 'icon.svg'
  };
  e.waitUntil(self.registration.showNotification('Little Kicks Tracker', options));
});
