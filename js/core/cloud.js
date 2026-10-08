/* =========================================================
   NUVEM ATHG — o progresso fica na conta do jogador, para continuar
   em qualquer aparelho (celular, PC, tablet).
   Usa o SDK da ATHG (index.html). Fora da plataforma (dev local) ou sem
   o SDK, não faz nada e o jogo segue só com o save do aparelho.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Cloud = (function () {
  var MIN_GAP = 10000;          // no máximo um envio a cada 10 s (o jogo salva a cada 5 s)
  var lastSent = 0, timer = 0, pending = null;

  function sdk() { return window.ATHG && window.ATHG.isInPortal ? window.ATHG : null; }

  function send() {
    timer = 0;
    var A = sdk(), data = pending;
    pending = null;
    if (!A || !data) return;
    lastSent = Date.now();
    try { A.save(data); } catch (e) { /* tenta no próximo save */ }
  }

  return {
    active: function () { return !!sdk(); },

    ready: function () { var A = sdk(); if (A) A.ready(); },
    started: function () { var A = sdk(); if (A) A.gameStarted(); },

    /* agenda o envio (com limite de frequência) */
    save: function (data) {
      if (!sdk()) return;
      pending = data;
      if (timer) return;
      timer = setTimeout(send, Math.max(0, lastSent + MIN_GAP - Date.now()));
    },

    /* envia já (saindo do jogo / trocando de aba / subindo de era) */
    flush: function () {
      if (!pending) return;
      if (timer) { clearTimeout(timer); timer = 0; }
      send();
    },

    /* save da conta (ou null). O SDK desiste sozinho depois de 8 s. */
    load: function () {
      var A = sdk();
      if (!A) return Promise.resolve(null);
      return A.load().then(function (d) { return d || null; }, function () { return null; });
    },

    /* APAGAR TODO O PROGRESSO também zera o da conta (grava um jogo novo) */
    wipe: function () {
      var A = sdk();
      pending = null;
      if (timer) { clearTimeout(timer); timer = 0; }
      if (!A) return Promise.resolve();
      return A.save(PALIT.State.pack(PALIT.State.fresh())).then(function () {}, function () {});
    }
  };
})();
