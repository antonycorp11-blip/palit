/* =========================================================
   ESTADO PERSISTENTE — save/load em localStorage
   (dentro da ATHG, também na conta do jogador: ver cloud.js).
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.State = {
  KEY: 'palit.save.v1',

  fresh: function () {
    var m = PALIT.MATERIALS[0];
    return {
      v: 1,
      matIndex: 0,
      money: 0,
      pieces: m.base.capacity,
      reserve: 0,
      prodP: 0,
      reserveP: 0,
      cursor: 0,
      cells: [],
      levels: {},
      globalBase: 0,
      history: [],
      mastered: [],
      challengeDone: false,
      milestones: 0,
      freeRepairCount: 0,
      stormToken: false,
      stats: { placed: 0, repaired: 0, defeated: 0, fallen: 0, earned: 0, playSec: 0, events: 0, perfect: 0, bestStreak: 0, missions: 0, choices: 0, extinguished: 0 },
      missions: [],
      missionTier: 0,
      ach: {},
      bestiary: {},
      story: {},
      clues: [],
      records: {},
      flags: {},
      bosses: {},
      lastSeen: Date.now()
    };
  },

  load: function () {
    try {
      var raw = localStorage.getItem(this.KEY);
      return raw ? this.unpack(JSON.parse(raw)) : null;
    } catch (e) { return null; }
  },

  /* objeto salvo (local ou nuvem da ATHG) → estado do jogo; null se inválido */
  unpack: function (d) {
    try {
      if (!d || d.v !== 1) return null;
      d.cells = typeof d.cells === 'string' ? d.cells.split('').map(Number) : (d.cells || []);
      var f = this.fresh();
      Object.keys(f).forEach(function (k) { if (d[k] == null) d[k] = f[k]; });
      Object.keys(f.stats).forEach(function (k) { if (d.stats[k] == null) d.stats[k] = 0; });
      return d;
    } catch (e) { return null; }
  },

  /* estado do jogo → objeto para salvar (o mesmo vai para o aparelho e para a nuvem) */
  pack: function (S) {
    S.lastSeen = Date.now();
    var o = Object.assign({}, S);
    // peças em colocação (5) voltam a vazio
    o.cells = S.cells.map(function (c) { return c === 5 ? 1 : c; }).join('');
    return o;
  },

  save: function (S) {
    var o = this.pack(S);
    PALIT.Cloud.save(o);
    try {
      localStorage.setItem(this.KEY, JSON.stringify(o));
      return true;
    } catch (e) { return false; }
  },

  wipe: function () {
    try { localStorage.removeItem(this.KEY); } catch (e) { /* sem storage */ }
  }
};
