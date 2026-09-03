// const CACHE_NAME = 'transport-cache-v1';
// const urlsToCache = [
//   '/',
//   '/index.html',
//   '/manifest.json',
//   '/favicon.ico',
// ];

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
//   );
//   self.skipWaiting();
// });

// self.addEventListener('activate', (event) => {
//   const cacheWhitelist = [CACHE_NAME];
//   event.waitUntil(
//     caches
//       .keys()
//       .then((cacheNames) =>
//         Promise.all(
//           cacheNames.map((cacheName) => {
//             if (!cacheWhitelist.includes(cacheName)) {
//               return caches.delete(cacheName);
//             }
//             return null;
//           })
//         )
//       )
//       .then(() => clients.claim())
//   );
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       }
//       return fetch(event.request);
//     })
//   );
// });
