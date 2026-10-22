/* =========================================================
   DESKTOP — layout de tela grande, atalhos de teclado e
   dicas ao passar o mouse na árvore. Sem painel lateral:
   a torre fica com a tela toda (missões no indicador).
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Desktop = (function () {
  var P = PALIT, G, V;
  var el = {};
  var hover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(id) { return document.getElementById(id); }
  function isDesk() {
    return window.innerWidth >= 1000 && window.innerHeight >= 560;
  }

  function init() {
    G = P.Game; V = P.View;
    el.tip = document.createElement('div');
    el.tip.id = 'tip';
    el.tip.className = 'px';
    el.tip.hidden = true;
    document.body.appendChild(el.tip);

    apply();
    window.addEventListener('resize', apply);
    bindKeys();
    bindTips();
  }

  function apply() {
    document.documentElement.classList.toggle('desk', isDesk());
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
      else if (k === 'KeyM') { P.Audio.unlock(); P.Audio.setMuted(!P.Audio.muted); P.HUD.toast(P.Audio.muted ? 'SOM DESLIGADO' : 'SOM LIGADO', 'info', true); }
      else if (k === 'KeyD') { var b = $('b-dmg'); if (b && !b.hidden) b.click(); }
      else if (k === 'Home') V.goTop();
      else if (k === 'Equal' || k === 'NumpadAdd') V.zoomBy(1);
      else if (k === 'Minus' || k === 'NumpadSubtract') V.zoomBy(-1);
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

  return { init: init, isDesk: isDesk, apply: function () { if (G) apply(); } };
})();
