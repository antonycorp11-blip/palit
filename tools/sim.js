// Simulação grosseira de balanceamento: jogador ativo comprando o nó mais barato.
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { console, Math, Object, Array, Number, JSON }; ctx.window = ctx; vm.createContext(ctx);
['js/data/stats.js','js/data/materials.js','js/data/trees/fosforo.js','js/core/tree.js','js/core/econ.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx));
const P = ctx.PALIT, E = P.ECON;
const mat = P.MATERIALS[0], def = P.Tree.prepare('fosforo');
const activity = +(process.argv[2] || 1); // fração do tempo ativo
let lv = {}, s = P.Tree.computeStats(mat, def, lv), money = 0, pieces = 10, layersPieces = 0, t = 0, prodP = 0, bought = 0;
const log = []; let nextLog = 0; let threatT = 50;
while (t < 60 * 3600 * 4) {
  const dt = 1; t += dt;
  prodP += dt / E.effRecharge(s);
  while (prodP >= 1) { prodP--; if (pieces < s.capacity) pieces++; }
  const limit = E.limit(mat, s);
  const active = (t % 600) < 600 * activity;
  if (active) {
    let budget = dt / E.placeTime(s, 3);
    while (budget >= 1 && pieces >= 1 && layersPieces < limit * 2) {
      budget--; if (Math.random() >= s.saveChance) pieces--; layersPieces++;
      if (layersPieces % 2 === 0) { const L = layersPieces / 2; money += E.layerMoney(mat, s, L - 1); if (L % 100 === 0) money += E.milestone(mat, s, L); }
    }
    threatT -= dt; if (threatT <= 0) { threatT = 50; money += 4 * (1 + Math.floor(layersPieces/2) / 200) * (1 + s.threatReward); pieces = Math.max(0, pieces - 1); }
  }
  money += E.passive(mat, s, Math.floor(layersPieces / 2), 0.9) * dt;
  // compra
  let best = null, bc = Infinity;
  def.nodes.forEach(n => { const l = lv[n.id] || 0; if (l >= n.lv || !P.Tree.reqsMet(def, n, lv)) return; const c = P.Tree.cost(def, mat, n, l); if (c < bc) { bc = c; best = n; } });
  if (best && money >= bc) { money -= bc; lv[best.id] = (lv[best.id] || 0) + 1; bought++; s = P.Tree.computeStats(mat, def, lv); }
  const prog = P.Tree.progress(def, lv), L = Math.floor(layersPieces / 2);
  if (t >= nextLog) { log.push(`${(t/3600).toFixed(1)}h layers=${L} limit=${limit} prog=${(prog*100).toFixed(0)}% money=${money|0} next=${bc}`); nextLog += 1800; }
  if (prog >= 1 && L >= mat.goalLayers) { log.push(`DONE at ${(t/3600).toFixed(2)}h`); break; }
}
console.log(log.join('\n'));
