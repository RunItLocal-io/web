// RunItLocal.io service worker: keeps the Studio usable offline once it has been opened.
// Pages: network first, falling back to the last copy. Build assets and the ONNX runtime: cache first.
// Model weights are cached by the app itself (Cache Storage "ril-models" and WebLLM's own caches).

const PAGES = "ril-pages-v1";
const ASSETS = "ril-assets-v1";

self.addEventListener("install", event => {
  event.waitUntil(caches.open(PAGES).then(c => c.add("/studio")).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keep = new Set([PAGES, ASSETS]);
    for (const k of await caches.keys()) if (/^ril-(pages|assets)-/.test(k) && !keep.has(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function cacheFirst(req) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match("/studio")) || Response.error();
  }
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/api/")) return;
    if (req.mode === "navigate") return event.respondWith(networkFirst(req));
    if (url.pathname === "/py-worker.js") return event.respondWith(fetch(req).then(res => { if (res.ok) caches.open(ASSETS).then(c => c.put(req, res.clone())); return res; }).catch(() => caches.match(req).then(r => r || Response.error())));
    if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/app-icon/") || url.pathname === "/manifest.webmanifest") return event.respondWith(cacheFirst(req));
    return;
  }
  // Versioned CDN files never change: the ONNX runtime for images and Pyodide for the Python sandbox.
  if (url.hostname === "cdn.jsdelivr.net" && (url.pathname.startsWith("/npm/onnxruntime-web@") || url.pathname.startsWith("/pyodide/v"))) return event.respondWith(cacheFirst(req));
});
