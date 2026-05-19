const CACHE_NAME = 'xaynha-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/utils.js',
  './js/data.js',
  './js/dashboard.js',
  './js/categories.js',
  './js/transactions.js',
  './js/reports.js',
  './js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
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
  );
});
