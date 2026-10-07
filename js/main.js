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
    P.View.init();
    P.HUD.init();
    P.TreeView.init();
    P.Juice.init();
    if (/[?&]debug/.test(location.search)) debugPanel();

    var last = performance.now(), hudT = 0, slowT = 0, saveT = 0;
    function loop(now) {
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      G.update(dt);
      P.View.frame(dt);
      hudT += dt; slowT += dt; saveT += dt;
      if (hudT > 0.1) { hudT = 0; P.HUD.update(); P.TreeView.tick(); }
      if (slowT > 1) { slowT = 0; P.TreeView.slowTick(); }
      if (saveT > 5) { saveT = 0; P.save(); }
      requestAnimationFrame(loop);
    }
    P.HUD.update();
    requestAnimationFrame(loop);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) P.save();
      else { // retorno: aplica produção offline do período ausente
        var s = P.State.load();
        if (s && (Date.now() - s.lastSeen) > 30000) { G.init(s); P.View.measure(); G.emit('rebuild'); P.HUD.welcome(); }
        last = performance.now();
      }
    });
    window.addEventListener('pagehide', P.save);
    G.on('bought', P.save);
    G.on('rebuild', P.save);

    var sp = document.getElementById('splash');
    var first = G.S.stats.placed === 0 && G.S.matIndex === 0;
    if (!first) { sp.remove(); P.HUD.welcome(); }
    else {
      sp.querySelector('button').addEventListener('click', function () { sp.remove(); });
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
