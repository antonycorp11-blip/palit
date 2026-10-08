/* =========================================================
   ERA FX — a virada de era: a torre brilha e sobe em luz,
   o palito antigo se despede e o novo material chega.
   play(mid): mid() é chamado com a tela coberta (reconstrução).
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.EraFX = (function () {
  var P = PALIT;
  var busy = false;

  /* palito grande em pixel art (box-shadow) a partir da arte do material */
  function stickArt(mat) {
    var art = P.STICKS && P.STICKS[mat.id], rows = [], pal = {};
    if (art && art.grid) { rows = art.grid; pal = art.pal; }
    else if (art) {
      var L = mat.look.len;
      for (var r = 0; r < 5; r++) {
        var row = '';
        for (var x = 0; x < L; x++) {
          if (x < 5) row += art.head[r][x] === '.' ? '.' : art.head[r][x];
          else row += r >= 1 && r <= 3 ? art.body[r - 1] : '.';
        }
        rows.push(row);
      }
      pal = art.pal;
    } else {
      var lk = mat.look; pal = { a: lk.light, b: lk.body, c: lk.shade };
      var w = lk.len; rows = [Array(w + 1).join('a'), Array(w + 1).join('b'), Array(w + 1).join('c')];
    }
    var Z = Math.max(4, Math.min(9, Math.floor(Math.min(window.innerWidth * 0.8, 520) / rows[0].length)));
    var sh = [];
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) if (row[x] !== '.' && pal[row[x]]) sh.push((x * Z) + 'px ' + (y * Z) + 'px 0 0 ' + pal[row[x]]);
    });
    var w2 = rows[0].length * Z, h2 = rows.length * Z;
    return '<div class="ef-stick" style="width:' + w2 + 'px;height:' + h2 + 'px"><i style="width:' + Z + 'px;height:' + Z + 'px;box-shadow:' + sh.join(',') + '"></i></div>';
  }

  function colorsOf(mat) {
    var art = P.STICKS && P.STICKS[mat.id];
    if (art) return Object.keys(art.pal).map(function (k) { return art.pal[k]; });
    return [mat.look.light, mat.look.body, mat.look.shade];
  }

  function burst(root, n, colors, cls) {
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.className = cls || 'ef-bit';
      var a = Math.random() * Math.PI * 2, r = 80 + Math.random() * Math.min(window.innerWidth, 600) * 0.6;
      p.style.setProperty('--dx', Math.round(Math.cos(a) * r) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(a) * r) + 'px');
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.15).toFixed(2) + 's';
      root.appendChild(p);
    }
  }

  function rising(root, n) {
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.className = 'ef-rise';
      p.style.left = (Math.random() * 100).toFixed(1) + '%';
      p.style.animationDelay = (Math.random() * 1.6).toFixed(2) + 's';
      p.style.animationDuration = (1.2 + Math.random() * 1.2).toFixed(2) + 's';
      p.style.background = ['#ffec27', '#fff1e8', '#ffa300'][i % 3];
      root.appendChild(p);
    }
  }

  function confetti(root, n) {
    var cols = ['#ff004d', '#ffec27', '#00e436', '#29adff', '#ff77a8', '#fff1e8'];
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.className = 'ef-conf';
      p.style.left = (Math.random() * 100).toFixed(1) + '%';
      p.style.background = cols[i % cols.length];
      p.style.animationDelay = (Math.random() * 2.5).toFixed(2) + 's';
      p.style.animationDuration = (2 + Math.random() * 2).toFixed(2) + 's';
      root.appendChild(p);
    }
  }

  function fmtTime(s) {
    s = Math.max(0, Math.round(s));
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
    return h ? h + 'H ' + String(m).padStart(2, '0') + 'MIN' : m + ' MIN';
  }

  function play(mid) {
    if (busy) return;
    busy = true;
    var G = P.Game, A = P.Audio, from = G.mat, to = P.MATERIALS[G.S.matIndex + 1];
    var rec = G.S.records && G.S.records[from.id];
    var stats = P.fmtNum(G.layersBuilt()) + ' CAMADAS · ' + P.fmtHeight(G.localHeight()) + (rec ? ' · ' + fmtTime(G.S.stats.playSec - rec.start) : '');
    P.Pause.set('era', true);
    if (P.TreeView.isOpen()) P.TreeView.close();
    P.View.goTop();

    var root = document.createElement('div');
    root.id = 'era-fx';
    root.innerHTML = '<div class="ef-rays"></div><div class="ef-pillar"></div><div class="ef-parts"></div>' +
      '<div class="ef-card"><div class="ef-kicker t-px"></div><div class="ef-art"></div><div class="ef-title t-px"></div><div class="ef-sub t-px"></div><div class="ef-stats t-px"></div></div>' +
      '<div class="ef-tap t-px">TOQUE PARA COMEÇAR</div>';
    document.body.appendChild(root);
    var parts = root.querySelector('.ef-parts'), card = root.querySelector('.ef-card');
    var world = document.getElementById('world');
    function q(s) { return root.querySelector(s); }
    function at(sec, fn) { setTimeout(fn, sec * 1000); }

    // 1) a torre brilha, treme e solta faíscas para o alto
    root.className = 'p1';
    world.classList.add('era-glow');
    rising(parts, 46);
    A.sfx.rumble();
    if (P.Haptics) P.Haptics.buzz([30, 60, 30, 60, 30]);
    var shakes = setInterval(function () { P.View.shake(2); }, 260);

    // 2) clarão: a era antiga em destaque
    at(2.0, function () {
      clearInterval(shakes);
      root.className = 'p2';
      q('.ef-kicker').textContent = 'ERA ' + String(from.era).padStart(2, '0') + ' CONCLUÍDA';
      q('.ef-art').innerHTML = stickArt(from);
      q('.ef-title').textContent = from.name.toUpperCase();
      q('.ef-sub').textContent = 'MATERIAL DOMINADO';
      q('.ef-stats').textContent = stats;
      A.sfx.milestone();
    });

    // 3) o palito antigo se desfaz em pixels
    at(4.4, function () {
      root.className = 'p3';
      burst(parts, 60, colorsOf(from));
      A.sfx.shatter();
      if (P.Haptics) P.Haptics.buzz(60);
    });

    // reconstrução com a tela coberta
    at(5.0, function () {
      world.classList.remove('era-glow');
      try { mid(); } catch (e) { /* segue a animação mesmo assim */ }
      var sc = P.sceneOf(to);
      var sky = sc.sky || ['#1d2b53', '#29adff'];
      root.style.setProperty('--sky0', sky[0]); root.style.setProperty('--sky1', sky[sky.length - 1]);
    });

    // 4) o novo material chega girando
    at(5.4, function () {
      root.className = 'p4';
      parts.innerHTML = '';
      q('.ef-kicker').textContent = 'ERA ' + String(to.era).padStart(2, '0');
      q('.ef-art').innerHTML = stickArt(to);
      q('.ef-title').textContent = to.name.toUpperCase();
      q('.ef-sub').textContent = (P.sceneOf(to).name || '').toUpperCase() + ' · ' + P.fmtHeight(G.S.globalBase);
      q('.ef-stats').textContent = to.traits.join(' · ');
      card.classList.remove('land'); void card.offsetWidth; card.classList.add('land');
      confetti(parts, 70);
      A.sfx.eraOpen();
      if (P.Haptics) P.Haptics.buzz([40, 40, 80]);
    });

    var ended = false;
    function end() {
      if (ended) return;
      ended = true;
      root.classList.add('out');
      setTimeout(function () { root.remove(); busy = false; P.Pause.set('era', false); }, 900);
    }
    at(7.4, function () {
      root.classList.add('ready');
      root.addEventListener('pointerdown', end);
    });
    at(16, end);
  }

  return { play: play, active: function () { return busy; } };
})();
