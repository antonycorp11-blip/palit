/* =========================================================
   HISTÓRIA (UI) — cenas com diálogo (pausam o jogo),
   comentários soltos (balões que não pausam) e pistas.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Story = (function () {
  var P = PALIT, G;
  var el = {};
  var queue = [];
  var cur = null;          // { beat, i, shown, full, typing }
  var typeT = 0;
  var chatT = 120, lastChat = [];
  var idleFns = [];

  function $(id) { return document.getElementById(id); }
  function S() { return G.S; }
  function seen(id) { return !!S().story[id]; }

  function init() {
    G = P.Game;
    el.box = document.createElement('div');
    el.box.id = 'dialog';
    el.box.className = 'px';
    el.box.hidden = true;
    el.box.innerHTML = '<div class="dg-por"><i class="sp"></i></div><div class="dg-main"><b class="dg-name"></b><p class="dg-text"></p></div>' +
      '<span class="dg-next">▼</span><button class="pxbtn dg-skip">PULAR</button>';
    document.body.appendChild(el.box);
    el.por = el.box.querySelector('.dg-por .sp');
    el.name = el.box.querySelector('.dg-name');
    el.text = el.box.querySelector('.dg-text');
    el.box.addEventListener('pointerdown', function (e) { e.stopPropagation(); if (e.target.closest('.dg-skip')) return; advance(); });
    el.box.querySelector('.dg-skip').addEventListener('click', function (e) { e.stopPropagation(); finish(); });

    el.bub = document.createElement('div');
    el.bub.id = 'bubble';
    el.bub.className = 'px';
    el.bub.hidden = true;
    el.bub.innerHTML = '<i class="sp"></i><div><b></b><p></p></div>';
    el.bub.addEventListener('pointerdown', function (e) { e.stopPropagation(); el.bub.hidden = true; });
    $('hud').appendChild(el.bub);

    // quem já passou de uma cena (save antigo) recebe as pistas sem ver a cena
    var L = G.layersBuilt();
    P.STORY.forEach(function (b) {
      var past = P.materialById(b.era) && P.materialById(b.era).era < G.mat.era;
      if (seen(b.id)) return;
      // a cena do topo da era nunca é pulada: ela aparece ao abrir o jogo
      if (!past && b.when.layer != null && b.when.layer >= G.mat.goalLayers) return;
      if (past || (b.era === G.mat.id && b.when.layer != null && b.when.layer <= L && L > 0)) markSeen(b, true);
    });

    G.on('layerDone', function (d) { trigger(function (w) { return w.layer === d.layer + 1; }); checkLimit(); });
    G.on('threatSpawn', function (t) {
      if (t.type === 'hail') return;
      trigger(function (w) { return w.on === 'threat' || (w.on === t.type); });
    });
    G.on('damage', function (d) { trigger(function (w) { return w.on === 'damage' || (d.kind === 'fire' && w.on === 'fire'); }); });
    G.on('blocked', function (r) { if (r === 'limit') trigger(function (w) { return w.on === 'limit'; }); });
    G.on('treeComplete', function () { trigger(function (w) { return w.on === 'tree100'; }); });
    G.on('challenge', function (s) { trigger(function (w) { return w.on === (s === 'start' ? 'challenge' : s === 'won' ? 'won' : '_'); }); });
    G.on('rebuild', function () { setTimeout(start, 1600); });
  }

  /* chamado quando o jogo começa de fato (após a tela inicial) */
  function start() {
    var L = G.layersBuilt();
    trigger(function (w) { return w.start || (w.layer != null && w.layer >= G.mat.goalLayers && L >= w.layer); });
  }

  function checkLimit() {
    var L = G.layersBuilt();
    if (L >= G.limit() && L < G.mat.goalLayers) trigger(function (w) { return w.on === 'limit'; });
  }

  function trigger(pred) {
    P.STORY.forEach(function (b) {
      if (b.era !== G.mat.id || seen(b.id) || queue.indexOf(b) >= 0 || (cur && cur.beat === b)) return;
      if (pred(b.when)) queue.push(b);
    });
  }

  function blocked() {
    return !!document.getElementById('splash') || !$('modal').hidden || (P.TreeView && P.TreeView.isOpen());
  }

  function show(b) {
    cur = { beat: b, i: -1 };
    P.Pause.set('story', true);
    el.box.hidden = false;
    el.box.classList.remove('in'); void el.box.offsetWidth; el.box.classList.add('in');
    P.Audio.sfx.page();
    next();
  }

  function next() {
    cur.i++;
    var line = cur.beat.lines[cur.i];
    if (!line) { finish(); return; }
    var ch = P.CHARACTERS[line[0]];
    el.por.className = 'sp sp-' + ch.sprite;
    el.name.textContent = ch.name;
    el.name.style.color = ch.color;
    el.box.style.setProperty('--cc', ch.color);
    cur.full = line[1];
    cur.shown = 0;
    cur.typing = true;
    cur.pitch = ch.pitch;
    el.text.textContent = '';
    el.box.classList.toggle('mystery', line[0] === 'voz');
  }

  function advance() {
    if (!cur) return;
    if (cur.typing) { cur.shown = cur.full.length; el.text.textContent = cur.full; cur.typing = false; return; }
    P.Audio.sfx.page();
    next();
  }

  function markSeen(b, silent) {
    S().story[b.id] = 1;
    if (b.clue && S().clues.indexOf(b.clue) < 0) {
      S().clues.push(b.clue);
      if (!silent) {
        var c = P.CLUES.filter(function (x) { return x.id === b.clue; })[0];
        G.emit('clue', c);
      }
    }
  }

  function finish() {
    if (!cur) return;
    markSeen(cur.beat);
    cur = null;
    el.box.hidden = true;
    P.Pause.set('story', false);
    P.save();
    if (!queue.length) { var f = idleFns.splice(0); f.forEach(function (fn) { fn(); }); }
  }

  /* executa fn assim que nenhuma cena estiver na tela */
  function whenIdle(fn) {
    if (!cur && !queue.length) fn(); else idleFns.push(fn);
  }

  /* ---------------- comentários soltos ---------------- */
  function chatter() {
    var pool = P.CHATTER.filter(function (c, i) { return lastChat.indexOf(i) < 0; });
    var i = P.CHATTER.indexOf(pool[Math.floor(Math.random() * pool.length)]);
    lastChat.push(i); if (lastChat.length > 8) lastChat.shift();
    var c = P.CHATTER[i], ch = P.CHARACTERS[c[0]];
    el.bub.querySelector('.sp').className = 'sp sp-' + ch.sprite;
    el.bub.querySelector('b').textContent = ch.name;
    el.bub.querySelector('b').style.color = ch.color;
    el.bub.querySelector('p').textContent = c[1];
    el.bub.hidden = false;
    el.bub.classList.remove('in'); void el.bub.offsetWidth; el.bub.classList.add('in');
    for (var k = 0; k < 4; k++) setTimeout(function () { P.Audio.sfx.blip(ch.pitch); }, k * 70);
    clearTimeout(el.bubT);
    el.bubT = setTimeout(function () { el.bub.hidden = true; }, 6500);
  }

  /* balão rápido de um personagem (sem pausar o jogo) */
  function bubble(who, text) {
    var ch = P.CHARACTERS[who];
    if (!ch) return;
    el.bub.querySelector('.sp').className = 'sp sp-' + ch.sprite;
    el.bub.querySelector('b').textContent = ch.name;
    el.bub.querySelector('b').style.color = ch.color;
    el.bub.querySelector('p').textContent = text;
    el.bub.hidden = false;
    el.bub.classList.remove('in'); void el.bub.offsetWidth; el.bub.classList.add('in');
    for (var k = 0; k < 4; k++) setTimeout(function () { P.Audio.sfx.blip(ch.pitch); }, k * 70);
    clearTimeout(el.bubT);
    el.bubT = setTimeout(function () { el.bub.hidden = true; }, 7000);
  }

  function tick(dt) {
    // digitação
    if (cur && cur.typing) {
      typeT += dt;
      while (typeT > 0.028 && cur.typing) {
        typeT -= 0.028;
        cur.shown++;
        el.text.textContent = cur.full.slice(0, cur.shown);
        if (cur.shown % 2 === 0 && /\S/.test(cur.full[cur.shown - 1] || '')) P.Audio.sfx.blip(cur.pitch);
        if (cur.shown >= cur.full.length) cur.typing = false;
      }
    }
    if (!cur && queue.length && !blocked()) show(queue.shift());
    // noite / dinheiro
    if (P.Ambient && P.Ambient.night > 0.5 && G.layersBuilt() > 20) trigger(function (w) { return w.on === 'night'; });
    if (G.def && !(G.levels().root) && G.S.money >= 3 && G.S.stats.placed > 4) trigger(function (w) { return w.on === 'money'; });
    // comentários
    if (!cur && !blocked() && G.S.stats.placed > 30) {
      chatT -= dt;
      if (chatT <= 0) { chatT = 140 + Math.random() * 120; chatter(); }
    }
  }

  return { init: init, start: start, tick: tick, whenIdle: whenIdle, advance: advance, bubble: bubble, active: function () { return !!cur; } };
})();

/* pausa compartilhada (história, escolhas) */
PALIT.Pause = (function () {
  var keys = {};
  return {
    set: function (k, on) { if (on) keys[k] = 1; else delete keys[k]; },
    active: function () { return Object.keys(keys).length > 0; }
  };
})();

/* vibração (Android; iPhone ignora) */
PALIT.Haptics = (function () {
  var on = true;
  try { on = localStorage.getItem('palit.vibe') !== '0'; } catch (e) { /* sem storage */ }
  return {
    buzz: function (p) { if (on && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) { /* ignore */ } } },
    set: function (v) { on = v; try { localStorage.setItem('palit.vibe', v ? '1' : '0'); } catch (e) { /* sem storage */ } },
    get on() { return on; }
  };
})();
