/* =========================================================
   VIEW — cenário, torre, câmera, ameaças, efeitos e entrada.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.View = (function () {
  var P = PALIT, G, C;
  var U = 4, LH = 8, W = 104;
  var el = {};
  var cam = { y: 0, follow: true, vel: 0, drag: null, returning: false };
  var H = 800, VW = 400, focal = 400;
  var layers = {};       // i -> {el, sig, x}
  var dirty = {};
  var allDirty = true;
  var ents = {};         // threat id -> el
  var sceneKey = null;
  var lastParKey = '';

  function $(id) { return document.getElementById(id); }

  function init() {
    G = P.Game; C = G.CELL;
    ['game', 'world', 'tower', 'ents', 'fx', 'ground', 'sky', 'stars', 'far', 'mid', 'near', 'clouds', 'sun', 'weather', 'flash', 'arrows'].forEach(function (k) { el[k] = $(k); });
    measure();
    window.addEventListener('resize', function () { measure(); allDirty = true; });
    buildScenery();
    setupMaterial();
    bindInput();
    bindGame();
    cam.y = targetCam();
  }

  function measure() {
    U = window.innerWidth < 480 ? 3 : 4;
    document.documentElement.style.setProperty('--u', U + 'px');
    LH = U * G.LHU;
    H = window.innerHeight; VW = window.innerWidth;
    focal = Math.round(H * 0.5);
    if (G.rt) G.rt.viewW = VW / U;
    W = G.mat ? G.mat.look.len * U : 104;
    P.SpriteCSS.compile(U);
  }

  /* ---------------- material / torre ---------------- */
  function setupMaterial() {
    var m = G.mat, lk = m.look;
    W = lk.len * U;
    var t = el.tower.style;
    t.setProperty('--pc-body', lk.body);
    t.setProperty('--pc-light', lk.light);
    t.setProperty('--pc-shade', lk.shade);
    t.setProperty('--pc-head', lk.head || lk.body);
    t.setProperty('--pc-headd', lk.headDark || lk.shade);
    t.setProperty('--head-len', lk.headLen || 3);
    el.tower.classList.toggle('nohead', !lk.head);
    el.tower.innerHTML = '';
    layers = {}; dirty = {}; allDirty = true;
    Object.keys(ents).forEach(function (k) { ents[k].remove(); });
    ents = {};
    el.fx.innerHTML = '';
    buildGround();
    applyVisualFlags();
    sceneKey = null;
  }

  function applyVisualFlags() {
    var st = G.st;
    el.tower.classList.toggle('headless', st.visHeadless > 0);
    el.tower.classList.toggle('glue', st.visGlue > 0);
    var glue = ['#fff1e8', '#fff1e8', '#ffccaa', '#ffec27', '#c2c3c7', '#29adff'][Math.min(5, st.visGlue)];
    el.tower.style.setProperty('--glue', glue);
    allDirty = true;
  }

  function buildGround() {
    var g = el.ground;
    g.innerHTML = '';
    if (G.S.matIndex === 0) {
      g.className = '';
      var html = '<div class="fence"></div><div class="slab" style="left:' + (-W / 2 - 4 * U) + 'px;width:' + (W + 8 * U) + 'px"></div>';
      var seed = 7;
      for (var i = 0; i < 26; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        var x = Math.round(((seed / 233280) * 2 - 1) * VW * 0.6 / U) * U;
        if (Math.abs(x) < W / 2 + 8 * U) continue;
        var nm = i % 5 === 0 ? 'flower' : 'tuft';
        html += P.SpriteCSS.html(nm, nm).replace('class="', 'style="left:' + (x + VW) + 'px" class="');
      }
      g.innerHTML = html;
    } else {
      g.className = 'platform';
      var last = G.S.history[G.S.history.length - 1];
      g.innerHTML = '<div class="cp-label t-px">CHECKPOINT ' + String(G.S.history.length).padStart(2, '0') + ' — ' + P.fmtHeight(G.S.globalBase) + (last ? ' · ' + last.name.toUpperCase() : '') + '</div>';
    }
  }

  function layerSig(i) {
    var S = G.S, r = G.rt, out = '';
    var ppl = G.mat.piecesPerLayer;
    for (var k = 0; k < ppl; k++) {
      var c = i * ppl + k;
      var v = S.cells[c] || 0;
      if (c === S.cursor && !r.placing) v = 9; // fantasma
      out += v;
      if (r.repairing && r.repairing.cell === c) out += 'r';
    }
    return out;
  }

  function renderLayer(i, sig) {
    var L = layers[i];
    if (!L) {
      var d = document.createElement('div');
      d.className = 'ly';
      el.tower.appendChild(d);
      L = layers[i] = { el: d, sig: null, x: null };
      d.style.width = W + 'px';
      d.style.top = (-(i + 1) * LH) + 'px';
      d.style.left = (-W / 2) + 'px';
    }
    L.sig = sig;
    var S = G.S, st = G.st, ppl = G.mat.piecesPerLayer;
    var A = i % 2 === 0;
    var cls = 'ly';
    if (!A && st.visCorners && i % 6 === 1) cls += ' wrap';
    if (A && st.visBands && i % 10 === 0 && i > 0) cls += ' band';
    L.el.className = cls;
    var html = '';
    for (var k = 0; k < ppl; k++) {
      var c = i * ppl + k;
      var v = S.cells[c] || 0;
      var ghost = c === S.cursor && !G.rt.placing;
      if (v === 0 && !ghost) continue;
      var pc = 'pc ';
      if (A) pc += (k === 0 ? 'a-b ' : 'a-f ') + (((i >> 1) % 2) ? 'hr ' : 'hl ');
      else pc += (k === 0 ? 'b-l ' : 'b-r ') + ((((i >> 1) + k) % 2) ? '' : 'he ');
      pc += ghost ? 'ghost' : 's' + v;
      if (G.rt.repairing && G.rt.repairing.cell === c) pc += ' rep';
      var style = '';
      if (v === C.PLACING && G.rt.placing) style = ' style="--pd:' + G.rt.placing.dur.toFixed(2) + 's"';
      html += '<i class="' + pc + '" data-c="' + c + '"' + style + '>' + (v === C.FIRE ? P.SpriteCSS.html('fire') : '') + '</i>';
    }
    L.el.innerHTML = html;
  }

  function visibleRange() {
    var top = (cam.y + focal) / LH;
    var bot = (cam.y + focal - H) / LH;
    return [Math.max(0, Math.floor(bot) - 3), Math.ceil(top) + 3];
  }

  function updateTower() {
    var rng = visibleRange();
    var maxL = Math.ceil((G.S.cursor + 1) / G.mat.piecesPerLayer);
    var lo = rng[0], hi = Math.min(rng[1], maxL);
    Object.keys(layers).forEach(function (k) {
      var i = +k;
      if (i < lo || i > hi) { layers[i].el.remove(); delete layers[i]; }
    });
    var top = Math.max(1, G.layersBuilt());
    var sw = G.sway();
    var amp = 5 * U * Math.min(2.2, 0.4 + top / 250);
    for (var i = lo; i <= hi; i++) {
      var sig = layerSig(i);
      var L = layers[i];
      if (!L || allDirty || dirty[i] || L.sig !== sig) renderLayer(i, sig);
      L = layers[i];
      var x = Math.round(sw * amp * Math.pow(i / top, 1.6) / U) * U;
      if (L.x !== x) { L.x = x; L.el.style.transform = x ? 'translateX(' + x + 'px)' : ''; }
    }
    dirty = {}; allDirty = false;
  }

  function layerX(i) { var L = layers[i]; return L ? L.x || 0 : 0; }

  /* ---------------- câmera ---------------- */
  function topY() { return G.topLayer() * LH; }
  function camMin() { return Math.round(H * 0.8) - focal; }
  function targetCam() { return Math.max(camMin(), topY() + LH * 2); }

  function updateCamera(dt) {
    var maxY = topY() + H * 0.3;
    if (cam.drag) { /* controlada pelo dedo */ }
    else if (cam.follow) {
      var tgt = targetCam();
      var k = cam.returning && !G.st.quickReturn ? 4 : 10;
      cam.y += (tgt - cam.y) * Math.min(1, dt * k);
      if (Math.abs(tgt - cam.y) < 2) cam.returning = false;
    } else {
      cam.y += cam.vel * dt;
      cam.vel *= Math.pow(0.04, dt);
      if (Math.abs(cam.vel) < 5) cam.vel = 0;
      if (cam.jump != null) {
        cam.y += (cam.jump - cam.y) * Math.min(1, dt * (G.st.quickReturn ? 14 : 6));
        if (Math.abs(cam.jump - cam.y) < 2) cam.jump = null;
      }
    }
    cam.y = Math.max(camMin(), Math.min(maxY, cam.y));
    if (!cam.follow && !cam.drag && cam.jump == null && Math.abs(cam.y - targetCam()) < LH * 3) cam.follow = true;
    el.world.style.transform = 'translate3d(0,' + Math.round(focal + cam.y) + 'px,0)';
  }

  function nearTop() { return Math.abs(cam.y - targetCam()) < H * 0.3; }

  function goTop() {
    cam.follow = true; cam.vel = 0; cam.jump = null; cam.returning = true;
    if (G.st.quickReturn) cam.y = targetCam();
  }

  function goLayer(layer) {
    cam.follow = false; cam.vel = 0;
    cam.jump = Math.max(camMin(), layer * LH + LH);
    if (G.st.quickReturn) { cam.y = cam.jump; cam.jump = null; }
  }

  /* ---------------- cenário ---------------- */
  function buildScenery() {
    // cidade
    var html = '', x = -2, seed = 3;
    function r() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    while (x < 102) {
      var w = 4 + Math.floor(r() * 9), h = 10 + Math.floor(r() * 34);
      html += '<div class="bldg' + (r() < 0.2 ? ' ant' : '') + '" style="left:' + x + '%;width:calc(var(--u) * ' + w * 2 + ');height:calc(var(--u) * ' + h + ')"></div>';
      x += w * 0.9 + r() * 2;
    }
    el.far.innerHTML = html;
    // colinas em degraus
    html = '';
    [[-10, 50, 18, ''], [30, 60, 12, ' d'], [70, 50, 22, '']].forEach(function (hdef) {
      var steps = 6;
      for (var s = 0; s < steps; s++) {
        var inset = s * (hdef[1] / steps / 2);
        html += '<div class="hill' + hdef[3] + '" style="left:' + (hdef[0] + inset) + '%;width:' + (hdef[1] - inset * 2) + '%;height:calc(var(--u) * ' + Math.round(hdef[2] * (s + 1) / steps) + ')"></div>';
      }
    });
    el.mid.innerHTML = html;
    
    // nuvens
    html = '';
    for (var i = 0; i < 7; i++) {
      html += '<i class="sp sp-cloud cl" style="top:' + (-i * 22 + 10) + 'vh;animation-duration:' + (90 + i * 37) + 's;animation-delay:-' + (i * 41) + 's;animation-timing-function:steps(' + (300 + i * 40) + ')"></i>';
    }
    el.clouds.innerHTML = html;
    el.clouds.style.top = '0'; el.clouds.style.bottom = 'auto'; el.clouds.style.height = '100%';
    el.sun.className = 'sp sp-sun';
    html = '';
    for (var j = 0; j < 70; j++) html += '<i style="left:' + (r() * 100).toFixed(1) + '%;top:' + (r() * 100).toFixed(1) + '%;animation-delay:-' + (r() * 3).toFixed(1) + 's"></i>';
    el.stars.innerHTML = html;
  }

  function updateScene() {
    var sc = P.sceneFor(G.globalHeight());
    if (sc !== sceneKey) {
      sceneKey = sc;
      var n = sc.sky.length, stops = sc.sky.map(function (c, i) { return c + ' ' + (i * 100 / n).toFixed(1) + '% ' + ((i + 1) * 100 / n).toFixed(1) + '%'; });
      el.sky.style.background = 'linear-gradient(180deg,' + stops.join(',') + ')';
      el.far.hidden = !sc.city; el.mid.hidden = !sc.hills; el.near.hidden = true;
      el.clouds.hidden = !sc.clouds; el.sun.hidden = !sc.sun;
      el.stars.style.opacity = Math.min(1, sc.stars || 0);
    }
    var base = cam.y - camMin();
    var key = Math.round(base);
    if (key === lastParKey) return;
    lastParKey = key;
    var gy = H - (focal + camMin());
    function par(e, f) { e.style.bottom = gy + 'px'; e.style.transform = 'translate3d(0,' + Math.round(base * f / U) * U + 'px,0)'; }
    par(el.far, 0.05); par(el.mid, 0.09); 
    el.clouds.style.transform = 'translate3d(0,' + Math.round(base * 0.15 / U) * U + 'px,0)';
    el.sun.style.transform = 'translate3d(0,' + Math.round(base * 0.02 / U) * U + 'px,0) scale(2)';
  }

  /* ---------------- ameaças ---------------- */
  function updateEnts() {
    var seen = {};
    G.rt.threats.forEach(function (t) {
      seen[t.id] = 1;
      var e = ents[t.id];
      if (!e) {
        e = document.createElement('div');
        e.className = 'th';
        e.dataset.id = t.id;
        e.innerHTML = P.SpriteCSS.html(t.def.sprite) + '<div class="hp" hidden><i></i></div>';
        el.ents.appendChild(e);
        ents[t.id] = e;
        e._hp = null;
      }
      var px = Math.round(t.x) * U + (t.state === 'attack' || t.state === 'windup' ? layerX(t.layer) : 0);
      var py = -Math.round(t.y) * U;
      var face = t.state === 'attack' || t.state === 'windup' ? -t.side : (t.tx >= t.x ? 1 : -1);
      var sz = P.SpriteCSS.size(t.def.sprite);
      var key = px + ',' + py + ',' + face + t.state;
      if (e._k !== key) {
        e._k = key;
        e.style.transform = 'translate(' + (px - sz.w * U / 2 + 22) + 'px,' + (py - sz.h * U / 2 + 22) + 'px)';
        e.classList.toggle('flip', face < 0);
        e.classList.toggle('windup', t.state === 'windup');
        e.classList.toggle('dead', t.state === 'dead');
      }
      if (t.hp !== e._hp && t.hp < t.maxHp && t.hp > 0) {
        e._hp = t.hp;
        var hp = e.querySelector('.hp'); hp.hidden = false;
        hp.firstChild.style.width = Math.max(0, t.hp / t.maxHp * 100) + '%';
      }
    });
    Object.keys(ents).forEach(function (id) { if (!seen[id]) { ents[id].remove(); delete ents[id]; } });
    // setas de ameaças fora da tela (Sentinela)
    if (G.st.threatWarn) {
      var html = '';
      G.rt.threats.forEach(function (t) {
        if (t.def.kind === 'faller' || t.state === 'dead' || t.state === 'leave') return;
        var sy = focal + cam.y - t.y * U;
        if (sy < 120) html += '<span class="arr" style="left:' + (VW / 2 + t.x * U) + 'px;top:130px">▲</span>';
        else if (sy > H - 90) html += '<span class="arr" style="left:' + (VW / 2 + t.x * U) + 'px;top:' + (H - 100) + 'px">▼</span>';
      });
      el.arrows.innerHTML = html;
    } else if (el.arrows.innerHTML) el.arrows.innerHTML = '';
  }

  /* ---------------- efeitos ---------------- */
  function cellPos(c) {
    var ppl = G.mat.piecesPerLayer, i = Math.floor(c / ppl), k = c % ppl;
    var A = i % 2 === 0;
    var x = A ? 0 : (k === 0 ? -W / 2 + U : W / 2 - U);
    return { x: x + layerX(i), y: -(i + 0.5) * LH, i: i };
  }

  function floatText(x, y, text, cls) {
    var d = document.createElement('div');
    d.className = 'fly-txt' + (cls ? ' ' + cls : '');
    d.style.left = x + 'px'; d.style.top = y + 'px';
    d.textContent = text;
    el.fx.appendChild(d);
    setTimeout(function () { d.remove(); }, 1200);
  }

  function sparks(x, y, color, n) {
    for (var i = 0; i < (n || 6); i++) {
      var s = document.createElement('i');
      s.className = 'spark';
      s.style.left = x + 'px'; s.style.top = y + 'px';
      if (color) s.style.background = color;
      s.style.setProperty('--dx', Math.round((Math.random() * 2 - 1) * 8) * U + 'px');
      s.style.setProperty('--dy', Math.round((Math.random() * 2 - 1.3) * 8) * U + 'px');
      el.fx.appendChild(s);
      setTimeout(function (s) { s.remove(); }.bind(null, s), 600);
    }
  }

  function fallingPiece(c) {
    var p = cellPos(c);
    var A = p.i % 2 === 0;
    var d = document.createElement('i');
    d.className = 'falling';
    d.style.width = (A ? W : 2 * U) + 'px';
    d.style.left = (p.x - (A ? W / 2 : U)) + 'px';
    d.style.top = (p.y - U) + 'px';
    d.style.background = G.mat.look.body;
    el.fx.appendChild(d);
    setTimeout(function () { d.remove(); }, 1300);
  }

  function windLines(dir) {
    for (var i = 0; i < 9; i++) {
      var d = document.createElement('i');
      d.className = 'wl';
      d.style.top = (15 + Math.random() * 70) + '%';
      d.style.width = (6 + Math.floor(Math.random() * 14)) * U + 'px';
      d.style.left = '0';
      d.style.setProperty('--from', (dir > 0 ? -20 : VW + 20) + 'px');
      d.style.setProperty('--to', (dir > 0 ? VW + 20 : -200) + 'px');
      d.style.animationDelay = (Math.random() * 0.6).toFixed(2) + 's';
      el.weather.appendChild(d);
      setTimeout(function (d) { d.remove(); }.bind(null, d), 1700);
    }
  }

  var rainOn = false;
  function updateWeather() {
    var r = G.rt;
    var raining = !!r.rain || r.hail > 0;
    if (raining !== rainOn) {
      rainOn = raining;
      el.weather.querySelectorAll('.drop').forEach(function (d) { d.remove(); });
      if (raining) {
        var n = Math.round(30 * ((r.rain && r.rain.str) || 0.6));
        for (var i = 0; i < n; i++) {
          var d = document.createElement('i');
          d.className = 'drop';
          d.style.left = (Math.random() * 110) + '%';
          d.style.animationDelay = '-' + (Math.random() * 0.7).toFixed(2) + 's';
          d.style.animationDuration = (0.55 + Math.random() * 0.3).toFixed(2) + 's';
          el.weather.appendChild(d);
        }
      }
    }
    el.weather.classList.toggle('storm', r.storm > 0 || !!r.ch);
    el.weather.classList.toggle('heat', r.heat > 0);
  }

  function flash() { el.flash.classList.remove('on'); void el.flash.offsetWidth; el.flash.classList.add('on'); }

  /* ---------------- eventos do jogo ---------------- */
  function bindGame() {
    G.on('cell', function (c) { dirty[Math.floor(c / G.mat.piecesPerLayer)] = 1; });
    G.on('stats', function () { applyVisualFlags(); });
    G.on('reset', function () { allDirty = true; });
    G.on('rebuild', function () { setupMaterial(); cam.y = targetCam(); cam.follow = true; });
    G.on('layerDone', function (d) {
      var p = cellPos(d.layer * G.mat.piecesPerLayer);
      floatText(W / 2 + 6 * U, p.y - 2 * U, '+$' + P.fmtMoney(Math.max(1, d.money)));
    });
    G.on('milestone', function (d) {
      floatText(0, -(d.layer + 3) * LH, 'MARCO ' + d.layer + '! +$' + P.fmtMoney(d.money), 'good');
      sparks(0, -d.layer * LH, '#ffec27', 14);
    });
    G.on('fall', function (d) { if (!d.burnt) fallingPiece(d.cell); });
    G.on('repaired', function (c) { var p = cellPos(c); sparks(p.x, p.y, '#ff77a8', 5); });
    G.on('extinguish', function (c) { var p = cellPos(c); sparks(p.x, p.y, '#c7f0ff', 6); });
    G.on('threatHit', function (t) {
      var e = ents[t.id]; if (!e) return;
      e.classList.remove('hurt'); void e.offsetWidth; e.classList.add('hurt');
      sparks(Math.round(t.x) * U, -Math.round(t.y) * U, '#fff1e8', 3);
    });
    G.on('threatDead', function (d) {
      floatText(Math.round(d.t.x) * U, -Math.round(d.t.y) * U - 16, '+$' + P.fmtMoney(Math.max(1, d.money)), 'good');
      sparks(Math.round(d.t.x) * U, -Math.round(d.t.y) * U, '#ffec27', 8);
    });
    G.on('impact', function (t) { sparks(Math.round(t.x) * U, -Math.round(t.y) * U, '#ff004d', 8); });
    G.on('gust', function (g) { windLines(g.dir); });
    G.on('placeStart', function (p) { dirty[Math.floor(p.cell / G.mat.piecesPerLayer)] = 1; });
    G.on('repairStart', function (r) { dirty[Math.floor(r.cell / G.mat.piecesPerLayer)] = 1; });
    G.on('challenge', function () { flash(); });
  }

  /* ---------------- entrada ---------------- */
  function isUI(t) { return !!t.closest('#topbar, #bottombar, #side-btns, #ruler, .toast, #tree-screen, #modal, #debug, #splash'); }

  function screenToWorld(sx, sy) {
    return { x: sx - VW / 2, y: focal + cam.y - sy };
  }

  /* encontra peça danificada mais próxima do toque */
  function findDamaged(sx, sy) {
    var w = screenToWorld(sx, sy);
    var ppl = G.mat.piecesPerLayer, S = G.S;
    var li = Math.floor(w.y / LH);
    var best = -1, bd = 1e9;
    for (var i = li - 4; i <= li + 4; i++) {
      if (i < 0) continue;
      for (var k = 0; k < ppl; k++) {
        var c = i * ppl + k;
        var v = S.cells[c];
        if (v !== C.CRACK && v !== C.MISS && v !== C.FIRE) continue;
        var p = cellPos(c);
        var A = i % 2 === 0;
        var dx = A ? Math.max(0, Math.abs(w.x - p.x) - W / 2) : Math.abs(w.x - p.x);
        var dy = Math.abs(-w.y - p.y);
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < bd) { bd = d; best = c; }
      }
    }
    return bd <= 28 ? best : -1;
  }

  function bindInput() {
    var g = el.game;
    var ptrs = {};
    g.addEventListener('pointerdown', function (e) {
      if (isUI(e.target)) return;
      e.preventDefault();
      var th = e.target.closest('.th');
      if (th) { G.hitThreat(+th.dataset.id); return; }
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY, y0: e.clientY, cam0: cam.y, t: performance.now(), moved: false, lastY: e.clientY, lastT: performance.now(), v: 0 };
    });
    g.addEventListener('pointermove', function (e) {
      var p = ptrs[e.pointerId];
      if (!p) return;
      var dy = e.clientY - p.y0;
      if (!p.moved && Math.abs(dy) > 10) { p.moved = true; cam.follow = false; cam.jump = null; cam.drag = true; }
      if (p.moved) {
        cam.y = p.cam0 + dy;
        var now = performance.now(), dt = (now - p.lastT) / 1000;
        if (dt > 0) p.v = p.v * 0.6 + ((e.clientY - p.lastY) / dt) * 0.4;
        p.lastY = e.clientY; p.lastT = now;
      }
    });
    function end(e) {
      var p = ptrs[e.pointerId];
      if (!p) return;
      delete ptrs[e.pointerId];
      if (p.moved) { cam.drag = null; cam.vel = p.v; return; }
      // toque simples
      var c = findDamaged(e.clientX, e.clientY);
      if (c >= 0) { G.repairCell(c); return; }
      if (nearTop()) G.tryPlace(false);
      else P.HUD.toast('VOLTE AO TOPO PARA CONSTRUIR', 'warn', true);
    }
    g.addEventListener('pointerup', end);
    g.addEventListener('pointercancel', function (e) { delete ptrs[e.pointerId]; cam.drag = null; });
    g.addEventListener('wheel', function (e) {
      if (isUI(e.target)) return;
      cam.follow = false; cam.jump = null; cam.vel = 0;
      cam.y -= e.deltaY;
    }, { passive: true });
    window.addEventListener('keydown', function (e) {
      if (e.code === 'Space') { e.preventDefault(); if (nearTop()) G.tryPlace(false); }
      if (e.code === 'Home') goTop();
    });
  }

  /* ---------------- frame ---------------- */
  function frame(dt) {
    updateCamera(dt);
    updateTower();
    updateEnts();
    updateScene();
    updateWeather();
  }

  return {
    init: init, frame: frame, goTop: goTop, goLayer: goLayer, nearTop: nearTop,
    get cam() { return cam; }, get LH() { return LH; }, get U() { return U; },
    viewLayers: function () { return [(cam.y + focal - H) / LH, (cam.y + focal) / LH]; },
    measure: measure
  };
})();
