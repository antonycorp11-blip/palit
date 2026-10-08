/* =========================================================
   JOGO — simulação. Não toca no DOM; a UI escuta eventos.
   Coordenadas de mundo em "unidades de pixel" (U):
     x relativo ao centro da torre, y a partir da base.
     camada i ocupa y ∈ [i*LHU, (i+1)*LHU], LHU = 3.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Game = (function () {
  var P = PALIT, E = P.ECON;
  var EMPTY = 0, OK = 1, CRACK = 2, MISS = 3, FIRE = 4, PLACING = 5;
  var LHU = 3;

  var S, mat, def, st, rt;
  var listeners = {};

  function on(n, f) { (listeners[n] = listeners[n] || []).push(f); }
  function emit(n, d) { (listeners[n] || []).forEach(function (f) { f(d); }); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function rint(a, b) { return Math.floor(rnd(a, b + 1)); }

  function freshRuntime() {
    return {
      clock: 0,
      placing: null, queued: false, combo: 0, lastPlaceAt: -9,
      repairing: null,
      wind: { force: 0, pending: [], gust: null, breeze: 0, phase: 0 },
      rain: null, hail: 0, hailT: 0, heat: 0, heatT: 0, boost: 0, calm: 0, storm: 0, stormGustT: 0,
      jam: false, jamTaps: 0, defect: 0, luck: 0,
      landAt: -9, streak: 0,
      threats: [], threatSeq: 1,
      threatT: 45, eventT: 30, spreadT: 20,
      fires: {},
      known: {},
      lastInput: 0,
      autoPlaceT: 0, autoRepairT: 0, autoDefendT: 0,
      helpers: [], helperSeq: 1,
      boss: null, bossCheckT: 3,
      ch: null,
      integrity: 100, dmgCount: { crack: 0, miss: 0, fire: 0 },
      viewW: 100
    };
  }

  /* ---------------- init / material ---------------- */
  function init(save) {
    S = save || P.State.fresh();
    rt = freshRuntime();
    setMaterial();
    // a era ficou mais curta: torres acima da nova altura máxima são aparadas no topo
    var maxCells = mat.goalLayers * ppl();
    if (S.cursor > maxCells) { S.cursor = maxCells; S.cells.length = maxCells; }
    rebuildDamageIndex(true);
    eraRecord();
  }

  function setMaterial() {
    mat = P.MATERIALS[S.matIndex];
    def = mat.tree ? P.Tree.prepare(mat.tree) : null;
    S.levels[mat.id] = S.levels[mat.id] || {};
    recalc();
  }

  function levels() { return S.levels[mat.id]; }

  /* recordes por era */
  function eraRecord() {
    S.records = S.records || {};
    var r = S.records[mat.id] = S.records[mat.id] || { start: S.stats.playSec, master: null, bestStreak: 0, maxCombo: 0, fallen0: S.stats.fallen, defeated0: S.stats.defeated };
    return r;
  }

  function recalc() {
    st = P.Tree.computeStats(mat, def, levels());
    if (S.pieces > st.capacity) S.pieces = st.capacity;
    if (S.reserve > st.reserveCap) S.reserve = st.reserveCap;
    emit('stats');
  }

  /* ---------------- derivados ---------------- */
  function ppl() { return mat.piecesPerLayer; }
  function layersBuilt() { return Math.floor(S.cursor / ppl()); }
  function topLayer() { return Math.ceil(S.cursor / ppl()); }
  function limit() { return E.limit(mat, st); }
  function localHeight() { return layersBuilt() * mat.layerHeightM * (1 + st.pieceSize); }
  function globalHeight() { return S.globalBase + localHeight(); }
  function progress() { return P.Tree.progress(def, levels()); }

  /* ---------------- células ---------------- */
  function setCell(c, v) {
    S.cells[c] = v;
    if (v === FIRE) rt.fires[c] = 0; else delete rt.fires[c];
    if (v === OK || v === EMPTY || v === PLACING) delete rt.known[c];
    recomputeIntegrity();
    emit('cell', c);
  }

  function rebuildDamageIndex(markKnown) {
    rt.fires = {};
    for (var c = 0; c < S.cells.length; c++) {
      var v = S.cells[c];
      if (v === PLACING) S.cells[c] = OK;
      if (v === FIRE) rt.fires[c] = 0;
      if (markKnown && (v === CRACK || v === MISS || v === FIRE)) rt.known[c] = 1;
    }
    recomputeIntegrity();
  }

  function recomputeIntegrity() {
    var cr = 0, mi = 0, fi = 0;
    for (var c = 0; c < S.cursor; c++) {
      var v = S.cells[c];
      if (v === CRACK) cr++; else if (v === MISS) mi++; else if (v === FIRE) fi++;
    }
    rt.dmgCount = { crack: cr, miss: mi, fire: fi };
    rt.integrity = Math.max(0, Math.min(100, 100 - mi * 2.5 - cr * 0.8 - fi * 3));
  }

  function damagedCells(knownOnly) {
    var out = [];
    for (var c = 0; c < S.cursor; c++) {
      var v = S.cells[c];
      if ((v === CRACK || v === MISS || v === FIRE) && (!knownOnly || rt.known[c])) out.push(c);
    }
    return out;
  }

  /* camadas de baixo blindadas por tábuas (cada upgrade de limite reforça a base).
     As 15 camadas do topo nunca ficam blindadas: sempre há o que defender. */
  function braced() {
    return Math.max(0, Math.min(Math.floor(st.limitLayers || 0), layersBuilt() - 15));
  }

  /* escolhe célula construída entre camadas lo..hi, enviesada para o topo */
  function pickCell(lo, hi, bias) {
    lo = Math.max(0, lo, braced()); hi = Math.min(layersBuilt() - 1, hi);
    if (hi < lo) return -1;
    for (var i = 0; i < 12; i++) {
      var f = Math.pow(Math.random(), bias || 1);
      var layer = Math.round(hi - f * (hi - lo));
      var c = layer * ppl() + rint(0, ppl() - 1);
      var v = S.cells[c];
      if (v === OK || v === CRACK) return c;
    }
    return -1;
  }

  /* ---------------- dano ---------------- */
  function damage(c, kind, src) {
    if (c < 0) return false;
    var v = S.cells[c];
    if (v !== OK && v !== CRACK) return false;
    if (Math.floor(c / ppl()) < braced()) { emit('braceBlock', c); return false; }
    var nv;
    if (kind === 'crack') nv = v === OK ? CRACK : MISS;
    else if (kind === 'fire') nv = FIRE;
    else nv = MISS;
    setCell(c, nv);
    var layer = Math.floor(c / ppl());
    if (nv === MISS) {
      S.stats.fallen++;
      emit('fall', { cell: c, steal: kind === 'steal' });
      if (kind !== 'steal' && Math.random() < st.recoverChance) {
        givePieces(1);
        emit('toast', { text: 'PEÇA RECUPERADA', kind: 'good' });
      }
    }
    var known = st.autoDetect || nv === FIRE || layer >= topLayer() - st.detectRange;
    if (known) {
      rt.known[c] = 1;
      emit('damage', { cell: c, layer: layer, kind: nv === FIRE ? 'fire' : (nv === MISS ? 'miss' : 'crack'), src: src });
    }
    return true;
  }

  function givePieces(n) {
    for (var i = 0; i < n; i++) {
      if (S.pieces < st.capacity) S.pieces++;
      else if (S.reserve < st.reserveCap) S.reserve++;
    }
  }

  /* ---------------- colocação ---------------- */
  function blockReason() {
    if (rt.boss && rt.boss.state !== 'dead') return 'boss';
    if (layersBuilt() >= limit() && S.cursor % ppl() === 0) return layersBuilt() >= mat.goalLayers ? 'goal' : 'limit';
    if (rt.integrity < 40) return 'unstable';
    if (S.pieces < 1 && !(st.reserveBuild && S.reserve >= 1)) return 'empty';
    return null;
  }

  var PERFECT_WIN = 0.26;

  function tryPlace(auto, queued) {
    if (!auto) rt.lastInput = rt.clock;
    if (rt.placing) { if (!auto && st.tapQueue) rt.queued = true; return false; }
    var r = blockReason();
    if (r) { if (!auto) emit('blocked', r); return false; }
    var fromReserve = S.pieces < 1;
    if (Math.random() >= st.saveChance) { if (fromReserve) S.reserve--; else S.pieces--; }
    else emit('toast', { text: 'PEÇA ECONOMIZADA', kind: 'good', small: true });
    if (!auto) {
      rt.combo = rt.clock - rt.lastPlaceAt < 1.8 ? Math.min(5, rt.combo + 1) : 0;
      rt.lastPlaceAt = rt.clock;
      var rec = eraRecord();
      if (rt.combo + 1 > rec.maxCombo) rec.maxCombo = rt.combo + 1;
      // encaixe perfeito: tocar logo depois que o palito anterior encaixou
      var since = rt.clock - rt.landAt;
      if (!queued && since >= 0 && since <= PERFECT_WIN) {
        rt.streak++;
        S.stats.perfect = (S.stats.perfect || 0) + 1;
        if (rt.streak > (S.stats.bestStreak || 0)) S.stats.bestStreak = rt.streak;
        if (rt.streak > rec.bestStreak) rec.bestStreak = rt.streak;
        var pm = E.layerMoney(mat, st, layersBuilt()) * 0.5 * (1 + Math.min(20, rt.streak) * 0.05);
        addMoney(pm);
        emit('perfect', { streak: rt.streak, money: pm });
      } else if (!queued) {
        if (rt.streak > 0) emit('streakLost', rt.streak);
        rt.streak = 0;
      }
    }
    var dur = E.placeTime(st, rt.combo);
    if (auto) dur = Math.max(dur, 0.6);
    var c = S.cursor++;
    S.cells[c] = PLACING;
    rt.placing = { cell: c, t: 0, dur: dur, auto: !!auto };
    emit('placeStart', rt.placing);
    emit('cell', c);
    return true;
  }

  function finishPlace() {
    var c = rt.placing.cell;
    rt.placing = null;
    var v = OK;
    rt.landAt = rt.clock;
    if (mat.slip && Math.random() < mat.slip * (1 - st.slipResist)) {
      v = CRACK; emit('toast', { text: 'ESCORREGOU! ENCAIXOU TORTO', kind: 'bad', small: true });
    }
    if (v === OK && rt.defect > 0) {
      rt.defect--;
      if (Math.random() >= st.defectResist) { v = CRACK; emit('toast', { text: 'PEÇA DEFEITUOSA', kind: 'bad', small: true }); }
    }
    setCell(c, v);
    if (v === CRACK) rt.known[c] = 1;
    S.stats.placed++;
    emit('placeDone', c);
    if ((c + 1) % ppl() === 0) layerComplete(Math.floor(c / ppl()));
    if (Math.random() < st.doublePlace && !blockReason()) {
      emit('toast', { text: 'MÃO DUPLA!', kind: 'good', small: true });
      tryPlace(true);
      if (rt.placing) rt.placing.dur = 0.12;
      return;
    }
    if (rt.queued) { rt.queued = false; tryPlace(false, true); }
  }

  function layerComplete(layer) {
    var m = E.layerMoney(mat, st, layer) * (rt.calm > 0 ? 1.1 : 1);
    addMoney(m);
    emit('layerDone', { layer: layer, money: m });
    var L = layer + 1;
    if (L % mat.milestoneEvery === 0 && L > S.milestones) {
      S.milestones = L;
      var b = E.milestone(mat, st, L);
      addMoney(b);
      emit('milestone', { layer: L, money: b });
    }
    if (L >= limit() && L < mat.goalLayers) emit('toast', { text: 'LIMITE ESTRUTURAL ATINGIDO', kind: 'warn' });
    if (L === mat.goalLayers) emit('toast', { text: 'ALTURA MÁXIMA DA ERA!', kind: 'good' });
  }

  function addMoney(m) { S.money += m; S.stats.earned += m; }

  /* ---------------- reparo ---------------- */
  function repairCell(c) {
    rt.lastInput = rt.clock;
    var v = S.cells[c];
    if (v === FIRE) {
      setCell(c, CRACK); rt.known[c] = 1;
      S.stats.extinguished = (S.stats.extinguished || 0) + 1;
      emit('toast', { text: 'FOGO APAGADO', kind: 'good', small: true });
      emit('extinguish', c);
      return true;
    }
    if (v !== CRACK && v !== MISS) return false;
    if (rt.repairing) return false;
    var layer = Math.floor(c / ppl());
    var free = false;
    if (st.freeStormRepair && S.stormToken) { free = true; S.stormToken = false; }
    var fee = free ? 0 : E.repairFee(mat, st, layer);
    if (S.money < fee) { emit('blocked', 'money'); return false; }
    if (v === MISS && !free) {
      var every = P.STATS.freeRepairLv.view(st);
      S.freeRepairCount++;
      var skip = every > 0 && S.freeRepairCount % every === 0;
      if (!skip) {
        if (S.reserve >= 1) S.reserve--;
        else if (S.pieces >= 1) S.pieces--;
        else {
          var extra = emergencyPiece(layer);
          if (S.money < fee + extra) { S.freeRepairCount--; emit('blocked', 'emptyRepair'); return false; }
          S.money -= extra;
          emit('toast', { text: 'PEÇA AVULSA COMPRADA −$' + P.fmtMoney(extra), kind: 'info', small: true });
        }
      } else emit('toast', { text: 'REPARO SEM CUSTO DE PEÇA', kind: 'good', small: true });
    }
    S.money -= fee;
    var dur = st.repairSec / (1 + st.repairSpeed) * (v === CRACK ? 0.6 : 1);
    rt.repairing = { cell: c, t: 0, dur: dur, free: free };
    emit('repairStart', rt.repairing);
    return true;
  }

  /* sem peças na caixa, o reparo compra uma peça avulsa (nunca trava o jogo) */
  function emergencyPiece(layer) { return Math.max(2, Math.round(E.repairFee(mat, st, layer) * 0.5)); }

  function finishRepair() {
    var c = rt.repairing.cell;
    rt.repairing = null;
    setCell(c, OK);
    S.stats.repaired++;
    emit('repaired', c);
  }

  /* ---------------- vento ---------------- */
  function gust(str) {
    var w = rt.wind;
    var dir = Math.random() < 0.5 ? -1 : 1;
    w.pending.push({ t: st.windWarn, str: str, dir: dir });
    emit('windWarn', { sec: st.windWarn, dir: dir, str: str });
  }

  function applyGustDamage(g) {
    var top = layersBuilt();
    if (top < 3) return;
    var exp = 1.1 * g.str * (1 - st.windResist) * (1 - st.looseResist * 0.6) * (1 + top / 400) * (1 - st.sway * 0.4);
    var n = Math.floor(exp + Math.random());
    var hits = 0;
    for (var i = 0; i < n; i++) {
      if (Math.random() < st.windImmune) continue;
      if (damage(pickCell(top - 80, top - 1, 0.6), Math.random() < 0.65 ? 'crack' : 'drop', 'wind')) hits++;
    }
    if (!hits) { emit('toast', { text: 'A TORRE RESISTIU AO VENTO', kind: 'good', small: true }); emit('gustSafe'); }
  }

  function updateWind(dt) {
    var w = rt.wind;
    w.phase += dt;
    for (var i = w.pending.length - 1; i >= 0; i--) {
      var p = w.pending[i];
      p.t -= dt;
      if (p.t <= 0) { w.pending.splice(i, 1); w.gust = { t: 0, dur: 3.2, str: p.str, dir: p.dir, hit: false }; emit('gust', w.gust); }
    }
    var f = Math.sin(w.phase * 0.7) * 0.12 + Math.sin(w.phase * 1.9) * 0.05;
    if (w.breeze > 0) { w.breeze -= dt; f += 0.35 + Math.sin(w.phase * 1.3) * 0.15; }
    if (w.gust) {
      var g = w.gust;
      g.t += dt;
      var k = Math.sin(Math.min(1, g.t / g.dur) * Math.PI);
      f += g.dir * g.str * k * 1.4;
      if (!g.hit && g.t > g.dur * 0.45) { g.hit = true; applyGustDamage(g); }
      if (g.t >= g.dur) w.gust = null;
    }
    rt.threats.forEach(function (t) { if (t.type === 'kite' && t.state === 'attack') f += Math.sin(w.phase * 3) * 0.2; });
    w.force = f;
  }

  function sway() { return rt.wind.force * (1 - st.sway); }

  /* ---------------- eventos ---------------- */
  function pickEvent() {
    var top = layersBuilt();
    var pool = P.EVENTS.filter(function (e) {
      if (e.min > top) return false;
      if (rt.calm > 0 && (e.type === 'gust' || e.type === 'windy' || e.type === 'storm')) return false;
      if (e.type === 'spawn' && mat.threats.indexOf(e.threat) < 0) return false;
      if ((e.type === 'heat') && !mat.look.head) return false;
      if (e.type === 'choice' && (rt.ch || (e.eras && e.eras.indexOf(mat.id) < 0))) return false;
      return true;
    });
    var tot = 0;
    var luck = st.eventLuck + (rt.luck > 0 ? 0.2 : 0);
    var ws = pool.map(function (e) { var w = e.w * (e.good ? 1 + luck * 3 : 1); tot += w; return w; });
    var r = Math.random() * tot;
    for (var i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) return pool[i]; }
    return pool[0];
  }

  function runEvent(e) {
    if (!e) return;
    var top = layersBuilt();
    S.stats.events++;
    var show = true;
    switch (e.type) {
      case 'gust': gust(rnd(e.str[0], e.str[1])); show = false; break;
      case 'windy': gust(1.0); gust(0.8); rt.wind.pending[1].t += 8; rt.wind.breeze = e.dur; break;
      case 'breeze': rt.wind.breeze = e.dur; break;
      case 'rain': rt.rain = { t: e.dur, str: e.str, tick: 4 }; break;
      case 'hail': rt.hail = e.dur; break;
      case 'storm': rt.storm = e.dur; rt.stormGustT = 3; rt.rain = { t: e.dur, str: 1, tick: 4 }; break;
      case 'heat': rt.heat = e.dur; rt.heatT = 6; break;
      case 'jam':
        if (Math.random() < st.jamResist) { emit('toast', { text: 'A CAIXA QUASE EMPERROU', kind: 'good', small: true }); return; }
        rt.jam = true; rt.jamTaps = 0; rt.jamT = 25; break;
      case 'defect': rt.defect += e.n; break;
      case 'loose': damage(pickCell(0, top - 1, 1), 'crack', 'event'); break;
      case 'bump':
        damage(pickCell(0, 20, 1), 'crack', 'event');
        damage(pickCell(0, 20, 1), Math.random() < 0.5 ? 'crack' : 'drop', 'event');
        rt.wind.gust = { t: 0, dur: 1.2, str: 0.6, dir: 1, hit: true };
        break;
      case 'spawn': spawnThreat(e.threat, rint(e.n[0], e.n[1])); break;
      case 'boost': rt.boost = e.dur; break;
      case 'found': {
        var n = rint(e.n[0], e.n[1]); givePieces(n);
        emit('event', { e: e, extra: '+' + n + ' ' + mat.pieces.toUpperCase() }); return;
      }
      case 'money': {
        var m = Math.round(e.mult * (5 + top * 0.15) * (1 + st.eventLuck));
        addMoney(m);
        emit('event', { e: e, extra: '+$' + P.fmtMoney(m) }); return;
      }
      case 'calm': rt.calm = e.dur; break;
      case 'refill': S.pieces = Math.max(S.pieces, st.capacity); break;
      case 'choice': emit('choice', { id: e.choice }); return;
    }
    if (show) emit('event', { e: e });
  }

  /* ---------------- ameaças ---------------- */
  /* geometria da torre em projeção oblíqua: L = comprimento da peça,
     D = recuo diagonal da profundidade (metade de L) */
  function geo() {
    var art = P.STICKS && P.STICKS[mat.id];
    var L = mat.look.len, D = art && art.depth ? art.depth : Math.round(L / 2);
    return { L: L, D: D, halfW: (L + D) / 2 };
  }

  function spawnThreat(type, count) {
    var d = P.THREATS[type];
    var top = layersBuilt();
    if (!d || top < 2) return;
    count = count || 1;
    for (var i = 0; i < count; i++) {
      var side = Math.random() < 0.5 ? -1 : 1;
      var g = geo(), halfW = g.halfW;
      var lowB = braced();
      var target = Math.max(lowB, top - 1 - rint(0, Math.min(25, top - 1 - lowB)));
      var t = {
        id: rt.threatSeq++, type: type, def: d, hp: d.hp, maxHp: d.hp,
        side: side, layer: target, state: 'approach', t: 0, life: 0, atk: 0, steals: 0,
        x: 0, y: 0, tx: 0, ty: 0, wob: Math.random() * 6
      };
      var speed = d.speed / 4;
      if (d.tags && d.tags.indexOf('insect') >= 0) speed *= 1 - st.insectSlow;
      t.speed = speed;
      var ty = target * LHU + 1 + (side > 0 ? g.D : 0);
      if (d.kind === 'flyer') {
        t.x = side * (rt.viewW / 2 + 12 + i * 4); t.y = ty + rnd(-10, 30);
        t.tx = side * (halfW + 4 + rnd(0, 4)); t.ty = ty;
      } else if (d.kind === 'climber' || d.kind === 'pounce') {
        t.x = side * (halfW + 3); t.y = Math.max(-2, ty - rnd(30, 50) - i * 8);
        t.tx = t.x; t.ty = ty;
      } else if (d.kind === 'projectile') {
        t.x = side * (rt.viewW / 2 + 10); t.y = ty + 6;
        t.sx = t.x; t.sy = t.y; t.tx = side * (halfW + 1); t.ty = ty;
      } else if (d.kind === 'faller') {
        t.x = rnd(-halfW + 1, halfW - 1); t.y = top * LHU + g.D + 70 + rnd(0, 30);
        t.tx = t.x; t.ty = Math.max(0, top - rint(0, 6)) * LHU + 1 + Math.round((t.x + halfW) / (2 * halfW) * g.D);
      }
      rt.threats.push(t);
      emit('threatSpawn', t);
    }
    if (d.kind !== 'faller') emit('toast', { text: d.name.toUpperCase() + (count > 1 ? ' ×' + count : '') + '!', kind: 'bad', small: true, cell: target * ppl() });
  }

  function pickThreatType() {
    var top = layersBuilt();
    var pool = mat.threats.filter(function (k) { var d = P.THREATS[k]; return d && d.w > 0 && d.minLayer <= top; });
    if (!pool.length) return null;
    var tot = 0;
    var ws = pool.map(function (k) {
      var d = P.THREATS[k], w = d.w;
      if (d.tags && d.tags.indexOf('ground') >= 0) w *= 1 - st.groundResist;
      tot += w; return w;
    });
    var r = Math.random() * tot;
    for (var i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) return pool[i]; }
    return pool[0];
  }

  function moveTo(t, dt, sp) {
    var dx = t.tx - t.x, dy = t.ty - t.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var step = sp * dt;
    if (dist <= step) { t.x = t.tx; t.y = t.ty; return true; }
    t.x += dx / dist * step; t.y += dy / dist * step;
    return false;
  }

  function threatAttack(t) {
    var d = t.def;
    var c = t.layer * ppl() + rint(0, ppl() - 1);
    if (S.cells[c] !== OK && S.cells[c] !== CRACK) c = pickCell(t.layer - 2, t.layer + 2, 1);
    if (d.dmg === 'ignite') {
      if (Math.random() < st.igniteResist || !mat.look.head) emit('toast', { text: 'A LUPA NÃO ACENDEU NADA', kind: 'good', small: true });
      else damage(c, 'fire', t.type);
      leave(t); return;
    }
    if (d.dmg === 'impact') {
      for (var i = 0; i < d.hits; i++) damage(pickCell(t.layer - 2, t.layer + 2, 1), Math.random() < 0.5 ? 'crack' : 'drop', t.type);
      emit('impact', t);
      leave(t); return;
    }
    if (d.dmg === 'crack' && t.type === 'hail') {
      // granizo só racha peças inteiras: nunca derruba peça já rachada
      if (Math.random() < st.hailResist || S.cells[c] !== OK) { remove(t); return; }
    }
    damage(c, d.dmg === 'steal' ? 'steal' : d.dmg, t.type);
    if (d.dmg === 'steal' && ++t.steals >= 3) { leave(t); return; }
    if (d.kind === 'flyer') {
      t.layer = Math.max(0, Math.min(layersBuilt() - 1, t.layer + rint(-2, 2)));
      t.ty = t.layer * LHU + 1; t.state = 'approach';
    }
  }

  function leave(t) {
    t.state = 'leave';
    t.tx = t.side * (rt.viewW / 2 + 30); t.ty = t.y + 20;
  }
  function remove(t) { t.state = 'gone'; }

  function updateThreats(dt) {
    var top = layersBuilt();
    var live = rt.threats.filter(function (t) { return t.def.kind !== 'faller' && t.state !== 'gone' && t.state !== 'dead'; }).length;
    if (!rt.ch) {
      rt.threatT -= dt;
      if (rt.threatT <= 0) {
        // com ajudantes contratados, as ameaças vêm com mais frequência
        rt.threatT = rnd(40, 75) * Math.max(0.5, 1 - top / 2000) / (1 + 0.18 * (st.helpers || 0));
        if (live < 5) { var k = pickThreatType(); if (k) spawnThreat(k, P.THREATS[k].group ? rint(P.THREATS[k].group[0], P.THREATS[k].group[1]) : 1); }
      }
    }
    if (rt.hail > 0) {
      rt.hail -= dt; rt.hailT -= dt;
      if (rt.hailT <= 0) { rt.hailT = rnd(0.9, 1.6); spawnThreat('hail', 1); }
    }
    for (var i = rt.threats.length - 1; i >= 0; i--) {
      var t = rt.threats[i], d = t.def;
      t.life += dt; t.t += dt;
      if (t.life > 120 && t.state !== 'leave' && t.state !== 'dead' && t.state !== 'gone') leave(t);
      switch (t.state) {
        case 'approach':
          if (d.kind === 'projectile') {
            var k = Math.min(1, t.t / d.impact);
            t.x = t.sx + (t.tx - t.sx) * k;
            t.y = t.sy + (t.ty - t.sy) * k + Math.sin(k * Math.PI) * 14;
            if (k >= 1) threatAttack(t);
          } else if (d.kind === 'faller') {
            if (moveTo(t, dt, t.speed)) threatAttack(t);
          } else {
            var sp = t.speed;
            if (moveTo(t, dt, sp)) {
              if (d.tags && d.tags.indexOf('bird') >= 0 && Math.random() < st.birdRepel) {
                emit('toast', { text: 'O ' + d.name.toUpperCase() + ' DESISTIU', kind: 'good', small: true }); leave(t); break;
              }
              t.state = d.kind === 'pounce' ? 'windup' : 'attack'; t.atk = 0;
            }
          }
          break;
        case 'attack':
          t.atk += dt;
          if (t.atk >= d.interval * (1 + st.threatDelay)) { t.atk = 0; threatAttack(t); }
          break;
        case 'windup':
          t.atk += dt;
          if (t.atk >= d.windup * (1 + st.threatDelay)) threatAttack(t);
          break;
        case 'leave':
          if (moveTo(t, dt, Math.max(t.speed, 20) * 1.5)) remove(t);
          break;
        case 'dead':
          if (t.t > 0.6) remove(t);
          break;
      }
      if (t.state === 'gone') { rt.threats.splice(i, 1); emit('threatGone', t); }
    }
  }

  function hitThreat(id, power) {
    var auto = power != null;
    if (!auto) rt.lastInput = rt.clock;
    for (var i = 0; i < rt.threats.length; i++) {
      var t = rt.threats[i];
      if (t.id !== id) continue;
      if (t.state === 'dead' || t.state === 'gone' || t.state === 'leave') return false;
      t.hp -= power != null ? power : st.threatPower;
      emit('threatHit', t);
      if (t.hp <= 0) {
        t.state = 'dead'; t.t = 0;
        var m = t.def.reward * (1 + layersBuilt() / 200) * (1 + st.threatReward);
        addMoney(m);
        S.stats.defeated++;
        emit('threatDead', { t: t, money: m });
      }
      return true;
    }
    return false;
  }

  function threatsActive() {
    for (var i = 0; i < rt.threats.length; i++) {
      var t = rt.threats[i];
      if (t.def.kind !== 'faller' && (t.state === 'attack' || t.state === 'approach' || t.state === 'windup')) return true;
    }
    return false;
  }

  /* ---------------- fogo / propagação ---------------- */
  function updateFires(dt) {
    Object.keys(rt.fires).forEach(function (k) {
      var c = +k;
      rt.fires[c] += dt;
      if (rt.fires[c] >= 7) {
        setCell(c, MISS); rt.known[c] = 1; S.stats.fallen++;
        emit('fall', { cell: c, burnt: true });
        var layer = Math.floor(c / ppl());
        var nb = [c ^ 1, c + ppl(), c - ppl()];
        nb.forEach(function (n) {
          if (n >= 0 && n < S.cursor && S.cells[n] === OK && Math.random() < 0.35 * (1 - st.igniteResist)) damage(n, 'fire', 'fire');
        });
        emit('toast', { text: 'FÓSFORO QUEIMOU — CAMADA ' + (layer + 1), kind: 'bad', cell: c });
      }
    });
  }

  function updateSpread(dt) {
    rt.spreadT -= dt;
    if (rt.spreadT > 0) return;
    rt.spreadT = 20;
    var dmg = damagedCells(false), events = 0;
    for (var i = 0; i < dmg.length && events < 3; i++) {
      var c = dmg[i], v = S.cells[c];
      if (v === MISS && Math.random() < 0.06 * (1 - st.spreadResist)) {
        var n = Math.random() < 0.5 ? c + ppl() : c - ppl();
        if (n >= 0 && n < S.cursor && damage(n, 'crack', 'spread')) events++;
      } else if (v === CRACK && Math.random() < 0.02 * (1 - st.spreadResist) * (rt.rain ? 2 : 1)) {
        if (damage(c, 'crack', 'spread')) events++;
      }
    }
  }

  /* ---------------- clima ---------------- */
  function updateWeather(dt) {
    if (rt.rain) {
      rt.rain.t -= dt; rt.rain.tick -= dt;
      if (rt.rain.tick <= 0) {
        rt.rain.tick = 4;
        if (Math.random() < 0.35 * rt.rain.str * (1 - st.moistureResist)) damage(pickCell(0, layersBuilt() - 1, 1), 'crack', 'rain');
      }
      if (rt.rain.t <= 0) rt.rain = null;
    }
    if (rt.storm > 0) {
      rt.storm -= dt; rt.stormGustT -= dt;
      if (rt.stormGustT <= 0) { rt.stormGustT = rnd(7, 10); gust(rnd(0.9, 1.4)); }
      if (rt.storm <= 0) { S.stormToken = true; emit('toast', { text: 'A TEMPESTADE PASSOU', kind: 'good' }); }
    }
    if (rt.heat > 0) {
      rt.heat -= dt; rt.heatT -= dt;
      if (rt.heatT <= 0) {
        rt.heatT = 6;
        if (Math.random() < 0.15 * (1 - st.igniteResist)) damage(pickCell(layersBuilt() - 40, layersBuilt() - 1, 1), 'fire', 'heat');
      }
    }
    if (rt.boost > 0) rt.boost -= dt;
    if (rt.calm > 0) rt.calm -= dt;
    if (rt.luck > 0) rt.luck -= dt;
  }

  function unjam() {
    if (!rt.jam) return;
    rt.lastInput = rt.clock;
    rt.jamTaps++;
    emit('jamTap', rt.jamTaps);
    if (rt.jamTaps >= 3) { rt.jam = false; emit('toast', { text: 'CAIXA DESEMPERRADA', kind: 'good', small: true }); }
  }

  /* ---------------- produção ---------------- */
  function prodRate() {
    var rate = 1 / E.effRecharge(st);
    if (rt.jam) return 0;
    if (rt.boost > 0) rate *= 1.5;
    if (rt.heat > 0) rate *= 1.1;
    if (threatsActive()) rate *= st.attackProd;
    if (rt.repairing && !st.rechargeWhileRepair) return 0;
    return rate;
  }

  function produceOne() {
    var n = Math.random() < st.doubleChance ? 2 : 1;
    for (var i = 0; i < n; i++) {
      if (S.pieces < st.capacity) { S.pieces++; emit('produce', 'box'); }
      else if (S.reserve < st.reserveCap) {
        S.reserveP += st.reserveFill;
        if (S.reserveP >= 1) { S.reserveP -= 1; S.reserve++; }
      }
    }
  }

  function boxFull() { return S.pieces >= st.capacity && S.reserve >= st.reserveCap; }

  function updateProduction(dt) {
    if (rt.jam && (rt.jamT -= dt) <= 0) { rt.jam = false; emit('toast', { text: 'A CAIXA DESEMPERROU SOZINHA', kind: 'good', small: true }); }
    if (boxFull()) { S.prodP = 0; return; }
    S.prodP += dt * prodRate();
    while (S.prodP >= 1) { S.prodP -= 1; produceOne(); if (boxFull()) { S.prodP = 0; break; } }
  }

  /* ---------------- automação ---------------- */
  function updateAuto(dt) {
    var active = rt.clock - rt.lastInput < st.autoActiveSec;
    if (!active) return;
    if (st.autoPlace > 0) {
      rt.autoPlaceT += dt;
      if (rt.autoPlaceT >= 60 / st.autoPlace) { rt.autoPlaceT = 0; if (tryPlace(true)) emit('auto', 'place'); }
    }
    if (st.autoRepair > 0) {
      rt.autoRepairT += dt;
      if (rt.autoRepairT >= 60 / st.autoRepair) {
        rt.autoRepairT = 0;
        var dmg = damagedCells(false), target = -1;
        for (var i = 0; i < dmg.length; i++) if (S.cells[dmg[i]] === CRACK) { target = dmg[i]; break; }
        if (target < 0 && st.autoRepairMissing) {
          for (var j = 0; j < dmg.length; j++) if (S.cells[dmg[j]] === MISS) { target = dmg[j]; break; }
        }
        if (target >= 0) {
          var fee = E.repairFee(mat, st, Math.floor(target / ppl()));
          var needPiece = S.cells[target] === MISS;
          if (S.money >= fee && (!needPiece || S.reserve + S.pieces >= 1)) {
            S.money -= fee;
            if (needPiece) { if (S.reserve >= 1) S.reserve--; else S.pieces--; }
            setCell(target, OK); S.stats.repaired++;
            emit('repaired', target);
            emit('auto', 'repair');
          }
        }
      }
    }
    if (st.autoDefend > 0) {
      rt.autoDefendT += dt;
      if (rt.autoDefendT >= 60 / st.autoDefend) {
        rt.autoDefendT = 0;
        var live = rt.threats.filter(function (t) { return t.state === 'attack' || t.state === 'approach' || t.state === 'windup'; });
        if (rt.boss && rt.boss.state !== 'dead') { hitBoss(1); emit('auto', 'defend'); }
        else if (live.length) { hitThreat(live[rint(0, live.length - 1)].id, 1); emit('auto', 'defend'); }
      }
    }
  }

  /* ---------------- ajudantes (bichinhos do topo) ----------------
     'def': correm até as ameaças e dão dano pequeno (o toque do jogador
     continua sendo o principal). 'fix': descem até peças danificadas,
     marcam o lugar e consertam (pagando a taxa normal de reparo). */
  function liveThreat(id) {
    if (id === 'boss') return rt.boss && rt.boss.state !== 'dead' ? rt.boss : null;
    for (var i = 0; i < rt.threats.length; i++) {
      var t = rt.threats[i];
      if (t.id === id) return (t.state === 'approach' || t.state === 'attack' || t.state === 'windup') ? t : null;
    }
    return null;
  }

  function homeOf(h) {
    var g = geo();
    return { x: h.hx * (g.halfW - 3), y: layersBuilt() * LHU + g.D * 0.5 + 1 };
  }

  /* posição aproximada (mundo) de uma peça; a view refina com a geometria exata */
  function cellPos(c) {
    var g = geo(), L = g.L, D = g.D, X0 = -Math.round((L + D) / 2);
    var i = Math.floor(c / ppl()), k = c % ppl(), base = i * LHU;
    if (i % 2 === 0) {
      var oz = Math.round((k === 0 ? L - 4 : 2) * D / L);
      return { x: X0 + oz + L / 2, y: base + oz + 1.5 };
    }
    var xb = k === 0 ? 2 : L - 7;
    return { x: X0 + xb + 1.5 + D / 2, y: base + (1 + D) / 2 };
  }

  function fixTarget(h) {
    var taken = {};
    rt.helpers.forEach(function (o) { if (o !== h && o.kind === 'fix' && o.cell != null) taken[o.cell] = 1; });
    var best = -1, bs = -1e9;
    for (var c = S.cursor - 1; c >= 0; c--) {
      var v = S.cells[c];
      if ((v !== CRACK && v !== MISS && v !== FIRE) || !rt.known[c] || taken[c]) continue;
      if (rt.repairing && rt.repairing.cell === c) continue;
      var sc = (v === FIRE ? 1000 : v === CRACK ? 200 : 100) - Math.abs(cellPos(c).y - h.y) / 30;
      if (sc > bs) { bs = sc; best = c; }
    }
    return best;
  }

  function updateHelpers(dt) {
    var H = rt.helpers;
    var want = { def: Math.round(st.helpers || 0), fix: Math.round(st.fixers || 0) }, have = { def: 0, fix: 0 };
    H.forEach(function (h) { have[h.kind]++; });
    ['def', 'fix'].forEach(function (k) {
      while (have[k] < want[k]) {
        var n = have[k]++;
        var h = { id: rt.helperSeq++, kind: k, state: 'home', t: 0, hx: (k === 'def' ? -0.7 + n * 0.45 : 0.75 - n * 0.4), target: null, cell: null, face: 1 };
        var hp = homeOf(h); h.x = hp.x; h.y = hp.y + 70;
        H.push(h); emit('helperNew', h);
      }
    });
    var spD = 42 * (1 + st.helperSpeed), spF = 40 * (1 + st.fixerSpeed);
    var atkInt = 1.5 / (1 + st.helperAtk), dmg = st.threatPower * st.helperDmg;
    var targeted = {};
    H.forEach(function (h) { if (h.target) targeted[h.target] = (targeted[h.target] || 0) + 1; });
    H.forEach(function (h) {
      h.t += dt;
      var px = h.x, home = homeOf(h);
      if (h.kind === 'def') {
        var t = h.target ? liveThreat(h.target) : null;
        if (h.target && !t) { h.target = null; h.state = 'back'; }
        if (h.state === 'home' || h.state === 'back') {
          var best = null, bc = 99;
          if (rt.boss && rt.boss.state !== 'dead') { best = rt.boss; bc = -1; }   // chefão tem prioridade
          rt.threats.forEach(function (o) {
            if (bc < 0) return;
            if (o.def.kind === 'faller' || !liveThreat(o.id)) return;
            var c = targeted[o.id] || 0;
            if (c < bc) { bc = c; best = o; }
          });
          if (best) { h.target = best.id; targeted[best.id] = (targeted[best.id] || 0) + 1; h.state = 'go'; emit('helperGo', h); t = best; }
        }
        if (h.state === 'go' && t) {
          h.tx = t.x - t.side * 3; h.ty = t.y;
          if (moveTo(h, dt, spD)) { h.state = 'fight'; h.t = 0; }
        } else if (h.state === 'fight' && t) {
          h.x = t.x - t.side * 3; h.y = t.y;
          if (h.t >= atkInt) { h.t = 0; emit('helperHit', { h: h, t: t }); if (t === rt.boss) hitBoss(dmg); else hitThreat(t.id, dmg); }
        } else if (h.state === 'back') {
          h.tx = home.x; h.ty = home.y;
          if (moveTo(h, dt, spD)) h.state = 'home';
        } else if (h.state === 'home') {
          h.x = home.x + Math.sin(rt.clock * 0.7 + h.id) * 2; h.y = home.y;
        }
      } else {
        var v = h.cell != null ? S.cells[h.cell] : -1;
        var bad = v === CRACK || v === MISS || v === FIRE;
        if (h.cell != null && (!bad || (rt.repairing && rt.repairing.cell === h.cell))) { h.cell = null; h.state = 'back'; }
        if ((h.state === 'home' || h.state === 'back') && h.t > 0.4) {
          h.t = 0;
          var c2 = fixTarget(h);
          if (c2 >= 0) { h.cell = c2; h.state = 'go'; emit('fixerGo', { h: h, cell: c2 }); }
        }
        if (h.state === 'go') {
          var cp = cellPos(h.cell);
          h.tx = cp.x; h.ty = cp.y;
          if (moveTo(h, dt, spF)) { h.state = 'fix'; h.t = 0; h.wait = false; emit('fixerAt', { h: h, cell: h.cell }); }
        } else if (h.state === 'fix') {
          var cv = S.cells[h.cell], dur = (cv === FIRE ? 1.5 : cv === CRACK ? 3 : 4.5) / (1 + st.fixRate);
          if (h.t >= dur) {
            if (cv === FIRE) {
              setCell(h.cell, CRACK); rt.known[h.cell] = 1;
              S.stats.extinguished = (S.stats.extinguished || 0) + 1;
              emit('extinguish', h.cell); h.t = 0;
            } else {
              var fee = E.repairFee(mat, st, Math.floor(h.cell / ppl()));
              var need = cv === MISS, buyP = need && S.reserve + S.pieces < 1;
              var tot = fee + (buyP ? emergencyPiece(Math.floor(h.cell / ppl())) : 0);
              if (S.money >= tot) {
                S.money -= tot;
                if (need && !buyP) { if (S.reserve >= 1) S.reserve--; else S.pieces--; }
                var done = h.cell;
                setCell(done, OK); S.stats.repaired++;
                emit('repaired', done); emit('fixerDone', { h: h, cell: done });
                h.cell = null; h.state = 'back';
              } else if (!h.wait) { h.wait = true; emit('fixerWait', { h: h, cell: h.cell, need: 'money' }); }
            }
          }
        } else if (h.state === 'back') {
          h.tx = home.x; h.ty = home.y;
          if (moveTo(h, dt, spF * 1.3)) h.state = 'home';
        } else if (h.state === 'home') {
          h.x = home.x + Math.sin(rt.clock * 0.6 + h.id) * 1.5; h.y = home.y;
        }
      }
      if (Math.abs(h.x - px) > 0.01) h.face = h.x > px ? 1 : -1;
    });
  }

  /* ---------------- chefões ----------------
     Em alturas fixas (PALIT.BOSSES), um chefão sobe na torre, quebra
     palitos e bloqueia a construção até ser derrotado. */
  function bossList() { return (P.BOSSES && P.BOSSES[mat.id]) || []; }
  function pendingBoss() {
    S.bosses = S.bosses || {};
    var L = layersBuilt(), l = bossList();
    for (var i = 0; i < l.length; i++) if (L >= l[i].layer && !S.bosses[l[i].id]) return l[i];
    return null;
  }
  function perchY(layer) { return layer * LHU + geo().D / 2 + 2; }
  function bossLayer() {
    var top = layersBuilt();
    return Math.max(braced(), top - 1 - rint(0, Math.min(40, Math.max(0, top - 1 - braced()))));
  }
  function startBoss(d) {
    var g = geo(), side = Math.random() < 0.5 ? -1 : 1, layer = bossLayer();
    rt.boss = { id: 'boss', def: d, hp: d.hp, maxHp: d.hp, side: side, state: 'enter', t: 0, layer: layer,
      x: side * (rt.viewW / 2 + 30), y: perchY(layer) + 40, tx: side * (g.halfW + 2), ty: perchY(layer),
      smashT: d.smash + 2, jumpT: d.jump };
    emit('bossSpawn', rt.boss);
  }
  function bossSmash(n) {
    var b = rt.boss, hit = 0;
    for (var i = 0; i < n; i++) if (damage(pickCell(b.layer - 3, b.layer + 3, 1), Math.random() < 0.55 ? 'drop' : 'crack', 'boss')) hit++;
    emit('bossSmash', { b: b, hits: hit });
  }
  function updateBoss(dt) {
    if (!rt.boss) {
      rt.bossCheckT -= dt;
      if (rt.bossCheckT <= 0 && !rt.ch) { rt.bossCheckT = 2; var d = pendingBoss(); if (d) startBoss(d); }
      return;
    }
    var b = rt.boss, d = b.def, g = geo();
    b.t += dt;
    if (b.state === 'enter') {
      if (moveTo(b, dt, 34)) { b.state = 'perch'; bossSmash(d.land); }
    } else if (b.state === 'perch') {
      b.x = b.tx; b.y = b.ty;
      b.smashT -= dt; b.jumpT -= dt;
      if (b.smashT <= 0) { b.smashT = d.smash * (0.8 + Math.random() * 0.4); bossSmash(d.hits); }
      if (b.jumpT <= 0) {
        b.jumpT = d.jump * (0.8 + Math.random() * 0.4);
        b.layer = bossLayer();
        if (Math.random() < 0.5) b.side = -b.side;
        b.fx = b.x; b.fy = b.y; b.tx = b.side * (g.halfW + 2); b.ty = perchY(b.layer);
        b.state = 'jump'; b.t = 0;
        emit('bossJump', b);
      }
    } else if (b.state === 'jump') {
      var k = Math.min(1, b.t / 1.1);
      b.x = b.fx + (b.tx - b.fx) * k;
      b.y = b.fy + (b.ty - b.fy) * k + Math.sin(k * Math.PI) * 28;
      if (k >= 1) { b.state = 'perch'; b.smashT = d.smash; bossSmash(d.land); }
    } else if (b.state === 'dead') {
      b.y -= dt * 30;
      if (b.t > 1.6) rt.boss = null;
    }
  }
  function hitBoss(power) {
    var b = rt.boss;
    if (!b || b.state === 'dead') return false;
    if (power == null) rt.lastInput = rt.clock;
    b.hp -= power != null ? power : st.threatPower;
    emit('bossHit', b);
    if (b.hp <= 0) {
      b.hp = 0; b.state = 'dead'; b.t = 0;
      var m = b.def.reward * (1 + st.threatReward);
      addMoney(m);
      S.bosses[b.def.id] = 1;
      S.stats.defeated++;
      S.stats.bosses = (S.stats.bosses || 0) + 1;
      emit('bossDead', { b: b, money: m });
    }
    return true;
  }

  /* ---------------- desafio final ---------------- */
  function challengeReady() {
    return !!(def && mat.challenge && layersBuilt() >= mat.goalLayers && !S.challengeDone && !rt.ch);
  }

  function startChallenge() {
    if (!challengeReady()) return false;
    var c = mat.challenge;
    if (rt.integrity < c.startIntegrity) { emit('blocked', 'chIntegrity'); return false; }
    rt.ch = { t: c.dur, dur: c.dur, gustT: 3, threatT: 5 };
    rt.rain = { t: c.dur, str: 0.8, tick: 4 };
    emit('challenge', 'start');
    return true;
  }

  function updateChallenge(dt) {
    var ch = rt.ch;
    if (!ch) return;
    var c = mat.challenge;
    ch.t -= dt; ch.gustT -= dt; ch.threatT -= dt;
    if (ch.gustT <= 0) { ch.gustT = c.gustEvery; gust(c.gustStr * rnd(0.85, 1.15)); }
    if (ch.threatT <= 0) { ch.threatT = c.threatEvery; var k = pickThreatType(); if (k) spawnThreat(k, 1); }
    if (ch.t <= 0) {
      rt.ch = null;
      if (rt.integrity >= c.minIntegrity) { S.challengeDone = true; var rec = eraRecord(); if (rec.master == null) rec.master = S.stats.playSec; emit('challenge', 'won'); }
      else emit('challenge', 'lost');
    }
  }

  function masteryReady() {
    // bateu a altura da era, pode subir (árvore e desafio final são opcionais)
    return !!(def && layersBuilt() >= mat.goalLayers && !rt.ch && !rt.boss && !pendingBoss());
  }

  function rebuild() {
    if (!masteryReady()) return false;
    var next = P.MATERIALS[S.matIndex + 1];
    if (!next) return false;
    S.history.push({ mat: mat.id, name: mat.name, layers: layersBuilt(), heightM: localHeight(), base: S.globalBase, at: Date.now() });
    if (S.mastered.indexOf(mat.id) < 0) S.mastered.push(mat.id);
    S.globalBase += localHeight();
    S.matIndex++;
    S.cursor = 0; S.cells = []; S.money = 0; S.reserve = 0; S.prodP = 0; S.reserveP = 0;
    S.challengeDone = false; S.milestones = 0; S.freeRepairCount = 0; S.stormToken = false;
    var keepView = rt.viewW;
    rt = freshRuntime(); rt.viewW = keepView;
    setMaterial();
    eraRecord();
    S.pieces = st.capacity;
    recomputeIntegrity();
    emit('rebuild');
    return true;
  }

  /* ---------------- compra ---------------- */
  function buy(id, max) {
    if (!def) return 0;
    var n = def.byId[id];
    var bought = 0;
    while (true) {
      var lv = levels()[id] || 0;
      if (lv >= n.lv || !P.Tree.reqsMet(def, n, levels())) break;
      var c = P.Tree.cost(def, mat, n, lv);
      if (S.money < c) break;
      S.money -= c;
      levels()[id] = lv + 1;
      bought++;
      if (!max) break;
    }
    if (bought) { recalc(); emit('bought', { id: id, n: bought }); if (progress() >= 1) emit('treeComplete'); }
    return bought;
  }

  /* Sem ganhos offline: com o jogo fechado ou em segundo plano, nada é produzido. */

  /* ---------------- loop ---------------- */
  function update(dt) {
    rt.clock += dt;
    S.stats.playSec += dt;
    updateProduction(dt);
    addMoney(E.passive(mat, st, layersBuilt(), rt.integrity / 100) * dt);
    if (rt.placing) { rt.placing.t += dt; if (rt.placing.t >= rt.placing.dur) finishPlace(); }
    if (rt.repairing) { rt.repairing.t += dt; if (rt.repairing.t >= rt.repairing.dur) finishRepair(); }
    updateWind(dt);
    updateWeather(dt);
    if (!rt.ch) {
      rt.eventT -= dt;
      if (rt.eventT <= 0) { rt.eventT = rnd(25, 50); runEvent(pickEvent()); }
    }
    updateThreats(dt);
    updateFires(dt);
    updateSpread(dt);
    updateAuto(dt);
    updateHelpers(dt);
    updateBoss(dt);
    updateChallenge(dt);
  }

  /* ---------------- API para eventos com escolha ---------------- */
  var fx = {
    money: function (n) { if (n == null) return S.money; addMoney(n); return S.money; },
    pay: function (n) { S.money = Math.max(0, S.money - n); },
    pieces: function () { return Math.floor(S.pieces + S.reserve); },
    takePieces: function (n) { for (var i = 0; i < n; i++) { if (S.pieces >= 1) S.pieces--; else if (S.reserve >= 1) S.reserve--; } },
    price: function (base, perLayer) { return Math.round(base + layersBuilt() * perLayer); },
    boost: function (sec) { rt.boost = Math.max(rt.boost, sec); },
    calm: function (sec) { rt.calm = Math.max(rt.calm, sec); },
    luck: function (sec) { rt.luck = Math.max(rt.luck, sec); },
    jam: function () { rt.jam = true; rt.jamTaps = 0; },
    crack: function (n) { for (var i = 0; i < n; i++) damage(pickCell(0, layersBuilt() - 1, 1), 'crack', 'event'); },
    repairCracked: function () {
      var n = 0;
      for (var c = 0; c < S.cursor; c++) if (S.cells[c] === CRACK) { setCell(c, OK); n++; }
      return n;
    },
    spawn: function (k, n) { spawnThreat(k, n); }
  };

  /* ---------------- debug ---------------- */
  var debug = {
    money: function (n) { addMoney(n); },
    layers: function (n) {
      for (var i = 0; i < n * ppl(); i++) {
        if (layersBuilt() >= limit()) break;
        S.cells[S.cursor] = OK; S.cursor++;
        if (S.cursor % ppl() === 0) layerComplete(Math.floor((S.cursor - 1) / ppl()));
      }
      recomputeIntegrity(); emit('reset');
    },
    maxTree: function () { def.nodes.forEach(function (n) { levels()[n.id] = n.lv; }); recalc(); emit('bought', {}); },
    event: function (id) { runEvent(P.EVENTS.filter(function (e) { return e.id === id; })[0]); },
    threat: function (k, n) { spawnThreat(k, n || 1); },
    gust: function (s) { gust(s || 1); },
    boss: function (i) { var l = bossList(); if (l[i || 0]) { S.bosses[l[i || 0].id] = 0; startBoss(l[i || 0]); } }
  };

  return {
    geo: function () { return geo(); },
    CELL: { EMPTY: EMPTY, OK: OK, CRACK: CRACK, MISS: MISS, FIRE: FIRE, PLACING: PLACING }, LHU: LHU,
    init: init, update: update, on: on, emit: emit,
    tryPlace: tryPlace, repairCell: repairCell, hitThreat: hitThreat, unjam: unjam, buy: buy,
    startChallenge: startChallenge, challengeReady: challengeReady, masteryReady: masteryReady, rebuild: rebuild,
    damagedCells: damagedCells, blockReason: blockReason, prodRate: prodRate, sway: sway, threatsActive: threatsActive,
    layersBuilt: layersBuilt, topLayer: topLayer, limit: limit, localHeight: localHeight, globalHeight: globalHeight, progress: progress,
    get S() { return S; }, get mat() { return mat; }, get def() { return def; }, get st() { return st; }, get rt() { return rt; },
    levels: levels, debug: debug, fx: fx, eraRecord: eraRecord, hitBoss: function () { return hitBoss(); }, bossList: bossList, braced: function () { return braced(); }, cellPos: cellPos
  };
})();
