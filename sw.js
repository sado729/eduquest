/* EduQuest — service worker: full offline app shell */
const CACHE = 'eduquest-v14';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './css/fonts.css',
  './js/i18n.js',
  './js/components.js',
  './js/data.js',
  './js/tracking.js',
  './js/profiles.js',
  './js/qr.js',
  './js/transfer.js',
  './js/screens-onboarding.js',
  './js/screens-world.js',
  './js/screens-play.js',
  './js/screens-collect.js',
  './js/parent.js',
  './js/app.js',
  './fonts/baloo2-latin.woff2',
  './fonts/baloo2-latin-ext.woff2',
  './fonts/baloo2-vietnamese.woff2',
  './fonts/baloo2-devanagari.woff2',
  './fonts/nunito-latin.woff2',
  './fonts/nunito-latin-ext.woff2',
  './fonts/nunito-cyrillic.woff2',
  './fonts/nunito-cyrillic-ext.woff2',
  './fonts/nunito-vietnamese.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  // cache:'reload' bypasses the HTTP cache so a new version never re-caches stale files
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
