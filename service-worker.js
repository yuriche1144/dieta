const CACHE_NAME = 'dieta-v25';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}: ${response.status}`);
                }
                return cache.put(url, response);
              })
              .catch(err => {
                console.error(`Failed to cache ${url}:`, err);
                throw err;
              });
          })
        );
      })
      .then(() => {
        console.log('All files cached successfully');
      })
      .catch(err => {
        console.error('Cache install failed:', err);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(err => {
        console.log('Fetch failed:', err);
        return fetch(event.request);
      })
  );
});
