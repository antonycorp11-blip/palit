/* =========================================================
   ESTADO PERSISTENTE — save/load em localStorage.
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
      stats: { placed: 0, repaired: 0, defeated: 0, fallen: 0, earned: 0, playSec: 0, events: 0 },
      lastSeen: Date.now()
    };
  },

  load: function () {
    try {
      var raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || d.v !== 1) return null;
      d.cells = typeof d.cells === 'string' ? d.cells.split('').map(Number) : (d.cells || []);
      var f = this.fresh();
      Object.keys(f).forEach(function (k) { if (d[k] == null) d[k] = f[k]; });
      Object.keys(f.stats).forEach(function (k) { if (d.stats[k] == null) d.stats[k] = 0; });
      return d;
    } catch (e) { return null; }
  },

  save: function (S) {
    try {
      S.lastSeen = Date.now();
      var o = Object.assign({}, S);
      // peças em colocação (5) voltam a vazio
      o.cells = S.cells.map(function (c) { return c === 5 ? 1 : c; }).join('');
      localStorage.setItem(this.KEY, JSON.stringify(o));
      return true;
    } catch (e) { return false; }
  },

  wipe: function () {
    try { localStorage.removeItem(this.KEY); } catch (e) { /* sem storage */ }
  }
};
