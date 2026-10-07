/* =========================================================
   ECONOMIA — fórmulas compartilhadas (jogo + simulador).
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.ECON = {
  /* dinheiro ao completar a camada idx (0-based) */
  layerMoney: function (mat, s, idx) {
    return mat.layerValue * (1 + idx / 120) * (1 + s.layerValue);
  },
  /* renda passiva de visitantes por segundo */
  passive: function (mat, s, layers, integrity) {
    return layers * mat.passiveRate * (1 + s.passiveMult) * integrity;
  },
  /* bônus de marco (a cada milestoneEvery camadas) */
  milestone: function (mat, s, layer) {
    return Math.round(20 * Math.pow(layer / 100, 1.35) * (1 + s.milestoneBonus));
  },
  effRecharge: function (s) {
    return Math.max(0.6, s.rechargeSec) / (1 + s.prodMult);
  },
  placeTime: function (s, combo) {
    return s.placeSec / (1 + s.placeSpeed + (combo || 0) * s.comboStep);
  },
  repairFee: function (mat, s, layer) {
    return Math.max(1, Math.round((1 + layer * 0.02) * (1 - s.repairFee)));
  },
  limit: function (mat, s) {
    return Math.min(mat.goalLayers, mat.baseLimitLayers + s.limitLayers);
  }
};
