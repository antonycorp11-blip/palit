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
    $('t-zc').addEventListener('click', function () { view.x = 0; view.y = 0; view.z = fitZoom(); apply(); });
    bindPan();
    G.on('bought', function (d) { if (!el.screen.hidden) { refresh(); if (d && d.id) celebrate(d.id, d.n); } });
    G.on('stats', function () { if (!el.screen.hidden) refresh(); });
  }

  function fitZoom() { return Math.max(0.35, Math.min(1, Math.min(el.view.clientWidth, el.view.clientHeight) / 1500)); }

  function build() {
    var def = G.def;
    if (!def) return;
    built = def.id;
    nodesEl = {}; linesEl = [];
    var cv = el.canvas;
    cv.querySelectorAll('.tn, .br-label').forEach(function (n) { n.remove(); });
    var svg = '';
    def.nodes.forEach(function (n) {
      n.reqs.forEach(function (r) {
        var o = def.byId[r.id];
        svg += '<line x1="' + o.x + '" y1="' + o.y + '" x2="' + n.x + '" y2="' + n.y + '" data-a="' + o.id + '" data-b="' + n.id + '" data-lv="' + r.lv + '"/>';
      });
    });
    el.lines.innerHTML = svg;
    linesEl = Array.prototype.slice.call(el.lines.querySelectorAll('line'));
    var brById = {};
    def.branches.forEach(function (b) {
      brById[b.id] = b;
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
      d.innerHTML = P.SpriteCSS.html(br ? 'ico_' + br.icon : 'ico_match') + '<span class="lv"></span>';
      d.addEventListener('click', function (e) { e.stopPropagation(); select(n.id); });
      cv.appendChild(d);
      nodesEl[n.id] = d;
    });
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
      ln.setAttribute('class', bOwned ? 'on' : met ? 'half' : '');
      ln.style.setProperty('--lc', brColor[def.byId[b].b] || '#ffa300');
    });
    if (newly.length) {
      P.Audio.sfx.unlock();
      setTimeout(function () { newly.forEach(function (id) { nodesEl[id] && nodesEl[id].classList.remove('new'); }); }, 1600);
    }
    var p = G.progress();
    $('t-bar').style.width = (p * 100) + '%';
    $('t-title').textContent = 'ÁRVORE — ' + G.mat.name.toUpperCase();
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
      if (ln.getAttribute('data-a') === id || ln.getAttribute('data-b') === id) {
        ln.classList.remove('zap'); void ln.getBBox(); ln.classList.add('zap');
        setTimeout(function () { ln.classList.remove('zap'); }, 800);
      }
    });
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
    var nz = Math.max(0.3, Math.min(2, view.z * f));
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
    if (built !== G.def.id) { build(); view.x = 0; view.y = 0; view.z = fitZoom(); prevState = {}; }
    // nós "surgem" em ondas a partir da raiz
    G.def.nodes.forEach(function (n) { var d = nodesEl[n.id]; d.style.animationDelay = (n.depth * 45) + 'ms'; });
    el.canvas.classList.remove('appear'); void el.canvas.offsetWidth; el.canvas.classList.add('appear');
    apply();
    refresh();
  }
  function close() { if (!el.screen.hidden) P.Audio.sfx.whoosh(false); el.screen.hidden = true; }
  function tick() { if (!el.screen.hidden) { $('t-money').textContent = '$' + P.fmtMoney(G.S.money); } }
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
