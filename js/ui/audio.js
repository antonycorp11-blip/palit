/* =========================================================
   ÁUDIO — sons 8-bit sintetizados (Web Audio), sem arquivos.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Audio = (function () {
  var ctx = null, master = null, noiseBuf = null, sfxBus = null, musicBus = null;
  var muted = false, sfxOn = true, musicOn = true;
  var last = {};
  function pref(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v === '1'; } catch (e) { return d; } }
  function setPref(k, v) { try { localStorage.setItem(k, v ? '1' : '0'); } catch (e) { /* sem storage */ } }
  muted = pref('palit.mute', false); sfxOn = pref('palit.sfx', true); musicOn = pref('palit.music', true);

  // escala pentatônica (Dó maior) para a "melodia" das camadas
  var PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function unlock() {
    if (ctx) { if (ctx.state !== 'running') ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.55;
    var comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxOn ? 1 : 0; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.55 : 0; musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // iOS: tocar um buffer mudo dentro do gesto destrava o áudio de vez
    var b = ctx.createBufferSource();
    b.buffer = ctx.createBuffer(1, 1, 22050);
    b.connect(ctx.destination); b.start(0);
    if (ctx.state !== 'running') ctx.resume();
  }

  function ok(key, gap) {
    if (!ctx || muted || !sfxOn) return false;
    var t = ctx.currentTime;
    if (key && last[key] && t - last[key] < (gap || 0.03)) return false;
    if (key) last[key] = t;
    return true;
  }

  function tone(f, dur, o) {
    o = o || {};
    var t = ctx.currentTime + (o.at || 0);
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + dur);
    var v = o.vol == null ? 0.15 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.att || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.dest || sfxBus);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function noise(dur, o) {
    o = o || {};
    var t = ctx.currentTime + (o.at || 0);
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.playbackRate.value = o.rate || 1;
    var f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 2000, t);
    if (o.freqTo) f.frequency.exponentialRampToValueAtTime(o.freqTo, t + dur);
    f.Q.value = o.q || 1;
    var g = ctx.createGain();
    var v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.att || 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.dest || sfxBus);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  }

  function arp(notes, step, o) {
    notes.forEach(function (n, i) { tone(midi(n), (o && o.len) || step * 1.6, Object.assign({}, o, { at: i * step })); });
  }

  var S = {
    /* encaixe do palito: "toc" de madeira, mais agudo com o ritmo */
    place: function (combo) {
      if (!ok('place', 0.02)) return;
      var p = 1 + (combo || 0) * 0.05 + (Math.random() * 0.06 - 0.03);
      noise(0.05, { freq: 2600 * p, q: 4, vol: 0.55 });
      tone(210 * p, 0.07, { type: 'sine', to: 90, vol: 0.5 });
      tone(1250 * p, 0.03, { type: 'triangle', vol: 0.08, at: 0.004 });
    },
    lift: function () { if (ok('lift', 0.05)) noise(0.06, { freq: 900, freqTo: 2400, q: 2, vol: 0.07 }); },
    /* camada completa: duas notas subindo a escala (10 camadas = uma escala) */
    layer: function (n) {
      if (!ok('layer', 0.05)) return;
      var base = 72 + PENTA[n % 10];
      tone(midi(base), 0.09, { vol: 0.09 });
      tone(midi(base + 7), 0.16, { vol: 0.08, at: 0.06 });
      tone(midi(base - 12), 0.14, { type: 'triangle', vol: 0.12 });
      if (n % 10 === 9) arp([base + 12, base + 16, base + 19], 0.05, { vol: 0.06 });
    },
    milestone: function () {
      if (!ok('ms', 0.3)) return;
      arp([72, 76, 79, 84, 88, 91, 96], 0.07, { vol: 0.1 });
      tone(midi(48), 0.6, { type: 'triangle', vol: 0.2 });
      noise(0.5, { freq: 6000, filter: 'highpass', vol: 0.05, at: 0.35 });
    },
    coin: function () {
      if (!ok('coin', 0.04)) return;
      tone(988, 0.05, { vol: 0.07 });
      tone(1319, 0.12, { vol: 0.07, at: 0.05 });
    },
    produce: function () { if (ok('prod', 0.08)) tone(1760, 0.03, { type: 'triangle', vol: 0.035 }); },
    hit: function () {
      if (!ok('hit', 0.02)) return;
      noise(0.05, { freq: 1200, q: 1, vol: 0.4 });
      tone(420, 0.07, { to: 160, vol: 0.12 });
    },
    kill: function () {
      if (!ok('kill', 0.05)) return;
      tone(500, 0.1, { to: 1400, vol: 0.12 });
      noise(0.12, { freq: 3000, q: 0.7, vol: 0.2 });
      tone(1568, 0.12, { vol: 0.06, at: 0.08 });
      tone(2093, 0.18, { vol: 0.06, at: 0.13 });
    },
    crack: function () {
      if (!ok('crack', 0.06)) return;
      noise(0.09, { freq: 3800, filter: 'highpass', vol: 0.35 });
      tone(900, 0.06, { type: 'sawtooth', to: 260, vol: 0.06 });
    },
    fall: function () {
      if (!ok('fall', 0.08)) return;
      tone(900, 0.45, { to: 110, vol: 0.06 });
      noise(0.08, { freq: 400, q: 2, vol: 0.35, at: 0.42 });
    },
    fire: function () { if (ok('fire', 0.4)) { noise(0.5, { freq: 700, filter: 'lowpass', vol: 0.2, rate: 0.6 }); noise(0.3, { freq: 3000, q: 3, vol: 0.06, at: 0.1 }); } },
    repairStart: function () {
      if (!ok('rs', 0.1)) return;
      for (var i = 0; i < 4; i++) noise(0.025, { freq: 3200, q: 6, vol: 0.25, at: i * 0.07 });
    },
    repaired: function () {
      if (!ok('rd', 0.06)) return;
      tone(1047, 0.08, { type: 'triangle', vol: 0.12 });
      tone(1568, 0.22, { type: 'triangle', vol: 0.12, at: 0.06 });
    },
    gust: function (str) {
      if (!ok('gust', 0.5)) return;
      noise(1.8, { freq: 300, freqTo: 1400, q: 0.8, vol: 0.12 + 0.08 * (str || 1), att: 0.6 });
    },
    warn: function () { if (ok('warn', 0.4)) { tone(880, 0.07, { vol: 0.06 }); tone(880, 0.07, { vol: 0.06, at: 0.12 }); } },
    blocked: function () { if (ok('blk', 0.2)) { tone(110, 0.14, { vol: 0.12 }); tone(104, 0.14, { vol: 0.08, type: 'sawtooth' }); } },
    good: function () { if (ok('good', 0.2)) arp([79, 84, 88], 0.06, { vol: 0.07, type: 'triangle' }); },
    bad: function () { if (ok('bad', 0.2)) { tone(330, 0.1, { vol: 0.08 }); tone(247, 0.18, { vol: 0.08, at: 0.09 }); } },
    clank: function () { if (ok('clank', 0.05)) { noise(0.06, { freq: 1800, q: 8, vol: 0.4 }); tone(320, 0.08, { type: 'square', vol: 0.06 }); } },
    click: function () { if (ok('click', 0.03)) tone(1400, 0.025, { vol: 0.05 }); },
    buy: function (lv, max) {
      if (!ok('buy', 0.05)) return;
      var b = 67 + Math.min(12, lv);
      arp([b, b + 4, b + 7], 0.045, { vol: 0.09 });
      noise(0.15, { freq: 5000, filter: 'highpass', vol: 0.05, at: 0.1 });
      if (max) arp([b + 12, b + 16, b + 19, b + 24], 0.05, { vol: 0.08, at: 0.15 });
    },
    maxed: function () {
      if (!ok('maxed', 0.2)) return;
      arp([72, 79, 84, 88, 91, 96], 0.05, { vol: 0.08 });
      tone(midi(60), 0.5, { type: 'triangle', vol: 0.15, at: 0.1 });
    },
    special: function () {
      if (!ok('special', 0.3)) return;
      arp([60, 64, 67, 72, 76, 79, 84, 88, 91, 96], 0.06, { vol: 0.09 });
      tone(midi(36), 1.2, { type: 'triangle', vol: 0.25 });
      noise(1, { freq: 8000, filter: 'highpass', vol: 0.06, at: 0.5 });
    },
    helper: function () { if (ok('helper', 0.12)) { tone(1200, 0.03, { type: 'square', vol: 0.035 }); tone(900, 0.04, { type: 'square', vol: 0.03, at: 0.04 }); } },
    fixed: function () { if (ok('fixed', 0.2)) { noise(0.04, { freq: 2200, q: 6, vol: 0.2 }); arp([84, 88, 91], 0.05, { vol: 0.06, type: 'triangle', at: 0.05 }); } },
    unlock: function () { if (ok('unlock', 0.1)) tone(2093, 0.1, { type: 'triangle', vol: 0.05, at: 0.2 }); },
    whoosh: function (up) { if (ok('whoosh', 0.1)) noise(0.25, { freq: up ? 500 : 2500, freqTo: up ? 2500 : 500, q: 1.2, vol: 0.12 }); },
    alarm: function () { if (ok('alarm', 1)) for (var i = 0; i < 3; i++) tone(500, 0.25, { to: 900, vol: 0.08, at: i * 0.3 }); },
    win: function () { if (ok('win', 1)) { arp([60, 64, 67, 72, 67, 72, 76, 79, 84], 0.11, { vol: 0.1 }); tone(midi(48), 1.4, { type: 'triangle', vol: 0.2 }); } },
    lose: function () { if (ok('lose', 1)) arp([67, 63, 60, 55], 0.18, { vol: 0.09, len: 0.3 }); },
    /* encaixe perfeito: sino que sobe com a sequência */
    perfect: function (streak) {
      if (!ok('perfect', 0.03)) return;
      var n = 79 + PENTA[Math.min(10, streak % 11)];
      tone(midi(n), 0.12, { type: 'triangle', vol: 0.13 });
      tone(midi(n + 12), 0.18, { type: 'square', vol: 0.04, at: 0.03 });
      if (streak > 0 && streak % 10 === 0) arp([n, n + 4, n + 7, n + 12], 0.05, { vol: 0.07, at: 0.1 });
    },
    streakLost: function () { if (ok('sl', 0.3)) tone(392, 0.15, { to: 260, vol: 0.05, type: 'triangle' }); },
    achievement: function () { if (ok('ach', 0.5)) { arp([72, 79, 84, 88], 0.07, { vol: 0.1 }); arp([91, 96], 0.09, { vol: 0.07, at: 0.3, type: 'triangle' }); } },
    mission: function () { if (ok('mis', 0.3)) arp([76, 79, 84], 0.06, { vol: 0.09, type: 'triangle' }); },
    page: function () { if (ok('page', 0.05)) noise(0.06, { freq: 3500, q: 2, vol: 0.12 }); },
    /* "voz" dos personagens: bipe curto com timbre por personagem */
    blip: function (pitch) {
      if (!ok('blip', 0.045)) return;
      tone(320 * (pitch || 1) * (0.92 + Math.random() * 0.16), 0.04, { type: 'square', vol: 0.045 });
    }
  };

  /* =========================================================
     MÚSICA — chiptune gerada na hora.
     Dia: Dó maior animado. Noite: lá menor tranquilo.
     Desafio: tenso e rápido. Melodia muda a cada 4 compassos.
     ========================================================= */
  var CH = {
    C: [48, 60, 64, 67], Am: [45, 57, 60, 64], F: [41, 53, 57, 60], G: [43, 55, 59, 62],
    Dm: [38, 50, 53, 57], E: [40, 52, 56, 59], Em: [40, 52, 55, 59]
  };
  var MOODS = {
    day:   { bpm: 96,  prog: ['C', 'Am', 'F', 'G'], scale: [60, 62, 64, 67, 69, 72, 74, 76], lead: 'square',   arp: true,  lv: 0.05 },
    night: { bpm: 72,  prog: ['Am', 'F', 'C', 'Em'], scale: [57, 60, 62, 64, 67, 69, 72], lead: 'triangle', arp: false, lv: 0.07 },
    tense: { bpm: 132, prog: ['Am', 'Dm', 'E', 'Am'], scale: [57, 59, 60, 62, 64, 65, 68, 69], lead: 'square', arp: true, lv: 0.05 }
  };
  var mood = 'day', step = 0, nextT = 0, phrase = [], timer = null;

  function makePhrase(m) {
    var out = [];
    for (var i = 0; i < 32; i++) {
      var r = Math.random();
      out.push(r < 0.42 ? null : m.scale[Math.floor(Math.random() * m.scale.length)] + (r > 0.93 ? 12 : 0));
    }
    return out;
  }

  function schedule() {
    if (!ctx || !musicOn || muted || ctx.state !== 'running') return;
    var m = MOODS[mood];
    var eighth = 60 / m.bpm / 2;
    if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05;
    while (nextT < ctx.currentTime + 0.25) {
      var bar = Math.floor(step / 8) % 4, beat = step % 8;
      if (step % 64 === 0 || !phrase.length) phrase = makePhrase(m);
      var ch = CH[m.prog[bar]];
      var at = nextT - ctx.currentTime;
      if (beat === 0 || beat === 4) tone(midi(ch[0]), eighth * 3.6, { type: 'triangle', vol: 0.16, at: at, dest: musicBus });
      if (beat === 6 && mood !== 'night') tone(midi(ch[0] + 12), eighth * 0.9, { type: 'triangle', vol: 0.08, at: at, dest: musicBus });
      if (m.arp) tone(midi(ch[1 + (beat % 3)] + 12), eighth * 0.8, { type: 'square', vol: 0.018, at: at, dest: musicBus });
      var note = phrase[step % 32];
      if (note && (beat % 2 === 0 || mood === 'tense')) tone(midi(note), eighth * 1.7, { type: m.lead, vol: m.lv, at: at, dest: musicBus });
      if (mood !== 'night' && beat % 2 === 1) noise(0.03, { freq: 8000, filter: 'highpass', vol: 0.025, at: at, dest: musicBus });
      if (mood === 'tense' && beat % 4 === 2) noise(0.08, { freq: 900, q: 1, vol: 0.06, at: at, dest: musicBus });
      nextT += eighth;
      step++;
    }
  }

  function setMood(md) {
    if (md === mood || !MOODS[md]) return;
    mood = md; phrase = []; step = 0;
  }

  function startMusic() { if (!timer) timer = setInterval(schedule, 60); }
  function setMusic(on) { musicOn = on; setPref('palit.music', on); if (musicBus) musicBus.gain.value = on ? 0.55 : 0; }
  function setSfx(on) { sfxOn = on; setPref('palit.sfx', on); if (sfxBus) sfxBus.gain.value = on ? 1 : 0; }

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem('palit.mute', m ? '1' : '0'); } catch (e) { /* sem storage */ }
    if (master) master.gain.value = m ? 0 : 0.55;
  }
  startMusic();

  ['pointerdown', 'pointerup', 'keydown', 'touchstart', 'touchend', 'click'].forEach(function (ev) { window.addEventListener(ev, unlock, { passive: true }); });
  // iOS suspende/interrompe o áudio ao sair do app; retoma ao voltar
  document.addEventListener('visibilitychange', function () { if (!document.hidden && ctx && ctx.state !== 'running') ctx.resume(); });

  return {
    sfx: S, unlock: unlock, setMuted: setMuted, setMusic: setMusic, setSfx: setSfx, setMood: setMood,
    get muted() { return muted; }, get musicOn() { return musicOn; }, get sfxOn() { return sfxOn; }
  };
})();
