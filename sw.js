// Guarda la app en el teléfono para que funcione sin internet.
// La página principal se busca primero en internet (si hay), así las versiones nuevas llegan solas.
const CACHE = "color-filete-v173";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "icon-192.png", "icon-512.png",
  "maskable-512.png", "xlsx.full.min.js", "jspdf.umd.min.js", "docx.umd.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => fetch(new Request(f, {cache: "reload"})).then(r => r.ok && c.put(f, r)).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const pagina = e.request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html") || url.pathname.endsWith("manifest.webmanifest");
  if (pagina && url.origin === location.origin) {
    e.respondWith(fetch(e.request, {cache: "no-store"}).then(resp => {
      if (resp.ok) { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return resp;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(r => r || fetch(e.request).then(resp => {
    if (resp.ok && url.origin === location.origin) { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return resp;
  }).catch(() => caches.match("./index.html"))));
});
