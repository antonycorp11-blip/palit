/* =========================================================
   SPRITES — pixel art em ASCII, compilada para CSS box-shadow.
   Cada sprite: pal (char → cor), frames: [linhas...], fps opcional.
   '.' = transparente.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.SPRITES = {
  fly: {
    pal: { k: '#1a1423', w: '#c7e8ff', r: '#ff004d' },
    fps: 12,
    frames: [
      ['.ww.ww.',
       '.wwkww.',
       '..kkk..',
       '.rkkkr.',
       '..kkk..',
       '..k.k..'],
      ['.......',
       '.......',
       'wwkkkww',
       'wrkkkrw',
       '..kkk..',
       '..k.k..']
    ]
  },
  ant: {
    pal: { k: '#1a1423', b: '#5f1f1f' },
    fps: 6,
    frames: [
      ['k.....k',
       '.k...k.',
       'bb.bbbk',
       'bbbbbbk',
       '.k.k.k.',
       'k..k..k'],
      ['k.....k',
       '.k...k.',
       'bb.bbbk',
       'bbbbbbk',
       'k.k.k..',
       '.k..k.k']
    ]
  },
  beetle: {
    pal: { k: '#1a1423', g: '#008751', l: '#00e436', s: '#c2c3c7' },
    fps: 4,
    frames: [
      ['..k..k..',
       '...kk...',
       '.kgggk..',
       'kgllggk.',
       'kgglggk.',
       'kgggggk.',
       '.kgggk..',
       'k.k.k.k.'],
      ['..k..k..',
       '...kk...',
       '.kgggk..',
       'kgllggk.',
       'kgglggk.',
       'kgggggk.',
       '.kgggk..',
       '.k.k.k.k']
    ]
  },
  gecko: {
    pal: { k: '#1a1423', g: '#7fbf3f', d: '#3f7f1f', e: '#ffec27' },
    fps: 5,
    frames: [
      ['k...........',
       '.kggg....k..',
       'gegdggggggg.',
       '.gggdgdgg..g',
       'k....k.k..g.'],
      ['.k..........',
       '.kggg...k...',
       'gegdggggggg.',
       '.gggdgdgg..g',
       '.k...k..k.g.']
    ]
  },
  bird: {
    pal: { k: '#1a1423', b: '#5f574f', w: '#c2c3c7', o: '#ffa300', e: '#fff1e8' },
    fps: 8,
    frames: [
      ['.bb.......',
       '..bb......',
       '...bbb.bb.',
       '..bbbbbeko',
       '.bwwwbbb..',
       '...ww.....',
       '...o.o....'],
      ['..........',
       '..........',
       '.......bb.',
       '.bbbbbbeko',
       'bbwwwbbb..',
       '.bbww.....',
       '...o.o....']
    ]
  },
  crow: {
    pal: { k: '#1a1423', d: '#29233a', g: '#5f574f', e: '#ff004d' },
    fps: 7,
    frames: [
      ['.dd.........',
       '..ddd.......',
       '...dddd..dd.',
       '..ddddddddek',
       '.ddgdddddd.k',
       'ddd.ggd.....',
       '....k.k.....'],
      ['............',
       '............',
       '.........dd.',
       '.ddddddddddek',
       'ddddgddddd.k',
       '.dddggd.....',
       '....k.k.....']
    ]
  },
  cat: {
    pal: { k: '#1a1423', o: '#ffa300', d: '#ab5236', p: '#ff77a8', w: '#fff1e8', g: '#00e436' },
    fps: 3,
    frames: [
      ['.k......k.',
       'kok....kok',
       'koodddoook',
       'kooooooook',
       'kowgoowgok',
       'kooookoook',
       '.koopppok.',
       '..kooook..',
       '...kkkk...'],
      ['.k......k.',
       'kok....kok',
       'koodddoook',
       'kooooooook',
       'kokkookkok',
       'kooookoook',
       '.koopppok.',
       '..kooook..',
       '...kkkk...']
    ]
  },
  ball: {
    pal: { k: '#1a1423', r: '#ff004d', w: '#fff1e8', d: '#7e2553' },
    fps: 8,
    frames: [
      ['.kkkk.',
       'krrwwk',
       'krwwrk',
       'kwwrrk',
       'kwrrdk',
       '.kkkk.'],
      ['.kkkk.',
       'kwrrrk',
       'kwwrrk',
       'krwwrk',
       'krrwdk',
       '.kkkk.']
    ]
  },
  kite: {
    pal: { k: '#1a1423', r: '#ff004d', y: '#ffec27', b: '#29adff', t: '#fff1e8' },
    fps: 4,
    frames: [
      ['...k...',
       '..kyk..',
       '.kyyrk.',
       'kyyrrrk',
       '.kbbrk.',
       '..kbk..',
       '...k...',
       '...t...',
       '..t....',
       '...t...',
       '....t..'],
      ['...k...',
       '..kyk..',
       '.kyyrk.',
       'kyyrrrk',
       '.kbbrk.',
       '..kbk..',
       '...k...',
       '....t..',
       '.....t.',
       '....t..',
       '...t...']
    ]
  },
  lens: {
    pal: { k: '#1a1423', c: '#c7f0ff', w: '#fff1e8', b: '#ab5236', g: '#5f574f' },
    fps: 3,
    frames: [
      ['.kkkk....',
       'kcwcck...',
       'kwccck...',
       'kcccck...',
       '.kkkkg...',
       '.....gb..',
       '......bb.',
       '.......bb'],
      ['.kkkk....',
       'kccwck...',
       'kcccwk...',
       'kcccck...',
       '.kkkkg...',
       '.....gb..',
       '......bb.',
       '.......bb']
    ]
  },
  hail: {
    pal: { w: '#fff1e8', c: '#c7f0ff', k: '#83769c' },
    frames: [
      ['.wc.',
       'wwcc',
       'wcck',
       '.ck.']
    ]
  },
  fire: {
    pal: { r: '#ff004d', o: '#ffa300', y: '#ffec27' },
    fps: 8,
    frames: [
      ['..y..',
       '.yoy.',
       '.oyo.',
       'roor.',
       '.rr..'],
      ['.y...',
       '.oy..',
       'yooy.',
       '.roo.',
       '..rr.']
    ]
  },
  cloud: {
    pal: { w: '#fff1e8', s: '#c2c3c7' },
    frames: [
      ['.....wwww.......',
       '...wwwwwwww.ww..',
       '..wwwwwwwwwwwwww',
       'wwwwwwwwwwwwwwww',
       'sswwwwwwwwwwwwss',
       '..ssssssssssss..']
    ]
  },
  sun: {
    pal: { y: '#ffec27', o: '#ffa300' },
    frames: [
      ['...yyyy...',
       '.yyyyyyyy.',
       '.yyyyyyyy.',
       'yyyyyyyyyy',
       'yyyyyyyyyo',
       'yyyyyyyyyo',
       'yyyyyyyyoo',
       '.yyyyyyoo.',
       '.yyyoooo..',
       '...oooo...']
    ]
  },
  flower: {
    pal: { p: '#ff77a8', y: '#ffec27', g: '#008751' },
    frames: [['.p.', 'pyp', '.p.', '.g.', 'gg.']]
  },
  tuft: {
    pal: { g: '#00e436', d: '#008751' },
    frames: [['g...g', 'g.g.d', 'dgdgd']]
  },

  /* ---------- ícones de HUD / ramos (7x7) ---------- */
  ico_match: { pal: { r: '#ff004d', d: '#7e2553', w: '#e8c27a', s: '#ab5236' }, frames: [[
    '.....rr', '....rdr', '...ws..', '..ws...', '.ws....', 'ws.....', 's......']] },
  ico_coin: { pal: { y: '#ffec27', o: '#ffa300', k: '#ab5236' }, frames: [[
    '.yyyyy.', 'yyoooyy', 'yoyyyky', 'yoyyyky', 'yoyyyky', 'yykkkyy', '.yyyyy.']] },
  ico_box: { pal: { b: '#ab5236', d: '#5f1f1f', y: '#ffec27', r: '#ff004d' }, frames: [[
    '.......', 'rrrrrrr', 'byyyyyb', 'byyyyyb', 'bbbbbbb', 'bdddddb', 'bbbbbbb']] },
  ico_tree: { pal: { g: '#00e436', d: '#008751', b: '#ab5236', y: '#ffec27' }, frames: [[
    '...y...', '..ggg..', '.gdgdg.', 'ggggggg', '.gdgdg.', '...b...', '..bbb..']] },
  ico_gear: { pal: { o: '#ffa300', k: '#1a1423' }, frames: [[
    '..o.o..', '.ooooo.', 'oookooo', '.okkko.', 'oookooo', '.ooooo.', '..o.o..']] },
  ico_bolt: { pal: { y: '#ffec27', o: '#ffa300' }, frames: [[
    '....yy.', '...yy..', '..yy...', '.yyyyy.', '...yy..', '..yo...', '.yo....']] },
  ico_layers: { pal: { g: '#00e436', d: '#008751' }, frames: [[
    'ggggggg', 'd.....d', 'ggggggg', 'd.....d', 'ggggggg', 'd.....d', 'ggggggg']] },
  ico_shield: { pal: { b: '#29adff', d: '#1d2b53', w: '#c7f0ff' }, frames: [[
    'bbbbbbb', 'bwwbbbb', 'bwbbbdb', 'bbbbbdb', '.bbbdb.', '..bdb..', '...b...']] },
  ico_wrench: { pal: { p: '#ff77a8', d: '#7e2553' }, frames: [[
    '.p...p.', '.pp.pp.', '..ppp..', '...p...', '...p...', '..ddd..', '..ddd..']] },
  ico_fist: { pal: { r: '#ff004d', d: '#7e2553', w: '#fff1e8' }, frames: [[
    '.rrrr..', 'rwrwrr.', 'rrrrrrr', 'rrrrrrd', '.rrrrd.', '.rrrr..', '.dddd..']] },
  ico_robot: { pal: { g: '#c2c3c7', d: '#5f574f', r: '#ff004d', b: '#29adff' }, frames: [[
    '...r...', '.ggggg.', '.gbgbg.', '.ggggg.', 'ddgggdd', '.gdddg.', '.g...g.']] },
  ico_wind: { pal: { w: '#fff1e8', c: '#c7f0ff' }, frames: [[
    '.....w.', 'wwwww.w', '......w', 'cccccc.', '.....c.', 'wwww..c', '....ww.']] },
  ico_warn: { pal: { y: '#ffec27', k: '#1a1423' }, frames: [[
    '...y...', '..yky..', '..yky..', '.yykyy.', '.yyyyy.', 'yyykyyy', 'yyyyyyy']] },
  ico_up: { pal: { w: '#fff1e8' }, frames: [[
    '...w...', '..www..', '.wwwww.', 'www.www', '...w...', '...w...', '...w...']] },
  ico_down: { pal: { r: '#ff77a8' }, frames: [[
    '...r...', '...r...', '...r...', 'rrr.rrr', '.rrrrr.', '..rrr..', '...r...']] },
  ico_menu: { pal: { w: '#fff1e8' }, frames: [[
    '.......', 'wwwwwww', '.......', 'wwwwwww', '.......', 'wwwwwww', '.......']] },
  ico_sound: { pal: { w: '#fff1e8', y: '#ffec27' }, frames: [[
    '...w...', '..ww.y.', 'www.y.y', 'www.y.y', 'www.y.y', '..ww.y.', '...w...']] },
  ico_mute: { pal: { w: '#c2c3c7', r: '#ff004d' }, frames: [[
    '...w...', '..ww...', 'wwwr.r.', 'www.r..', 'wwwr.r.', '..ww...', '...w...']] },
  ico_close: { pal: { w: '#fff1e8' }, frames: [[
    'w.....w', '.w...w.', '..w.w..', '...w...', '..w.w..', '.w...w.', 'w.....w']] },
  ico_heart: { pal: { r: '#ff004d', w: '#fff1e8', d: '#7e2553' }, frames: [[
    '.rr.rr.', 'rwrrrrr', 'rrrrrrr', 'rrrrrrd', '.rrrrd.', '..rrd..', '...d...']] },
  ico_flag: { pal: { r: '#ff004d', w: '#c2c3c7' }, frames: [[
    'wrrrr..', 'wrrrrrr', 'wrrrrr.', 'w......', 'w......', 'w......', 'w......']] }
};
