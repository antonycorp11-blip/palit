/* Service worker — deixa o jogo funcionando offline depois de instalado.
   Estratégia: pré-cache do app + "stale-while-revalidate" (abre na hora pelo
   cache e baixa a versão nova em segundo plano para a próxima abertura).
   Ao publicar mudanças grandes, aumente VERSION. */
var VERSION = 'palit-v5';
var ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/fonts.css', 'css/style.css',
  'fonts/silkscreen-latin.woff2', 'fonts/silkscreen-latin-ext.woff2', 'fonts/vt323-latin.woff2', 'fonts/vt323-latin-ext.woff2',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png',
  'js/data/stats.js', 'js/data/materials.js', 'js/data/trees/fosforo.js', 'js/data/threats.js', 'js/data/events.js',
  'js/data/scenes.js', 'js/data/sprites.js',
  'js/core/econ.js', 'js/core/tree.js', 'js/core/state.js', 'js/core/game.js',
  'js/ui/audio.js', 'js/ui/spritecss.js', 'js/ui/view.js', 'js/ui/hud.js', 'js/ui/treeview.js', 'js/ui/juice.js', 'js/ui/ambient.js', 'js/ui/desktop.js',
  'js/main.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit || (req.mode === 'navigate' ? cache.match('index.html') : undefined); });
      return hit || net;
    });
  }));
});
