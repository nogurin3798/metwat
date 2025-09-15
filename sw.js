const CACHE='metwat-pwa-v47-full-2';
const ASSETS=['./','./index.html','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE?caches.delete(k):null)))); self.clients.claim();});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(c=> c || fetch(e.request).then(r=>{caches.open(CACHE).then(C=>C.put(e.request,r.clone())); return r;})));
});