/* =========================================================
   PAINÉIS — menu com abas, eventos com escolha e
   indicador de missões (celular) / seção de missões (PC).
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Panels = (function () {
  var P = PALIT, G;
  var el = {};
  var tab = 'missoes';
  var misKey = '';

  function $(id) { return document.getElementById(id); }
  function spr(n, c) { return P.SpriteCSS.html(n, c); }
  function S() { return G.S; }
  function fmtTime(s) { var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h + 'h ' + String(m).padStart(2, '0') + 'min'; }

  function init() {
    G = P.Game;
    // indicador de missão (celular)
    el.pill = document.createElement('button');
    el.pill.id = 'mission-pill';
    el.pill.className = 'px';
    $('hud').appendChild(el.pill);
    el.pill.addEventListener('click', function () {
      var got = P.Progress.claimAll();
      if (!got.length) open('missoes');
    });
    G.on('missions', function () { misKey = ''; });
    G.on('choice', function (d) { choice(d.id); });
  }

  /* ---------------- missões: indicador e seção desktop ---------------- */
  function update() {
    var ms = S().missions || [];
    var key = ms.map(function (m) { return m.type + Math.floor(m.prog) + m.done; }).join() + (P.Desktop && P.Desktop.isDesk());
    if (key === misKey) return;
    misKey = key;
    var done = ms.filter(function (m) { return m.done; }).length;
    var first = ms.filter(function (m) { return !m.done; })[0] || ms[0];
    if (!first) { el.pill.hidden = true; return; }
    el.pill.hidden = false;
    el.pill.classList.toggle('ready', done > 0);
    el.pill.innerHTML = done > 0
      ? spr('ico_star') + '<span><b>MISSÃO COMPLETA!</b><em>TOQUE PARA RECEBER</em></span>'
      : spr('ico_flag') + '<span><b>' + first.text + '</b><i class="bar"><i style="width:' + Math.min(100, first.prog / first.target * 100) + '%;--c:var(--yellow)"></i></i></span>';
    var dp = $('dp-mis');
    if (dp) dp.innerHTML = missionRows(true);
  }

  function missionRows(compact) {
    return (S().missions || []).map(function (m, i) {
      var pct = Math.min(100, m.prog / m.target * 100);
      return '<div class="mis' + (m.done ? ' done' : '') + '">' +
        '<div class="mis-t"><b>' + m.text + '</b><span>' + (m.type === 'safe' ? Math.floor(m.prog) + 's' : P.fmtNum(Math.floor(m.prog))) + ' / ' + P.fmtNum(m.target) + '</span>' +
        '<i class="bar"><i style="width:' + pct + '%;--c:' + (m.done ? 'var(--lime)' : 'var(--yellow)') + '"></i></i></div>' +
        (m.done ? '<button class="pxbtn gold" data-claim="' + i + '">$' + P.fmtMoney(m.money) + '</button>' : '<span class="mis-r">$' + P.fmtMoney(m.money) + '</span>') +
        '</div>';
    }).join('');
  }

  /* ---------------- menu com abas ---------------- */
  var TABS = [['missoes', 'MISSÕES'], ['conquistas', 'CONQUISTAS'], ['bestiario', 'BESTIÁRIO'], ['misterio', 'MISTÉRIO'], ['recordes', 'RECORDES'], ['opcoes', 'OPÇÕES']];

  function open(t) {
    tab = t || tab;
    P.HUD.modal('PALIT', '<div class="tabs">' + TABS.map(function (x) {
      return '<button class="tab' + (x[0] === tab ? ' on' : '') + '" data-tab="' + x[0] + '">' + x[1] + '</button>';
    }).join('') + '</div><div id="tabbody"></div>', [['FECHAR', null]]);
    var box = document.querySelector('#modal .box');
    box.classList.add('wide');
    box.querySelector('.tabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]');
      if (!b) return;
      tab = b.dataset.tab;
      box.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('on', x.dataset.tab === tab); });
      P.Audio.sfx.page();
      render();
    });
    render();
  }

  function render() {
    var b = $('tabbody');
    if (!b) return;
    var s = S(), html = '';
    if (tab === 'missoes') {
      html = '<p class="c-l">Sempre há 3 missões ativas. Ao completar, toque para receber — uma nova aparece no lugar.</p>' + missionRows();
      html += '<div class="kv"><span>Missões completas</span><b>' + P.fmtNum(s.stats.missions || 0) + '</b></div>';
    } else if (tab === 'conquistas') {
      var got = Object.keys(s.ach).length;
      html = '<div class="kv"><span>Conquistadas</span><b>' + got + ' / ' + P.ACHIEVEMENTS.length + '</b></div><div class="ach-grid">' +
        P.ACHIEVEMENTS.map(function (a) {
          var ok = !!s.ach[a.id];
          return '<div class="ach' + (ok ? ' ok' : '') + '">' + spr(a.icon) + '<div><b>' + (ok ? a.name : a.name) + '</b><span>' + a.desc + '</span></div></div>';
        }).join('') + '</div>';
    } else if (tab === 'bestiario') {
      var keys = Object.keys(P.THREATS);
      html = '<div class="kv"><span>Descobertas</span><b>' + keys.filter(function (k) { return s.bestiary[k]; }).length + ' / ' + keys.length + '</b></div><div class="best-grid">' +
        keys.map(function (k) {
          var d = P.THREATS[k], b2 = s.bestiary[k];
          return '<div class="best' + (b2 ? '' : ' unk') + '"><div class="best-sp">' + spr(d.sprite) + '</div><div><b>' + (b2 ? d.name.toUpperCase() : '???') + '</b>' +
            '<span>' + (b2 ? (P.BESTIARY[k] || '') : 'Ainda não apareceu.') + '</span>' +
            (b2 ? '<em>Expulsos: ' + P.fmtNum(b2.defeated) + ' · Vida: ' + d.hp + '</em>' : '') + '</div></div>';
        }).join('') + '</div>';
    } else if (tab === 'misterio') {
      html = '<div class="line c-y">O MISTÉRIO DOS 4 METROS</div><p class="c-l">Pistas reunidas: ' + s.clues.length + ' / ' + P.CLUES.length + '</p>' +
        P.CLUES.map(function (c) {
          var ok = s.clues.indexOf(c.id) >= 0;
          return '<div class="clue' + (ok ? '' : ' unk') + '">' + spr(ok ? 'ico_q' : 'ico_book') + '<div><b>' + (ok ? c.title : '???') + '</b><span>' + (ok ? c.text : 'Continue subindo...') + '</span></div></div>';
        }).join('');
    } else if (tab === 'recordes') {
      var st = s.stats, m = G.mat;
      html = '<div class="line c-l">ESTA ERA — ' + m.name.toUpperCase() + '</div>';
      var r = G.eraRecord();
      html += kv('Tempo nesta era', fmtTime(st.playSec - r.start)) + kv('Melhor sequência perfeita', r.bestStreak) + kv('Maior ritmo', 'x' + r.maxCombo) +
        kv('Peças perdidas', P.fmtNum(st.fallen - (r.fallen0 || 0))) + kv('Ameaças expulsas', P.fmtNum(st.defeated - (r.defeated0 || 0)));
      html += '<div class="sep"></div><div class="line c-l">ERAS DOMINADAS</div>';
      var any = false;
      P.MATERIALS.forEach(function (mm) {
        var rr = s.records[mm.id];
        if (!rr || rr.master == null) return;
        any = true;
        html += kv(mm.name, 'dominado em ' + fmtTime(rr.master - rr.start) + ' · seq. ' + rr.bestStreak);
      });
      if (!any) html += '<p class="c-l">Nenhuma ainda.</p>';
      html += '<div class="sep"></div><div class="line c-l">GERAL</div>' +
        kv('Peças colocadas', P.fmtNum(st.placed)) + kv('Encaixes perfeitos', P.fmtNum(st.perfect || 0)) + kv('Melhor sequência', st.bestStreak || 0) +
        kv('Reparos', P.fmtNum(st.repaired)) + kv('Ameaças expulsas', P.fmtNum(st.defeated)) + kv('Eventos', P.fmtNum(st.events)) +
        kv('Dinheiro ganho', '$' + P.fmtMoney(st.earned)) + kv('Tempo de jogo', fmtTime(st.playSec));
      html += '<div class="sep"></div><div class="line c-l">ERAS</div><div class="era-list">' + P.MATERIALS.map(function (mm, i) {
        var cls = i < s.matIndex ? 'done' : i === s.matIndex ? 'cur' : i === s.matIndex + 1 ? 'next' : '';
        return '<div class="' + cls + '">ERA ' + String(mm.era).padStart(2, '0') + ' — ' + (i <= s.matIndex + 1 ? mm.name.toUpperCase() : '???') + (i < s.matIndex ? ' ✓' : '') + '</div>';
      }).join('') + '</div>';
    } else if (tab === 'opcoes') {
      var A = P.Audio;
      html = toggle('mute', 'SOM', !A.muted) + toggle('music', 'MÚSICA', A.musicOn) + toggle('sfx', 'EFEITOS SONOROS', A.sfxOn) + toggle('vibe', 'VIBRAÇÃO (ANDROID)', P.Haptics.on) +
        '<div class="sep"></div><p class="c-l">VERSÃO DO JOGO: <b class="c-y">' + (P.BUILD || '?') + '</b></p><p class="c-l">O progresso fica salvo neste aparelho.</p><button class="pxbtn red" id="op-wipe">APAGAR TODO O PROGRESSO</button>';
    }
    b.innerHTML = html;
    b.querySelectorAll('[data-claim]').forEach(function (btn) {
      btn.addEventListener('click', function () { P.Progress.claim(+btn.dataset.claim); render(); });
    });
    b.querySelectorAll('[data-opt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var k = btn.dataset.opt, A = P.Audio;
        if (k === 'mute') { A.unlock(); A.setMuted(!A.muted); }
        if (k === 'music') A.setMusic(!A.musicOn);
        if (k === 'sfx') A.setSfx(!A.sfxOn);
        if (k === 'vibe') { P.Haptics.set(!P.Haptics.on); P.Haptics.buzz(30); }
        render();
      });
    });
    var w = $('op-wipe');
    if (w) w.addEventListener('click', function () {
      P.HUD.modal('APAGAR PROGRESSO?', '<p>Isso apaga TODO o progresso, de todas as eras. Não pode ser desfeito.</p>',
        [['CANCELAR', function () { open('opcoes'); }], ['APAGAR TUDO', function () { P.wipe(); }, 'red']]);
    });
  }

  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function toggle(k, label, on) { return '<div class="kv opt"><span>' + label + '</span><button class="pxbtn' + (on ? ' green' : '') + '" data-opt="' + k + '">' + (on ? 'LIGADO' : 'DESLIGADO') + '</button></div>'; }

  /* ---------------- eventos com escolha ---------------- */
  function choice(id) {
    var c = P.CHOICES[id];
    if (!c) return;
    var api = G.fx;
    var ch = P.CHARACTERS[c.who];
    P.Pause.set('choice', true);
    P.Audio.sfx.page();
    var body = '<div class="choice-head">' + spr(ch.sprite, 'big') + '<div><b style="color:' + ch.color + '">' + ch.name + '</b><p>' + c.text(api) + '</p></div></div>';
    var buttons = c.options.map(function (o, i) {
      var blockMsg = o.need ? o.need(api) : null;
      return [o.label(api) + (blockMsg ? ' (' + blockMsg + ')' : ''), function () {
        if (blockMsg) return;
        var res = o.run(api);
        G.emit('choiceMade', { id: id, opt: i });
        P.Audio.sfx.good();
        P.HUD.modal(c.title, '<div class="choice-head">' + spr(ch.sprite, 'big') + '<div><b style="color:' + ch.color + '">' + ch.name + '</b><p>' + res + '</p></div></div>',
          [['OK', function () { P.Pause.set('choice', false); }, 'gold']]);
      }, i === 0 ? 'gold' : '', true];
    });
    P.HUD.modal(c.title, body, buttons);
    document.querySelectorAll('#modal .btns .pxbtn').forEach(function (btn, i) {
      if (c.options[i] && c.options[i].need && c.options[i].need(api)) btn.disabled = true;
    });
  }

  return { init: init, update: update, open: open, missionRows: missionRows };
})();
