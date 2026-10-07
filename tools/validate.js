// Valida dados: node tools/validate.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { console, Math, Object, Array, Number, JSON };
ctx.window = ctx; vm.createContext(ctx);
['js/data/stats.js','js/data/materials.js','js/data/trees/fosforo.js','js/core/tree.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f }));
const P = ctx.PALIT; let errors = 0;
for (const tid of Object.keys(P.TREES)) {
  const def = P.Tree.prepare(tid), mat = P.MATERIALS.find(m => m.tree === tid);
  const ids = new Set();
  def.nodes.forEach(n => {
    if (ids.has(n.id)) { console.log('DUP', n.id); errors++; } ids.add(n.id);
    n.reqs.forEach(r => { if (!def.byId[r.id]) { console.log('REQ missing', n.id, r.id); errors++; }
      else if (r.lv > def.byId[r.id].lv) { console.log('REQ lv > max', n.id, r.id); errors++; } });
    Object.keys(n.e).forEach(k => { if (!P.STATS[k]) { console.log('STAT?', n.id, k); errors++; }
      if (Array.isArray(n.e[k]) && n.e[k].length !== n.lv) { console.log('arr len', n.id, k); errors++; } });
  });
  // overlap
  let minD = 1e9, pair;
  for (let i = 0; i < def.nodes.length; i++) for (let j = i + 1; j < def.nodes.length; j++) {
    const a = def.nodes[i], b = def.nodes[j]; const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < minD) { minD = d; pair = a.id + '/' + b.id; } }
  const full = {}; def.nodes.forEach(n => full[n.id] = n.lv);
  const s = P.Tree.computeStats(mat, def, full);
  console.log(`${tid}: nodes=${def.nodes.length} levels=${def.totalLevels} totalCost=${P.Tree.totalCost(def, mat)} minDist=${minD.toFixed(0)} (${pair})`);
  console.log(` limit=${mat.baseLimitLayers + s.limitLayers}/${mat.goalLayers} recharge=${s.rechargeSec.toFixed(2)} prod=${s.prodMult.toFixed(2)} cap=${s.capacity} place=${(s.placeSec/(1+s.placeSpeed)).toFixed(2)}`);
  const per = {}; def.nodes.forEach(n => per[n.b] = (per[n.b] || 0) + 1); console.log(' per branch', JSON.stringify(per));
}
console.log('materials', P.MATERIALS.length, errors ? 'ERRORS ' + errors : 'OK');
process.exit(errors ? 1 : 0);
