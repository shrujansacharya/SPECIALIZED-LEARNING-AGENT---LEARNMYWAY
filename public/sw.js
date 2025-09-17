// public/sw.js
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    event.waitUntil(
      caches.open('owl-buddy-cache-v1').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/owl-avatar.png',
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
  });