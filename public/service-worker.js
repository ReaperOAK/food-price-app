// Service Worker for Today Egg Rates PWA
const CACHE_NAME = 'todayeggrates-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Assets to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/eggpic.png',
  '/Favicon.ico',
  '/manifest.json',
  '/static/css/main.37052b51.css',
  '/static/js/main.js'
];

// Install event - cache important assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete outdated caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle differently based on request type
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip requests that aren't http/https
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Handle navigation requests specially to not interfere with React Router
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      // Try the network first
      fetch(event.request).catch(() => {
        // If network fails, fall back to the cached index.html for client-side routing
        return caches.match('/index.html');
      })
    );
    return;
  }

  // For API requests, use network-first strategy
  if (event.request.url.includes('/api/') || event.request.url.includes('/php/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response and store in cache
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE)
            .then(cache => {
              // Only cache successful API responses
              if (response.ok) {
                cache.put(event.request, responseToCache);
              }
            });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For static assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response from cache
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/eggpic.png',
    badge: '/Favicon.ico',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Today Egg Rates', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});