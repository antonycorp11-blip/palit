/* Service worker — deixa o jogo funcionando offline depois de instalado.
   Estratégia: REDE PRIMEIRO. Com internet, sempre baixa a versão publicada
   (ignorando o cache HTTP); sem internet, usa a cópia guardada.
   Ao publicar mudanças, aumente VERSION (e PALIT.BUILD em js/main.js). */
var VERSION = 'palit-v18';
var ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/fonts.css', 'css/style.css',
  'fonts/silkscreen-latin.woff2', 'fonts/silkscreen-latin-ext.woff2', 'fonts/vt323-latin.woff2', 'fonts/vt323-latin-ext.woff2',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png',
  'js/data/stats.js', 'js/data/materials.js', 'js/data/trees/fosforo.js', 'js/data/threats.js', 'js/data/events.js',
  'js/data/scenes.js', 'js/data/sprites.js', 'js/data/sticks.js', 'js/data/treelooks.js', 'js/data/bosses.js', 'js/data/story.js', 'js/data/progression.js', 'js/data/trees/dente.js',
  'js/core/econ.js', 'js/core/cloud.js', 'js/core/tree.js', 'js/core/state.js', 'js/core/game.js', 'js/core/progress.js',
  'js/ui/audio.js', 'js/ui/spritecss.js', 'js/ui/view.js', 'js/ui/hud.js', 'js/ui/treeview.js', 'js/ui/juice.js', 'js/ui/theme.js', 'js/ui/life.js', 'js/ui/erafx.js', 'js/ui/ambient.js', 'js/ui/desktop.js', 'js/ui/story.js', 'js/ui/panels.js',
  'js/main.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(ASSETS.map(function (u) {
      return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (r.ok) return c.put(u, r); }).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('message', function (e) { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return fetch(req, { cache: 'no-store' }).then(function (res) {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(function () {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || (req.mode === 'navigate' ? cache.match('index.html') : undefined);
      });
    });
  }));
});
