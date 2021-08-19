var STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";

const FILES_TO_CACHE = [
    "/",
    "index.html",
    "index.js",
    "manifest.json",
    "service-worker.json",
    "style.css",
    "db.js"
]



self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    )
})

//Clean old cache
self.addEventListener("activate", event => {
    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                return cacheNames.filter(
                    cacheName => !currentCaches.includes(cacheName)
                );
            })
            .then(cachesToDelete => {
                return Promise.all(
                    cachesToDelete.map(cacheToDelete => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(RUNTIME_CACHE).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        console.log(response.status)
                        cache.put(event.request, response.clone())
                        return response
                    })
                    .catch(() => caches.match(event.request));

            }).catch(err => { console.log(err) })
        )
        return;
    } event.respondWith(
        caches.open(RUNTIME_CACHE).then(cache => {
            return fetch(event.request).then(response => {
                return cache.put(event.request, response.clone()).then(() => {
                    return response
                })
            })
        })
    )


})
