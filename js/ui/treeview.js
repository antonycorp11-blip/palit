/* =========================================================
   TREE VIEW — tela grande, arrastável, com zoom.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.TreeView = (function () {
  var P = PALIT, G;
  var el = {};
  var built = null;      // id da árvore construída
  var nodesEl = {};
  var linesEl = [];
  var sel = null;
  var view = { x: 0, y: 0, z: 0.8 };
  var prevState = {};
  var fruitsEl = {};

  function $(id) { return document.getElementById(id); }

  function init() {
    G = P.Game;
    el.screen = $('tree-screen');
    el.screen.innerHTML =
      '<div id="tree-head"><div class="row"><h2 id="t-title"></h2>' +
      '<span class="money" id="t-money"></span>' +
      '<button class="pxbtn" id="t-close" aria-label="Fechar">' + P.SpriteCSS.html('ico_close') + '</button></div>' +
      '<div class="bar t-bar"><i id="t-bar"></i></div>' +
      '<div class="prog"><span>PROGRESSO DA ÁRVORE: <b id="t-prog" class="c-g"></b></span><span>MATERIAL DOMINADO: <b id="t-dom"></b></span><span id="t-next" class="c-l"></span></div></div>' +
      '<div id="tree-view"><div id="tree-canvas"><svg id="tree-lines"></svg></div>' +
      '<div id="tree-zoom"><button class="pxbtn" id="t-zin">+</button><button class="pxbtn" id="t-zout">−</button><button class="pxbtn" id="t-zc">◎</button></div></div>' +
      '';
    el.view = $('tree-view'); el.canvas = $('tree-canvas'); el.lines = $('tree-lines'); el.detail = document.createElement('div');
    el.detail.id = 'tree-pop'; el.detail.className = 'px'; el.detail.hidden = true;
    el.view.appendChild(el.detail);
    el.detail.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    $('t-close').addEventListener('click', close);
    $('t-zin').addEventListener('click', function () { zoom(1.25); });
    $('t-zout').addEventListener('click', function () { zoom(0.8); });
    $('t-zc').addEventListener('click', home);
    bindPan();
    G.on('bought', function (d) { if (!el.screen.hidden) { refresh(); if (d && d.id) celebrate(d.id, d.n); } });
    G.on('stats', function () { if (!el.screen.hidden) refresh(); });
    G.on('produce', produceFx);
    G.on('rebuild', function () { built = null; sceneVars(); });
    sceneVars();
  }

  function fitZoom() {
    var w = el.view.clientWidth, h = el.view.clientHeight;
    return Math.max(0.3, Math.min(0.9, w / 2200, h * 0.86 / 1700));
  }
  /* enquadra a copa inteira com o chão aparecendo embaixo */
  function home() {
    view.z = fitZoom();
    view.x = 0;
    view.y = Math.round(el.view.clientHeight * 0.4 - GY * view.z);
    apply();
  }

  var GY = 560, BOXX = 430;      // chão (y) e posição da caixa (x) no canvas

  /* cores do "fruto" (o material da era) a partir da arte do palito */
  function fruitColors() {
    var art = P.STICKS && P.STICKS[G.mat.id], lk = G.mat.look;
    if (art && art.grid) {
      var g = art.grid, mid = g[Math.floor(g.length / 2)], c = Math.floor(mid.length / 2);
      var pick = function (row, col) { var ch = row[col]; return ch && ch !== '.' ? art.pal[ch] : null; };
      return { l: pick(g[0], c) || lk.light, b: pick(mid, c) || lk.body, d: pick(g[g.length - 1], c) || lk.shade, h: pick(mid, 1) || pick(mid, 0) || lk.light };
    }
    if (art) return { l: art.pal.L, b: art.pal.B, d: art.pal.D, h: art.pal.R };
    return { l: lk.light, b: lk.body, d: lk.shade, h: lk.head || lk.light };
  }

  function sceneVars() {
    var look = P.treeLookOf(G.mat), sc = P.sceneOf(G.mat), f = fruitColors();
    var v = el.screen.style;
    v.setProperty('--b1', look.bark[0]); v.setProperty('--b2', look.bark[1]); v.setProperty('--b3', look.bark[2]);
    v.setProperty('--l1', look.leaf[0]); v.setProperty('--l2', look.leaf[1]); v.setProperty('--l3', look.leaf[2]);
    v.setProperty('--g1', look.ground[0]); v.setProperty('--g2', look.ground[1]);
    var rs = document.documentElement.style;
    rs.setProperty('--f1', f.l); rs.setProperty('--f2', f.b); rs.setProperty('--f3', f.d); rs.setProperty('--fh', f.h);
    var sky = sc.sky || ['#1d6fd8', '#29adff', '#8fd8ff'];
    el.view.style.background = 'linear-gradient(180deg,' + sky[0] + ' 0%,' + sky[Math.floor(sky.length / 2)] + ' 55%,' + sky[sky.length - 1] + ' 100%)';
    el.screen.dataset.style = look.style;
    el.screen.classList.toggle('space', !!sc.stars && sc.stars >= 1);
    return look;
  }

  function build() {
    var def = G.def;
    if (!def) return;
    built = def.id;
    nodesEl = {}; linesEl = []; fruitsEl = {};
    var cv = el.canvas;
    cv.querySelectorAll('.tn, .br-label, .tz').forEach(function (n) { n.remove(); });
    var look = sceneVars();
    var back =
      '<div class="tz tz-ground" style="top:' + GY + 'px"></div>' +
      '<div class="tz tz-trunk" id="tz-trunk" style="top:-24px;height:' + (GY + 28) + 'px"><i></i></div>' +
      '<div class="tz tz-roots" style="top:' + (GY - 20) + 'px"></div>' +
      '<div class="tz tz-brace" id="tz-brace" style="top:' + GY + 'px"></div>' +
      '<div class="tz tz-props" id="tz-props" style="top:' + GY + 'px"><i class="l"></i><i class="r"></i></div>' +
      '<div class="tz tz-belt" id="tz-belt" style="left:52px;top:' + (GY - 8) + 'px;width:' + (BOXX - 80) + 'px"></div>' +
      '<div class="tz tz-hole" style="left:22px;top:' + (GY - 30) + 'px"></div>' +
      '<div class="tz tz-box" id="tz-box" style="left:' + BOXX + 'px;top:' + GY + 'px"><div class="crates"></div><b class="cnt t-px"></b><b class="rate t-px"></b><span class="to-tower t-px">PARA A TORRE ▶</span></div>' +
      '<div class="tz tz-crew" id="tz-crew" style="top:' + GY + 'px"></div>' +
      '<div class="tz tz-name t-px" style="top:' + (GY + 40) + 'px">' + look.name.toUpperCase() + '</div>' +
      '<div class="tz tz-flow" id="tz-flow"></div>';
    cv.insertAdjacentHTML('afterbegin', back);
    var brById = {};
    def.branches.forEach(function (b) { brById[b.id] = b; });
    var svg = '';
    def.nodes.forEach(function (n) {
      n.reqs.forEach(function (r) {
        var o = def.byId[r.id];
        var x1 = o.x, y1 = o.y;
        if (!o.b && brById[n.b]) { x1 = brById[n.b].ox; y1 = brById[n.b].oy; }
        var len = Math.round(Math.hypot(n.x - x1, n.y - y1));
        var w = !o.b ? 16 : Math.max(4, 13 - Math.floor((n.along || 0) * 0.6));
        svg += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + n.x + '" y2="' + n.y + '" stroke-width="' + w + '" style="--len:' + len + '" data-a="' + o.id + '" data-b="' + n.id + '" data-lv="' + r.lv + '"/>';
      });
    });
    el.lines.innerHTML = svg;
    linesEl = Array.prototype.slice.call(el.lines.querySelectorAll('line'));
    def.branches.forEach(function (b) {
      var lab = document.createElement('div');
      lab.className = 'br-label';
      lab.style.left = b.labelX + 'px'; lab.style.top = b.labelY + 'px';
      lab.style.setProperty('--bc', b.color);
      lab.textContent = b.name;
      cv.appendChild(lab);
    });
    def.nodes.forEach(function (n) {
      var d = document.createElement('div');
      var br = brById[n.b];
      d.className = 'tn' + (n.sp ? ' sp-node' : '') + (n.b ? '' : ' root');
      d.dataset.id = n.id;
      d.style.left = n.x + 'px'; d.style.top = n.y + 'px';
      d.style.setProperty('--bc', br ? br.color : '#ffa300');
      d.style.setProperty('--rot', ((n.x * 7 + n.y * 3) % 4) * 90 + 'deg');
      d.innerHTML = '<i class="leaf"></i>' + P.SpriteCSS.html(br ? 'ico_' + br.icon : 'ico_match') + '<span class="lv"></span>';
      d.addEventListener('click', function (e) { e.stopPropagation(); select(n.id); });
      cv.appendChild(d);
      nodesEl[n.id] = d;
      // frutos: o material nasce nos galhos de produção (e na raiz)
      if (!n.b || n.b === 'prod') {
        var f = document.createElement('i');
        f.className = 'tz tz-fruit';
        f.style.left = (n.x + (n.b ? 10 : 26)) + 'px'; f.style.top = (n.y + (n.b ? 16 : 26)) + 'px';
        f.style.animationDelay = (-(n.x % 7) * 0.3).toFixed(1) + 's';
        cv.appendChild(f);
        fruitsEl[n.id] = f;
      }
    });
  }

  /* mudanças físicas da árvore conforme as melhorias */
  function refreshScene() {
    var st = G.st, lv = G.levels(), def = G.def;
    var p = G.progress();
    var tw = Math.round(44 + p * 70);
    el.screen.style.setProperty('--tw', tw + 'px');
    var owned = {};
    def.nodes.forEach(function (n) { if ((lv[n.id] || 0) > 0) owned[n.b] = (owned[n.b] || 0) + 1; });
    Object.keys(fruitsEl).forEach(function (id) {
      var l = lv[id] || 0, n = def.byId[id];
      fruitsEl[id].className = 'tz tz-fruit' + (l > 0 ? ' on' : '') + (l >= n.lv ? ' ripe' : '');
    });
    $('tz-belt').classList.toggle('on', (owned.spd || 0) > 0);
    $('tz-belt').style.setProperty('--bs', (0.9 / (1 + st.placeSpeed)).toFixed(2) + 's');
    $('tz-props').classList.toggle('on', (owned.res || 0) >= 2);
    var br = $('tz-brace'), bh = st.limitLayers > 0 ? Math.min(GY - 60, 30 + Math.round(st.limitLayers * 0.45)) : 0;
    br.style.height = bh + 'px'; br.style.marginTop = (-bh) + 'px';
    br.hidden = !bh;
    // caixa: cresce com a capacidade (pilha de caixotes)
    var crates = Math.max(1, Math.min(10, Math.ceil(st.capacity / 12)));
    var box = $('tz-box');
    if (box._n !== crates) {
      box._n = crates;
      var html = '', rows = [4, 3, 2, 1], k = 0;
      for (var r = 0; r < rows.length && k < crates; r++) for (var c = 0; c < rows[r] && k < crates; c++, k++) {
        html += '<i style="left:' + (c * 34 + r * 17) + 'px;bottom:' + (r * 28) + 'px"></i>';
      }
      box.firstChild.innerHTML = html;
    }
    updateBox();
    // ajudantes e robô morando no pé da árvore
    var crewKey = Math.round(st.helpers || 0) + ',' + Math.round(st.fixers || 0) + ',' + (st.autoPlace > 0 ? 1 : 0) + G.mat.id;
    var crew = $('tz-crew');
    if (crew._k !== crewKey) {
      crew._k = crewKey;
      var spr = { fosforo: ['hlp_ant', 'hlp_beetle'], dente: ['hlp_cricket', 'hlp_ladybug'] }[G.mat.id] || ['hlp_bot', 'hlp_drone'];
      var h = '';
      for (var i = 0; i < Math.round(st.helpers || 0); i++) h += '<span class="crew def" style="--x:' + (-160 - i * 46) + 'px;animation-delay:-' + i * 1.3 + 's">' + P.SpriteCSS.html(spr[0]) + '</span>';
      for (var j = 0; j < Math.round(st.fixers || 0); j++) h += '<span class="crew fix" style="--x:' + (120 + j * 50) + 'px;animation-delay:-' + j * 1.7 + 's">' + P.SpriteCSS.html(spr[1]) + '</span>';
      if (st.autoPlace > 0) h += '<span class="crew bot" style="--x:' + (BOXX - 40) + 'px">' + P.SpriteCSS.html('hlp_bot') + '</span>';
      crew.innerHTML = h;
    }
  }

  function updateBox() {
    var box = $('tz-box');
    if (!box) return;
    var S = G.S, cap = G.st.capacity;
    box.querySelector('.cnt').textContent = Math.floor(S.pieces) + '/' + cap + (S.reserve >= 1 ? ' +' + Math.floor(S.reserve) : '');
    box.classList.toggle('full', S.pieces >= cap);
    var pr = G.prodRate();
    box.querySelector('.rate').textContent = pr > 0 ? 'A ÁRVORE DÁ 1 ' + G.mat.piece.toUpperCase() + ' A CADA ' + P.fmtNum(1 / pr, 1) + 's' : 'PRODUÇÃO PARADA';
  }

  /* um palito sai de baixo da árvore e vai até a caixa (e dali para a torre) */
  var flowing = 0;
  function produceFx() {
    if (el.screen.hidden || !$('tz-flow') || flowing > 10) return;
    var flow = $('tz-flow'), belt = $('tz-belt').classList.contains('on');
    var dur = Math.max(0.7, Math.min(2.6, 2.4 / (1 + G.st.prodMult)));
    var pc = document.createElement('i');
    pc.className = 'tz-piece' + (belt ? ' belt' : '');
    pc.style.left = '34px'; pc.style.top = (GY - 14) + 'px';
    pc.style.setProperty('--dx', (BOXX - 20) + 'px');
    pc.style.animationDuration = dur + 's';
    flow.appendChild(pc);
    flowing++;
    setTimeout(function () {
      pc.remove(); flowing--;
      var box = $('tz-box'); if (box) { box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump'); }
      updateBox();
    }, dur * 1000);
    // às vezes um fruto maduro cai do galho
    var ids = Object.keys(fruitsEl).filter(function (id) { return fruitsEl[id].classList.contains('on'); });
    if (ids.length && Math.random() < 0.45) {
      var id = ids[Math.floor(Math.random() * ids.length)], n = G.def.byId[id];
      var fr = document.createElement('i');
      fr.className = 'tz-drop';
      fr.style.left = (n.x + (n.b ? 10 : 26)) + 'px'; fr.style.top = (n.y + (n.b ? 16 : 26)) + 'px';
      fr.style.setProperty('--fy', (GY - 10 - n.y - 16) + 'px');
      fr.style.setProperty('--fx', (30 - n.x) + 'px');
      flow.appendChild(fr);
      setTimeout(function () { fr.remove(); }, 1300);
    }
  }

  function refresh() {
    var def = G.def;
    if (!def) return;
    if (built !== def.id) build();
    var lv = G.levels(), money = G.S.money;
    var newly = [];
    def.nodes.forEach(function (n) {
      var d = nodesEl[n.id];
      var s = P.Tree.nodeState(def, n, lv);
      var l = lv[n.id] || 0;
      var afford = s !== 'max' && s !== 'locked' && money >= P.Tree.cost(def, G.mat, n, l);
      var keep = (d.classList.contains('bought') ? ' bought' : '') + (d.classList.contains('new') ? ' new' : '');
      if (prevState[n.id] === 'locked' && s === 'avail') { keep = ' new'; newly.push(n.id); }
      prevState[n.id] = s;
      d.className = 'tn ' + s + (afford ? ' afford' : '') + (n.sp ? ' sp-node' : '') + (n.b ? '' : ' root') + (sel === n.id ? ' sel' : '') + keep;
      d.querySelector('.lv').textContent = l + '/' + n.lv;
    });
    var brColor = {};
    def.branches.forEach(function (b) { brColor[b.id] = b.color; });
    linesEl.forEach(function (ln) {
      var a = ln.getAttribute('data-a'), b = ln.getAttribute('data-b'), need = +ln.getAttribute('data-lv');
      var met = (lv[a] || 0) >= need;
      var bOwned = (lv[b] || 0) > 0;
      var cls = bOwned ? 'on' : met ? 'half' : '';
      if (ln._g) cls += ' grow';
      ln.setAttribute('class', cls);
      ln.style.setProperty('--lc', brColor[def.byId[b].b] || '#ffa300');
    });
    if (newly.length) {
      P.Audio.sfx.unlock();
      setTimeout(function () { newly.forEach(function (id) { nodesEl[id] && nodesEl[id].classList.remove('new'); }); }, 1600);
    }
    refreshScene();
    var p = G.progress();
    $('t-bar').style.width = (p * 100) + '%';
    $('t-title').textContent = P.treeLookOf(G.mat).name.toUpperCase() + ' — ' + G.mat.name.toUpperCase();
    $('t-money').textContent = '$' + P.fmtMoney(money);
    $('t-prog').textContent = (p >= 1 ? '100' : Math.min(99.9, p * 100).toFixed(1).replace('.', ',')) + '%';
    var dom = G.masteryReady();
    $('t-dom').textContent = dom ? 'SIM' : 'NÃO';
    $('t-dom').className = dom ? 'c-g' : 'c-r';
    $('t-next').textContent = nextGoal();
    renderDetail();
  }

  /* um objetivo "próximo" sempre visível */
  function nextGoal() {
    var def = G.def, lv = G.levels(), money = G.S.money;
    var best = null, bc = Infinity;
    def.nodes.forEach(function (n) {
      var s = P.Tree.nodeState(def, n, lv);
      if (s !== 'avail' && s !== 'owned') return;
      var c = P.Tree.cost(def, G.mat, n, lv[n.id] || 0);
      if (c < bc) { bc = c; best = n; }
    });
    if (!best) return G.progress() >= 1 ? 'ÁRVORE COMPLETA' : '';
    return bc <= money ? 'PODE COMPRAR: ' + best.n.toUpperCase() : 'FALTAM $' + P.fmtMoney(bc - money) + ' PARA ' + best.n.toUpperCase();
  }

  function select(id) {
    sel = id;
    P.Audio.sfx.click();
    refresh();
  }

  /* efeitos ao comprar: explosão de pixels, anel, texto e linhas energizadas */
  function celebrate(id, count) {
    var def = G.def, n = def.byId[id], d = nodesEl[id];
    if (!n || !d) return;
    var lv = G.levels()[id] || 0;
    var br = def.branches.filter(function (b) { return b.id === n.b; })[0];
    var col = br ? br.color : '#ffa300';
    var maxed = lv >= n.lv;
    if (n.sp && maxed) P.Audio.sfx.special();
    else if (maxed) P.Audio.sfx.maxed();
    else P.Audio.sfx.buy(lv, count > 1);
    d.classList.remove('bought'); void d.offsetWidth; d.classList.add('bought');
    var cv = el.canvas;
    var ring = document.createElement('i');
    ring.className = 'tring' + (maxed ? ' gold' : '');
    ring.style.left = n.x + 'px'; ring.style.top = n.y + 'px';
    ring.style.setProperty('--bc', col);
    cv.appendChild(ring);
    var parts = maxed ? 22 : 12;
    for (var i = 0; i < parts; i++) {
      var p = document.createElement('i');
      p.className = 'tpart';
      var a = i / parts * Math.PI * 2, r = 50 + Math.random() * (maxed ? 70 : 35);
      p.style.left = n.x + 'px'; p.style.top = n.y + 'px';
      p.style.background = i % 3 === 0 ? '#fff1e8' : (maxed && i % 2 ? '#ffec27' : col);
      p.style.setProperty('--dx', Math.round(Math.cos(a) * r / 4) * 4 + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(a) * r / 4) * 4 + 'px');
      cv.appendChild(p);
      setTimeout(function (p) { p.remove(); }.bind(null, p), 700);
    }
    var t = document.createElement('div');
    t.className = 'tpop' + (maxed ? ' gold' : '');
    t.style.left = n.x + 'px'; t.style.top = (n.y - 34) + 'px';
    t.textContent = maxed ? (n.sp ? 'ESPECIAL!' : 'MÁXIMO!') : (count > 1 ? '+' + count + ' NÍVEIS' : 'NÍVEL ' + lv + '/' + n.lv);
    cv.appendChild(t);
    setTimeout(function () { ring.remove(); t.remove(); }, 1000);
    linesEl.forEach(function (ln) {
      // o galho que leva ao nó comprado cresce
      if (ln.getAttribute('data-b') === id && lv === 1) {
        ln._g = 1; ln.classList.remove('grow'); void ln.getBBox(); ln.classList.add('grow');
        setTimeout(function () { ln._g = 0; ln.classList.remove('grow'); }, 1000);
      } else if (ln.getAttribute('data-a') === id || ln.getAttribute('data-b') === id) {
        ln.classList.remove('zap'); void ln.getBBox(); ln.classList.add('zap');
        setTimeout(function () { ln.classList.remove('zap'); }, 800);
      }
    });
    // folhas novas brotam
    for (var q = 0; q < 6; q++) {
      var lf = document.createElement('i');
      lf.className = 'tz-leafpop';
      lf.style.left = n.x + 'px'; lf.style.top = n.y + 'px';
      lf.style.setProperty('--dx', Math.round((Math.random() * 2 - 1) * 60) + 'px');
      lf.style.setProperty('--dy', Math.round(-20 - Math.random() * 50) + 'px');
      cv.appendChild(lf);
      setTimeout(function (lf) { lf.remove(); }.bind(null, lf), 900);
    }
    var m = $('t-money'); m.classList.remove('spend'); void m.offsetWidth; m.classList.add('spend');
    if (n.sp && maxed) { el.view.classList.remove('boom'); void el.view.offsetWidth; el.view.classList.add('boom'); }
  }

  function renderDetail() {
    var def = G.def;
    if (!sel) { el.detail.hidden = true; return; }
    el.detail.hidden = false;
    var n = def.byId[sel], lv = G.levels(), l = lv[n.id] || 0;
    var br = def.branches.filter(function (b) { return b.id === n.b; })[0];
    var state = P.Tree.nodeState(def, n, lv);
    var cost = state === 'max' ? 0 : P.Tree.cost(def, G.mat, n, l);
    var html = '<button class="pop-x" aria-label="Fechar">×</button><h3 style="color:' + (br ? br.color : '#ffa300') + '">' + n.n.toUpperCase() + '</h3>' +
      '<div class="meta"><span>' + (br ? br.name : 'RAIZ') + '</span><span>NÍVEL ' + l + '/' + n.lv + '</span>' + (n.sp ? '<span class="c-y">NÓ ESPECIAL</span>' : '') + '</div>' +
      '<p>' + n.d + '</p>' +
      '<div class="eff" style="--bc:' + (br ? br.color : '#ffa300') + '">' + P.Tree.effectLines(n).map(function (t) { return '<div>' + t + '</div>'; }).join('') + '</div>';
    if (state !== 'max') {
      html += '<div class="pv">' + P.Tree.preview(G.mat, def, lv, n).map(function (p) {
        return '<div>' + p.label + ': ' + p.from + ' → <b>' + p.to + '</b></div>';
      }).join('') + '</div>';
    }
    if (n.reqs.length) {
      html += '<div class="reqs">Requer: ' + n.reqs.map(function (r) {
        var o = def.byId[r.id], ok = (lv[r.id] || 0) >= r.lv;
        return '<span class="' + (ok ? 'ok' : 'no') + '">' + o.n + (r.lv > 1 || o.lv > 1 ? ' (nv ' + r.lv + ')' : '') + '</span>';
      }).join(', ') + '</div>';
    }
    html += '<div class="buy">';
    if (state === 'max') html += '<span class="cost c-g">MÁXIMO</span>';
    else {
      html += '<span class="cost' + (G.S.money < cost ? ' no' : '') + '">$' + P.fmtMoney(cost) + '</span>';
      var can = state !== 'locked' && G.S.money >= cost;
      var dis = state === 'locked' ? ' disabled' : '';
      html += '<button class="pxbtn gold' + (can ? ' ready' : ' dim') + '" id="t-buy"' + dis + '>COMPRAR</button>';
      if (n.lv > 1) html += '<button class="pxbtn' + (can ? '' : ' dim') + '" id="t-buymax"' + dis + '>MÁX</button>';
      if (state === 'locked') html += '<span class="c-r t-px">BLOQUEADO</span>';
    }
    html += '</div>';
    el.detail.innerHTML = html;
    var b1 = $('t-buy'), b2 = $('t-buymax');
    function tryBuy(max) {
      if (!G.buy(n.id, max)) {
        P.Audio.sfx.blocked();
        var c = el.detail.querySelector('.cost');
        if (c) { c.classList.remove('nope'); void c.offsetWidth; c.classList.add('nope'); }
      }
    }
    if (b1) b1.addEventListener('click', function () { tryBuy(false); });
    if (b2) b2.addEventListener('click', function () { tryBuy(true); });
    var bx = el.detail.querySelector('.pop-x');
    if (bx) bx.addEventListener('click', function () { sel = null; refresh(); });
    placePop();
  }

  /* balão ao lado do nó selecionado (acompanha arrastar e zoom) */
  function placePop() {
    if (!sel || el.detail.hidden || !nodesEl[sel]) return;
    var vr = el.view.getBoundingClientRect(), nr = nodesEl[sel].getBoundingClientRect();
    var pw = el.detail.offsetWidth, ph = el.detail.offsetHeight;
    var x = nr.right - vr.left + 12;
    if (x + pw > vr.width - 8) x = nr.left - vr.left - pw - 12;
    var y = nr.top - vr.top + nr.height / 2 - ph / 2;
    if (x < 8) { x = Math.max(8, Math.min(vr.width - pw - 8, nr.left - vr.left + nr.width / 2 - pw / 2)); y = nr.bottom - vr.top + 12; if (y + ph > vr.height - 8) y = nr.top - vr.top - ph - 12; }
    y = Math.max(8, Math.min(vr.height - ph - 8, y));
    el.detail.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  }

  /* ---------------- pan / zoom ---------------- */
  function apply() {
    el.canvas.style.transform = 'translate(' + Math.round(view.x) + 'px,' + Math.round(view.y) + 'px) scale(' + view.z.toFixed(3) + ')';
    placePop();
  }
  function zoom(f, cx, cy) {
    var nz = Math.max(0.15, Math.min(2, view.z * f));
    cx = cx || 0; cy = cy || 0;
    view.x = cx - (cx - view.x) * nz / view.z;
    view.y = cy - (cy - view.y) * nz / view.z;
    view.z = nz;
    apply();
  }
  function bindPan() {
    var ptrs = {}, pinch = null;
    el.view.addEventListener('pointerdown', function (e) {
      if (e.target.closest('#tree-zoom')) return;
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY, moved: false };
      var ids = Object.keys(ptrs);
      if (ids.length === 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: view.z };
      }
    });
    el.view.addEventListener('pointermove', function (e) {
      var p = ptrs[e.pointerId];
      if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      var ids = Object.keys(ptrs);
      if (ids.length === 2 && pinch) {
        p.x = e.clientX; p.y = e.clientY;
        var a = ptrs[ids[0]], b = ptrs[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        var r = el.view.getBoundingClientRect();
        zoom((pinch.z * d / pinch.d) / view.z, (a.x + b.x) / 2 - r.left - r.width / 2, (a.y + b.y) / 2 - r.top - r.height / 2);
        return;
      }
      if (!p.moved && Math.abs(dx) + Math.abs(dy) > 6) p.moved = true;
      if (p.moved) { view.x += dx; view.y += dy; p.x = e.clientX; p.y = e.clientY; apply(); }
    });
    function up(e) {
      var p = ptrs[e.pointerId];
      delete ptrs[e.pointerId];
      if (Object.keys(ptrs).length < 2) pinch = null;
      if (p && !p.moved && !e.target.closest('.tn') && e.type === 'pointerup') { sel = null; refresh(); }
    }
    el.view.addEventListener('pointerup', up);
    el.view.addEventListener('pointercancel', up);
    el.view.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = el.view.getBoundingClientRect();
      zoom(e.deltaY < 0 ? 1.1 : 0.9, e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
    }, { passive: false });
  }

  function open() {
    if (!G.def) {
      P.HUD.modal('ÁRVORE INDISPONÍVEL', '<p>A árvore de ' + G.mat.name + ' chega na próxima atualização.</p>');
      return;
    }
    el.screen.hidden = false;
    P.Audio.sfx.whoosh(true);
    if (built !== G.def.id) { build(); home(); prevState = {}; }
    // nós "surgem" em ondas a partir da raiz
    G.def.nodes.forEach(function (n) { var d = nodesEl[n.id]; d.style.animationDelay = (n.depth * 45) + 'ms'; });
    el.canvas.classList.remove('appear'); void el.canvas.offsetWidth; el.canvas.classList.add('appear');
    apply();
    refresh();
  }
  function close() { if (!el.screen.hidden) P.Audio.sfx.whoosh(false); el.screen.hidden = true; }
  function tick() { if (!el.screen.hidden) { $('t-money').textContent = '$' + P.fmtMoney(G.S.money); updateBox(); } }
  function slowTick() { if (!el.screen.hidden) refresh(); }

  /* abre a árvore já centralizada num nó (painel desktop) */
  function focus(id) {
    open();
    var n = G.def.byId[id];
    if (!n) return;
    view.z = Math.max(view.z, 0.9);
    view.x = -n.x * view.z; view.y = -n.y * view.z;
    apply();
    select(id);
  }
  function buySelected(max) {
    if (!sel) return;
    if (!G.buy(sel, max)) P.Audio.sfx.blocked();
  }
  function pan(dx, dy) { view.x += dx; view.y += dy; apply(); }

  return {
    init: init, open: open, close: close, tick: tick, slowTick: slowTick,
    focus: focus, buySelected: buySelected, pan: pan, zoom: zoom,
    isOpen: function () { return !el.screen.hidden; }
  };
})();
