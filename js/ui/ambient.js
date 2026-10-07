/* =========================================================
   AMBIENTE — cenário vivo:
   - ciclo de dia / pôr do sol / noite / amanhecer
   - camadas de profundidade (montanhas, árvores, casas, bancos de nuvens)
     que descem em velocidades diferentes conforme a torre sobe
   - vida passando ao fundo (borboletas, pássaros, aviões, balões, folhas)
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.Ambient = (function () {
  var P = PALIT, G, V;
  var el = {};
  var CYCLE = 420;          // segundos de um dia completo
  var camBase = 0;          // quanto a câmera já subiu (px)
  var timers = {};
  var lastSkyKey = '';
  var night = 0;

  var PAL = {
    sunset: ['#1d2b53', '#7e2553', '#c8325a', '#ff77a8', '#ffa300', '#ffccaa'],
    night: ['#03061a', '#070c28', '#0c1638', '#141f4a', '#1d2b53', '#26386a'],
    dawn: ['#1d2b53', '#3a3a7a', '#83769c', '#ff77a8', '#ffccaa', '#fff1e8']
  };

  /* coisas que passam ao fundo; band = faixa de subida da câmera (px) */
  var KINDS = [
    { id: 'butterfly', sprite: 'butterfly', band: [0, 700], every: [5, 11], dur: [10, 15], y: [62, 88], wobble: 'flutter', day: true },
    { id: 'birds', sprite: 'birdlet', band: [150, 1e9], every: [10, 22], dur: [11, 17], y: [14, 55], count: [3, 7], wobble: 'glide' },
    { id: 'plane', sprite: 'plane', band: [0, 1e9], every: [35, 70], dur: [24, 32], y: [6, 26], contrail: true, scale: 2 },
    { id: 'balloon', sprite: 'balloon', band: [2200, 1e9], every: [40, 75], dur: [45, 60], y: [20, 55], wobble: 'float', scale: 2, day: true },
    { id: 'kite', sprite: 'kite', band: [800, 6000], every: [30, 60], dur: [30, 40], y: [25, 50], wobble: 'float', scale: 2, day: true },
    { id: 'pigeons', sprite: 'pigeon', band: [0, 1e9], every: [9, 18], dur: [9, 14], y: [15, 60], count: [2, 5], wobble: 'glide' },
    { id: 'heli', sprite: 'heli', band: [0, 1e9], every: [35, 70], dur: [20, 28], y: [10, 40], scale: 2 },
    { id: 'jet', sprite: 'plane', band: [0, 1e9], every: [18, 40], dur: [8, 12], y: [5, 45], contrail: true, scale: 2 },
    { id: 'balloon_hi', sprite: 'balloon', band: [0, 1e9], every: [40, 70], dur: [60, 80], y: [20, 60], wobble: 'float', scale: 2 },
    { id: 'comet', sprite: 'comet', band: [0, 1e9], every: [12, 30], dur: [5, 9], y: [5, 50], scale: 2 },
    { id: 'satellite', sprite: 'satellite', band: [0, 1e9], every: [20, 45], dur: [30, 45], y: [8, 60], scale: 2 },
    { id: 'station', sprite: 'station', band: [0, 1e9], every: [50, 90], dur: [50, 70], y: [10, 35], scale: 3 },
    { id: 'ufo', sprite: 'ufo', band: [0, 1e9], every: [30, 60], dur: [10, 16], y: [10, 60], wobble: 'float', scale: 2 },
    { id: 'asteroid', sprite: 'asteroid', band: [0, 1e9], every: [8, 18], dur: [18, 30], y: [5, 80], scale: 3 }
  ];

  function $(id) { return document.getElementById(id); }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function mix(a, b, t) {
    if (a[0] !== '#' || b[0] !== '#') return t < 0.5 ? a : b;
    var x = hex(a), y = hex(b);
    return '#' + x.map(function (v, i) { var r = Math.round(v + (y[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16); }).join('');
  }
  function resample(arr, n) { var o = []; for (var i = 0; i < n; i++) o.push(arr[Math.min(arr.length - 1, Math.floor(i * arr.length / n))]); return o; }

  /* fase do dia: retorna duas paletas, mistura e "quão noite" */
  function dayPhase(day) {
    var t = (Date.now() / 1000 % CYCLE) / CYCLE;
    var S = [
      [0.00, 0.46, day, day],
      [0.46, 0.53, day, PAL.sunset],
      [0.53, 0.60, PAL.sunset, PAL.night],
      [0.60, 0.88, PAL.night, PAL.night],
      [0.88, 0.94, PAL.night, PAL.dawn],
      [0.94, 1.00, PAL.dawn, day]
    ];
    for (var i = 0; i < S.length; i++) {
      var s = S[i];
      if (t >= s[0] && t < s[1]) {
        var k = (t - s[0]) / (s[1] - s[0]);
        var n = i === 2 ? k : i === 3 ? 1 : i === 4 ? 1 - k : i === 1 ? k * 0.3 : i === 5 ? 0 : 0;
        return { a: s[2], b: s[3], k: k, night: n, t: t };
      }
    }
    return { a: day, b: day, k: 0, night: 0, t: t };
  }

  function init() {
    G = P.Game; V = P.View;
    ['sky', 'sun', 'moon', 'stars', 'mountains', 'trees', 'houses', 'cloudbank', 'ambient', 'game', 'world', 'scene',
     'roofs', 'skyline', 'seaclouds', 'curve', 'planet', 'nebula', 'galaxy', 'web', 'asteroids', 'moonland', 'marsland'].forEach(function (k) { el[k] = $(k); });
    build();
    G.on('gust', function (g) { leaves(g.dir, Math.round(6 + g.str * 6)); });
    G.on('rebuild', function () { lastSkyKey = ''; applyScene(); });
    applyScene();
  }

  /* ---------------- construção das camadas ---------------- */
  function build() {
    var seed = 11;
    function r() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    // montanhas em degraus com neve
    var html = '';
    [[-15, 55, 46], [25, 50, 60], [62, 55, 40], [90, 40, 52]].forEach(function (m) {
      var steps = 9;
      for (var s = 0; s < steps; s++) {
        var inset = s * (m[1] / steps / 2);
        var h = Math.round(m[2] * (s + 1) / steps);
        html += '<div class="mtn' + (s >= steps - 2 ? ' snow' : '') + '" style="left:' + (m[0] + inset) + '%;width:' + (m[1] - inset * 2) + '%;height:calc(var(--u) * ' + h + ')"></div>';
      }
    });
    el.mountains.innerHTML = html;
    // árvores
    html = '';
    for (var i = 0; i < 14; i++) {
      var x = Math.round(r() * 104 - 4);
      if (x > 38 && x < 62) continue;
      html += '<i class="sp sp-ptree tr" style="left:' + x + '%;transform:scale(' + (3 + Math.round(r())) + ')"></i>';
    }
    el.trees.innerHTML = html;
    // casas da vizinhança
    html = '';
    var cols = [['#c8644a', '#7e2553'], ['#e8c27a', '#ab5236'], ['#83769c', '#1d2b53'], ['#5cc4ff', '#7e2553'], ['#ffccaa', '#5f574f']];
    [[-4, 26], [20, 18], [70, 20], [86, 24]].forEach(function (h, j) {
      var c = cols[j % cols.length];
      html += '<div class="house" style="left:' + h[0] + '%;width:calc(var(--u) * ' + h[1] * 2 + ');--wall:' + c[0] + ';--roof:' + c[1] + '"><i class="roof"></i><i class="win"></i><i class="door"></i></div>';
    });
    el.houses.innerHTML = html;
    // bancos de nuvens: você passa por eles enquanto sobe
    html = '';
    for (var b = 0; b < 9; b++) {
      var y = 900 + b * 950 + Math.round(r() * 300);
      for (var c2 = 0; c2 < 3; c2++) {
        html += '<i class="sp sp-cloud bank" style="bottom:' + (y + Math.round(r() * 120)) + 'px;left:' + Math.round(r() * 90 - 15) + '%;transform:scale(' + (4 + Math.round(r() * 2)) + ')"></i>';
      }
    }
    el.cloudbank.innerHTML = html;
    el.moon.className = 'sp sp-moon';

    // telhados próximos (era 2): telhas, caixas d'água, antenas, varais
    html = '';
    [[-6, 30, 26], [18, 20, 34], [64, 22, 30], [84, 26, 22]].forEach(function (h, j) {
      html += '<div class="rf" style="left:' + h[0] + '%;width:calc(var(--u) * ' + h[1] * 2 + ');height:calc(var(--u) * ' + h[2] + ')">' +
        '<i class="tiles"></i>' + (j % 2 ? '<i class="tank"></i>' : '<i class="chim"></i>') + '<i class="ant" style="left:' + (30 + j * 12) + '%"></i>' + (j === 1 ? '<i class="line"></i>' : '') + '</div>';
    });
    el.roofs.innerHTML = html;
    // arranha-céus
    html = ''; var sx = -4;
    while (sx < 104) {
      var sw = 6 + Math.floor(r() * 8), shh = 40 + Math.floor(r() * 80);
      html += '<div class="sk" style="left:' + sx + '%;width:calc(var(--u) * ' + sw * 2 + ');height:calc(var(--u) * ' + shh + ')">' + (r() < 0.4 ? '<i class="spire"></i>' : '') + '</div>';
      sx += sw * 1.1 + r() * 4;
    }
    el.skyline.innerHTML = html;
    // mar de nuvens
    html = '<div class="sea"></div>';
    for (var q = 0; q < 12; q++) html += '<i class="sp sp-cloud seac" style="left:' + (q * 9 - 6) + '%;transform:scale(' + (5 + (q % 3)) + ')"></i>';
    el.seaclouds.innerHTML = html;
    el.curve.innerHTML = '<div class="earth"></div>';
    el.planet.innerHTML = '<div class="pl"><i class="ring"></i></div>';
    el.nebula.innerHTML = '<i class="nb a"></i><i class="nb b"></i><i class="nb c"></i>';
    el.galaxy.innerHTML = '<div class="gx"></div>';
    el.web.innerHTML = '<div class="wb"></div>';
    html = '';
    for (var a2 = 0; a2 < 22; a2++) {
      html += '<i class="sp sp-asteroid ast" style="bottom:' + Math.round(200 + r() * 9000) + 'px;left:' + Math.round(r() * 100 - 5) + '%;transform:scale(' + (2 + Math.round(r() * 4)) + ');animation-duration:' + (6 + r() * 10).toFixed(1) + 's"></i>';
    }
    el.asteroids.innerHTML = html;
    el.moonland.innerHTML = '<div class="land moon"></div>';
    el.marsland.innerHTML = '<div class="land mars"></div>';
  }

  /* aplica o cenário da era atual: camadas visíveis, cores, planeta */
  var LAYER_EL = { mountains: 'mountains', city: 'far', hills: 'mid', cloudbank: 'cloudbank', trees: 'trees', houses: 'houses', clouds: 'clouds',
    roofs: 'roofs', skyline: 'skyline', seaclouds: 'seaclouds', curve: 'curve', planet: 'planet', nebula: 'nebula', galaxy: 'galaxy', web: 'web',
    asteroids: 'asteroids', moonland: 'moonland', marsland: 'marsland' };
  var curScene = null;
  function scene() { return P.sceneOf(G.mat); }
  function applyScene() {
    var sc = scene();
    curScene = sc;
    Object.keys(LAYER_EL).forEach(function (k) { var e = $(LAYER_EL[k]); if (e) e.hidden = sc.layers.indexOf(k) < 0; });
    var cs = el.scene.style;
    ['--city', '--sky2', '--roof', '--mtn', '--snow', '--hill', '--hill2', '--curve', '--neb1', '--neb2'].forEach(function (v) { cs.removeProperty(v); });
    Object.keys(sc.col || {}).forEach(function (v) { cs.setProperty(v, sc.col[v]); });
    if (sc.planet) {
      var p = sc.planet, pl = el.planet.querySelector('.pl');
      pl.style.cssText = 'left:' + p.x + '%;top:' + p.y + '%;width:' + p.size + 'vmin;height:' + p.size + 'vmin;--pc:' + p.color + ';--pd:' + p.dark + ';--pb:' + (p.bands || 'transparent') + ';--pg:' + (p.glow || 'transparent');
      pl.querySelector('.ring').style.display = p.ring ? 'block' : 'none';
      if (p.ring) pl.style.setProperty('--pr', p.ring);
    }
    lastSkyKey = '';
  }

  /* chamado pela View quando a câmera muda */
  function parallax(base, groundY, U) {
    camBase = base;
    function par(e, f) { e.style.bottom = groundY + 'px'; e.style.transform = 'translate3d(0,' + Math.round(base * f / U) * U + 'px,0)'; }
    par(el.mountains, 0.02); par(el.trees, 0.22); par(el.houses, 0.42); par(el.cloudbank, 0.7);
    par(el.roofs, 0.4); par(el.skyline, 0.1); par(el.seaclouds, 0.03); par(el.curve, 0.01);
    par(el.asteroids, 0.25); par(el.moonland, 0.5); par(el.marsland, 0.5);
  }

  /* ---------------- céu / dia e noite ---------------- */
  function updateSky() {
    var sc = scene();
    var bands = 6;
    var day = resample(sc.sky, bands);
    var ph = sc.day ? dayPhase(day) : { a: day, b: day, k: 0, night: 0, t: 0.25 };
    // quanto mais alto dentro da era, mais profundo o azul do céu
    var frac = Math.min(1, G.layersBuilt() / G.mat.goalLayers);
    var a = resample(ph.a, bands), b = resample(ph.b, bands);
    var cols = a.map(function (c, i) { return mix(mix(c, b[i], ph.k), '#0c1a4a', frac * 0.22 * (1 - i / bands)); });
    var key = cols.join();
    if (key !== lastSkyKey) {
      lastSkyKey = key;
      var stops = cols.map(function (c, i) { return c + ' ' + (i * 100 / bands).toFixed(1) + '% ' + ((i + 1) * 100 / bands).toFixed(1) + '%'; });
      el.sky.style.background = 'linear-gradient(180deg,' + stops.join(',') + ')';
    }
    night = ph.night;
    el.stars.style.opacity = Math.max(Math.min(1, sc.stars || 0), night);
    el.game.style.setProperty('--night', night.toFixed(2));
    el.game.classList.toggle('is-night', night > 0.5);
    // sol e lua em arco (em degraus)
    var hu = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--u'), 10) || 3;
    function arc(e, p, show) {
      e.hidden = !show;
      if (!show) return;
      var x = 6 + p * 80, y = 34 - Math.sin(p * Math.PI) * 24;
      e.style.left = x + '%';
      e.style.top = 'calc(' + y.toFixed(1) + '% - ' + (camBase * 0.01 | 0) + 'px)';
    }
    var t = ph.t;
    arc(el.sun, Math.min(1, t / 0.56), !!sc.sun && t < 0.57);
    arc(el.moon, Math.max(0, Math.min(1, (t - 0.55) / 0.4)), !!sc.day && t >= 0.55 && t < 0.96);
    void hu;
  }

  /* ---------------- vida ao fundo ---------------- */
  function spawn(k) {
    var VW = window.innerWidth;
    var n = k.count ? Math.round(rnd(k.count[0], k.count[1])) : 1;
    var dir = Math.random() < 0.5 ? 1 : -1;
    var dur = rnd(k.dur[0], k.dur[1]);
    var y = rnd(k.y[0], k.y[1]);
    for (var i = 0; i < n; i++) {
      var w = document.createElement('div');
      w.className = 'amb ' + (k.wobble || '') + (dir < 0 ? ' flip' : '');
      w.style.top = 'calc(' + y + '% + ' + (k.count ? (i % 2 ? 8 : -4) * (i + 1) : 0) + 'px)';
      w.innerHTML = (k.contrail ? '<i class="trail"></i>' : '') + '<i class="sp sp-' + k.sprite + '" style="transform:scale(' + (k.scale || 1) + ')' + (dir < 0 ? ' scaleX(-1)' : '') + '"></i>';
      w.style.animationDelay = (-Math.random()).toFixed(2) + 's';
      el.ambient.appendChild(w);
      var from = dir > 0 ? -80 - i * 22 : VW + 80 + i * 22;
      var to = dir > 0 ? VW + 120 : -160;
      var an = w.animate([{ transform: 'translateX(' + from + 'px)' }, { transform: 'translateX(' + to + 'px)' }],
        { duration: dur * 1000, easing: 'steps(' + Math.round(dur * 10) + ')' });
      an.onfinish = function () { this.remove(); }.bind(w);
    }
  }

  function leaves(dir, n) {
    var sc = scene();
    if (!sc.day) return;
    var VW = window.innerWidth;
    for (var i = 0; i < n; i++) {
      var w = document.createElement('div');
      w.className = 'amb leafy';
      w.style.top = rnd(20, 85) + '%';
      w.innerHTML = '<i class="sp sp-leaf"></i>';
      el.ambient.appendChild(w);
      var d = 1200 + Math.random() * 900;
      var sy = rnd(-60, 60);
      var an = w.animate([
        { transform: 'translate(' + (dir > 0 ? -30 : VW + 30) + 'px,0) rotate(0)' },
        { transform: 'translate(' + (VW / 2) + 'px,' + (sy / 2 - 20) + 'px) rotate(' + 180 * dir + 'deg)', offset: 0.5 },
        { transform: 'translate(' + (dir > 0 ? VW + 30 : -30) + 'px,' + sy + 'px) rotate(' + 360 * dir + 'deg)' }
      ], { duration: d, delay: Math.random() * 500, easing: 'steps(14)', fill: 'backwards' });
      an.onfinish = function () { this.remove(); }.bind(w);
    }
  }

  var skyT = 0;
  function tick(dt) {
    skyT -= dt;
    if (skyT <= 0) { skyT = 0.5; updateSky(); }
    var sc = scene();
    KINDS.forEach(function (k) {
      if (!sc.amb || sc.amb.indexOf(k.id) < 0) return;
      if (camBase < k.band[0] || camBase > k.band[1]) return;
      if (k.day && night > 0.5) return;
      if (timers[k.id] == null) timers[k.id] = rnd(1, k.every[1] * 0.5);
      timers[k.id] -= dt;
      if (timers[k.id] <= 0) { timers[k.id] = rnd(k.every[0], k.every[1]); spawn(k); }
    });
  }

  return { init: init, tick: tick, parallax: parallax, get night() { return night; } };
})();
