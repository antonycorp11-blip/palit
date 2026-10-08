/* =========================================================
   MOTOR DE ÁRVORES — genérico para qualquer material.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Tree = (function () {
  var cache = {};

  function parseReq(s) {
    var p = s.split(':');
    return { id: p[0], lv: p[1] ? parseInt(p[1], 10) : 1 };
  }

  /* prepara a árvore: índices, requisitos, totais e layout radial */
  function prepare(treeId) {
    if (cache[treeId]) return cache[treeId];
    var def = PALIT.TREES[treeId];
    if (!def) return null;
    var byId = {};
    var totalLevels = 0;
    def.nodes.forEach(function (n) {
      n.reqs = (n.r || []).map(parseReq);
      n.g = n.g || 1.3;
      byId[n.id] = n;
      totalLevels += n.lv;
    });
    def.byId = byId;
    def.totalLevels = totalLevels;
    layout(def);
    cache[treeId] = def;
    return def;
  }

  /* layout de árvore de verdade: a raiz fica no topo do tronco e cada ramo
     é um galho que sai do tronco (os laterais mais baixo) e se curva para
     cima conforme cresce. Nós da mesma profundidade viram raminhos
     alternados ao longo do galho. */
  function layout(def) {
    var nb = def.branches.length;
    var R0 = 290, SUB = 46, PERP = 32;
    var depth = {};
    function d(n) {
      if (depth[n.id] != null) return depth[n.id];
      if (!n.b) return (depth[n.id] = 0);
      var m = 0;
      n.reqs.forEach(function (r) {
        var o = def.byId[r.id];
        if (o && o.b === n.b) m = Math.max(m, d(o));
      });
      return (depth[n.id] = m + 1);
    }
    def.nodes.forEach(d);
    def.branches.forEach(function (br, bi) {
      var a = (-180 + (bi + 0.5) * 180 / nb) * Math.PI / 180;
      br.angle = a;
      br.ox = 0; br.oy = Math.round(Math.abs(Math.cos(a)) * 150);
      var list = def.nodes.filter(function (n) { return n.b === br.id; });
      list.sort(function (p, q) { return depth[p.id] - depth[q.id] || def.nodes.indexOf(p) - def.nodes.indexOf(q); });
      var maxD = 0;
      list.forEach(function (n, i) {
        var dd = depth[n.id]; maxD = Math.max(maxD, dd);
        var r = R0 + i * SUB;
        var ang = a + (-Math.PI / 2 - a) * Math.min(0.34, i * 0.024);
        var dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx;
        var lane = (i % 2 ? PERP : -PERP) * Math.min(1, 0.4 + i * 0.15);
        n.x = Math.round(br.ox + dx * r + px * lane);
        n.y = Math.round(br.oy + dy * r + py * lane);
        n.depth = dd;
        n.along = i;
      });
      br.labelX = Math.round(br.ox + Math.cos(a) * (R0 - 120));
      br.labelY = Math.round(br.oy + Math.sin(a) * (R0 - 120));
      br.maxDepth = maxD;
    });
    def.nodes.forEach(function (n) { if (!n.b) { n.x = 0; n.y = 0; n.depth = 0; } });
  }

  function effVal(v, lv) {
    if (Array.isArray(v)) { var s = 0; for (var i = 0; i < lv && i < v.length; i++) s += v[i]; return s; }
    return v * lv;
  }

  function baseStats(mat) {
    var s = {};
    Object.keys(PALIT.STATS).forEach(function (k) {
      var d = PALIT.STATS[k];
      s[k] = d.fromMat ? mat.base[k] : (d.base || 0);
    });
    return s;
  }

  function clampStats(s) {
    Object.keys(PALIT.STATS).forEach(function (k) {
      var d = PALIT.STATS[k];
      if (d.max != null && s[k] > d.max) s[k] = d.max;
      if (d.min != null && s[k] < d.min) s[k] = d.min;
    });
    return s;
  }

  /* calcula atributos finais a partir dos níveis comprados */
  function computeStats(mat, def, levels, extra) {
    var s = baseStats(mat);
    if (def) {
      def.nodes.forEach(function (n) {
        var lv = levels[n.id] || 0;
        if (extra && extra.id === n.id) lv += extra.add;
        if (!lv) return;
        Object.keys(n.e).forEach(function (k) { s[k] += effVal(n.e[k], lv); });
      });
    }
    return clampStats(s);
  }

  function cost(def, mat, n, lv) {
    return Math.round(n.c * Math.pow(n.g, lv) * (mat.costScale || 1));
  }

  function reqsMet(def, n, levels) {
    for (var i = 0; i < n.reqs.length; i++) {
      if ((levels[n.reqs[i].id] || 0) < n.reqs[i].lv) return false;
    }
    return true;
  }

  function nodeState(def, n, levels) {
    var lv = levels[n.id] || 0;
    if (lv >= n.lv) return 'max';
    if (!reqsMet(def, n, levels)) return 'locked';
    return lv > 0 ? 'owned' : 'avail';
  }

  function progress(def, levels) {
    if (!def) return 0;
    var got = 0;
    def.nodes.forEach(function (n) { got += Math.min(n.lv, levels[n.id] || 0); });
    return got / def.totalLevels;
  }

  function totalCost(def, mat) {
    var t = 0;
    def.nodes.forEach(function (n) { for (var l = 0; l < n.lv; l++) t += cost(def, mat, n, l); });
    return t;
  }

  /* linhas "Atual → Próximo" para o painel */
  function preview(mat, def, levels, n) {
    var a = computeStats(mat, def, levels);
    var b = computeStats(mat, def, levels, { id: n.id, add: 1 });
    var lines = [];
    Object.keys(n.e).forEach(function (k) {
      var d = PALIT.STATS[k];
      var va = d.view ? d.view(a, mat) : a[k];
      var vb = d.view ? d.view(b, mat) : b[k];
      lines.push({ label: d.label, from: PALIT.fmtStatValue(k, va), to: PALIT.fmtStatValue(k, vb) });
    });
    return lines;
  }

  function effectLines(n) {
    return Object.keys(n.e).map(function (k) {
      var v = n.e[k];
      if (Array.isArray(v)) {
        var same = v.every(function (x) { return x === v[0]; });
        if (!same) return PALIT.fmtStatDelta(k, v[0]) + ' (varia por nível)';
        v = v[0];
      }
      return PALIT.fmtStatDelta(k, v) + (n.lv > 1 ? ' / nível' : '');
    });
  }

  return {
    prepare: prepare, computeStats: computeStats, cost: cost, reqsMet: reqsMet,
    nodeState: nodeState, progress: progress, totalCost: totalCost,
    preview: preview, effectLines: effectLines
  };
})();
