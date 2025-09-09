// GitHub Pages向け SW（キャッシュ名更新で反映）
const CACHE = 'pwa-walk-v3';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./sw.js','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate' || (e.request.headers.get('accept')||'').includes('text/html')) {
    e.respondWith((async () => {
      try{
        const fresh = await fetch(e.request);
        const cache = await caches.open(CACHE); cache.put(e.request, fresh.clone());
        return fresh;
      }catch(err){
        const cached = await caches.match(e.request);
        return cached || caches.match('./index.html');
      }
    })());
  } else {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
  }
});
