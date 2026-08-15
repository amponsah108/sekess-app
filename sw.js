const CACHE_NAME = "sekess-ballot-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for the app shell, network-first for everything else
// (so login/vote submissions always hit the live Apps Script backend).
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isAppShell = ASSETS.some((a) => url.pathname.endsWith(a.replace("./", "")));

  if (isAppShell) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // Non-shell requests (e.g. the Apps Script POST) just pass through untouched.
});
