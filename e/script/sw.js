var v1 = 'my-site-cache-v1';
var urlsToCache = [
  '/e/index.html',
  '/e/style/styles.css',
  '/e/script/script.js'
  // 'https://www.gstatic.com/firebasejs/3.5.2/firebase.js'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(v1)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// self.addEventListener('fetch', function(event) {
//   console.log("HI");
//   event.respondWith(
//     caches.match(event.request).catch(function() {
//       return fetch(event.request).then(function(response) {
//         return caches.open(v1).then(function(cache) {
//           cache.put(event.request, response.clone());
//           return response;
//         });
//       });
//     })
//   );
// });

self.addEventListener('fetch', event => {

  console.log("Hi");
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  // request.mode of 'navigate' is unfortunately not supported in Chrome
  // versions older than 49, so we need to include a less precise fallback,
  // which checks for a GET request with an Accept: text/html header.
  if (event.request.mode === 'navigate' ||
      (event.request.method === 'GET' &&
       event.request.headers.get('accept').includes('text/html'))) {
    console.log('Handling fetch event for', event.request.url);
    event.respondWith(
      fetch(event.request).catch(error => {
        // The catch is only triggered if fetch() throws an exception, which will most likely
        // happen due to the server being unreachable.
        // If fetch() returns a valid HTTP response with an response code in the 4xx or 5xx
        // range, the catch() will NOT be called. If you need custom handling for 4xx or 5xx
        // errors, see https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/fallback-response
        console.log('Fetch failed; returning offline page instead.', error);
        return caches.match(OFFLINE_URL);
      })
    );
  }
  console.log("Hi");
  // If our if() condition is false, then this fetch handler won't intercept the request.
  // If there are any other fetch handlers registered, they will get a chance to call
  // event.respondWith(). If no fetch handlers call event.respondWith(), the request will be
  // handled by the browser as if there were no service worker involvement.
});
