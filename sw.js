const CACHE_NAME = 'supervila-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './assets/logo_supervila.png'
];

// Instalação e Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Responde com Cache ou Rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
