const CACHE = 'finance-portal-home-v7-minimal-icon';
const FILES = ['./', './index.html', './css/style.css', './js/app.js', './js/firebase.js', './js/tasks.js', './js/offices.js', './js/office-ui.js', './js/office-seed.js', './manifest.json', './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/apple-touch-icon.png', './favicon.ico'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return; e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); });
