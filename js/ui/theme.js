/* =========================================================
   TEMA POR ERA — painéis, bordas, barras e botões ganham as
   cores e a textura do material de cada era.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Theme = (function () {
  var P = PALIT;
  var GROUPS = ['wood', 'cane', 'metal', 'stone', 'glass', 'cosmic'];

  function hex(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function css(a) { return '#' + a.map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(''); }
  function mix(a, b, t) { a = hex(a); b = hex(b); return css(a.map(function (v, i) { return v + (b[i] - v) * t; })); }
  function lum(c) { c = hex(c); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  /* garante cor de destaque legível sobre painel escuro */
  function bright(c) { var l = lum(c); return l < 0.45 ? mix(c, '#ffffff', 0.45 - l + 0.2) : c; }

  function apply(mat) {
    var root = document.documentElement, st = root.style;
    GROUPS.forEach(function (g) { root.classList.remove('th-' + g); });
    root.classList.remove('themed');
    ['--panel', '--panel2', '--edge', '--bar', '--bar2', '--accent', '--accent2'].forEach(function (k) { st.removeProperty(k); });
    if (!mat || mat.era === 1) return;            // era 1 mantém o visual clássico
    var lk = P.treeLookOf(mat);
    var dark = '#0c0914';
    var b3 = lk.bark[2], b2 = lk.bark[1];
    var panel = mix(b3, dark, 0.38 + lum(b3) * 0.4);
    var panel2 = mix(b2, dark, 0.32 + lum(b2) * 0.4);
    var accent = bright(lk.leaf[0]), accent2 = bright(lk.bark[0]);
    st.setProperty('--panel', panel);
    st.setProperty('--panel2', panel2);
    st.setProperty('--edge', mix(b3, '#000000', 0.55));
    st.setProperty('--bar', accent);
    st.setProperty('--bar2', mix(accent, dark, 0.45));
    st.setProperty('--accent', accent);
    st.setProperty('--accent2', accent2);
    root.classList.add('themed', 'th-' + lk.style);
  }

  return { apply: apply, mix: mix };
})();
