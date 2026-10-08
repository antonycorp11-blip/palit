/* =========================================================
   LIFE — o que vive ao redor da torre:
   · tábuas de reforço nas camadas de baixo (upgrades de limite)
   · bichinhos ajudantes (defesa e conserto)
   · visitantes a pé e de balão que deixam gorjetas
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Life = (function () {
  var P = PALIT, G, V;
  var el = {};
  var braceKey = '';
  var helpers = {};        // id -> {el, rope, kind}
  var visitors = [];
  var walkT = 6, flyT = 20, seq = 1;
  var bornT = performance.now(), arrivals = {};

  var HELPER_SPR = {
    fosforo: ['hlp_ant', 'hlp_beetle'],
    dente: ['hlp_cricket', 'hlp_ladybug']
  };

  function $(id) { return document.getElementById(id); }

  function init() {
    G = P.Game; V = P.View;
    var w = $('world');
    el.brace = document.createElement('div'); el.brace.id = 'brace';
    el.life = document.createElement('div'); el.life.id = 'life';
    w.insertBefore(el.brace, $('ents'));
    w.insertBefore(el.life, $('ents'));
    G.on('rebuild', reset);
    G.on('reset', function () { braceKey = ''; });
    G.on('helperHit', function (d) {
      var g = V.geom();
      V.sparks(Math.round(d.t.x) * g.U, -Math.round(d.t.y) * g.U, '#fff1e8', 3);
      if (P.Audio.sfx.helper) P.Audio.sfx.helper();
    });
    G.on('fixerGo', function (d) {
      var layer = Math.floor(d.cell / G.mat.piecesPerLayer);
      if (layer < G.topLayer() - 6) P.HUD.toast(helperName('fix').toUpperCase() + ' DESCENDO ATÉ A CAMADA ' + (layer + 1) + ' ▼', 'info', true, jump(d.cell));
    });
    G.on('fixerWait', function (d) {
      P.HUD.toast(d.need === 'piece' ? 'O AJUDANTE PRECISA DE 1 PEÇA PARA CONSERTAR' : 'O AJUDANTE ESPERA DINHEIRO PARA O REPARO', 'warn', true, jump(d.cell));
    });
    G.on('fixerDone', function (d) {
      var p = V.cellScreen(d.cell);
      if (P.Audio.sfx.fixed) P.Audio.sfx.fixed();
      var g = V.geom();
      V.sparks(p.x - g.VW / 2, p.y - g.focal - g.camY, '#00e436', 6);
    });
    G.on('helperNew', function (h) {
      // no carregamento do save os ajudantes já moram lá; só a contratação é anunciada
      if (performance.now() - bornT < 1500) return;
      arrivals[h.id] = performance.now();
      V.goTop();
      P.HUD.toast((h.kind === 'def' ? 'NOVO DEFENSOR: ' : 'NOVO CONSERTADOR: ') + helperName(h.kind).toUpperCase() + '!', 'good', false, { big: true, life: 4 });
      if (P.Audio.sfx.achievement) P.Audio.sfx.achievement();
      if (P.Story.bubble) P.Story.bubble('ademir', h.kind === 'def'
        ? 'Contratei um(a) ' + helperName('def') + '! Mora no topo e corre atrás das ameaças. Você ainda bate mais forte.'
        : 'Chegou o(a) ' + helperName('fix') + '! Desce pela torre até as peças quebradas e conserta pra você.');
    });
    G.on('bought', function () { braceKey = ''; });
  }

  function jump(cell) {
    return { onClick: function () { V.goLayer(Math.floor(cell / G.mat.piecesPerLayer)); } };
  }

  function reset() {
    Object.keys(helpers).forEach(function (k) { helpers[k].el.remove(); if (helpers[k].rope) helpers[k].rope.remove(); });
    helpers = {};
    visitors.forEach(function (v) { v.el.remove(); });
    visitors = [];
    braceKey = '';
  }

  function helperName(kind) {
    var def = G.def;
    var n = def && def.byId[kind === 'def' ? 'd14' : 'e15'];
    return n ? n.n : (kind === 'def' ? 'Robô Vigia' : 'Drone Reparador');
  }

  function scene() { return P.sceneOf(G.mat); }
  function eraIdx() { return G.S.matIndex; }

  /* ---------------- tábuas de reforço ---------------- */
  function braceLook() {
    var i = eraIdx();
    if (i < 10) return 'wood';
    if (i < 20) return 'steel';
    if (i < 30) return 'alloy';
    return 'energy';
  }

  function updateBrace() {
    var g = V.geom(), U = g.U, LHU = G.LHU;
    var B = G.braced();
    var key = B + ',' + U + ',' + g.L + ',' + g.D + ',' + G.S.matIndex;
    if (key === braceKey) return;
    var grew = braceKey && B > (+braceKey.split(',')[0]);
    braceKey = key;
    if (B < 1) { el.brace.innerHTML = ''; return; }
    var h = B * LHU * U, X0 = g.X0, L = g.L, D = g.D;
    el.brace.className = 'bz-' + braceLook();
    el.brace.style.setProperty('--bh', h + 'px');
    el.brace.innerHTML =
      // cintas horizontais na frente e na lateral (a cada 10 camadas)
      '<i class="bz-front" style="left:' + (X0 - 1) * U + 'px;width:' + (L + 2) * U + 'px;top:' + (-h) + 'px;height:' + h + 'px"></i>' +
      '<i class="bz-side" style="left:' + (X0 + L) * U + 'px;width:' + D * U + 'px;top:' + (-h) + 'px;height:' + h + 'px"></i>' +
      // montantes verticais nos cantos
      '<i class="bz-post" style="left:' + (X0 - 2) * U + 'px;top:' + (-h - U) + 'px;height:' + (h + U) + 'px"></i>' +
      '<i class="bz-post" style="left:' + (X0 + L - 1) * U + 'px;top:' + (-h - U) + 'px;height:' + (h + U) + 'px"></i>' +
      '<i class="bz-post back" style="left:' + (X0 + L + D - 2) * U + 'px;top:' + (-h - (D + 1) * U) + 'px;height:' + h + 'px"></i>' +
      '<b class="bz-tag t-px" style="left:' + (X0 - 3) * U + 'px;top:' + (-h - 2 * U) + 'px">BLINDADO · ' + B + '</b>';
    if (grew) { el.brace.classList.remove('grow'); void el.brace.offsetWidth; el.brace.classList.add('grow'); }
  }

  /* ---------------- ajudantes ---------------- */
  function sprOf(kind) {
    var s = HELPER_SPR[G.mat.id] || ['hlp_bot', 'hlp_drone'];
    return kind === 'def' ? s[0] : s[1];
  }

  function updateHelpers() {
    var g = V.geom(), U = g.U, seen = {};
    var topY = (G.layersBuilt() * G.LHU + g.D) * U;
    G.rt.helpers.forEach(function (h) {
      seen[h.id] = 1;
      var o = helpers[h.id];
      if (!o) {
        var e = document.createElement('div');
        e.className = 'hlp ' + h.kind;
        e.innerHTML = '<i class="hlp-glow"></i>' + P.SpriteCSS.html(sprOf(h.kind)) + '<b class="hlp-mark"></b><i class="hlp-sparks"></i>' +
          '<span class="hlp-tag t-px">' + (h.kind === 'def' ? '⚔ ' : '✚ ') + helperName(h.kind).split(' ')[0].toUpperCase() + '</span>';
        el.life.appendChild(e);
        o = helpers[h.id] = { el: e, kind: h.kind, rope: null, spr: sprOf(h.kind) };
        if (h.kind === 'fix') { o.rope = document.createElement('i'); o.rope.className = 'hlp-rope'; o.rope.hidden = true; el.life.insertBefore(o.rope, el.life.firstChild); }
      }
      var sz = P.SpriteCSS.size(o.spr);
      var x = h.x * U, y = -h.y * U;
      if (h.kind === 'fix' && h.state === 'fix' && h.cell != null) {
        var sg = V.cellSeg(h.cell);
        x = (sg[0] + sg[2]) / 2; y = (sg[1] + sg[3]) / 2 - U;
      }
      x = Math.round(x / U) * U; y = Math.round(y / U) * U;
      var key = x + ',' + y + ',' + h.state + h.face + (h.wait ? 'w' : '');
      if (o.k !== key) {
        o.k = key;
        o.el.style.transform = 'translate(' + (x - sz.w * U / 2) + 'px,' + (y - sz.h * U) + 'px)';
        var arr = arrivals[h.id] && performance.now() - arrivals[h.id] < 6000;
        o.el.className = 'hlp ' + h.kind + ' st-' + h.state + (h.face < 0 ? ' flip' : '') + (h.wait ? ' wait' : '') + (arr ? ' arrive' : '');
      }
      if (o.rope) {
        var down = (h.state === 'go' || h.state === 'fix' || h.state === 'back') && -y < topY - 10 * U;
        o.rope.hidden = !down;
        if (down) {
          o.rope.style.transform = 'translate(' + x + 'px,' + (-topY) + 'px)';
          o.rope.style.height = Math.max(0, topY + y - sz.h * U) + 'px';
        }
      }
    });
    Object.keys(helpers).forEach(function (id) {
      if (!seen[id]) { helpers[id].el.remove(); if (helpers[id].rope) helpers[id].rope.remove(); delete helpers[id]; }
    });
  }

  /* ---------------- visitantes ---------------- */
  function walkerSprite() {
    var i = eraIdx();
    if (i >= 30) return 'vis_alien';
    if (i >= 14) return 'vis_astro';
    return 'vis_p' + Math.floor(Math.random() * 6);
  }
  function flyerSprite() {
    var i = eraIdx();
    if (i >= 30) return 'ufo';
    if (i >= 14) return 'vis_jet';
    return 'vis_balloon';
  }

  function tipBase() {
    var E = P.ECON;
    return E.passive(G.mat, G.st, G.layersBuilt(), G.rt.integrity / 100);
  }

  function spawnWalker() {
    var g = V.geom();
    var side = Math.random() < 0.5 ? -1 : 1;
    var spr = walkerSprite();
    var e = document.createElement('div');
    e.className = 'vis walker' + (side > 0 ? ' flip' : '');
    e.innerHTML = P.SpriteCSS.html(spr);
    el.life.appendChild(e);
    var halfW = (g.L + g.D) / 2;
    visitors.push({
      id: seq++, kind: 'walk', el: e, spr: spr, side: side,
      x: side * (g.VW / g.U / 2 + 12), y: 0, vx: -side * (7 + Math.random() * 5),
      stopAt: side * (halfW + 6 + Math.random() * 14), state: 'walk', t: 0, tipped: false
    });
  }

  function spawnFlyer() {
    var g = V.geom();
    var side = Math.random() < 0.5 ? -1 : 1;
    var spr = flyerSprite();
    var e = document.createElement('div');
    e.className = 'vis flyer' + (side > 0 ? ' flip' : '');
    e.innerHTML = P.SpriteCSS.html(spr);
    el.life.appendChild(e);
    var top = G.layersBuilt() * G.LHU + g.D;
    visitors.push({
      id: seq++, kind: 'fly', el: e, spr: spr, side: side,
      x: side * (g.VW / g.U / 2 + 16), y: top + 18 + Math.random() * 30, vx: -side * (5 + Math.random() * 3),
      state: 'fly', t: Math.random() * 6, tipped: false
    });
  }

  function dropCoin(v, big) {
    var g = V.geom(), U = g.U;
    var amt = Math.max(big ? 3 : 1, tipBase() * (big ? 20 : 7) * (0.7 + Math.random() * 0.6));
    var c = document.createElement('div');
    c.className = 'coin-drop' + (big ? ' big' : '');
    c.innerHTML = P.SpriteCSS.html('ico_coin');
    var x = Math.round(v.x) * U, y = -Math.round(v.y + (big ? 0 : 14)) * U;
    var landY = big ? -(G.layersBuilt() * G.LHU + g.D) * U : -2 * U;
    c.style.left = x + 'px'; c.style.top = y + 'px';
    c.style.setProperty('--fall', (landY - y) + 'px');
    c.style.setProperty('--dx', (big ? 0 : -v.side * 8 * U) + 'px');
    el.life.appendChild(c);
    setTimeout(function () {
      c.remove();
      G.fx.money(amt);
      var t = document.createElement('div');
      t.className = 'fly-txt good';
      t.style.left = (x + (big ? 0 : -v.side * 8 * U)) + 'px'; t.style.top = (landY - 16) + 'px';
      t.textContent = (big ? 'GORJETA DO BALÃO +$' : 'GORJETA +$') + P.fmtMoney(amt);
      $('fx').appendChild(t);
      setTimeout(function () { t.remove(); }, 1200);
      if (P.Audio.sfx.coin) P.Audio.sfx.coin();
    }, big ? 1100 : 750);
  }

  function updateVisitors(dt, paused) {
    var g = V.geom(), U = g.U;
    if (!paused && G.layersBuilt() >= 3) {
      walkT -= dt; flyT -= dt;
      var walkers = visitors.filter(function (v) { return v.kind === 'walk'; }).length;
      if (walkT <= 0) { walkT = 9 + Math.random() * 14; if (walkers < 4) spawnWalker(); }
      if (flyT <= 0) { flyT = 30 + Math.random() * 35; if (visitors.length - walkers < 2) spawnFlyer(); }
    }
    var edge = g.VW / U / 2 + 24;
    for (var i = visitors.length - 1; i >= 0; i--) {
      var v = visitors[i];
      if (!paused) {
        v.t += dt;
        if (v.kind === 'walk') {
          if (v.state === 'walk') {
            var nx = v.x + v.vx * dt;
            if (!v.tipped && (v.x - v.stopAt) * (nx - v.stopAt) <= 0) { v.state = 'look'; v.t = 0; v.el.classList.add('look'); v.el.firstChild.className = 'sp sp-' + v.spr + 'c'; }
            v.x = nx;
          } else if (v.state === 'look') {
            if (!v.tipped && v.t > 1) { v.tipped = true; dropCoin(v, false); }
            if (v.t > 2.6) { v.state = 'walk'; v.el.classList.remove('look'); v.el.firstChild.className = 'sp sp-' + v.spr; }
          }
        } else {
          v.x += v.vx * dt;
          if (!v.tipped && Math.abs(v.x) < 4) { v.tipped = true; dropCoin(v, true); }
        }
      }
      var bob = v.kind === 'fly' ? Math.round(Math.sin(v.t * 1.3) * 2) : 0;
      var sz = P.SpriteCSS.size(v.spr);
      v.el.style.transform = 'translate(' + (Math.round(v.x) * U - sz.w * U / 2) + 'px,' + (-(Math.round(v.y) + bob) * U - sz.h * U) + 'px)';
      if (Math.abs(v.x) > edge) { v.el.remove(); visitors.splice(i, 1); }
    }
  }

  /* ---------------- elenco da história na base ---------------- */
  var CAST = { ademir: 'npc_ademir', vo: 'npc_vo', luca: 'npc_luca', inspetor: 'npc_inspetor', pombo: 'pigeon', gato: 'cat', radio: 'pt_radio', bilhete: 'pt_bilhete', voz: 'pt_voz' };
  var castEls = {};
  function cast(who) {
    uncast(true);
    var g = V.geom(), U = g.U, halfW = (g.L + g.D) / 2;
    var n = 0;
    who.forEach(function (w) {
      var spr = CAST[w];
      if (!spr || !P.SPRITES[spr]) return;
      var ch = P.CHARACTERS[w] || {};
      var e = document.createElement('div');
      e.className = 'npc' + (w === 'voz' ? ' voice' : '') + (w === 'luca' ? ' kid' : '');
      var sz = P.SpriteCSS.size(spr);
      var x, y = 0;
      if (w === 'voz') { x = 0; y = 34; }
      else { x = -(halfW + 10 + n * 15); n++; }
      if (n > 3 && w !== 'voz') x = halfW + 12 + (n - 4) * 15;
      e.style.transform = 'translate(' + (x * U - sz.w * U / 2) + 'px,' + (-y * U - sz.h * U) + 'px)';
      e.innerHTML = '<span class="npc-name t-px" style="color:' + (ch.color || '#fff1e8') + '">' + (ch.name || '').split(' ')[0] + '</span>' + P.SpriteCSS.html(spr) + '<b class="npc-talk"></b>';
      el.life.appendChild(e);
      castEls[w] = e;
    });
  }
  function speak(w) {
    Object.keys(castEls).forEach(function (k) { castEls[k].classList.toggle('talking', k === w); });
  }
  function uncast(now) {
    Object.keys(castEls).forEach(function (k) {
      var e = castEls[k];
      if (now) e.remove(); else { e.classList.add('leave'); setTimeout(function () { e.remove(); }, 700); }
    });
    castEls = {};
  }

  function tick(dt, paused) {
    if (!G || !V) return;
    updateBrace();
    updateHelpers();
    updateVisitors(dt, paused);
  }

  return { init: init, tick: tick, helperName: helperName, cast: cast, speak: speak, uncast: function () { uncast(false); }, spawn: function (k) { if (k === 'fly') spawnFlyer(); else spawnWalker(); } };
})();
