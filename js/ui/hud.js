/* =========================================================
   HUD — informações essenciais, alertas, régua, modais.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.HUD = (function () {
  var P = PALIT, G, V;
  var el = {};
  var toastKeys = {};
  var windT = 0, windDir = 1, windNow = 0;
  var lastRuler = '';

  function $(id) { return document.getElementById(id); }
  function spr(n, c) { return P.SpriteCSS.html(n, c); }

  function init() {
    G = P.Game; V = P.View;
    ['topbar', 'alerts', 'ruler', 'bottombar', 'side-btns', 'status', 'modal', 'wind-ind', 'ch-ind'].forEach(function (k) { el[k] = $(k); });
    buildTop();
    buildBottom();
    bindGame();
    el.ruler.addEventListener('pointerdown', rulerJump);
    el.ruler.addEventListener('pointermove', function (e) { if (e.buttons) rulerJump(e); });
  }

  /* ---------------- topo ---------------- */
  function buildTop() {
    el.topbar.className = 'px';
    el.topbar.innerHTML =
      '<div class="tb-row">' + spr('ico_match') +
        '<div class="grow"><div class="mat-name" id="h-mat"></div><div class="era-tag" id="h-era" style="margin-top:4px"></div></div>' +
        spr('ico_coin') + '<span class="money" id="h-money">0</span>' +
        '<button class="pxbtn tb-menu" id="b-menu" aria-label="Menu">' + spr('ico_menu') + '</button></div>' +
      '<div class="tb-row">' +
        '<button class="box-btn" id="h-box">' + spr('ico_box') + '<span class="pieces" id="h-pieces"></span></button>' +
        '<span class="reserve" id="h-res"></span>' +
        '<div class="timer"><div class="bar"><i id="h-timer" style="--c:var(--orange)"></i></div><span id="h-timer-t"></span></div>' +
        '<div class="alts"><div class="alt"><span>ALT. GLOBAL</span><b id="h-glob"></b></div><div class="alt"><span>TORRE</span><b id="h-loc" class="c-g"></b></div></div>' +
      '</div>' +
      '<div class="integ" id="h-integ"><span>ESTRUTURA</span><div class="bar"><i id="h-int"></i></div><b id="h-int-t"></b></div>' +
      '<div class="chips" id="h-chips"></div><span class="build-tag">' + (P.BUILD || '') + '</span>';
    $('h-box').addEventListener('click', function () { G.unjam(); });
  }

  function buildBottom() {
    el.bottombar.innerHTML = '<div id="status"></div>';
    // árvore: aba na lateral da tela (meio da altura), também abre arrastando da borda
    var tab = document.createElement('button');
    tab.id = 'b-tree'; tab.className = 'px'; tab.setAttribute('aria-label', 'Árvore');
    tab.innerHTML = spr('ico_tree') + '<span class="tt">ÁRVORE</span><span class="pct" id="b-tree-p"></span><i class="chev">▶</i>';
    $('hud').appendChild(tab);
    tab.addEventListener('click', function () { P.TreeView.open(); });
    bindEdgeSwipe();
    el['side-btns'].innerHTML =
      '<button class="pxbtn gold big-up" id="b-master" hidden>' + spr('ico_up') + 'SUBIR DE ERA</button>' +
      '<button class="pxbtn" id="b-ch" hidden>' + spr('ico_flag') + 'DESAFIO FINAL (BÔNUS)</button>' +
      '<button class="pxbtn red" id="b-dmg" hidden>' + spr('ico_down') + 'DANO</button>' +
      '<button class="pxbtn" id="b-top" hidden>' + spr('ico_up') + 'TOPO</button>';
    $('b-menu').addEventListener('click', function () { P.Panels.open(); });
    $('b-top').addEventListener('click', function () { V.goTop(); });
    $('b-dmg').addEventListener('click', jumpDamage);
    $('b-ch').addEventListener('click', confirmChallenge);
    $('b-master').addEventListener('click', masteryModal);
  }

  /* arrastar da borda esquerda para a direita abre a árvore (como o "voltar" do iPhone) */
  function bindEdgeSwipe() {
    var st = null;
    document.getElementById('game').addEventListener('pointerdown', function (e) {
      st = e.clientX < 28 && !P.Pause.active() ? { x: e.clientX, y: e.clientY } : null;
    }, true);
    document.getElementById('game').addEventListener('pointermove', function (e) {
      if (st && e.clientX - st.x > 70 && Math.abs(e.clientY - st.y) < 60) { st = null; P.TreeView.open(); }
    }, true);
    document.getElementById('game').addEventListener('pointerup', function () { st = null; }, true);
  }

  var dmgIdx = 0;
  function jumpDamage() {
    var list = G.damagedCells(true);
    if (!list.length) return;
    list.sort(function (a, b) { return b - a; });
    dmgIdx = dmgIdx % list.length;
    var c = list[dmgIdx++];
    V.goLayer(Math.floor(c / G.mat.piecesPerLayer));
  }

  /* ---------------- atualização (10 Hz) ---------------- */
  /* escrevem no DOM só quando o valor muda (evita relayout/repintura do HUD) */
  function txt(e, v) { if (e && e._t !== v) { e._t = v; e.textContent = v; } }
  function htm(e, v) { if (e && e._h !== v) { e._h = v; e.innerHTML = v; } }
  function wid(e, v) { if (e && e._w !== v) { e._w = v; e.style.width = v; } }
  function hid(e, v) { if (e && e.hidden !== v) e.hidden = v; }

  function update() {
    var S = G.S, st = G.st, m = G.mat, rt = G.rt;
    txt($('h-mat'), m.name.toUpperCase());
    txt($('h-era'), 'ERA ' + String(m.era).padStart(2, '0') + ' · CAMADA ' + P.fmtNum(G.layersBuilt()) + ' / ' + P.fmtNum(m.goalLayers));
    txt($('h-money'), '$' + P.fmtMoney(P.Juice.money()));
    htm($('h-pieces'), Math.floor(S.pieces) + '<small>/' + st.capacity + '</small>');
    $('h-box').classList.toggle('jam', rt.jam);
    txt($('h-res'), st.reserveCap > 0 ? '+' + S.reserve + '/' + st.reserveCap : '');
    var rate = G.prodRate();
    var full = S.pieces >= st.capacity && S.reserve >= st.reserveCap;
    wid($('h-timer'), (full ? 100 : Math.min(100, S.prodP * 100)) + '%');
    var tt;
    if (rt.jam) tt = 'EMPERROU! TOQUE';
    else if (full) tt = 'CAIXA CHEIA';
    else if (rate <= 0) tt = 'PAUSADA';
    else tt = P.fmtNum((1 - S.prodP) / rate, 1) + 's' + (S.pieces >= st.capacity ? ' → RES.' : '');
    txt($('h-timer-t'), tt);
    txt($('h-glob'), P.fmtHeight(G.globalHeight()));
    txt($('h-loc'), P.fmtHeight(G.localHeight()));
    var integ = rt.integrity;
    var ib = $('h-int');
    wid(ib, integ + '%');
    var ic = (integ > 70 ? 'var(--lime)' : integ > 40 ? 'var(--yellow)' : 'var(--red)');
    if (ib._c !== ic) { ib._c = ic; ib.style.setProperty('--c', ic); }
    txt($('h-int-t'), Math.round(integ) + '%');
    txt($('b-tree-p'), G.def ? Math.floor(G.progress() * 100) + '%' : '—');
    $('b-tree').classList.toggle('has', canAffordAny());

    // chips de estado
    var chips = [];
    if (rt.jam) chips.push(['CAIXA EMPERRADA', 'bad']);
    if (G.threatsActive()) chips.push(['ATAQUE · PRODUÇÃO ' + Math.round(st.attackProd * 100) + '%', 'bad']);
    if (rt.rain) chips.push(['CHUVA ' + Math.ceil(rt.rain.t) + 's', 'warn']);
    if (rt.storm > 0) chips.push(['TEMPESTADE ' + Math.ceil(rt.storm) + 's', 'bad']);
    if (rt.hail > 0) chips.push(['GRANIZO ' + Math.ceil(rt.hail) + 's', 'bad']);
    if (rt.heat > 0) chips.push(['SOL FORTE', 'warn']);
    if (rt.boost > 0) chips.push(['PRODUÇÃO +50% ' + Math.ceil(rt.boost) + 's', 'good']);
    if (rt.calm > 0) chips.push(['CALMARIA +10% ' + Math.ceil(rt.calm) + 's', 'good']);
    if (rt.defect > 0) chips.push(['DEFEITO ×' + rt.defect, 'warn']);
    if (rt.repairing) chips.push(['REPARANDO…', 'good']);
    if (S.stormToken && st.freeStormRepair) chips.push(['REPARO GRÁTIS', 'good']);
    if (rt.combo > 0 && rt.clock - rt.lastPlaceAt < 1.8 && st.comboStep > 0) chips.push(['RITMO ×' + rt.combo, 'good']);
    var dmg = rt.dmgCount.crack + rt.dmgCount.miss + rt.dmgCount.fire;
    if (dmg) chips.push([dmg + ' PEÇA' + (dmg > 1 ? 'S' : '') + ' DANIFICADA' + (dmg > 1 ? 'S' : ''), 'bad']);
    if (st.statsPanel) chips.push([P.fmtNum(60 / P.ECON.effRecharge(st), 1) + ' PEÇAS/MIN · $' + P.fmtNum(P.ECON.passive(G.mat, st, G.layersBuilt(), integ / 100) * 60, 1) + '/MIN', '']);
    var ch = chips.map(function (c) { return '<span class="chip ' + c[1] + '">' + c[0] + '</span>'; }).join('');
    var hc = $('h-chips');
    if (hc._v !== ch) { hc._v = ch; hc.innerHTML = ch; }

    // status (linha central inferior)
    var s = '', cls = '';
    var br = G.blockReason();
    if (!V.nearTop()) { s = 'VISITANDO CAMADA ' + Math.max(1, Math.round(V.viewLayers()[0] + (V.viewLayers()[1] - V.viewLayers()[0]) / 2)); }
    else if (rt.ch) { s = 'SOBREVIVA À ' + G.mat.challenge.name; cls = 'warn'; }
    else if (br === 'boss') { s = 'CHEFÃO NA TORRE! TOQUE NELE!'; cls = 'bad'; }
    else if (br === 'empty') { s = 'SEM ' + G.mat.pieces.toUpperCase() + ' · AGUARDE A RECARGA'; cls = 'bad'; }
    else if (br === 'limit') { s = 'LIMITE ESTRUTURAL · MELHORE A ÁRVORE'; cls = 'warn'; }
    else if (br === 'goal') { s = 'ALTURA MÁXIMA DA ERA · SUBA DE ERA ▲'; cls = 'warn'; }
    else if (br === 'unstable') { s = 'ESTRUTURA INSTÁVEL · REPARE (<40%)'; cls = 'bad'; }
    else s = 'TOQUE PARA COLOCAR UM ' + G.mat.piece.toUpperCase();
    var stEl = $('status');
    if (stEl._v !== s) { stEl._v = s; stEl.textContent = s; stEl.className = cls; }

    hid($('b-top'), V.nearTop());
    hid($('b-dmg'), !(st.jumpToDamage && G.damagedCells(true).length));
    hid($('b-ch'), !G.challengeReady());
    hid($('b-master'), !G.masteryReady());

    // indicador de vento
    var wi = el['wind-ind'];
    var pend = rt.wind.pending.length ? rt.wind.pending[0] : null;
    if (pend || rt.wind.gust) {
      var dir = (pend || rt.wind.gust).dir;
      var arrows = dir > 0 ? '►►►' : '◄◄◄';
      var wtx = pend ? 'VENTO ' + arrows + ' ' + P.fmtNum(Math.max(0, pend.t), 1) + 's' : 'RAJADA ' + arrows;
      hid(wi, false); var wc = 'px' + (pend ? '' : ' now'); if (wi.className !== wc) wi.className = wc;
      if (wi._v !== wtx) { wi._v = wtx; wi.innerHTML = spr('ico_wind') + wtx; }
    } else hid(wi, true);

    // desafio
    var ci = el['ch-ind'];
    if (rt.ch) {
      hid(ci, false); if (ci.className !== 'px') ci.className = 'px';
      htm(ci, G.mat.challenge.name + '<br>' + Math.ceil(rt.ch.t) + 's · MÍN ' + G.mat.challenge.minIntegrity + '%');
    } else hid(ci, true);

    updateBossBar();
    updateRuler();
  }

  function updateBossBar() {
    var b = G.rt.boss, bb = $('boss-bar');
    if (!bb) { bb = document.createElement('div'); bb.id = 'boss-bar'; bb.className = 'px'; bb.hidden = true; bb.innerHTML = '<b class="t-px"></b><div class="bar"><i></i></div><span class="t-px"></span>'; $('hud').appendChild(bb); }
    if (!b) { hid(bb, true); return; }
    hid(bb, false);
    txt(bb.querySelector('b'), '☠ ' + b.def.name);
    wid(bb.querySelector('.bar i'), (b.hp / b.maxHp * 100) + '%');
    txt(bb.querySelector('span'), Math.ceil(b.hp) + ' / ' + b.maxHp + (b.state === 'dead' ? ' · DERROTADO!' : ''));
    bb.classList.toggle('dead', b.state === 'dead');
  }

  function canAffordAny() {
    var def = G.def;
    if (!def) return false;
    var lv = G.levels(), money = G.S.money;
    for (var i = 0; i < def.nodes.length; i++) {
      var n = def.nodes[i], l = lv[n.id] || 0;
      if (l < n.lv && P.Tree.reqsMet(def, n, lv) && money >= P.Tree.cost(def, G.mat, n, l)) return true;
    }
    return false;
  }

  /* ---------------- régua ---------------- */
  function updateRuler() {
    var m = G.mat, st = G.st, goal = m.goalLayers;
    var vl = V.viewLayers();
    var built = G.layersBuilt(), lim = G.limit();
    var dmg = st.rulerMarkers ? G.damagedCells(true) : [];
    var key = [built, lim, Math.round(vl[0]), Math.round(vl[1]), dmg.length, dmg[0], st.rulerHeat, G.rt.dmgCount.miss + G.rt.dmgCount.crack, JSON.stringify(G.S.bosses || {})].join('|');
    if (key === lastRuler) return;
    lastRuler = key;
    function pct(l) { return Math.max(0, Math.min(100, l / goal * 100)); }
    var h = '<div class="fill" style="height:' + pct(built) + '%"></div>';
    for (var t = m.milestoneEvery; t < goal; t += m.milestoneEvery) h += '<i class="tick" style="bottom:' + pct(t) + '%"></i>';
    if (lim < goal) h += '<i class="limit" style="bottom:' + pct(lim) + '%"></i>';
    if (st.rulerHeat) {
      var seg = 20, ppl = m.piecesPerLayer, cnt = {};
      G.damagedCells(false).forEach(function (c) { var s = Math.floor(c / ppl / (goal / seg)); cnt[s] = (cnt[s] || 0) + 1; });
      for (var s = 0; s < seg; s++) {
        if (s * goal / seg > built) break;
        var n = cnt[s] || 0;
        h += '<i class="heat" style="bottom:' + (s * 100 / seg) + '%;height:' + (100 / seg) + '%;left:-8px;background:' + (n === 0 ? '#00e436' : n < 3 ? '#ffec27' : '#ff004d') + '"></i>';
      }
    }
    dmg.forEach(function (c) { h += '<i class="dmg" style="bottom:' + pct(Math.floor(c / m.piecesPerLayer)) + '%"></i>'; });
    G.bossList().forEach(function (bd) {
      var done = G.S.bosses && G.S.bosses[bd.id];
      h += '<span class="boss-mk' + (done ? ' done' : '') + '" style="bottom:' + pct(bd.layer) + '%" title="' + bd.name + '">' + (done ? '✓' : '☠') + '</span>';
    });
    var v0 = pct(Math.max(0, vl[0])), v1 = pct(Math.max(0, vl[1]));
    h += '<i class="view" style="bottom:' + v0 + '%;height:' + Math.max(1, v1 - v0) + '%"></i>';
    h += '<span class="lbl" style="bottom:calc(100% - 4px)">' + P.fmtHeight(m.goalM * (1 + st.pieceSize)) + '</span>';
    if (lim < goal) h += '<span class="lbl c-o" style="bottom:' + pct(lim) + '%">LIMITE</span>';
    el.ruler.innerHTML = h;
  }

  function rulerJump(e) {
    var r = el.ruler.getBoundingClientRect();
    var f = 1 - (e.clientY - r.top) / r.height;
    var layer = Math.round(f * G.mat.goalLayers);
    if (layer >= G.topLayer() - 3) V.goTop(); else V.goLayer(Math.max(0, layer));
  }

  /* ---------------- alertas ---------------- */
  function toast(text, kind, small, opts) {
    opts = opts || {};
    var key = text;
    if (toastKeys[key] && performance.now() - toastKeys[key] < 1500) return;
    toastKeys[key] = performance.now();
    var a = el.alerts;
    while (a.children.length > 4) a.firstChild.remove();
    var d = document.createElement('div');
    d.className = 'toast px ' + (kind || '') + (small ? ' small' : '') + (opts.big ? ' big' : '') + (opts.onClick ? ' link' : '');
    var life = opts.life || (small ? 1.8 : 2.6);
    d.style.setProperty('--life', life + 's');
    d.innerHTML = (opts.icon ? spr(opts.icon) : '') + '<span>' + text + '</span>';
    if (opts.onClick) d.addEventListener('click', opts.onClick);
    a.appendChild(d);
    setTimeout(function () { d.remove(); }, (life + 0.4) * 1000);
  }

  function bindGame() {
    G.on('toast', function (t) {
      var opts = {};
      if (t.cell != null && G.st.jumpToDamage) opts.onClick = function () { V.goLayer(Math.floor(t.cell / G.mat.piecesPerLayer)); };
      toast(t.text, t.kind, t.small, opts);
    });
    G.on('damage', function (d) {
      if (d.src === 'boss') return;          // o chefão tem a própria barra
      var what = d.kind === 'fire' ? 'FOGO' : d.kind === 'miss' ? 'PEÇA CAIU' : 'DANO';
      toast(what + ' — CAMADA ' + (d.layer + 1), 'bad', false, {
        icon: 'ico_warn',
        onClick: G.st.jumpToDamage ? function () { V.goLayer(d.layer); } : null
      });
    });
    G.on('blocked', function (r) {
      var msg = {
        empty: 'SEM ' + G.mat.pieces.toUpperCase() + '!', emptyRepair: G.rt.jam ? 'CAIXA EMPERRADA — TOQUE 3x' : 'SEM PEÇAS E SEM DINHEIRO PARA O REPARO', money: 'DINHEIRO INSUFICIENTE',
        limit: 'LIMITE ESTRUTURAL — MELHORE A ÁRVORE', boss: 'DERROTE O CHEFÃO PARA CONTINUAR!', unstable: 'ESTRUTURA INSTÁVEL — REPARE A TORRE', goal: 'ALTURA MÁXIMA DA ERA',
        chIntegrity: 'INTEGRIDADE MÍNIMA DE ' + (G.mat.challenge ? G.mat.challenge.startIntegrity : 0) + '% PARA INICIAR'
      }[r] || r;
      toast(msg, 'warn', true);
    });
    G.on('event', function (d) { toast(d.e.name + (d.extra ? ' ' + d.extra : ''), d.e.good ? 'good' : 'info', false, { icon: d.e.good ? 'ico_coin' : 'ico_warn' }); });
    G.on('milestone', function (d) { toast('MARCO ' + d.layer + ' CAMADAS · +$' + P.fmtMoney(d.money), 'good', false, { big: true, icon: 'ico_flag', life: 3.4 }); });
    G.on('windWarn', function (w) { if (w.sec >= 1) toast('VENTO SE APROXIMANDO', 'warn', true, { icon: 'ico_wind' }); });
    G.on('treeComplete', function () { toast('ÁRVORE 100% CONCLUÍDA', 'good', false, { big: true, life: 4 }); });
    G.on('challenge', function (s) {
      if (s === 'start') toast(G.mat.challenge.name + '!', 'bad', false, { big: true, life: 3 });
      if (s === 'won') { toast('DESAFIO FINAL CONCLUÍDO!', 'good', false, { big: true, life: 4 }); setTimeout(function () { P.Story.whenIdle(masteryModal); }, 900); }
      if (s === 'lost') modal('DESAFIO FALHOU', '<div class="line c-r">A ESTRUTURA FICOU ABAIXO DE ' + G.mat.challenge.minIntegrity + '%.</div><p>Repare a torre e tente novamente. Nenhum progresso foi perdido.</p>', [['OK', null]]);
    });
    G.on('rebuild', function () { lastRuler = ''; });
    // bateu a altura da era: oferece a subida na hora
    G.on('layerDone', function (d) { if (d.layer + 1 === G.mat.goalLayers) setTimeout(function () { P.Story.whenIdle(masteryModal); }, 1200); });
  }

  /* ---------------- modais ---------------- */
  function modal(title, body, buttons) {
    var m = el.modal;
    m.hidden = false;
    m.innerHTML = '<div class="box px"><h2>' + title + '</h2><div class="body">' + body + '</div><div class="btns"></div></div>';
    var bx = m.querySelector('.btns');
    (buttons || [['FECHAR', null]]).forEach(function (b) {
      var btn = document.createElement('button');
      btn.className = 'pxbtn ' + (b[2] || '');
      btn.textContent = b[0];
      btn.addEventListener('click', function () { if (!b[3]) close(); if (b[1]) b[1](); });
      bx.appendChild(btn);
    });
  }
  function close() { el.modal.hidden = true; el.modal.innerHTML = ''; P.Pause.set('choice', false); }

  function confirmChallenge() {
    var c = G.mat.challenge;
    modal('DESAFIO FINAL', '<div class="big">' + c.name + '</div>' +
      '<p>Sobreviva por ' + c.dur + ' segundos a rajadas violentas, chuva e ataques constantes.</p>' +
      '<div class="kv"><span>Integridade para iniciar</span><b>' + c.startIntegrity + '%</b></div>' +
      '<div class="kv"><span>Integridade ao final</span><b>≥ ' + c.minIntegrity + '%</b></div>' +
      '<p class="c-l">Falhar não destrói nada — apenas exige reparos.</p>',
      [['INICIAR', function () { G.startChallenge(); }, 'gold'], ['AGORA NÃO', null]]);
  }

  function masteryModal() {
    if (!G.masteryReady()) return;
    var m = G.mat, next = P.MATERIALS[m.era];
    var hasTree = next && next.tree && P.TREES[next.tree];
    var pct = Math.floor(G.progress() * 100);
    var body =
      '<div class="line c-g">✓ ALTURA MÁXIMA DA ERA: ' + P.fmtHeight(G.localHeight()) + '</div>' +
      '<div class="line ' + (pct >= 100 ? 'c-g">✓' : 'c-l">·') + ' ÁRVORE ' + pct + '% (OPCIONAL)</div>' +
      '<div class="line ' + (G.S.challengeDone ? 'c-g">✓' : 'c-l">·') + ' DESAFIO FINAL (OPCIONAL)</div><div class="sep"></div>' +
      '<div class="line c-l">MATERIAL DOMINADO:</div><div class="big">' + m.name.toUpperCase() + '</div><div class="sep"></div>';
    if (!next) {
      modal('FIM DA REALIDADE', body + '<p>Não há mais nada para construir. Tudo começou com um palito de fósforo.</p>');
      return;
    }
    body += '<div class="line c-l">PRÓXIMO MATERIAL:</div><div class="big c-y">' + next.name.toUpperCase() + '</div>' +
      '<p>' + next.traits.join(' · ') + '</p><p class="c-r">Novos problemas: ' + next.problems.join(' · ') + '</p>';
    if (!hasTree) {
      body += '<div class="sep"></div><p class="c-o">A era de ' + next.name + ' chega na próxima atualização. Seu domínio está registrado — continue cuidando da torre!</p>';
      modal('ALTURA MÁXIMA!', body);
      return;
    }
    body += '<div class="sep"></div><p>A torre atual fica no histórico. Uma nova torre começa no checkpoint a ' + P.fmtHeight(G.globalHeight()) + '. O dinheiro desta era vira fundação.</p>';
    var btns = [['SUBIR DE ERA ▲', function () { P.EraFX.play(function () { G.rebuild(); P.save(); }); }, 'gold'], ['CONTINUAR AQUI', null]];
    if (G.challengeReady()) btns.splice(1, 0, ['DESAFIO FINAL', confirmChallenge]);
    modal('ALTURA MÁXIMA!', body, btns);
  }

  function openMenu() {
    var S = G.S, st = S.stats;
    var eras = P.MATERIALS.map(function (m, i) {
      var cls = i < S.matIndex ? 'done' : i === S.matIndex ? 'cur' : i === S.matIndex + 1 ? 'next' : '';
      var name = i <= S.matIndex + 1 ? m.name.toUpperCase() : '???';
      return '<div class="' + cls + '">ERA ' + String(m.era).padStart(2, '0') + ' — ' + name + (i < S.matIndex ? ' ✓' : '') + '</div>';
    }).join('');
    var hist = S.history.length ? S.history.map(function (h, i) {
      return '<div class="kv"><span>#' + (i + 1) + ' ' + h.name + '</span><b>' + P.fmtNum(h.layers) + ' cam. · ' + P.fmtHeight(h.heightM) + '</b></div>';
    }).join('') : '<p class="c-l">Nenhuma torre concluída ainda.</p>';
    var m = G.mat;
    var body =
      '<div class="kv"><span>Material</span><b>' + m.name + '</b></div>' +
      '<p>' + m.traits.join(' · ') + '</p><p class="c-r">Problemas: ' + m.problems.join(' · ') + '</p><div class="sep"></div>' +
      '<div class="kv"><span>Peças colocadas</span><b>' + P.fmtNum(st.placed) + '</b></div>' +
      '<div class="kv"><span>Reparos</span><b>' + P.fmtNum(st.repaired) + '</b></div>' +
      '<div class="kv"><span>Peças perdidas</span><b>' + P.fmtNum(st.fallen) + '</b></div>' +
      '<div class="kv"><span>Ameaças expulsas</span><b>' + P.fmtNum(st.defeated) + '</b></div>' +
      '<div class="kv"><span>Eventos</span><b>' + P.fmtNum(st.events) + '</b></div>' +
      '<div class="kv"><span>Dinheiro ganho</span><b>$' + P.fmtMoney(st.earned) + '</b></div>' +
      '<div class="kv"><span>Tempo de jogo</span><b>' + fmtTime(st.playSec) + '</b></div>' +
      '<div class="sep"></div><div class="line c-l">HISTÓRICO DE TORRES</div>' + hist +
      '<div class="sep"></div><div class="line c-l">ERAS</div><div class="era-list">' + eras + '</div>';
    modal('PALIT', body, [['FECHAR', null], ['APAGAR SAVE', confirmWipe, 'red', true]]);
  }

  function confirmWipe() {
    modal('APAGAR PROGRESSO?', '<p>Isso apaga TODO o progresso, de todas as eras. Não pode ser desfeito.</p>',
      [['CANCELAR', null], ['APAGAR TUDO', function () { P.wipe(); }, 'red']]);
  }

  function fmtTime(s) {
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
    return h + 'h ' + String(m).padStart(2, '0') + 'min';
  }

  return { init: init, update: update, toast: toast, modal: modal, close: close, masteryModal: masteryModal };
})();
