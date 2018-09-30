const version = "0.0.2";
const cacheName = `resto-review-${version}`;
self.addEventListener('install', e => {
    const timeStamp = Date.now();
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll([
                `/`,
                `/index.html`,
                `/restaurant.html?id=1`,
                `/restaurant.html?id=2`,
                `/restaurant.html?id=3`,
                `/restaurant.html?id=4`,
                `/restaurant.html?id=5`,
                `/restaurant.html?id=6`,
                `/restaurant.html?id=7`,
                `/restaurant.html?id=8`,
                `/restaurant.html?id=9`,
                `/restaurant.html?id=10`,
                `/css/styles.css`,
                `/js/dbhelper.js`,
                `/js/idb.js`,
                `/js/main.js`,
                `/js/restaurant_info.js`,
                `/img/1.webp`,
                `/img/2.webp`,
                `/img/3.webp`,
                `/img/4.webp`,
                `/img/5.webp`,
                `/img/6.webp`,
                `/img/7.webp`,
                `/img/8.webp`,
                `/img/9.webp`,
                `/img/10.webp`,
                `/img/favicon-32x32.png`,
                `/img/favicon-32x32.png`,
                `https://fonts.googleapis.com/css?family=Roboto:300,400,500,700`

            ])
            .then(() => self.skipWaiting());
        })
    );
});

// Removing old cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName.startsWith('resto-review-') &&
                        cacheName != staticCacheName;
                }).map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );

        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(cacheName).then((cache) => {
            return cache.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                else {
                    return fetch(event.request).then((networkResponse) => {
                        return networkResponse;
                    }).catch((error) => console.log("Unable to fetch data from network", event.request.url, error));
                }
            });
        }).catch((error) => console.log("Issue occurred with Service Worker fetch intercept", error))
    );
});