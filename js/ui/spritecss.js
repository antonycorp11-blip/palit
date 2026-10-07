/* =========================================================
   Compila PALIT.SPRITES (ASCII) em classes CSS .sp-<nome>
   usando box-shadow — cada pixel é uma sombra de U×U.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.SpriteCSS = {
  compile: function (U) {
    var css = [];
    Object.keys(PALIT.SPRITES).forEach(function (name) {
      var sp = PALIT.SPRITES[name];
      var w = 0, h = 0;
      sp.frames.forEach(function (f) { h = Math.max(h, f.length); f.forEach(function (r) { w = Math.max(w, r.length); }); });
      sp.w = w; sp.h = h;
      var shadows = sp.frames.map(function (f) {
        var out = [];
        f.forEach(function (row, y) {
          for (var x = 0; x < row.length; x++) {
            var col = sp.pal[row[x]];
            if (col) out.push(((x + 1) * U) + 'px ' + ((y + 1) * U) + 'px 0 0 ' + col);
          }
        });
        return out.join(',') || 'none';
      });
      css.push('.sp-' + name + '{width:' + (w * U) + 'px;height:' + (h * U) + 'px}');
      var anim = '';
      if (shadows.length > 1) {
        var dur = (shadows.length / (sp.fps || 6)).toFixed(3);
        var kf = shadows.map(function (s, i) { return (i * 100 / shadows.length).toFixed(2) + '%{box-shadow:' + s + '}'; }).join('');
        css.push('@keyframes sp-' + name + '{' + kf + '}');
        anim = 'animation:sp-' + name + ' ' + dur + 's steps(1) infinite;';
      }
      css.push('.sp-' + name + '::before{box-shadow:' + shadows[0] + ';' + anim + '}');
    });
    var el = document.getElementById('sprite-css') || document.createElement('style');
    el.id = 'sprite-css';
    el.textContent = css.join('\n');
    document.head.appendChild(el);
  },
  size: function (name) { var s = PALIT.SPRITES[name]; return { w: s.w, h: s.h }; },
  html: function (name, cls) { return '<i class="sp sp-' + name + (cls ? ' ' + cls : '') + '"></i>'; }
};
