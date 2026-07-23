const CACHE = 'fittrack-v1';
const ASSETS = ['/', '/index.html', '/css/style.css', '/js/data.js', '/js/app.js', '/js/coach.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.anthropic.com')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
