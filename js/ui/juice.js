/* =========================================================
   JUICE — sons + efeitos de HUD ligados aos eventos do jogo.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Juice = (function () {
  var P = PALIT, G, V, A;
  var fxLayer;
  var shownMoney = 0;

  function $(id) { return document.getElementById(id); }

  function bump(id, cls) {
    var e = typeof id === 'string' ? $(id) : id;
    if (!e) return;
    cls = cls || 'bump';
    e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls);
  }

  /* moeda voando de um ponto da tela até o contador de dinheiro */
  function coinFly(x, y, n, delay) {
    var target = $('h-money');
    if (!target) return;
    var r = target.getBoundingClientRect();
    var tx = r.left - 14, ty = r.top + r.height / 2;
    for (var i = 0; i < (n || 1); i++) {
      (function (i) {
        setTimeout(function () {
          var c = document.createElement('div');
          c.className = 'coin-fly';
          c.innerHTML = P.SpriteCSS.html('ico_coin');
          fxLayer.appendChild(c);
          var sx = x + (Math.random() * 30 - 15), sy = y + (Math.random() * 16 - 8);
          var mx = (sx + tx) / 2 + (Math.random() * 80 - 40), my = Math.min(sy, ty) - 40 - Math.random() * 40;
          var anim = c.animate([
            { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1)' },
            { transform: 'translate(' + mx + 'px,' + my + 'px) scale(1.3)', offset: 0.45 },
            { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(.8)' }
          ], { duration: 650 + i * 40, easing: 'steps(12)' });
          anim.onfinish = function () {
            c.remove();
            bump('h-money');
            A.sfx.coin();
          };
        }, (delay || 0) + i * 70);
      })(i);
    }
  }

  function popText(x, y, text, cls) {
    var d = document.createElement('div');
    d.className = 'hud-pop ' + (cls || '');
    d.style.left = x + 'px'; d.style.top = y + 'px';
    d.textContent = text;
    fxLayer.appendChild(d);
    setTimeout(function () { d.remove(); }, 900);
  }

  function banner(title, sub, cls) {
    var b = document.createElement('div');
    b.className = 'banner px ' + (cls || '');
    b.innerHTML = '<b>' + title + '</b>' + (sub ? '<span>' + sub + '</span>' : '');
    fxLayer.appendChild(b);
    setTimeout(function () { b.remove(); }, 2300);
  }

  function confetti(n) {
    var cols = ['#ffec27', '#ff004d', '#29adff', '#00e436', '#ff77a8', '#fff1e8'];
    for (var i = 0; i < n; i++) {
      var c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = (Math.random() * 100) + '%';
      c.style.background = cols[i % cols.length];
      c.style.animationDuration = (1.1 + Math.random() * 0.9).toFixed(2) + 's';
      c.style.animationDelay = (Math.random() * 0.3).toFixed(2) + 's';
      c.style.setProperty('--dx', Math.round(Math.random() * 120 - 60) + 'px');
      fxLayer.appendChild(c);
      setTimeout(function (c) { c.remove(); }.bind(null, c), 2400);
    }
  }

  function boxRect() { var e = $('h-box'); return e ? e.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 }; }

  function init() {
    G = P.Game; V = P.View; A = P.Audio;
    fxLayer = $('hud-fx');
    shownMoney = G.S.money;

    G.on('placeStart', function () { A.sfx.lift(); bump('h-pieces', 'dip'); });
    var H = P.Haptics;
    /* janela do encaixe perfeito: um anel aparece no instante do encaixe */
    G.on('placeDone', function (c) {
      H.buzz(8);
      var p = V.cellScreen(c);
      var r = document.createElement('i');
      r.className = 'pwin';
      r.style.left = p.x + 'px'; r.style.top = p.y + 'px';
      fxLayer.appendChild(r);
      setTimeout(function () { r.remove(); }, 300);
    });
    G.on('perfect', function (d) {
      A.sfx.perfect(d.streak); H.buzz(15);
      var p = V.cellScreen(Math.max(0, G.S.cursor - 1));
      popText(p.x - 40, p.y - 46, d.streak >= 3 ? 'PERFEITO x' + d.streak : 'PERFEITO!', 'perf' + (d.streak >= 10 ? ' hot' : ''));
      if (d.streak % 5 === 0) coinFly(p.x, p.y, 2, 0);
      bump('h-money');
    });
    G.on('streakLost', function (n) { if (n >= 5) { A.sfx.streakLost(); var r = boxRect(); popText(window.innerWidth / 2, 240, 'SEQUÊNCIA PERDIDA (' + n + ')', 'lost'); } });
    G.on('achievement', function (d) {
      A.sfx.achievement(); H.buzz([20, 40, 20]);
      banner('CONQUISTA!', d.a.name.toUpperCase() + ' · +$' + P.fmtMoney(d.money), 'ach');
      confetti(24);
    });
    G.on('missionDone', function (m) { A.sfx.mission(); H.buzz([10, 30, 10]); P.HUD.toast('MISSÃO COMPLETA: ' + m.text.toUpperCase(), 'good', false, { icon: 'ico_star' }); });
    G.on('missionClaim', function (m) {
      var pill = $('mission-pill');
      var r = pill && !pill.hidden ? pill.getBoundingClientRect() : { left: window.innerWidth - 200, top: 200, width: 100, height: 20 };
      coinFly(r.left + r.width / 2, r.top + r.height / 2, 6, 0);
      popText(r.left + r.width / 2, r.top + r.height + 10, '+$' + P.fmtMoney(m.money), 'plus');
    });
    G.on('clue', function (c) { if (!c) return; A.sfx.achievement(); banner('NOVA PISTA', c.title.toUpperCase(), 'clue'); });
    G.on('bestiaryNew', function (k) { P.HUD.toast('NOVO NO BESTIÁRIO: ' + P.THREATS[k].name.toUpperCase(), 'info', true, { icon: 'ico_book' }); });
    G.on('impact', function () { H.buzz(60); });
    G.on('milestone', function () { H.buzz([30, 40, 30]); });
    G.on('fall', function () { H.buzz(25); });
    G.on('placeDone', function () {
      A.sfx.place(G.rt.combo);
      var rt = G.rt;
      if (rt.combo >= 2 && rt.clock - rt.lastPlaceAt < 1.8) {
        var top = V.cellScreen(Math.max(0, G.S.cursor - 1));
        popText(top.x + 50, top.y - 30, 'x' + (rt.combo + 1), 'combo c' + Math.min(5, rt.combo));
      }
    });
    G.on('layerDone', function (d) {
      A.sfx.layer(d.layer);
      bump('h-loc'); bump('h-glob'); bump('h-era', 'flashy');
      var p = V.cellScreen(d.layer * G.mat.piecesPerLayer + 1);
      coinFly(p.x, p.y, d.money >= 8 ? 3 : d.money >= 3 ? 2 : 1, 120);
    });
    G.on('milestone', function (d) {
      A.sfx.milestone();
      banner('MARCO ' + d.layer, '+$' + P.fmtMoney(d.money), 'gold');
      confetti(36); V.shake(2);
      var p = V.cellScreen(d.layer * G.mat.piecesPerLayer - 1);
      coinFly(p.x, p.y, 8, 300);
    });
    G.on('produce', function () {
      A.sfx.produce();
      bump('h-pieces', 'pop');
      var r = boxRect();
      if (Math.random() < 0.5) popText(r.left + r.width, r.top - 4, '+1', 'plus');
    });
    G.on('threatHit', function () { A.sfx.hit(); });
    G.on('threatDead', function (d) {
      A.sfx.kill();
      var s = V.toScreen(Math.round(d.t.x) * V.U, -Math.round(d.t.y) * V.U);
      coinFly(s.x, s.y, 2, 80);
    });
    G.on('damage', function (d) {
      if (d.kind === 'fire') A.sfx.fire(); else A.sfx.crack();
      bump($('h-int').parentNode.parentNode, 'hurt');
      if (d.src === 'wind' || d.src === 'event' || d.src === 'cat' || d.src === 'ball') V.shake(1);
    });
    G.on('fall', function () { A.sfx.fall(); });
    G.on('impact', function () { V.shake(3); });
    G.on('repairStart', function () { A.sfx.repairStart(); });
    G.on('repaired', function (c) {
      A.sfx.repaired();
      bump($('h-int').parentNode.parentNode, 'heal');
      var p = V.cellScreen(c);
      popText(p.x, p.y - 10, 'REPARADO', 'heal');
    });
    G.on('extinguish', function () { A.sfx.repaired(); });
    G.on('gust', function (g) { A.sfx.gust(g.str); if (g.str > 1.2) V.shake(1); });
    G.on('windWarn', function () { A.sfx.warn(); });
    G.on('blocked', function (r) {
      A.sfx.blocked();
      if (r === 'empty' || r === 'emptyRepair') bump('h-box', 'nope');
      if (r === 'money') bump('h-money', 'nope');
      bump('status', 'nope');
    });
    G.on('event', function (d) { if (d.e.good) { A.sfx.good(); if (d.e.type === 'money') { var r = boxRect(); coinFly(window.innerWidth / 2, 220, 4); } } else A.sfx.bad(); });
    G.on('jamTap', function () { A.sfx.clank(); bump('h-box', 'nope'); });
    G.on('challenge', function (s) {
      if (s === 'start') { A.sfx.alarm(); banner('DESAFIO FINAL', G.mat.challenge.name, 'red'); V.shake(3); }
      if (s === 'won') { A.sfx.win(); confetti(70); }
      if (s === 'lost') A.sfx.lose();
    });
    G.on('treeComplete', function () { A.sfx.special(); confetti(50); });
    G.on('rebuild', function () { A.sfx.special(); confetti(80); banner('NOVA ERA', G.mat.name.toUpperCase(), 'gold'); shownMoney = G.S.money; });
    document.addEventListener('click', function (e) { if (e.target.closest('.pxbtn')) A.sfx.click(); }, true);
  }

  /* renda de visitantes: um "+$" discreto a cada poucos segundos */
  var passiveT = 4;
  function tick(dt) {
    A.setMood(G.rt.ch ? 'tense' : (P.Ambient && P.Ambient.night > 0.5 ? 'night' : 'day'));
    passiveT -= dt;
    if (passiveT > 0) return;
    passiveT = 4;
    var v = P.ECON.passive(G.mat, G.st, G.layersBuilt(), G.rt.integrity / 100) * 4;
    if (v < 0.5) return;
    var m = $('h-money'); if (!m) return;
    var r = m.getBoundingClientRect();
    popText(r.left + r.width / 2, r.bottom + 6, '+$' + P.fmtMoney(Math.max(1, v)), 'plus');
  }

  /* dinheiro exibido "conta" até o valor real */
  function money() {
    var t = G.S.money, d = t - shownMoney;
    if (Math.abs(d) < 1) shownMoney = t;
    else shownMoney += d * 0.35;
    return shownMoney;
  }

  return { init: init, tick: tick, bump: bump, coinFly: coinFly, popText: popText, banner: banner, confetti: confetti, money: money };
})();
