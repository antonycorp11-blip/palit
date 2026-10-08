/* =========================================================
   Compila PALIT.SPRITES (ASCII) em classes CSS .sp-<nome>.
   Cada sprite é desenhado uma vez num canvas (todos os quadros
   lado a lado) e vira um background-image do ::before; a animação
   só desloca o background-position. Muito mais leve que pintar
   centenas de box-shadows por quadro, com o mesmo pixel.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.SpriteCSS = (function () {
  var cv = document.createElement('canvas');

  /* pinta pixels [x, y, cor] (em pixels de arte) e devolve uma data URL.
     A escala segue a densidade da tela para ficar nítido em telas retina. */
  function bake(w, h, pixels, U) {
    var k = Math.max(1, Math.round(U * (window.devicePixelRatio || 1)));
    cv.width = Math.max(1, w * k); cv.height = Math.max(1, h * k);
    var g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height);
    for (var i = 0; i < pixels.length; i++) {
      var p = pixels[i];
      g.fillStyle = p[2];
      g.fillRect(p[0] * k, p[1] * k, k, k);
    }
    return cv.toDataURL('image/png');
  }

  function compile(U, scope, id) {
    scope = scope || '';
    var css = [];
    Object.keys(PALIT.SPRITES).forEach(function (name) {
      var sp = PALIT.SPRITES[name];
      var w = 0, h = 0;
      sp.frames.forEach(function (f) { h = Math.max(h, f.length); f.forEach(function (r) { w = Math.max(w, r.length); }); });
      sp.w = w; sp.h = h;
      var n = sp.frames.length, px = [];
      sp.frames.forEach(function (f, i) {
        f.forEach(function (row, y) {
          for (var x = 0; x < row.length; x++) {
            var col = sp.pal[row[x]];
            if (col) px.push([i * w + x, y, col]);
          }
        });
      });
      css.push(scope + '.sp-' + name + '{width:' + (w * U) + 'px;height:' + (h * U) + 'px}');
      var anim = '';
      if (n > 1) {
        var dur = (n / (sp.fps || 6)).toFixed(3);
        var an = 'sp-' + name + (scope ? '-w' : '');
        css.push('@keyframes ' + an + '{to{background-position:' + (-n * w * U) + 'px 0}}');
        anim = 'animation:' + an + ' ' + dur + 's steps(' + n + ') infinite;';
      }
      css.push(scope + '.sp-' + name + '::before{background-image:url(' + bake(n * w, h, px, U) + ');background-size:' + (n * w * U) + 'px ' + (h * U) + 'px;' + anim + '}');
    });
    var el = document.getElementById(id || 'sprite-css') || document.createElement('style');
    el.id = id || 'sprite-css';
    el.textContent = css.join('\n');
    document.head.appendChild(el);
  }

  return {
    bake: bake,
    compile: compile,
    size: function (name) { var s = PALIT.SPRITES[name]; return { w: s.w, h: s.h }; },
    html: function (name, cls) { return '<i class="sp sp-' + name + (cls ? ' ' + cls : '') + '"></i>'; }
  };
})();
