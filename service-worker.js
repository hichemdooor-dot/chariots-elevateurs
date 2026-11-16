/* SBI PWA service worker — cache only same-origin app shell resources. */
const CACHE_NAME = "sbi-pwa-shell-v1";
const OFFLINE_URL = new URL("./offline.html", self.registration.scope).toString();
const CORE_URLS = [
  "./manifest.webmanifest",
  "./offline.html",
  "./assets/sbi-pwa-icon.svg",
  "./css/style.css",
  "./js/app.js",
  "./js/shell.js",
  "./js/pwa.js",
  "./maintenance-config.js"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_URLS.map(async path => {
      try {
        const response = await fetch(new Request(new URL(path, self.registration.scope), { cache: "reload" }));
        if (response.ok && response.type === "basic") await cache.put(new URL(path, self.registration.scope), response);
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("sbi-pwa-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept authentication or data APIs; this app uses Supabase on a separate origin.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        return response;
      } catch (_) {
        const cached = await caches.match(request);
        if (cached) return cached;
        return (await caches.match(OFFLINE_URL)) || Response.error();
      }
    })());
    return;
  }

  // Cache only same-origin static assets. Network-first keeps deployments fresh;
  // the cache is a fallback for previously visited resources while offline.
  if (/\.(?:css|js|mjs|svg|png|webp|jpg|jpeg|woff2?)$/i.test(url.pathname) || url.pathname.endsWith(".webmanifest")) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || (await caches.match(url.pathname, { ignoreSearch: true })) || Response.error();
      }
    })());
  }
});