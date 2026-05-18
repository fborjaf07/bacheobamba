// BACHEOBAMBA Service Worker — fuerza siempre red para JSON y HTML
const VERSION = 'bb-202605180306';
const CACHE = 'bb-static-v1';

// Recursos que queremos cachear (estáticos — tiles, Leaflet)
const CACHE_URLS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(CACHE_URLS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const url = e.request.url;

  // SIEMPRE red para: HTML, JSON de GitHub, API de GitHub
  if(
    url.includes('raw.githubusercontent.com') ||
    url.includes('api.github.com') ||
    url.includes('nominatim.openstreetmap.org') ||
    url.endsWith('.html') ||
    url.endsWith('index.html') ||
    url === self.registration.scope ||
    url === self.registration.scope + 'index.html'
  ){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).catch(()=>
        caches.match(e.request)
      )
    );
    return;
  }

  // Tiles del mapa y Leaflet: caché con red primero
  if(
    url.includes('tile.openstreetmap.org') ||
    url.includes('unpkg.com/leaflet')
  ){
    e.respondWith(
      caches.open(CACHE).then(c=>
        fetch(e.request).then(r=>{c.put(e.request,r.clone());return r;}).catch(()=>c.match(e.request))
      )
    );
    return;
  }

  // Resto: red directa
  e.respondWith(fetch(e.request, {cache: 'no-store'}));
});
