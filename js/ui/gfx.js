/* =========================================================
   GFX — qualidade gráfica.
   AUTO (padrão): qualidade total; se o aparelho não aguentar
   (FPS baixo por alguns segundos), liga sozinho o modo leve e
   lembra disso nas próximas vezes.
   LEVE: troca efeitos caros de GPU (filtros de noite, brilhos
   com drop-shadow) por versões simples. TOTAL: nunca reduz.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Gfx = (function () {
  var MODES = ['auto', 'full', 'lite'];
  var mode = 'auto', autoLite = false;
  try {
    mode = localStorage.getItem('palit.gfx') || 'auto';
    autoLite = localStorage.getItem('palit.gfx.auto') === '1';
  } catch (e) { /* sem storage */ }
  if (MODES.indexOf(mode) < 0) mode = 'auto';

  function lite() { return mode === 'lite' || (mode === 'auto' && autoLite); }
  function apply() { document.documentElement.classList.toggle('lite', lite()); }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem storage */ } }

  function set(m) {
    mode = m; store('palit.gfx', m);
    if (m !== 'auto') { autoLite = false; store('palit.gfx.auto', '0'); }
    reset(); apply();
  }

  /* medidor de FPS: janelas de 3s; duas seguidas abaixo de 26 FPS → modo leve.
     (26 e não 60: aparelhos em economia de bateria travam em 30 e estão ok) */
  var t0 = 0, frames = 0, slow = 0, grace = 0;
  function reset() { t0 = 0; frames = 0; slow = 0; grace = performance.now() + 5000; }
  function frame() {
    if (mode !== 'auto' || autoLite || document.hidden) return;
    var now = performance.now();
    if (now < grace) return;                 // ignora os engasgos do carregamento
    if (!t0) { t0 = now; frames = 0; return; }
    frames++;
    var el = now - t0;
    if (el < 3000) return;
    var fps = frames * 1000 / el;
    t0 = now; frames = 0;
    slow = fps < 26 ? slow + 1 : 0;
    if (slow >= 2) {
      autoLite = true; store('palit.gfx.auto', '1'); apply();
      if (PALIT.HUD && PALIT.HUD.toast) PALIT.HUD.toast('MODO LEVE LIGADO (MENU → OPÇÕES)', 'good', true);
    }
  }
  document.addEventListener('visibilitychange', reset);

  reset(); apply();
  return {
    frame: frame, set: set, lite: lite,
    get mode() { return mode; },
    get autoLite() { return autoLite; }
  };
})();
