var v1 = 'my-site-cache-v1';
var urlsToCache = [
    '/e',
    '/e/index.html',
    '/e/home.html',
    '/e/kurse.html',
    '/e/login.html',
    '/e/profile.html',
    '/e/vplan.html',
    '/e/style/styles.css',
    '/e/script/script.js',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    // 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js'
    // 'https://www.gstatic.com/firebasejs/3.5.2/firebase.js'

];

// The SW will be shutdown when not in use to save memory,
// be aware that any global state is likely to disappear
console.log("SW startup");

self.addEventListener('install', function(event) {
    try {
        // Perform install steps
        event.waitUntil(
            caches.open(v1)
            .then(function(cache) {
                console.log('Opened cache');
                cache.addAll(urlsToCache.map(function(urlsToCache) {
                    return new Request(urlsToCache, {mode:"no-cors"});
                })).then(function() {
                    console.log('All resources have been fetched and cached.');
                });
            })
        );
    } catch (ex) {
        console.log(ex);
    }
});

self.addEventListener('activate', function(event) {
    console.log("SW activated");
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // IMPORTANT: Clone the request. A request is a stream and
            // can only be consumed once. Since we are consuming this
            // once by cache and once by the browser for fetch, we need
            // to clone the response.
            var fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
                function(response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    var responseToCache = response.clone();

                    caches.open(v1)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});
//
// // self.addEventListener('fetch', function(event) {
// //   console.log("HI");
// //   event.respondWith(
// //     caches.match(event.request).catch(function() {
// //       return fetch(event.request).then(function(response) {
// //         return caches.open(v1).then(function(cache) {
// //           cache.put(event.request, response.clone());
// //           return response;
// //         });
// //       });
// //     })
// //   );
// // });
//
// self.addEventListener('fetch', event => {
//
//   console.log("Hi");
//   // We only want to call event.respondWith() if this is a navigation request
//   // for an HTML page.
//   // request.mode of 'navigate' is unfortunately not supported in Chrome
//   // versions older than 49, so we need to include a less precise fallback,
//   // which checks for a GET request with an Accept: text/html header.
//   if (event.request.mode === 'navigate' ||
//       (event.request.method === 'GET' &&
//        event.request.headers.get('accept').includes('text/html'))) {
//     console.log('Handling fetch event for', event.request.url);
//     event.respondWith(
//       fetch(event.request).catch(error => {
//         // The catch is only triggered if fetch() throws an exception, which will most likely
//         // happen due to the server being unreachable.
//         // If fetch() returns a valid HTTP response with an response code in the 4xx or 5xx
//         // range, the catch() will NOT be called. If you need custom handling for 4xx or 5xx
//         // errors, see https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/fallback-response
//         console.log('Fetch failed; returning offline page instead.', error);
//         return caches.match(OFFLINE_URL);
//       })
//     );
//   }
//   console.log("Hi");
//   // If our if() condition is false, then this fetch handler won't intercept the request.
//   // If there are any other fetch handlers registered, they will get a chance to call
//   // event.respondWith(). If no fetch handlers call event.respondWith(), the request will be
//   // handled by the browser as if there were no service worker involvement.
// });
