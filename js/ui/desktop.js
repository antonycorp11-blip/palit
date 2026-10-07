/* =========================================================
   DESKTOP — layout de tela grande, atalhos de teclado,
   painel de próximas melhorias, registro de eventos e
   dicas ao passar o mouse na árvore.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Desktop = (function () {
  var P = PALIT, G, V;
  var el = {};
  var log = [];
  var upKey = '';
  var hover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(id) { return document.getElementById(id); }
  function isDesk() { return window.innerWidth >= 1000 && window.innerHeight >= 560; }

  function init() {
    G = P.Game; V = P.View;
    var panel = document.createElement('aside');
    panel.id = 'deskpanel';
    panel.className = 'px';
    panel.innerHTML =
      '<h3>' + P.SpriteCSS.html('ico_star') + 'MISSÕES</h3><div id="dp-mis"></div>' +
      '<h3>' + P.SpriteCSS.html('ico_tree') + 'PRÓXIMAS MELHORIAS</h3><div id="dp-up"></div>' +
      '<h3>' + P.SpriteCSS.html('ico_flag') + 'REGISTRO</h3><div id="dp-log"></div>' +
      '<div class="keys">' +
        '<span><kbd>ESPAÇO</kbd> colocar</span><span><kbd>T</kbd> árvore</span><span><kbd>ESC</kbd> fechar</span>' +
        '<span><kbd>↑</kbd><kbd>↓</kbd> rolar</span><span><kbd>HOME</kbd> topo</span><span><kbd>D</kbd> dano</span>' +
        '<span><kbd>M</kbd> som</span><span><kbd>ENTER</kbd> comprar (árvore)</span>' +
      '</div>';
    $('hud').appendChild(panel);
    el.panel = panel; el.up = $('dp-up'); el.log = $('dp-log');

    el.tip = document.createElement('div');
    el.tip.id = 'tip';
    el.tip.className = 'px';
    el.tip.hidden = true;
    document.body.appendChild(el.tip);

    apply();
    window.addEventListener('resize', apply);
    bindKeys();
    bindLog();
    bindTips();
    $('dp-mis').addEventListener('click', function (e) { var b = e.target.closest('[data-claim]'); if (b) P.Progress.claim(+b.dataset.claim); });
    el.up.addEventListener('click', function (e) {
      var b = e.target.closest('[data-buy]');
      if (b) { e.stopPropagation(); if (!G.buy(b.dataset.buy, false)) P.Audio.sfx.blocked(); else { P.Audio.sfx.buy(G.levels()[b.dataset.buy] || 1, false); upKey = ''; } return; }
      var r = e.target.closest('[data-node]');
      if (r) P.TreeView.focus(r.dataset.node);
    });
  }

  function apply() {
    var d = isDesk();
    document.documentElement.classList.toggle('desk', d);
    el.panel.hidden = !d;
  }

  /* ---------------- painel: próximas melhorias ---------------- */
  function update() {
    if (!isDesk() || !G.def) return;
    var def = G.def, lv = G.levels(), money = G.S.money;
    var list = def.nodes.filter(function (n) {
      var l = lv[n.id] || 0;
      return l < n.lv && P.Tree.reqsMet(def, n, lv);
    }).map(function (n) { return { n: n, c: P.Tree.cost(def, G.mat, n, lv[n.id] || 0) }; })
      .sort(function (a, b) { return a.c - b.c; }).slice(0, 5);
    var key = list.map(function (x) { return x.n.id + (lv[x.n.id] || 0) + (money >= x.c ? 'y' : 'n'); }).join();
    if (key === upKey) return;
    upKey = key;
    var brs = {};
    def.branches.forEach(function (b) { brs[b.id] = b; });
    if (!list.length) { el.up.innerHTML = '<p class="c-g">ÁRVORE COMPLETA!</p>'; return; }
    el.up.innerHTML = list.map(function (x) {
      var n = x.n, b = brs[n.b], ok = money >= x.c;
      return '<div class="dp-row' + (ok ? ' ok' : '') + '" data-node="' + n.id + '" style="--bc:' + (b ? b.color : '#ffa300') + '">' +
        P.SpriteCSS.html(b ? 'ico_' + b.icon : 'ico_match') +
        '<div class="dp-txt"><b>' + n.n + '</b><span>' + P.Tree.effectLines(n)[0] + ' · NV ' + (lv[n.id] || 0) + '/' + n.lv + '</span></div>' +
        '<button class="pxbtn' + (ok ? ' gold' : '') + '" data-buy="' + n.id + '">$' + P.fmtMoney(x.c) + '</button></div>';
    }).join('');
  }

  /* ---------------- registro de eventos ---------------- */
  function add(text, cls) {
    var d = new Date();
    log.unshift({ t: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), text: text, cls: cls || '' });
    if (log.length > 40) log.pop();
    if (!isDesk()) return;
    var row = document.createElement('div');
    row.className = 'dp-log ' + (cls || '');
    row.innerHTML = '<i>' + log[0].t + '</i>' + text;
    el.log.insertBefore(row, el.log.firstChild);
    while (el.log.children.length > 14) el.log.lastChild.remove();
  }

  function bindLog() {
    add('Bem-vindo à ' + G.mat.name.toUpperCase() + '.', 'info');
    G.on('event', function (d) { add(d.e.name + (d.extra ? ' ' + d.extra : ''), d.e.good ? 'good' : 'info'); });
    G.on('milestone', function (d) { add('MARCO ' + d.layer + ' camadas · +$' + P.fmtMoney(d.money), 'gold'); });
    G.on('damage', function (d) { add((d.kind === 'fire' ? 'Fogo' : d.kind === 'miss' ? 'Peça caiu' : 'Dano') + ' na camada ' + (d.layer + 1), 'bad'); });
    G.on('threatDead', function (d) { add(d.t.def.name + ' expulso(a) · +$' + P.fmtMoney(Math.max(1, d.money)), 'good'); });
    G.on('bought', function (d) { if (d && d.id) { var n = G.def.byId[d.id]; add('Comprado: ' + n.n + ' (nv ' + (G.levels()[d.id] || 0) + ')', 'gold'); } });
    G.on('gust', function (g) { if (g.str >= 1.1) add('Rajada forte de vento', 'info'); });
    G.on('challenge', function (s) { add(s === 'start' ? 'Desafio final iniciado!' : s === 'won' ? 'DESAFIO FINAL VENCIDO!' : 'Desafio final falhou', s === 'lost' ? 'bad' : 'gold'); });
    G.on('rebuild', function () { add('Nova era: ' + G.mat.name.toUpperCase(), 'gold'); });
  }

  /* ---------------- teclado ---------------- */
  function overlayOpen() { return !$('modal').hidden || !!$('splash'); }

  function bindKeys() {
    window.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      var k = e.code;
      var tree = P.TreeView.isOpen();
      if (k === 'Escape') {
        if (!$('modal').hidden) P.HUD.close(); else if (tree) P.TreeView.close();
        return;
      }
      if ($('splash')) { if (k === 'Space' || k === 'Enter') { e.preventDefault(); $('splash').querySelector('button').click(); } return; }
      if (!$('modal').hidden) return;
      if (P.Story.active()) { if (k === 'Space' || k === 'Enter') { e.preventDefault(); P.Story.advance(); } return; }
      if (tree) {
        if (k === 'Enter' || k === 'KeyB') { e.preventDefault(); P.TreeView.buySelected(e.shiftKey); }
        else if (k === 'KeyT') P.TreeView.close();
        else if (k === 'ArrowLeft') P.TreeView.pan(80, 0);
        else if (k === 'ArrowRight') P.TreeView.pan(-80, 0);
        else if (k === 'ArrowUp') { e.preventDefault(); P.TreeView.pan(0, 80); }
        else if (k === 'ArrowDown') { e.preventDefault(); P.TreeView.pan(0, -80); }
        else if (k === 'Equal' || k === 'NumpadAdd') P.TreeView.zoom(1.2);
        else if (k === 'Minus' || k === 'NumpadSubtract') P.TreeView.zoom(0.83);
        return;
      }
      if (k === 'Space' || k === 'Enter') {
        e.preventDefault();
        if (e.repeat) return;
        if (V.nearTop()) G.tryPlace(false); else P.HUD.toast('VOLTE AO TOPO (HOME)', 'warn', true);
      }
      else if (k === 'KeyT') P.TreeView.open();
      else if (k === 'KeyM') $('b-snd').click();
      else if (k === 'KeyD') { var b = $('b-dmg'); if (b && !b.hidden) b.click(); }
      else if (k === 'Home') V.goTop();
      else if (k === 'ArrowUp') { e.preventDefault(); V.scrollBy(V.LH * 8); }
      else if (k === 'ArrowDown') { e.preventDefault(); V.scrollBy(-V.LH * 8); }
      else if (k === 'PageUp') { e.preventDefault(); V.scrollBy(window.innerHeight * 0.6); }
      else if (k === 'PageDown') { e.preventDefault(); V.scrollBy(-window.innerHeight * 0.6); }
    });
  }

  /* ---------------- dicas ao passar o mouse (árvore) ---------------- */
  function bindTips() {
    if (!hover) return;
    var tv = $('tree-screen');
    tv.addEventListener('mouseover', function (e) {
      var t = e.target.closest('.tn');
      if (!t || !t.dataset.id) { el.tip.hidden = true; return; }
      var def = G.def, n = def.byId[t.dataset.id], lv = G.levels(), l = lv[n.id] || 0;
      var st = P.Tree.nodeState(def, n, lv);
      var cost = st === 'max' ? 'MÁXIMO' : '$' + P.fmtMoney(P.Tree.cost(def, G.mat, n, l));
      el.tip.innerHTML = '<b>' + n.n.toUpperCase() + '</b><span>NÍVEL ' + l + '/' + n.lv + ' · ' + cost + '</span>' +
        '<em>' + P.Tree.effectLines(n).join('<br>') + '</em>' + (st === 'locked' ? '<span class="c-r">BLOQUEADO</span>' : '');
      el.tip.hidden = false;
    });
    tv.addEventListener('mousemove', function (e) {
      if (el.tip.hidden) return;
      var x = Math.min(window.innerWidth - 300, e.clientX + 18), y = Math.min(window.innerHeight - 120, e.clientY + 18);
      el.tip.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
    tv.addEventListener('mouseleave', function () { el.tip.hidden = true; });
    G.on('bought', function () { el.tip.hidden = true; });
  }

  return { init: init, update: update, isDesk: isDesk, log: add };
})();
