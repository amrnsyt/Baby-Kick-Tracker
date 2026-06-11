const CACHE_NAME = 'little-kicks-cache-v3';
const ASSETS = [
  '/Baby-Kick-Tracker/',
  '/Baby-Kick-Tracker/index.html',
  '/Baby-Kick-Tracker/manifest.json'
];

// Install Event - Simpan Core Assets ke dalam Cache Storage
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Buang Cache Lama jika ada kemas kini struktur
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

// Fetch Event - Mengendalikan Request ketika peranti offline
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then(response => {
        if (response) return response;
        return new Response('Asset offline tidak ditemui.');
      });
    })
  );
});

// Push Notification Listener - Menangkap isyarat daripada Cloud Trigger
self.addEventListener('push', e => {
  let messageData = 'Ada data tracker baru masuk! 👶';
  
  if (e.data) {
    try {
      const json = e.data.json();
      messageData = json.notification?.body || json.body || messageData;
    } catch (err) {
      messageData = e.data.text() || messageData;
    }
  }

  const options = {
    body: messageData,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23FF7A90" width="192" height="192"/><text x="96" y="140" font-size="100" font-weight="bold" text-anchor="middle" fill="white">👶</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23FF7A90" width="192" height="192"/><text x="96" y="140" font-size="100" font-weight="bold" text-anchor="middle" fill="white">👶</text></svg>',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'open_app', title: 'Buka Little Kicks' }
    ]
  };

  e.waitUntil(
    self.registration.showNotification('Little Kicks Tracker', options)
  );
});

// Klik pada Notification automatik fokus/buka aplikasi
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/Baby-Kick-Tracker/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/Baby-Kick-Tracker/');
      }
    })
  );
});
