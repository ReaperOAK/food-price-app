// Service Worker for Today Egg Rates
const CACHE_NAME = 'eggrates-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/eggpic.png',
  '/desiegg.jpg',
  '/eggchicken.jpg',
  '/eggrate2.jpg',
  '/eggrate3.jpg',
  '/static/css/main.70e6da12.css',
  '/static/js/main.js',
  // Add other critical assets here
];

// Install event - cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }

        // Not in cache - return the result from the network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response
            let responseToCache = networkResponse.clone();

            // Don't cache API responses
            if (!event.request.url.includes('/api/') && !event.request.url.includes('chrome-extension://')) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return networkResponse;
          }
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-egg-rates') {
    event.waitUntil(syncEggRates());
  }
});

// Helper function to process background syncs
async function syncEggRates() {
  try {
    // Get saved form data from IndexedDB
    const db = await openIndexedDB();
    const transaction = db.transaction('offlineData', 'readwrite');
    const store = transaction.objectStore('offlineData');
    const formData = await store.getAll();

    // Process each form data entry
    for (const data of formData) {
      // Send data to server
      await fetch('/api/rates/add_rate.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Delete from IndexedDB after successful sync
      await store.delete(data.id);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper function to open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offlineEggRatesDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
