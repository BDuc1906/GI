// LEIBO Progressive Web App Service Worker
const CACHE_NAME = "leibo-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install: pre-cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for navigation, Stale-while-revalidate for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-HTTP(S) and API calls that need live database/token
  if (!request.url.startsWith("http") || request.url.includes("/api/")) {
    return;
  }

  // Navigation requests: Network first, fallback to cached homepage
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match("/");
        });
      })
    );
    return;
  }

  // Static assets (images, icons, fonts): Stale while revalidate
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // Default: Network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
