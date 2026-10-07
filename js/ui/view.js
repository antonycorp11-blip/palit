/* =========================================================
   VIEW — cenário, torre, câmera, ameaças, efeitos e entrada.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.View = (function () {
  var P = PALIT, G, C;
  var U = 4, HU = 3, LH = 8, W = 104;  // U = pixel do mundo, HU = pixel do HUD
  var L = 26, D = 13, X0 = -19;          // geometria oblíqua em unidades
  var stickKey = '';
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
    var desk = window.innerWidth >= 1000 && window.innerHeight >= 560;
    HU = window.innerWidth < 480 ? 3 : 4;
    U = window.innerWidth < 480 ? 4 : desk && window.innerHeight >= 900 ? 6 : 5;
    document.documentElement.style.setProperty('--u', HU + 'px');
    if (el.world) el.world.style.setProperty('--u', U + 'px');
    LH = U * G.LHU;
    H = window.innerHeight; VW = window.innerWidth;
    focal = Math.round(H * 0.5);
    if (G.rt) G.rt.viewW = VW / U;
    geo();
    P.SpriteCSS.compile(HU);
    P.SpriteCSS.compile(U, '#world ', 'sprite-css-world');
    stickKey = '';
  }

  /* ---------------- material / torre ----------------
     Projeção oblíqua (como uma torre de palitos vista de cima/frente):
       ponto (x, z, h) → tela (x + z/2, h + z/2)
     Camadas pares: palitos ao longo de X (frente e fundo).
     Camadas ímpares: palitos ao longo de Z (esquerda e direita),
     desenhados em diagonal 1:1. Cada palito é um sprite box-shadow
     gerado por material.                                            */
  function geo() {
    if (!G.mat) return;
    L = G.mat.look.len; D = Math.round(L / 2);
    X0 = -Math.round((L + D) / 2);
    W = (L + D) * U;
  }

  var ZN = 2;                           // recuo do palito da frente
  function zf() { return L - 4; }       // posição do palito do fundo

  function compileSticks() {
    var lk = G.mat.look, st = G.st;
    var headless = !lk.head || st.visHeadless > 0;
    var key = G.mat.id + U + headless;
    if (key === stickKey) return;
    stickKey = key;
    var c = {
      l: lk.light, b: lk.body, s: lk.shade,
      h: headless ? lk.light : lk.head, d: headless ? lk.shade : lk.headDark, H: headless ? null : lk.head
    };
    var hl = lk.headLen || 3;
    function css(px) {
      return px.filter(function (p) { return p[2]; }).map(function (p) { return ((p[0] + 1) * U) + 'px ' + ((p[1] + 1) * U) + 'px 0 0 ' + p[2]; }).join(',');
    }
    // palito ao longo de X: linha 0 = volume da cabeça; 1 topo claro; 2 corpo; 3 lateral escura
    function xs(headLeft) {
      var px = [];
      for (var x = 0; x < L; x++) {
        var isH = headLeft ? x < hl : x >= L - hl;
        var end = x === (headLeft ? L - 1 : 0);
        px.push([x, 1, isH ? c.H || c.h : c.l]);
        px.push([x, 2, isH ? c.h : (end ? c.l : c.b)]);
        px.push([x, 3, isH ? c.d : (end ? c.b : c.s)]);
      }
      var h0 = headLeft ? 0 : L - hl;
      for (var j = h0; j < h0 + hl; j++) if (c.H) px.push([j, 0, j === h0 || j === h0 + hl - 1 ? null : c.H]);
      return css(px);
    }
    // palito ao longo de Z: diagonal subindo para a direita (1:1), D degraus, espessura 3
    function zs(headNear) {
      var px = [], top = D + 3;
      for (var j = 0; j < D; j++) {
        var isH = headNear ? j < hl - 1 : j >= D - (hl - 1);
        px.push([j, top - (j + 2), isH ? c.H || c.h : c.l]);
        px.push([j, top - (j + 1), isH ? c.h : c.b]);
        px.push([j, top - j, isH ? c.d : (j === 0 ? c.l : c.b)]);
        px.push([j + 1, top - j, isH ? c.d : c.s]);
        if (isH && c.H && j === (headNear ? 0 : D - 1)) px.push([j, top - (j + 3), c.H]);
      }
      return css(px);
    }
    var out = [
      '.sx-l,.sx-r{width:' + L * U + 'px;height:' + 4 * U + 'px}',
      '.sz-n,.sz-f{width:' + (D + 2) * U + 'px;height:' + (D + 4) * U + 'px}',
      '.sx-l::before{box-shadow:' + xs(true) + '}',
      '.sx-r::before{box-shadow:' + xs(false) + '}',
      '.sz-n::before{box-shadow:' + zs(true) + '}',
      '.sz-f::before{box-shadow:' + zs(false) + '}'
    ];
    var e = document.getElementById('stick-css') || document.createElement('style');
    e.id = 'stick-css';
    e.textContent = out.join('\n');
    document.head.appendChild(e);
  }

  /* retângulo (em px, relativo à base da camada) e classe do sprite da peça k da camada i */
  function stickRect(i, k) {
    var A = i % 2 === 0;
    if (A) {
      var oz = Math.round((k === 0 ? zf() : ZN) / 2);
      return { cls: ((i >> 1) % 2) ? 'sx-r' : 'sx-l', left: oz * U, bottom: oz * U, w: L * U, h: 4 * U, A: true, oz: oz };
    }
    var xb = k === 0 ? 2 : L - 4;
    return { cls: (((i >> 1) + k) % 2) ? 'sz-f' : 'sz-n', left: xb * U, bottom: 0, w: (D + 2) * U, h: (D + 4) * U, A: false, xb: xb };
  }

  /* segmento central da peça, em px de mundo (y para cima negativo) */
  function cellSeg(c) {
    var ppl = G.mat.piecesPerLayer, i = Math.floor(c / ppl), k = c % ppl;
    var r = stickRect(i, k), base = i * G.LHU, lx = layerX(i);
    if (r.A) {
      var y = -(base + r.oz + 1.5) * U;
      return [(X0 + r.oz) * U + lx, y, (X0 + r.oz + L) * U + lx, y];
    }
    return [(X0 + r.xb) * U + lx, -(base + 1.5) * U, (X0 + r.xb + D) * U + lx, -(base + 1.5 + D) * U];
  }

  function setupMaterial() {
    geo();
    stickKey = '';
    compileSticks();
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
    compileSticks();
    var glue = ['#fff1e8', '#fff1e8', '#ffccaa', '#ffec27', '#c2c3c7', '#29adff'][Math.min(5, st.visGlue)];
    el.tower.style.setProperty('--glue', glue);
    allDirty = true;
  }

  function buildGround() {
    var g = el.ground;
    g.innerHTML = '';
    var slab = '<div class="slab" style="left:' + ((X0 - 4) * U) + 'px;width:' + (W + 8 * U) + 'px"></div>' +
      '<div class="shadow" style="left:' + ((X0 + 1) * U) + 'px;width:' + ((L + D) * U) + 'px"></div>';
    if (G.S.matIndex === 0) {
      g.className = '';
      var html = '<div class="fence"></div>' + slab;
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
      g.innerHTML = slab + '<div class="cp-label t-px">CHECKPOINT ' + String(G.S.history.length).padStart(2, '0') + ' — ' + P.fmtHeight(G.S.globalBase) + (last ? ' · ' + last.name.toUpperCase() : '') + '</div>';
    }
  }

  function layerSig(i) {
    var S = G.S, r = G.rt, out = '';
    var ppl = G.mat.piecesPerLayer;
    for (var k = 0; k < ppl; k++) {
      var c = i * ppl + k;
      var v = S.cells[c] || 0;
      if (c === S.cursor && !r.placing) v = 9; // fantasma: próxima posição
      out += v;
      if (r.repairing && r.repairing.cell === c) out += 'r';
    }
    // reforços dependem da camada de baixo
    if (i % 2 === 1) out += '|' + (S.cells[(i - 1) * ppl] || 0) + (S.cells[(i - 1) * ppl + 1] || 0);
    return out;
  }

  function renderLayer(i, sig) {
    var Ly = layers[i];
    if (!Ly) {
      var d = document.createElement('div');
      d.className = 'ly';
      el.tower.appendChild(d);
      Ly = layers[i] = { el: d, sig: null, x: null };
      d.style.top = (-(i * G.LHU) * U) + 'px';
      d.style.left = (X0 * U) + 'px';
      d.style.zIndex = i;
    }
    Ly.sig = sig;
    var S = G.S, st = G.st, ppl = G.mat.piecesPerLayer;
    var A = i % 2 === 0;
    var html = '';
    for (var k = 0; k < ppl; k++) {
      var c = i * ppl + k;
      var v = S.cells[c] || 0;
      var ghost = c === S.cursor && !G.rt.placing;
      if (v === 0 && !ghost) continue;
      var r = stickRect(i, k);
      var cls = 'sp stk ' + r.cls + ' ' + (ghost ? 'ghost' : 's' + v);
      if (G.rt.repairing && G.rt.repairing.cell === c) cls += ' rep';
      var style = 'left:' + r.left + 'px;bottom:' + r.bottom + 'px';
      if (v === C.PLACING && G.rt.placing) {
        var fl = flyFrom(i, r);
        style += ';--pd:' + G.rt.placing.dur.toFixed(2) + 's;--sx:' + fl.sx + 'px;--sy:' + fl.sy + 'px;--sr:' + fl.sr + 'deg';
      }
      var inner = '';
      var mx = A ? Math.round(L / 2) * U : Math.round(D / 2) * U;
      var my = A ? U : Math.round(D / 2) * U;
      if (v === C.CRACK) inner = '<b class="crk" style="left:' + mx + 'px;bottom:' + my + 'px"></b>';
      if (v === C.FIRE) inner = P.SpriteCSS.html('fire').replace('class="', 'style="left:' + (mx - 2 * U) + 'px;bottom:' + (my + 2 * U) + 'px" class="');
      // faixa de linha a cada 10 camadas (Camada Reforçada)
      if (A && k === 1 && st.visBands && i % 10 === 0 && i > 0 && v === C.OK) {
        inner += '<b class="thr" style="left:' + 4 * U + 'px"></b><b class="thr" style="left:' + (L - 5) * U + 'px"></b>';
      }
      html += '<i class="' + cls + '" data-c="' + c + '" style="' + style + '">' + inner + '</i>';
    }
    // placa de marco a cada N camadas
    if ((i + 1) % G.mat.milestoneEvery === 0 && G.layersBuilt() > i) {
      html += '<b class="plaque" style="bottom:' + 2 * U + 'px">' + (i + 1) + '</b>';
    }
    // cola e amarração nos cruzamentos (camadas Z sobre camadas X)
    if (!A && (st.visGlue > 0 || st.visCorners > 0)) {
      var wrap = st.visCorners > 0 && i % 6 === 1;
      for (var kk = 0; kk < ppl; kk++) {
        if (S.cells[i * ppl + kk] !== C.OK) continue;
        var xb = kk === 0 ? 2 : L - 4;
        [ZN, zf()].forEach(function (z, zi) {
          if (S.cells[(i - 1) * ppl + (zi === 0 ? 1 : 0)] !== C.OK) return;
          var oz = Math.round(z / 2);
          html += '<b class="' + (wrap ? 'wrp' : 'glu') + '" style="left:' + (xb + oz) * U + 'px;bottom:' + (oz - 1) * U + 'px"></b>';
        });
      }
    }
    Ly.el.innerHTML = html;
  }

  /* de onde o palito vem voando: da caixa do HUD (ou da borda, se for o braço mecânico) */
  function flyFrom(i, r) {
    var pl = G.rt.placing;
    if (pl.fly) return pl.fly;
    var tx = VW / 2 + X0 * U + r.left + r.w / 2 + layerX(i);
    var ty = focal + cam.y - i * G.LHU * U - r.bottom - r.h / 2;
    var bx, by;
    var box = document.getElementById('h-box');
    if (pl.auto || !box) { bx = VW + 40; by = ty - 120; }
    else { var b = box.getBoundingClientRect(); bx = b.left + b.width / 2; by = b.top + b.height / 2; }
    pl.fly = { sx: Math.round(bx - tx), sy: Math.round(by - ty), sr: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.round(Math.random() * 4) * 45) };
    return pl.fly;
  }

  function visibleRange() {
    var top = (cam.y + focal) / LH;
    var bot = (cam.y + focal - H - D * U) / LH;
    return [Math.max(0, Math.floor(bot) - 2), Math.ceil(top) + 2];
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
      var Ly = layers[i];
      if (!Ly || allDirty || dirty[i] || Ly.sig !== sig) renderLayer(i, sig);
      Ly = layers[i];
      var x = Math.round(sw * amp * Math.pow(i / top, 1.6) / U) * U;
      if (Ly.x !== x) { Ly.x = x; Ly.el.style.transform = x ? 'translateX(' + x + 'px)' : ''; }
    }
    dirty = {}; allDirty = false;
    // bandeirinha no topo da torre
    var built = G.layersBuilt();
    var f = el.flag;
    if (!f) { f = el.flag = document.createElement('i'); f.className = 'sp sp-flag topflag'; el.fx.parentNode.appendChild(f); }
    f.hidden = built < 2;
    if (built >= 2) {
      var fx = (X0 + L + Math.round(D / 2) - 2) * U + layerX(built - 1);
      var fy = -(built * G.LHU + Math.round(D / 2) + 7) * U;
      var key = fx + ',' + fy;
      if (f._k !== key) { f._k = key; f.style.transform = 'translate(' + fx + 'px,' + fy + 'px)'; }
    }
  }

  function layerX(i) { var Ly = layers[i]; return Ly ? Ly.x || 0 : 0; }

  /* ---------------- câmera ---------------- */
  function topY() { return (G.topLayer() * G.LHU + D) * U; }
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
    cam.jump = Math.max(camMin(), layer * LH + D * U / 2);
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
      el.far.hidden = !sc.city; el.mid.hidden = !sc.hills; el.near.hidden = true;
      el.clouds.hidden = !sc.clouds;
      $('mountains').hidden = !sc.hills; $('cloudbank').hidden = !sc.clouds;
      $('trees').hidden = $('houses').hidden = !(sc.fence && G.S.matIndex === 0);
    }
    var base = cam.y - camMin();
    var key = Math.round(base);
    if (key === lastParKey) return;
    lastParKey = key;
    var gy = H - (focal + camMin());
    function par(e, f) { e.style.bottom = gy + 'px'; e.style.transform = 'translate3d(0,' + Math.round(base * f / U) * U + 'px,0)'; }
    par(el.far, 0.05); par(el.mid, 0.09); 
    el.clouds.style.transform = 'translate3d(0,' + Math.round(base * 0.15 / U) * U + 'px,0)';
    P.Ambient.parallax(base, gy, U);
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
    var g = cellSeg(c);
    return { x: (g[0] + g[2]) / 2, y: (g[1] + g[3]) / 2, i: Math.floor(c / G.mat.piecesPerLayer) };
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
    var ppl = G.mat.piecesPerLayer, i = Math.floor(c / ppl), k = c % ppl;
    var r = stickRect(i, k);
    var d = document.createElement('i');
    d.className = 'sp stk falling ' + r.cls;
    d.style.left = (X0 * U + r.left + layerX(i)) + 'px';
    d.style.top = (-(i * G.LHU) * U - r.bottom - r.h) + 'px';
    d.style.setProperty('--rot', (Math.random() < 0.5 ? -1 : 1) * 90 + 'deg');
    d.style.setProperty('--fx', Math.round((Math.random() * 2 - 1) * 20) * U + 'px');
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

  function shake(px) {
    var g = el.game;
    g.style.setProperty('--sh', (px || 2) * HU + 'px');
    g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
  }

  /* brilho correndo pela camada recém-completada */
  function layerShine(i) {
    var d = document.createElement('i');
    d.className = 'shine';
    d.style.left = (X0 * U + layerX(i)) + 'px';
    d.style.top = (-(i * G.LHU + 4) * U) + 'px';
    d.style.width = W + 'px';
    el.fx.appendChild(d);
    setTimeout(function () { d.remove(); }, 600);
  }

  function dust(x, y) {
    for (var i = 0; i < 4; i++) {
      var s = document.createElement('i');
      s.className = 'spark dust';
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--dx', ((i < 2 ? -1 : 1) * (3 + i % 2 * 3)) * U + 'px');
      s.style.setProperty('--dy', (-1 - i % 2) * U + 'px');
      el.fx.appendChild(s);
      setTimeout(function (s) { s.remove(); }.bind(null, s), 500);
    }
  }

  function flash() { el.flash.classList.remove('on'); void el.flash.offsetWidth; el.flash.classList.add('on'); }

  /* ---------------- eventos do jogo ---------------- */
  function bindGame() {
    G.on('cell', function (c) { dirty[Math.floor(c / G.mat.piecesPerLayer)] = 1; });
    G.on('stats', function () { applyVisualFlags(); });
    G.on('placeDone', function (c) { var p = cellPos(c); dust(p.x, p.y); });
    G.on('reset', function () { allDirty = true; });
    G.on('rebuild', function () { setupMaterial(); cam.y = targetCam(); cam.follow = true; });
    G.on('layerDone', function (d) {
      floatText(W / 2 + 2 * U, -(d.layer * G.LHU + D) * U, '+$' + P.fmtMoney(Math.max(1, d.money)));
      layerShine(d.layer);
    });
    G.on('milestone', function (d) {
      floatText(0, -(d.layer * G.LHU + D + 8) * U, 'MARCO ' + d.layer + '!', 'good');
      sparks(0, -(d.layer * G.LHU + D / 2) * U, '#ffec27', 18);
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

  /* encontra peça danificada mais próxima do toque (distância ao segmento da peça) */
  function findDamaged(sx, sy) {
    var w = screenToWorld(sx, sy);
    var px = w.x, py = -w.y;
    var ppl = G.mat.piecesPerLayer, S = G.S;
    var li = Math.floor(w.y / LH);
    var best = -1, bd = 1e9;
    for (var i = li - Math.ceil(D / 2) - 4; i <= li + 4; i++) {
      if (i < 0) continue;
      for (var k = 0; k < ppl; k++) {
        var c = i * ppl + k;
        var v = S.cells[c];
        if (v !== C.CRACK && v !== C.MISS && v !== C.FIRE) continue;
        var g = cellSeg(c);
        var dx = g[2] - g[0], dy = g[3] - g[1];
        var t = Math.max(0, Math.min(1, ((px - g[0]) * dx + (py - g[1]) * dy) / (dx * dx + dy * dy)));
        var ex = g[0] + dx * t - px, ey = g[1] + dy * t - py;
        var d = Math.sqrt(ex * ex + ey * ey);
        if (d < bd) { bd = d; best = c; }
      }
    }
    return bd <= 26 ? best : -1;
  }

  function bindInput() {
    var g = el.game;
    var ptrs = {};
    g.addEventListener('pointerdown', function (e) {
      if (isUI(e.target)) return;
      e.preventDefault();
      if (P.Pause.active()) { if (P.Story.active()) P.Story.advance(); return; }
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
    measure: measure, sparks: sparks, findDamaged: function (x, y) { return findDamaged(x, y); },
    cellScreen: function (c) { var p = cellPos(c); return { x: VW / 2 + p.x, y: focal + cam.y + p.y }; },
    toScreen: function (wx, wy) { return { x: VW / 2 + wx, y: focal + cam.y + wy }; },
    scrollBy: function (dy) { cam.follow = false; cam.jump = null; cam.vel = 0; cam.y += dy; },
    shake: shake, get W() { return W; }, get D() { return D; }
  };
})();
