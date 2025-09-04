const CACHE='metwat-pwa-v44-fix3-now2';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});