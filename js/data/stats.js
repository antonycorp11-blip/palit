/* =========================================================
   STATS — todos os atributos que upgrades podem modificar.
   Cada efeito de nó soma um valor a um destes atributos.
   fromMat: valor base vem de material.base[chave].
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.STATS = {
  /* ---- produção ---- */
  capacity:        { label: 'Caixa', fmt: 'int', unit: ' peças', fromMat: true },
  rechargeSec:     { label: 'Recarga', fmt: 'sec1', fromMat: true, min: 0.8 },
  prodMult:        { label: 'Ritmo de produção', fmt: 'pct' },
  doubleChance:    { label: 'Chance de peça dupla', fmt: 'pct' },
  attackProd:      { label: 'Produção durante ataques', fmt: 'pct', base: 0.5, max: 1 },
  rechargeWhileRepair: { label: 'Recarga durante reparos', fmt: 'flag' },

  /* ---- capacidade / reserva ---- */
  reserveCap:      { label: 'Reserva emergencial', fmt: 'int', unit: ' peças' },
  reserveFill:     { label: 'Transbordo para a reserva', fmt: 'pct', base: 0.25, max: 1 },
  reserveBuild:    { label: 'Construir usando a reserva', fmt: 'flag' },

  /* ---- velocidade ---- */
  placeSec:        { label: 'Colocação base', fmt: 'sec2', fromMat: true, hidden: true },
  placeSpeed:      { label: 'Tempo de colocação', fmt: 'sec2', view: function (s) { return s.placeSec / (1 + s.placeSpeed); } },
  comboStep:       { label: 'Ritmo (bônus por toque em sequência)', fmt: 'pct' },
  doublePlace:     { label: 'Chance de colocar 2 peças', fmt: 'pct' },
  tapQueue:        { label: 'Fila de toque', fmt: 'flag' },
  quickReturn:     { label: 'Retorno rápido ao topo', fmt: 'flag' },
  jumpToDamage:    { label: 'Atalho até o dano', fmt: 'flag' },

  /* ---- construção ---- */
  layerValue:      { label: 'Valor por camada', fmt: 'pct' },
  limitLayers:     { label: 'Limite estrutural', fmt: 'layers', view: function (s, m) { return Math.min(m.goalLayers, m.baseLimitLayers + s.limitLayers); } },
  pieceSize:       { label: 'Tamanho das peças', fmt: 'pct' },
  milestoneBonus:  { label: 'Bônus de marcos', fmt: 'pct' },
  visBands:        { label: 'Amarrações visíveis', fmt: 'flag' },
  visCorners:      { label: 'Cantos reforçados', fmt: 'flag' },

  /* ---- resistência ---- */
  windResist:      { label: 'Resistência ao vento', fmt: 'pct', max: 0.9 },
  sway:            { label: 'Redução de oscilação', fmt: 'pct', max: 0.9 },
  looseResist:     { label: 'Peças não se soltam', fmt: 'pct', max: 0.9 },
  windImmune:      { label: 'Vento sem dano', fmt: 'pct', max: 0.75 },
  spreadResist:    { label: 'Atraso de dano estrutural', fmt: 'pct', max: 0.9 },

  /* ---- reparos ---- */
  repairSec:       { label: 'Reparo base', fmt: 'sec1', fromMat: true, hidden: true },
  repairSpeed:     { label: 'Tempo de reparo', fmt: 'sec2', view: function (s) { return s.repairSec / (1 + s.repairSpeed); } },
  repairFee:       { label: 'Desconto no custo de reparo', fmt: 'pct', max: 0.9 },
  recoverChance:   { label: 'Recuperar peça que cai', fmt: 'pct', max: 0.9 },
  detectRange:     { label: 'Detecção de dano', fmt: 'layers', base: 30 },
  rulerMarkers:    { label: 'Marcadores de dano na régua', fmt: 'flag' },
  freeStormRepair: { label: 'Reparo grátis pós-tempestade', fmt: 'flag' },
  freeRepairLv:    { label: 'Reparo sem peça a cada', fmt: 'every', view: function (s) { return s.freeRepairLv > 0 ? 14 - 2 * s.freeRepairLv : 0; } },

  /* ---- defesa ---- */
  threatPower:     { label: 'Força do toque', fmt: 'num1', base: 1 },
  threatReward:    { label: 'Recompensa por defesa', fmt: 'pct' },
  windWarn:        { label: 'Alerta de vento', fmt: 'sec0', base: 1 },
  birdRepel:       { label: 'Pássaros fogem ao chegar', fmt: 'pct', max: 0.8 },
  insectSlow:      { label: 'Insetos mais lentos', fmt: 'pct', max: 0.6 },
  threatWarn:      { label: 'Sentinela de ameaças', fmt: 'flag' },
  threatDelay:     { label: 'Ameaças demoram a atacar', fmt: 'pct' },
  hailResist:      { label: 'Proteção contra granizo', fmt: 'pct', max: 0.9 },
  groundResist:    { label: 'Menos ameaças do chão', fmt: 'pct', max: 0.8 },

  /* ---- eficiência ---- */
  saveChance:      { label: 'Economizar peça', fmt: 'pct', max: 0.5 },
  passiveMult:     { label: 'Renda de visitantes', fmt: 'pct' },
  eventLuck:       { label: 'Sorte em eventos', fmt: 'pct' },
  jamResist:       { label: 'Caixa não emperra', fmt: 'pct', max: 0.9 },

  /* ---- qualidade do material ---- */
  visGlue:         { label: 'Nível da cola', fmt: 'int' },
  defectResist:    { label: 'Peças sem defeito', fmt: 'pct', max: 0.9 },
  slipResist:      { label: 'Pontas não escorregam', fmt: 'pct', max: 0.95 },
  visHeadless:     { label: 'Cabeças aparadas', fmt: 'flag' },
  igniteResist:    { label: 'Resistência à ignição', fmt: 'pct', max: 0.95 },
  moistureResist:  { label: 'Resistência à umidade', fmt: 'pct', max: 0.95 },

  /* ---- automação controlada ---- */
  autoDetect:      { label: 'Assistente detecta danos', fmt: 'flag' },
  autoRepair:      { label: 'Reparos automáticos', fmt: 'permin' },
  autoRepairMissing: { label: 'Assistente repõe peças', fmt: 'flag' },
  autoPlace:       { label: 'Braço mecânico', fmt: 'permin' },
  autoDefend:      { label: 'Defesa automática', fmt: 'permin' },
  autoActiveSec:   { label: 'Atenção do assistente', fmt: 'sec0', base: 60 },
  rulerHeat:       { label: 'Mapa de integridade', fmt: 'flag' },
  statsPanel:      { label: 'Painel de produção', fmt: 'flag' }
};

/* ---------- formatação ---------- */
PALIT.fmtNum = function (n, dec) {
  dec = dec || 0;
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

PALIT.fmtMoney = function (n) {
  n = Math.floor(n);
  if (n >= 1e9) return PALIT.fmtNum(n / 1e9, 2) + ' bi';
  if (n >= 1e6) return PALIT.fmtNum(n / 1e6, 2) + ' mi';
  return PALIT.fmtNum(n);
};

/* altura: m → km → anos-luz */
PALIT.fmtHeight = function (m) {
  var LY = 9.4607e15;
  if (m >= LY * 0.01) return PALIT.fmtNum(m / LY, m / LY < 100 ? 2 : 0) + ' a.l.';
  if (m >= 1e4) return PALIT.fmtNum(m / 1000, m < 1e6 ? 1 : 0) + ' km';
  if (m >= 100) return PALIT.fmtNum(m, 0) + ' m';
  return PALIT.fmtNum(m, 2) + ' m';
};

PALIT.fmtStatValue = function (key, v) {
  var d = PALIT.STATS[key];
  var f = PALIT.fmtNum;
  switch (d.fmt) {
    case 'int': return f(Math.round(v)) + (d.unit || '');
    case 'sec0': return f(v, 0) + 's';
    case 'sec1': return f(v, 1) + 's';
    case 'sec2': return f(v, 2) + 's';
    case 'pct': return f(v * 100, Math.abs(v * 100) % 1 ? 1 : 0) + '%';
    case 'flag': return v > 0 ? 'SIM' : 'NÃO';
    case 'min': return f(v, 0) + ' min';
    case 'layers': return f(v, 0) + ' camadas';
    case 'num1': return f(v, 1);
    case 'permin': return f(v, 1) + '/min';
    case 'every': return v > 0 ? f(v, 0) + ' reparos' : '—';
    default: return f(v, 2);
  }
};

/* texto de efeito por nível: "Recarga −0,2s" */
PALIT.fmtStatDelta = function (key, v) {
  var d = PALIT.STATS[key];
  var f = PALIT.fmtNum;
  var sign = v < 0 ? '−' : '+';
  var a = Math.abs(v);
  var label = d.label;
  switch (key) {
    case 'placeSpeed': return 'Colocação ' + f(a * 100, a * 100 % 1 ? 1 : 0) + '% mais rápida';
    case 'repairSpeed': return 'Reparo ' + f(a * 100, 0) + '% mais rápido';
    case 'freeRepairLv': return 'Reparo grátis mais frequente';
  }
  switch (d.fmt) {
    case 'int': return label + ' ' + sign + f(a) + (d.unit || '');
    case 'sec0': case 'sec1': case 'sec2': return label + ' ' + sign + f(a, a < 0.1 ? 2 : 1) + 's';
    case 'pct': return label + ' ' + sign + f(a * 100, a * 100 % 1 ? 1 : 0) + '%';
    case 'flag': return label;
    case 'min': return label + ' ' + sign + f(a) + ' min';
    case 'layers': return label + ' ' + sign + f(a) + ' camadas';
    case 'num1': return label + ' ' + sign + f(a, 1);
    case 'permin': return label + ' ' + sign + f(a, 1) + '/min';
    default: return label + ' ' + sign + f(a, 2);
  }
};
