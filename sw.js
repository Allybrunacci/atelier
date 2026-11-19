/* Atelier — offline support. Network first so updates show straight away; the cache is the fallback.
   Only touches its own caches and its own folder, so other apps on the same site are unaffected. */
const CACHE = 'atelier-v3';
const SHELL = [
  './', './index.html', './app.css', './core.js', './sched.js', './db.js', './deco.js', './illus.js', './illus2.js', './techniques.js', './techniques2.js',
  './therapy.js', './therapy2.js', './therapy3.js', './therapy4.js', './therapy5.js', './therapy6.js', './tprompts.js', './tguides.js', './tprograms.js',
  './plans.js', './parts.js', './session.js', './classes.js', './calendar.js', './today.js', './earnings.js', './money.js', './docs.js', './spend.js', './photos.js',
  './ideas.js', './planner.js', './heal.js', './ttools.js', './tdraw.js', './tprint.js', './tsheets.js', './teach.js', './seasons.js', './seasonal.js', './reftools.js',
  './settings.js', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  './img/grain-light.png', './img/grain-dark.png',
  './fonts/fraunces-soft-latin.woff2', './fonts/nunito-latin.woff2', './fonts/caveat-latin.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(sweep().then(() => self.clients.claim()));
});
// Removes older Atelier caches. Runs on activation and again on each page open, because an older version's worker can
// still be saving files for a moment after this one takes over. Only touches caches named atelier-*.
function sweep() {
  return caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('atelier-') && k !== CACHE).map(k => caches.delete(k))));
}

function network(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    // Always ask the server (a quick "not modified" when nothing changed), so an update is never held back by the browser's cache.
    fetch(req, { cache: 'no-cache' }).then(res => { clearTimeout(timer); resolve(res); }, err => { clearTimeout(timer); reject(err); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (req.mode === 'navigate') e.waitUntil(sweep());
  e.respondWith(
    network(req, 4000)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : null))
        .then(hit => hit || fetch(req))),
  );
});
