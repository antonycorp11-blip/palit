/* =========================================================
   PROGRESSO — missões (sempre 3 ativas), conquistas,
   bestiário. Escuta os eventos do jogo; não toca no DOM.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Progress = (function () {
  var P = PALIT, G;
  var lastEarned = 0;
  var achT = 0;

  function S() { return G.S; }

  /* ---------------- missões ---------------- */
  function rewardFor(m) {
    var L = G.layersBuilt();
    return Math.max(5, Math.round(m.reward * 2.5 * P.ECON.layerMoney(G.mat, G.st, L) * (1 + S().missionTier * 0.04)));
  }

  function newMission() {
    var s = S(), L = G.layersBuilt();
    var active = s.missions.map(function (m) { return m.type; });
    var pool = P.MISSIONS.filter(function (t) {
      if (active.indexOf(t.type) >= 0) return false;
      if (t.min && L < t.min) return false;
      if (t.tree && (!G.def || G.progress() >= 1)) return false;
      if ((t.type === 'place' || t.type === 'layers' || t.type === 'perfect' || t.type === 'streak' || t.type === 'combo') && G.blockReason() === 'goal') return false;
      return true;
    });
    if (!pool.length) pool = P.MISSIONS.filter(function (t) { return t.type === 'defeat' || t.type === 'events' || t.type === 'safe'; });
    var t = pool[Math.floor(Math.random() * pool.length)];
    var tier = s.missionTier;
    var m = { type: t.type, target: t.n(tier, L), prog: 0, done: false, reward: t.reward };
    m.text = t.text.replace('{n}', P.fmtNum(m.target));
    m.money = rewardFor(m);
    return m;
  }

  function fill() {
    var s = S();
    while (s.missions.length < 3) s.missions.push(newMission());
  }

  function bump(type, n, isMax) {
    var changed = false;
    S().missions.forEach(function (m) {
      if (m.done || m.type !== type) return;
      m.prog = isMax ? Math.max(m.prog, n) : m.prog + n;
      if (m.prog >= m.target) { m.prog = m.target; m.done = true; G.emit('missionDone', m); }
      changed = true;
    });
    if (changed) G.emit('missions');
  }

  function claim(i) {
    var s = S(), m = s.missions[i];
    if (!m || !m.done) return null;
    s.money += m.money; s.stats.earned += m.money;
    s.stats.missions = (s.stats.missions || 0) + 1;
    s.missionTier++;
    s.missions.splice(i, 1);
    fill();
    G.emit('missionClaim', m);
    G.emit('missions');
    return m;
  }

  function claimAll() {
    var got = [];
    for (var i = S().missions.length - 1; i >= 0; i--) if (S().missions[i].done) got.push(claim(i));
    return got;
  }

  /* ---------------- conquistas ---------------- */
  function checkAch() {
    var s = S();
    P.ACHIEVEMENTS.forEach(function (a) {
      if (s.ach[a.id]) return;
      var ok = false;
      try { ok = a.test(s, G); } catch (e) { ok = false; }
      if (!ok) return;
      s.ach[a.id] = Date.now();
      var r = Math.round(a.reward * (1 + s.matIndex * 2));
      s.money += r; s.stats.earned += r;
      G.emit('achievement', { a: a, money: r });
    });
  }

  /* ---------------- ligação com o jogo ---------------- */
  function init() {
    G = P.Game;
    var s = S();
    s.missions = (s.missions || []).filter(function (m) { return m && m.type; });
    fill();
    lastEarned = s.stats.earned;
    G.on('placeDone', function () { bump('place', 1); bump('combo', G.rt.combo + 1, true); });
    G.on('layerDone', function () { bump('layers', 1); });
    G.on('perfect', function (d) { bump('perfect', 1); bump('streak', d.streak, true); });
    G.on('threatDead', function () { bump('defeat', 1); });
    G.on('repaired', function () { bump('repair', 1); });
    G.on('bought', function (d) { bump('buy', (d && d.n) || 1); });
    G.on('gustSafe', function () { bump('gust', 1); });
    G.on('event', function () { bump('events', 1); });
    G.on('choiceMade', function () { bump('events', 1); S().stats.choices = (S().stats.choices || 0) + 1; });
    G.on('threatSpawn', function (t) {
      var b = S().bestiary;
      if (!b[t.type]) { b[t.type] = { seen: 1, defeated: 0 }; G.emit('bestiaryNew', t.type); }
    });
    G.on('threatDead', function (d) { var b = S().bestiary[d.t.type]; if (b) b.defeated++; });
    G.on('milestone', function () { if (P.Ambient && P.Ambient.night > 0.5) S().flags.nightMilestone = 1; });
    G.on('rebuild', function () { S().missions = []; fill(); G.emit('missions'); });
  }

  function tick(dt) {
    var s = S();
    var e = s.stats.earned;
    if (e > lastEarned) { bump('earn', Math.round(e - lastEarned)); lastEarned = e; }
    if (s.missions.some(function (m) { return m.type === 'safe' && !m.done; })) {
      if (G.rt.integrity >= 90 && G.layersBuilt() > 0) bump('safe', dt);
      else s.missions.forEach(function (m) { if (m.type === 'safe' && !m.done) m.prog = 0; });
    }
    achT -= dt;
    if (achT <= 0) { achT = 1; checkAch(); }
  }

  return { init: init, tick: tick, claim: claim, claimAll: claimAll, fill: fill };
})();
