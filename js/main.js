/* =========================================================
   BOOT + LOOP
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

(function () {
  var P = PALIT;
  var G = P.Game;
  var wiping = false;

  P.save = function () { if (!wiping) P.State.save(G.S); };
  P.wipe = function () { wiping = true; P.State.wipe(); location.reload(); };

  function start() {
    G.init(P.State.load());
    P.Progress.init();
    P.View.init();
    P.HUD.init();
    P.TreeView.init();
    P.Juice.init();
    P.Ambient.init();
    P.Desktop.init();
    P.Story.init();
    P.Panels.init();
    P.Life.init();
    P.Theme.apply(G.mat);
    G.on('rebuild', function () { P.Theme.apply(G.mat); });
    if (/[?&]debug/.test(location.search)) debugPanel();

    var last = performance.now(), hudT = 0, slowT = 0, saveT = 0;
    function loop(now) {
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!P.Pause.active()) { G.update(dt); P.Progress.tick(dt); }
      P.Story.tick(dt);
      P.View.frame(dt);
      P.Life.tick(dt, P.Pause.active());
      P.Ambient.tick(dt);
      P.Juice.tick(dt);
      hudT += dt; slowT += dt; saveT += dt;
      if (hudT > 0.1) { hudT = 0; P.HUD.update(); P.TreeView.tick(); P.Desktop.update(); P.Panels.update(); }
      if (slowT > 1) { slowT = 0; P.TreeView.slowTick(); }
      if (saveT > 5) { saveT = 0; P.save(); }
      requestAnimationFrame(loop);
    }
    P.HUD.update();
    requestAnimationFrame(loop);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) P.save();
      else last = performance.now(); // sem ganhos offline: o tempo fora não conta
    });
    window.addEventListener('pagehide', P.save);
    G.on('bought', P.save);
    G.on('rebuild', P.save);

    var sp = document.getElementById('splash');
    var first = G.S.stats.placed === 0 && G.S.matIndex === 0;
    if (!first) { sp.remove(); P.Story.start(); }
    else {
      sp.querySelector('button').addEventListener('click', function () { sp.remove(); setTimeout(P.Story.start, 400); });
    }
  }

  function debugPanel() {
    var d = document.createElement('div');
    d.id = 'debug';
    var b = [
      ['+$1K', function () { G.debug.money(1000); }],
      ['+$100K', function () { G.debug.money(100000); }],
      ['+50 CAM', function () { G.debug.layers(50); }],
      ['TREE MAX', function () { G.debug.maxTree(); }],
      ['VENTO', function () { G.debug.gust(1.4); }],
      ['AMEAÇA', function () { var k = ['fly', 'bird', 'beetle', 'cat', 'ball', 'lens', 'gecko', 'crow', 'kite']; G.debug.threat(k[Math.floor(Math.random() * k.length)]); }],
      ['EVENTO', function () { var e = P.EVENTS[Math.floor(Math.random() * P.EVENTS.length)]; G.debug.event(e.id); }],
      ['CHUVA', function () { G.debug.event('storm'); }]
    ];
    b.forEach(function (x) {
      var bt = document.createElement('button');
      bt.className = 'pxbtn'; bt.textContent = x[0];
      bt.addEventListener('click', x[1]);
      d.appendChild(bt);
    });
    document.body.appendChild(d);
  }

  /* PWA: service worker (offline) + bloqueios de gestos do iOS */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* sem SW */ }); });
  }
  ['gesturestart', 'gesturechange', 'dblclick'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
  });
  document.addEventListener('touchmove', function (e) {
    if (!e.target.closest('#tree-detail, #modal .box')) e.preventDefault();
  }, { passive: false });
  var standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  document.documentElement.classList.toggle('standalone', standalone);
  document.addEventListener('DOMContentLoaded', function () {
    var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var tip = document.getElementById('ios-tip');
    if (tip && ios && !standalone) tip.hidden = false;
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
