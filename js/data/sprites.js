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

  /* ---------- cenário vivo ---------- */
  birdlet: { pal: { k: '#29233a' }, fps: 5, frames: [
    ['k...k', '.k.k.', '..k..'],
    ['.....', 'kk.kk', '..k..']] },
  plane: { pal: { w: '#fff1e8', g: '#c2c3c7', b: '#29adff', r: '#ff004d' }, frames: [[
    'r...............',
    'rr..............',
    'rrwwwwwwwwwwww..',
    '.gwbwbwbwbwwwwww',
    '..gggggwwwgggg..',
    '.......gg.......']] },
  balloon: { pal: { r: '#ff004d', y: '#ffec27', o: '#ffa300', b: '#ab5236', k: '#5f574f' }, frames: [[
    '...rryrr...',
    '..rryyyrr..',
    '.rryyryyrr.',
    'rryyrrryyrr',
    'rryyrrryyrr',
    'rryyrrryyrr',
    '.rryyryyrr.',
    '..rryyyrr..',
    '...rryrr...',
    '....k.k....',
    '....k.k....',
    '....bbb....',
    '....bbb....']] },
  butterfly: { pal: { p: '#ff77a8', y: '#ffec27', k: '#1a1423' }, fps: 8, frames: [
    ['pp.pp', 'pykyp', '.pkp.', '..k..'],
    ['.....', '.pkp.', 'ppkpp', '..k..']] },
  leaf: { pal: { o: '#ffa300', b: '#ab5236', g: '#00e436' }, fps: 4, frames: [
    ['og.', '.ob'],
    ['.o.', 'gob'],
    ['.go', 'bo.'],
    ['.b.', 'ogo']] },
  moon: { pal: { w: '#fff1e8', g: '#c2c3c7' }, frames: [[
    '..wwww..',
    '.wwwwgw.',
    'wwgwwwww',
    'wwwwwwww',
    'wwwwwgww',
    'wgwwwwww',
    '.wwwwww.',
    '..wwww..']] },
  ptree: { pal: { g: '#008751', l: '#00e436', d: '#1f5a3c', b: '#5f3a20' }, frames: [[
    '...gggg...',
    '..gglggg..',
    '.ggllgggg.',
    'gglgggggdg',
    'gggggggddg',
    '.ggggdddg.',
    '..gdddgg..',
    '....bb....',
    '....bb....',
    '...bbbb...']] },
  flag: { pal: { r: '#ff004d', d: '#7e2553', w: '#fff1e8', k: '#5f574f' }, fps: 5, frames: [
    ['krrrr.', 'krrrdd', 'krrd..', 'k.....', 'k.....', 'k.....', 'k.....'],
    ['krrr..', 'krrrrd', 'krrdd.', 'k.....', 'k.....', 'k.....', 'k.....'],
    ['krr...', 'krrrr.', 'krrrdd', 'k.....', 'k.....', 'k.....', 'k.....']] },

  /* ---------- retratos dos personagens (12x12) ---------- */
  pt_ademir: { pal: { r: '#ff004d', y: '#ffec27', b: '#5f3a20', p: '#ffccaa', k: '#1a1423', w: '#fff1e8', m: '#ab5236', s: '#e0a080' }, fps: 2, frames: [
    ['..rrrrrrrr..', '..ryyyyyyr..', '..rrrrrrrr..', '.bpppppppppb', '.pkkkpkkkpp.', '.pkwkpkwkpp.', '.pkkkpkkkpp.', '.ppppppppps.', '.ppmmmmmmpp.', '.pppwwwwppp.', '..pppppppp..', '...pppppp...'],
    ['..rrrrrrrr..', '..ryyyyyyr..', '..rrrrrrrr..', '.bpppppppppb', '.pkkkpkkkpp.', '.pkwkpkwkpp.', '.pkkkpkkkpp.', '.ppppppppps.', '.ppmmmmmmpp.', '.ppkkkkkkpp.', '..pppppppp..', '...pppppp...']] },
  pt_vo: { pal: { g: '#c2c3c7', p: '#ffccaa', k: '#5f574f', w: '#fff1e8', r: '#ff77a8', v: '#83769c' }, fps: 2, frames: [
    ['....gggg....', '...gggggg...', '..gggggggg..', '.gppppppppg.', '.pkkpppkkpp.', '.kwwkpkwwkp.', '.pkkpppkkpp.', '.pppppppppp.', '.pppprrpppp.', '..pppppppp..', '.vvvvvvvvvv.', 'vvvwvvvvwvvv'],
    ['....gggg....', '...gggggg...', '..gggggggg..', '.gppppppppg.', '.pkkpppkkpp.', '.kwwkpkwwkp.', '.pkkpppkkpp.', '.pppppppppp.', '.ppprrrrppp.', '..pppppppp..', '.vvvvvvvvvv.', 'vvvwvvvvwvvv']] },
  pt_luca: { pal: { b: '#29adff', h: '#5f3a20', p: '#ffccaa', k: '#1a1423', w: '#fff1e8', f: '#e0705a', o: '#ffa300' }, fps: 2, frames: [
    ['..bbbbbbbb..', '.bbbbbbbbbbb', '.hppppppppb.', '.pppppppppp.', '.pkwppppkwp.', '.pkwppppkwp.', '.pfppppppfp.', '.pppppppppp.', '.pppkkkkppp.', '..pppppppp..', '..oooooooo..', '.oooooooooo.'],
    ['..bbbbbbbb..', '.bbbbbbbbbbb', '.hppppppppb.', '.pppppppppp.', '.pkwppppkwp.', '.pkwppppkwp.', '.pfppppppfp.', '.pppppppppp.', '.ppppkkpppp.', '..pppppppp..', '..oooooooo..', '.oooooooooo.']] },
  pt_inspetor: { pal: { d: '#5f574f', y: '#ffec27', p: '#ffccaa', k: '#1a1423', s: '#e0a080', m: '#29233a', w: '#fff1e8' }, fps: 2, frames: [
    ['..dddddddd..', '.dddddyddddd', 'dddddddddddd', '.pppppppppp.', '.pkkppppkkp.', '.pppppppppp.', '.ppppsppppp.', '.mmmmmmmmmm.', '.pppkkkkppp.', '..pppppppp..', '.dddwddwddd.', 'dddddwwddddd'],
    ['..dddddddd..', '.dddddyddddd', 'dddddddddddd', '.pppppppppp.', '.pkkppppkkp.', '.pppppppppp.', '.ppppsppppp.', '.mmmmmmmmmm.', '.ppppkkpppp.', '..pppppppp..', '.dddwddwddd.', 'dddddwwddddd']] },
  pt_pombo: { pal: { g: '#8a8c94', l: '#c2c3c7', o: '#ffa300', k: '#1a1423', y: '#5f574f', n: '#008751', p: '#7e2553' }, fps: 3, frames: [
    ['....llll....', '...llllll...', '..lllollll..', '..lllklll...', 'yyllllllll..', '..llllllll..', '..nnnnnnnn..', '.nnpnnnnpnn.', '.gggggggggg.', 'gggggggggggg', 'gggggggggggg', 'gggggggggggg'],
    ['....llll....', '...llllll...', '..lllollll..', '..lllklll...', '.yyllllllll.', '..llllllll..', '..nnnnnnnn..', '.nnpnnnnpnn.', '.gggggggggg.', 'gggggggggggg', 'gggggggggggg', 'gggggggggggg']] },
  pt_voz: { pal: { k: '#1a1423', y: '#ffec27', d: '#29233a' }, fps: 1, frames: [
    ['....dddd....', '...dkkkkd...', '..dkkkkkkd..', '..dkykkykd..', '..dkkkkkkd..', '...dkkkkd...', '....dkkd....', '...dkkkkd...', '..dkkkkkkd..', '.dkkkkkkkkd.', 'dkkkkkkkkkkd', 'kkkkkkkkkkkk'],
    ['....dddd....', '...dkkkkd...', '..dkkkkkkd..', '..dkkkkkkd..', '..dkkkkkkd..', '...dkkkkd...', '....dkkd....', '...dkkkkd...', '..dkkkkkkd..', '.dkkkkkkkkd.', 'dkkkkkkkkkkd', 'kkkkkkkkkkkk']] },
  pt_radio: { pal: { b: '#ab5236', w: '#c2c3c7', k: '#1a1423', y: '#ffec27', r: '#ff004d' }, fps: 3, frames: [
    ['.....k......', '......k.....', '.......k....', '.bbbbbbbbbb.', '.bwwwwbyyyb.', '.bwkwkbyryb.', '.bwwwwbyyyb.', '.bwkwkbbbbb.', '.bwwwwbkbkb.', '.bbbbbbbbbb.', '..k......k..', '............'],
    ['.....k......', '......k.....', '.......k....', '.bbbbbbbbbb.', '.bwkwkbyyyb.', '.bwwwwbyryb.', '.bwkwkbyyyb.', '.bwwwwbbbbb.', '.bwkwkbkbkb.', '.bbbbbbbbbb.', '..k......k..', '............']] },
  pt_bilhete: { pal: { w: '#fff1e8', k: '#83769c', r: '#ff004d' }, frames: [
    ['.wwwwwwwww..', '.wkkkkkwww..', '.wwwwwwwww..', '.wkkkkkkkw..', '.wwwwwwwww..', '.wkkkkwwww..', '.wwwwwwwww..', '.wkkkkkkkw..', '.wwwwwwwww..', '.wwwwwwrrw..', '.wwwwwwwww..', '............']] },
  pt_gato: { pal: { k: '#1a1423', o: '#ffa300', d: '#ab5236', p: '#ff77a8', w: '#fff1e8', g: '#00e436' }, fps: 2, frames: [
    ['.k........k.', 'kok......kok', 'kooddddddook', 'kooooooooook', 'kowgooooowgk', 'kowgooooowgk', 'koooookooook', '.koooppooook', '.kooooooook.', '..kooooook..', '...kkkkkk...', '............'],
    ['.k........k.', 'kok......kok', 'kooddddddook', 'kooooooooook', 'kokkoooookkk', 'kooooooooook', 'koooookooook', '.koooppooook', '.kooooooook.', '..kooooook..', '...kkkkkk...', '............']] },

  /* ---------- vida ao fundo: eras altas ---------- */
  heli: { pal: { r: '#ff004d', d: '#7e2553', k: '#1a1423', c: '#c7f0ff', g: '#5f574f' }, fps: 12, frames: [
    ['kkkkkkkkkkkk.....', '.....k...........', '...rrrrr......k..', '..rccrrrrrrrrrrk.', '..rccrrrrdd....k.', '...rrrrr.........', '....k..k.........', '..kkkkkkkk.......'],
    ['....kkkk.........', '.....k...........', '...rrrrr.......k.', '..rccrrrrrrrrrrk.', '..rccrrrrdd...k..', '...rrrrr.........', '....k..k.........', '..kkkkkkkk.......']] },
  comet: { pal: { w: '#fff1e8', y: '#ffec27', o: '#ffa300', c: '#c7f0ff' }, fps: 6, frames: [
    ['o.........', '.oo.......', '..oyy.....', '...yyww...', '....ywww..', '.....www..', '......ww..'],
    ['..........', 'o.........', '.ooy......', '..yyyww...', '....ywww..', '.....www..', '......ww..']] },
  satellite: { pal: { b: '#29adff', d: '#1d2b53', g: '#c2c3c7', y: '#ffec27' }, frames: [[
    'bbbb.......bbbb', 'bdbb..ggg..bdbb', 'bbbbggggggggbbbb', 'bdbb..gyg..bdbb', 'bbbb...g...bbbb']] },
  station: { pal: { b: '#29adff', d: '#1d2b53', g: '#c2c3c7', w: '#fff1e8' }, frames: [[
    'bb.bb.....bb.bb', 'bb.bb..g..bb.bb', 'ggggggggggggggg', 'bb.bb.gwg.bb.bb', 'bb.bb.ggg.bb.bb', '......ggg......']] },
  ufo: { pal: { g: '#c2c3c7', d: '#5f574f', c: '#00e436', y: '#ffec27', w: '#c7f0ff' }, fps: 4, frames: [
    ['....www....', '...wcccw...', '.ggggggggg.', 'gdgygdgygdg', '.ggggggggg.'],
    ['....www....', '...wcccw...', '.ggggggggg.', 'gygdgygdgyg', '.ggggggggg.']] },
  asteroid: { pal: { g: '#8a7a70', d: '#5a4a44', k: '#2a201c', l: '#b0a090' }, frames: [[
    '..gggg..', '.glggdg.', 'gggdkggg', 'gdggggdg', 'ggkgggdg', '.gggdgg.', '..dddd..']] },

  /* ---------- inimigos da era 2 (telhados) ---------- */
  pigeon: { pal: { g: '#8a8c94', l: '#c2c3c7', n: '#008751', p: '#7e2553', o: '#ffa300', k: '#1a1423' }, fps: 8, frames: [
    ['.ll.......', '..lll.....', '...llll.gg', '..gglllgok', '.gnpgggg..', '...gg.....', '...o.o....'],
    ['..........', '..........', '.......gg.', '.lllllggok', 'llnpgggg..', '.llgg.....', '...o.o....']] },
  wasp: { pal: { y: '#ffec27', k: '#1a1423', w: '#c7f0ff' }, fps: 14, frames: [
    ['..ww.ww..', '..wwkww..', 'kykykyk..', 'ykykykyk.', 'kykykyk.k', '..k..k...'],
    ['.........', '.........', 'kykykykww', 'ykykykykw', 'kykykyk.k', '..k..k...']] },
  paperplane: { pal: { w: '#fff1e8', g: '#c2c3c7', k: '#83769c' }, fps: 4, frames: [
    ['w.........', 'ww........', 'wwww......', 'wwwwwwww..', '.ggggkkwww', '..gkk.....'],
    ['..........', 'w.........', 'www.......', 'wwwwwwww..', '.ggggkkwww', '..gkk.....']] },
  toydrone: { pal: { g: '#5f574f', l: '#c2c3c7', r: '#ff004d', k: '#1a1423', b: '#29adff' }, fps: 14, frames: [
    ['kkk.....kkk', '.k.......k.', '.lllllllll.', '..lgbbbgl..', '..lllrlll..', '...k...k...'],
    ['.kkk...kkk.', '.k.......k.', '.lllllllll.', '..lgbbbgl..', '..lllrlll..', '...k...k...']] },

  /* ---------- ícones de HUD / ramos (7x7) ---------- */
  ico_match: { pal: { r: '#ff004d', d: '#7e2553', w: '#e8c27a', s: '#ab5236' }, frames: [[
    '.....rr', '....rdr', '...ws..', '..ws...', '.ws....', 'ws.....', 's......']] },
  ico_coin: { pal: { y: '#ffec27', o: '#ffa300', k: '#ab5236', w: '#fff1e8' }, fps: 5, frames: [
    ['.yyyyy.', 'yyoooyy', 'ywyyyky', 'ywyyyky', 'yoyyyky', 'yykkkyy', '.yyyyy.'],
    ['..yyy..', '.yoooy.', '.wyyyk.', '.wyyyk.', '.oyyyk.', '.ykkky.', '..yyy..'],
    ['...y...', '...o...', '...y...', '...w...', '...y...', '...k...', '...y...'],
    ['..yyy..', '.yoooy.', '.kyyyw.', '.kyyyw.', '.kyyyo.', '.ykkky.', '..yyy..']] },
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
  ico_note: { pal: { w: '#c2c3c7', y: '#ffec27' }, frames: [[
    '...wwww', '...w..w', '...w..w', '...w..w', '.yyw.yy', 'yyyyyyy', '.yy..yy']] },
  ico_star: { pal: { y: '#ffec27', o: '#ffa300' }, frames: [[
    '...y...', '..yyy..', 'yyyyyyy', '.yyyyy.', '.yyoyy.', 'yyo.oyy', 'o.....o']] },
  ico_book: { pal: { b: '#ab5236', w: '#fff1e8', k: '#5f3a20' }, frames: [[
    'bbbbbbb', 'bwwbwwb', 'bwwbwwb', 'bwwbwwb', 'bwwbwwb', 'bbbbbbb', 'k.....k']] },
  ico_q: { pal: { y: '#ffec27', k: '#ab5236' }, frames: [[
    '.yyyyy.', 'yy...yy', '.....yy', '...yyy.', '...yy..', '.......', '...yy..']] },
  ico_zin: { pal: { w: '#fff1e8' }, frames: [['.wwww..', 'w....w.', 'w.ww.w.', 'w....w.', '.wwww..', '.....ww', '......w']] },
  ico_zout: { pal: { w: '#fff1e8' }, frames: [['.wwww..', 'w....w.', 'w....w.', 'w....w.', '.wwww..', '.....ww', '......w']] },
  ico_close: { pal: { w: '#fff1e8' }, frames: [[
    'w.....w', '.w...w.', '..w.w..', '...w...', '..w.w..', '.w...w.', 'w.....w']] },
  ico_heart: { pal: { r: '#ff004d', w: '#fff1e8', d: '#7e2553' }, frames: [[
    '.rr.rr.', 'rwrrrrr', 'rrrrrrr', 'rrrrrrd', '.rrrrd.', '..rrd..', '...d...']] },
  ico_flag: { pal: { r: '#ff004d', w: '#c2c3c7' }, frames: [[
    'wrrrr..', 'wrrrrrr', 'wrrrrr.', 'w......', 'w......', 'w......', 'w......']] }
};

/* ---------------- visitantes e ajudantes ---------------- */
(function () {
  var S = PALIT.SPRITES;
  var head = ['...hhh...', '..hhhhh..', '..hsssk..', '..sssss..', '...sss...'];
  var walkA = ['..ttttt..', '.ttttttt.', '.s.ttt.s.', '...ttt...', '...ppp...', '...p.p...', '..p...p..', '..p...p..', '.kk...kk.'];
  var walkB = ['..ttttt..', '.ttttttt.', '..sttts..', '...ttt...', '...ppp...', '...p.p...', '...p.p...', '...p.p...', '..kk.kk..'];
  var look = ['..ttttt..', 's.ttttt.s', '.sttttts.', '...ttt...', '...ppp...', '...p.p...', '...p.p...', '...p.p...', '..kk.kk..'];
  function person(pal) {
    return { pal: pal, fps: 6, frames: [head.concat(walkA), head.concat(walkB)] };
  }
  function cheer(pal) { return { pal: pal, fps: 4, frames: [head.concat(look), ['.........'].concat(head.slice(0, 4), look.slice(0, 1), ['s.ttttt.s'], look.slice(2))] }; }
  var people = [
    { h: '#5f3a20', s: '#ffccaa', k: '#1a1423', t: '#ff004d', p: '#1d2b53' },
    { h: '#1a1423', s: '#e0a080', k: '#1a1423', t: '#29adff', p: '#5f574f' },
    { h: '#ffec27', s: '#ffccaa', k: '#1a1423', t: '#00e436', p: '#ab5236' },
    { h: '#c2c3c7', s: '#ffccaa', k: '#1a1423', t: '#83769c', p: '#5f574f' },
    { h: '#ab5236', s: '#ab7a5a', k: '#1a1423', t: '#ffa300', p: '#1d2b53' },
    { h: '#ff77a8', s: '#ffccaa', k: '#1a1423', t: '#fff1e8', p: '#29adff' }
  ];
  people.forEach(function (pal, i) { S['vis_p' + i] = person(pal); S['vis_p' + i + 'c'] = cheer(pal); });
  var astro = { h: '#fff1e8', s: '#1d2b53', k: '#c7f0ff', t: '#fff1e8', p: '#c2c3c7' };
  S.vis_astro = person(astro); S.vis_astroc = cheer(astro);
  var alien = { h: '#00e436', s: '#00e436', k: '#1a1423', t: '#83769c', p: '#008751' };
  S.vis_alien = person(alien); S.vis_alienc = cheer(alien);

  /* personagens da história (aparecem na base durante as conversas) */
  S.npc_ademir = cheer({ h: '#ff004d', s: '#ffccaa', k: '#1a1423', t: '#ffec27', p: '#5f3a20' });
  S.npc_vo = cheer({ h: '#c2c3c7', s: '#ffccaa', k: '#5f574f', t: '#83769c', p: '#ff77a8' });
  S.npc_luca = cheer({ h: '#5f3a20', s: '#ffccaa', k: '#1a1423', t: '#29adff', p: '#ffa300' });
  S.npc_inspetor = cheer({ h: '#29233a', s: '#e0a080', k: '#1a1423', t: '#5f574f', p: '#29233a' });
  S.vis_balloon = { pal: { r: '#ff004d', y: '#ffec27', w: '#fff1e8', k: '#5f574f', b: '#ab5236', d: '#7e2553', s: '#ffccaa', h: '#5f3a20' }, fps: 2, frames: [[
    '....rrwrr....',
    '..rrrywyrrr..',
    '.rrryywyyrrr.',
    'rrrryywyyrrrd',
    'rrrryywyyrrrd',
    'rrrryywyyrrrd',
    '.rrryywyyrrd.',
    '..rrrywyrrd..',
    '...rrrwrrd...',
    '....k...k....',
    '....k.h.k....',
    '....k.s.k....',
    '....bbbbb....',
    '....bbbbb....',
    '.....bbb.....'], [
    '....rrwrr....',
    '..rrrywyrrr..',
    '.rrryywyyrrr.',
    'rrrryywyyrrrd',
    'rrrryywyyrrrd',
    'rrrryywyyrrrd',
    '.rrryywyyrrd.',
    '..rrrywyrrd..',
    '...rrrwrrd...',
    '....k...k....',
    '....kh..k....',
    '....ks.sk....',
    '....bbbbb....',
    '....bbbbb....',
    '.....bbb.....']] };
  S.vis_jet = { pal: { w: '#fff1e8', g: '#c2c3c7', v: '#1d2b53', c: '#c7f0ff', o: '#ffa300', y: '#ffec27', r: '#ff004d' }, fps: 10, frames: [[
    '..www....', '.wwwww...', '.wvvcw...', '.wvvvw...', 'gg.www...', 'ggwwwww..', 'gg.www.w.', 'gg.www...', '...g.g...', '...g.g...', '.o.......', '.y.......'], [
    '..www....', '.wwwww...', '.wvvcw...', '.wvvvw...', 'gg.www...', 'ggwwwww..', 'gg.www.w.', 'gg.www...', '...g.g...', '...g.g...', '.y.......', 'oro......']] };

  /* ajudantes: [defensor, consertador] por era */
  S.hlp_ant = { pal: { k: '#1a1423', b: '#7e2553', g: '#008751', l: '#00e436', w: '#fff1e8' }, fps: 6, frames: [[
    '...ggg..', '..gglgg.', '...kwk..', 'bb.kkk..', 'bbbbbbk.', '.k.k.k..', 'k..k..k.'], [
    '...ggg..', '..gglgg.', '...kwk..', 'bb.kkk..', 'bbbbbbk.', 'k.k.k...', '.k..k.k.']] };
  S.hlp_beetle = { pal: { k: '#1a1423', o: '#ffa300', y: '#ffec27', b: '#ab5236', g: '#c2c3c7', w: '#fff1e8' }, fps: 5, frames: [[
    '.....gg.', '..yy.gb.', '.yyyy.b.', 'kwkyy.b.', 'koooook.', 'koobook.', '.kooook.', 'k.k.k.k.'], [
    '........', '..yy.gg.', '.yyyy.b.', 'kwkyy.b.', 'koooook.', 'koobook.', '.kooook.', '.k.k.k.k']] };
  S.hlp_cricket = { pal: { k: '#1a1423', g: '#008751', l: '#00e436', r: '#ff004d', w: '#fff1e8' }, fps: 6, frames: [[
    '..rrr...', '.rrrrr..', '..lwl...', '.lllll..', 'gggggggk', '.k...k..', 'k.....k.'], [
    '..rrr...', '.rrrrr..', '..lwl...', '.lllll..', 'gggggggk', '..k.k...', '.k...k..']] };
  S.hlp_ladybug = { pal: { k: '#1a1423', r: '#ff004d', w: '#fff1e8', y: '#ffec27', g: '#c2c3c7' }, fps: 5, frames: [[
    '......g.', '..yyy.g.', '.kwk..g.', 'krrkrrk.', 'krkrrkk.', 'krrkrrk.', '.kkkkk..', 'k.k.k.k.'], [
    '.....g..', '..yyy.g.', '.kwk..g.', 'krrkrrk.', 'krkrrkk.', 'krrkrrk.', '.kkkkk..', '.k.k.k.k']] };
  S.hlp_bot = { pal: { g: '#c2c3c7', d: '#5f574f', r: '#ff004d', b: '#29adff' }, fps: 4, frames: [[
    '...r....', '..ggg...', '.gbgbg..', '.ggggg..', 'dgdddgd.', '.g...g..', '.d...d..'], [
    '...r....', '..ggg...', '.gbgbg..', '.ggggg..', 'dgdddgd.', '..g.g...', '..d.d...']] };
  S.hlp_drone = { pal: { g: '#c2c3c7', d: '#5f574f', y: '#ffec27', k: '#1a1423' }, fps: 10, frames: [[
    'ggg..ggg', '.d....d.', '.dyyyyd.', '..ykky..', '..yyyy..', '...dd...', '...g....'], [
    '.g....g.', '.d....d.', '.dyyyyd.', '..ykky..', '..yyyy..', '...dd...', '....g...']] };
})();
