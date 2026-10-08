/* =========================================================
   ARTE DOS PALITOS — por material.
   A arte do fósforo vem do sprite sheet enviado (paleta e
   cabeça extraídas da imagem). As diagonais seguem o mesmo
   padrão de degrau da imagem: claro → corpo → corpo → sombra.
   Coordenadas: x para a direita, "up" para cima; o corpo do
   palito ocupa up 0..2 (3 pixels de espessura).
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.STICKS = {
  fosforo: {
    depth: 24,                               // degraus da diagonal (profundidade)
    pal: { L: '#f6d69d', B: '#e4bb73', D: '#a4743f', R: '#c4261a', S: '#6a0e0c', H: '#f06c5a' },
    body: ['L', 'B', 'D'],                   // de cima para baixo (palito horizontal)
    diag: ['L', 'B', 'B', 'D'],              // da esquerda para a direita (cada degrau)
    head: [                                  // 5x5, de cima para baixo
      '.RRR.',
      'RHRRR',
      'RRRRS',
      'SRRSS',
      '.SSS.'
    ]
  }
};

/* Eras 2–40: arte extraída das sprite sheets (horizontal, de cima para baixo).
   As diagonais e o espelhamento são gerados a partir desta grade. */
Object.assign(PALIT.STICKS, {
  dente: { pal: {h: "#997943", d: "#dbc899", e: "#d6c49a", c: "#ecd08e", b: "#ecd18f", a: "#edd290", g: "#a7874e"},
    grid: [
      '.hddeedeeeeeeeeeeedeeeedeeedh.',
      'hccbcaabcbcbabccababaabccbcbch',
      '.hggggggggggggggggggggggggggh.'
    ] },
  churrasco: { pal: {h: "#946f39", e: "#be9958", b: "#d7c291", a: "#d9c492", d: "#d6b46d", c: "#d8b771", g: "#ae8648", f: "#af8749"},
    grid: [
      '..hebbaaabaabebabaaabaabababbbaadabaaaaabbdh',
      'hccddddddedddccddeeddddddccddccccdgdddccddde',
      '..hhgfggfggggffffggfgfffgfgggfffffggfgffgggh'
    ] },
  bambu: { pal: {e: "#556826", d: "#657a2e", a: "#bed36f", f: "#4b5d22", g: "#40511d", c: "#839a40", h: "#3e4d1c"},
    grid: [
      '.eeeeeedeeeeeeeeeedeeeeeeeeeedeeeeeeeeeeeee.',
      'eaaaaaaeaaaaaaaaaaeaaaaaaaaaadeaaaaaaaaaafae',
      'gccccccfccccccccccfhcccccccccfgccccccccccgcg',
      '.hhgghgghhggggggggghgggggggggfhgggggggggghg.'
    ] },
  canico: { pal: {c: "#88703d", f: "#6e592d", h: "#69451f", e: "#846d3b", g: "#6c572d", b: "#927c48", a: "#a48f58", d: "#85703f"},
    grid: [
      '.cccffhcceccecccccehfhccccccccecceghccc.',
      'baaahhaaaaaaaaaaaaahhaaaaaaaaaaaahhaaaaa',
      'dcddeheddcdddddddedehddddddddddddchecddb',
      '.ggghhhgggggggggggghhhggggggggggghhhggg.'
    ] },
  vassoura: { pal: {e: "#955b25", g: "#614226", f: "#794313", a: "#eca249", h: "#6d3a0d", c: "#b56016", b: "#cb8a44"},
    grid: [
      'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeggg..',
      'faaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaagaagg',
      'hccccccccccccccccccccccccccccccccccccccccgbbgg',
      'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhggg..'
    ] },
  galho: { pal: {f: "#613512", g: "#552c0e", c: "#a9602d", a: "#d18a4c", b: "#b76e36", d: "#965426", e: "#703b17", h: "#391b07"},
    grid: [
      '............fg..............................',
      '...........gc...............................',
      '.ffaaaaafffabcdffffffffaaaabfffffffffffffff.',
      'faaccbbcbaabccbbaebbacabcccccaaadcbbcaabbcbd',
      '.eddccdddcccddddceedcddcddddddcdhgdcccccdddh',
      '..hhhhhhhfffffffffffffhhhhhhhhfeefeehhffhhh.'
    ] },
  tora: { pal: {f: "#5b2b0e", g: "#4e250b", a: "#dc9856", b: "#af6530", e: "#733816", h: "#421e09", c: "#9a5326", d: "#84441c"},
    grid: [
      '...ffffffffgffgggffggggggggfggffgggfgggggggggfg.',
      '.aaaaaabbbaaaabbbbbbaaaaabbaaaabbaaaaaaabbbbeaah',
      'gcbbdccbccbbbbbbbbbbcdbbbbbbcccddddbbbcbbbbbaaae',
      'gbbbbccccccccddddcccccddddbbccccdcbcccdddcdgaabd',
      'geeddddddeffeedcddddeeddccfeefddddeeeeeedcchaaad',
      '.ffeeeeeffeedffeeefffeeffffeffeffeeeefffeeefaaah',
      '..ghhhhhhhhhhhhghhhhhhhhhhhghhhhghhhghhhhhhghdh.'
    ] },
  viga: { pal: {e: "#884f20", f: "#75431b", h: "#5f3312", a: "#cf8f48", b: "#cd8b46", c: "#bb7a3c", g: "#6e401b", d: "#b8773a"},
    grid: [
      '.efefhhfeeffffffffffffffefffffffffffffeeehhfffff',
      'faaahhaaabaabaaaaaaaaabbbbabbbaabbabaabbhhaaaaah',
      'fccbghbdcbbbbcdcdcdddbbbbbabbbbddddddcddhhbcdcch',
      'hbbbaacddddddcdddddcdcdddcdcccddddddddddbacdbbdh',
      'hgggggggggggggggggggggggggggggggggggggggggggggh.'
    ] },
  laminada: { pal: {e: "#855524", a: "#e1ad5d", g: "#5a3a18", f: "#805729", b: "#8a5f2d", c: "#895d2b", d: "#845b2b", h: "#503316"},
    grid: [
      '.eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      'eaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag',
      'fbbbbbbbbbbbbbbbbbcccbcbccccccbbbcbbbbcccbbbcbbg',
      'gbbbbbbbbcbbbcbbcccbdbcbdbdbbcdbbbbbbccbbbbbbbdg',
      'gdfffddffdfddffffdffffffffffffffffddfffffddfffcg',
      'ghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh.'
    ] },
  papel: { pal: {g: "#7c715d", f: "#837967", h: "#6f6553", a: "#fdfcfd", d: "#d4cbb9", c: "#e1dacc", e: "#9b9487", b: "#ebe5d9"},
    grid: [
      '.ggfgggggggggggggggggggggggggggggggggggggggfh.',
      'haaaaaaaaaadaaaaaaaaaaadcaaaaaaaaaaaadaaaaadhe',
      'fbbbbbbbbbdbbbbbbbbbbbdbbbbbbbbbbbbdbbbbbbbchd',
      'hddddddddedddddddddddeddddddddddddedddddddddhe',
      '.hffffffggffffffffffggfffffffffffggffffffffhf.'
    ] },
  bambu_carbo: { pal: {g: "#322820", h: "#211915", a: "#997451", b: "#826954", c: "#674832", e: "#453123", d: "#544437", f: "#3c3027"},
    grid: [
      '.....gg.........gg..........gh..........gg....',
      'gababcbbbabbbbaaegbbbbbbbbbbbbbabbbbbbaadfabag',
      'gcdddddddcddddddcgdcddddddddddcdddddddccfgddcg',
      'hffffdefffffefffghffffffafffdffaefffffffghffeh',
      '.....gh....eaehhgg.h....ehhhghhch...h...hg....'
    ] },
  aluminio: { pal: {g: "#7d838e", f: "#7e8490", e: "#808693", h: "#656b76", a: "#e6eaee", d: "#9197a3", c: "#caced4"},
    grid: [
      '...gfeegfegfgffgegffggffffggggefggggggfggggggfgh',
      'gaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaah',
      'hddcccchcccchcccccgcccchcccchcccchcccgcccchcccch',
      '..heeeeeeeeeeeeeeefeefefeeeeeeeeefefefeeeefeeeeh'
    ] },
  aco: { pal: {h: "#3c4350", g: "#424957", b: "#818c9c", c: "#6c7787", f: "#4e5866", d: "#5d6776", e: "#55606e", a: "#a9b8c8"},
    grid: [
      '.hhhhhhhhhhhhhhgghghhghhgggghghghhhhhhhhgghhhhgh',
      'gbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbch',
      '.hffffffffffffffffffffffffffffffffffffffffffffh.',
      '.hdebfddddddecddddedcfddddddbgdddddbfddddddbedh.',
      '.baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaah',
      'hddddddddddddddddddddddddddddddddddddddddddddddh'
    ] },
  concreto: { pal: {g: "#7e7367", f: "#85796d", h: "#7b523e", a: "#d8c9bc", b: "#b4a799", d: "#a6998b", e: "#93877a", c: "#aea193"},
    grid: [
      '....ggffgfffggggffgfggfggffggggggfgggggfggfgggh...',
      'hhhgaabaaadaaaaaadaaaaaabaaaaabbaaaaeaaaaabaaahhhh',
      '...gacbceccccecfccccccccccceccbcccfcceccdcccebh...',
      'hhhhccfcccdcccccfccccccccccccfcccfccccfcccccfbhhhh',
      '...heeeegeeeeeeeeeefeeeeeeeeeeefeeegeeeeegeegeh...'
    ] },
  titanio: { pal: {e: "#808b9f", g: "#565f6f", a: "#c9d9fb", h: "#4e5665", c: "#929eb6"},
    grid: [
      '..eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeg.',
      'gaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag',
      'hecccccccccccccccccccccccccccccccccccccccccccceh',
      '.hggggggggggggggggggggggggggggggggggggggggggggh.'
    ] },
  carbono: { pal: {g: "#1d1a21", e: "#252228", f: "#211f25", h: "#1a171d", a: "#625e6a", c: "#413e48", b: "#4f4b56", d: "#302d36"},
    grid: [
      '..gefeeeeefefeefefeeffefeeefeffefefeefeefeeefe..',
      'haacbaaaaaaaabababababaaaaabbacababababbbaabacaf',
      'hddedccccdcdcdcdcdcdcdccccdcdcdcdcdcdcdcccbdcdch',
      '..hgggghghggggggfgfggggghghggggfgfggggghhgggfh..'
    ] },
  vidro: { pal: {g: "#51a1d7", h: "#418dc8", a: "#ceeffc", b: "#a5dff7", e: "#66bfea", d: "#67c0eb", f: "#70bee6", c: "#70c0e8"},
    grid: [
      '...ghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh..',
      'haabbbbabbaaaabbbbbbbbbbbbbbbbbbaaaabbbbbbbbbbah',
      'heeeddddddedddddddddeddddddeeddeeeeeddeeeeeedeeh',
      '..hhffffffffffcfffffffffccfffffffffffffffffffhh.'
    ] },
  ceramica: { pal: {g: "#a08a75", h: "#98816d", b: "#f4ebdf", a: "#fcfaf5", d: "#d9c5b0", e: "#c2ac97", c: "#e4d0bc"},
    grid: [
      '...ggggggggggggggggggggggggggggggggggggggggggg..',
      'hbbbbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbh',
      'hddecccccccccccccccccccccccccccccccccccccccccedh',
      '..hgeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeehh.'
    ] },
  basalto: { pal: {e: "#302d31", f: "#2c292d", h: "#242124", b: "#615b62", a: "#836c5c", g: "#272427", d: "#443f46", c: "#4e4648"},
    grid: [
      '...eeeeeeeffeeffeefeeeefeeeeeeefeeeeeefeeefefeef..',
      'hbababbbbbbbbbbbbbbbbbbbbabbbbbbbbabbbbbbbbbbabaag',
      'hdcedccdccdcddcdcdddccecdcacccaacdddccdddddccdcddh',
      '...fgghhgggggghghhgghhghgghfhghgggggghhggggghggh..'
    ] },
  memoria: { pal: {h: "#6e5d81", g: "#7b688d", b: "#f4daec", a: "#fcebee", d: "#b19dc9", c: "#bfaad3", e: "#9a88b0", f: "#8a779d"},
    grid: [
      '..hggggggggggggggggggggggggggggggggggggggggggg..',
      'hbbbbaaaaaaaabbabaabaaaaaaaaaaababbbaaaaaaaaabah',
      'hdddccbbbcddddddddcdcddddccccbddcddddcddddccdedh',
      '..hfeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeehh.'
    ] },
  magnetica: { pal: {g: "#762d34", f: "#a92e29", d: "#2653b7", a: "#80a1f4", c: "#485cb7", b: "#e07577", e: "#d03f39", h: "#133496"},
    grid: [
      '..ggffffffffffffffffffffddddddddddddddddddddgg..',
      '.aacbbbbbbbbbbbbbbbbbbbbaaaaaaaaaaaaaaaaaaaacaa.',
      'gacgeeeeeeeeeeeeeeeeeeeeddddddddddddddddddddgcag',
      '..ggffffffffffffffffffffhhhhhhhhhhhhhhhhhhhhgg..'
    ] },
  meteorito: { pal: {e: "#463a31", f: "#382a24", a: "#ab9482", b: "#968070", g: "#2f211c", h: "#2d1f1b", c: "#705a50", d: "#504239"},
    grid: [
      '...eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee...',
      '.fabbbbghababahbabbaagaaabbbababbbbagbbbabbbbbbace',
      '.fedcccbbcccccbccbbccccacccbcccaccecccbcccbgbccdeg',
      '...hhhhhgggggggggggggggghggfggghhggggghgggggggg...'
    ] },
  cristal: { pal: {e: "#2f8a9b", d: "#59bacd", f: "#2c8697", c: "#93e2f4", a: "#e5fbfd", b: "#c3f5fc", h: "#237d90", g: "#248193"},
    grid: [
      '..edeefeeeeeeffffeefffeeeffffffefeffeeeffefede..',
      '.cacaaaabbbaabababbbbaaaabbaaaaacbbbaabaaaabcab.',
      'fcdebcdddddcccabddecccccddddccccbeddcccddecbedch',
      '..egggggggggggghgghghhggggghghghhhggggggghghhd..'
    ] },
  quitina: { pal: {e: "#2f3512", f: "#292e0f", g: "#262a0d", h: "#23260c", a: "#bcc459", b: "#82963a", c: "#6d6f2b", d: "#575320"},
    grid: [
      '..effgffeeeeeeeeggfeefeefheeefeeeeeffffeefffe...',
      '.eaabebaabbbhaabbgaaabbbccaabbbbhaabbgaaabbhaaa.',
      'fbcbbdhbbbbbdhbbccbbbbbchcbbbbbccbbbbcgbbbcdbbcf',
      '.ddddggddddddgdddehdddcgddddddcdcdddcfhdddfdfddg',
      '..gfgghfgggggffgghhgghggggggggghggggggggggghg...'
    ] },
  osso: { pal: {h: "#9f8c70", a: "#f9f3e8", g: "#c1af9a", f: "#d5c8b7", c: "#f6eddb", b: "#f6eedb", e: "#e8e4de", d: "#ebe6df"},
    grid: [
      '.hhh........................................hhh.',
      'haaag......................................haaah',
      'hfcabaeedeeeeeeeeeeeddeeeeededeeeddeddeeedabbbfh',
      '.gbbeccbbbbcbbbccccbbbbcccbbbcbbbbcbcbcccccebbh.',
      'haabfggggggggggggggggggggggggggggggggggggggfaaah',
      'heefgh....................................hgfefh',
      '.hhh........................................hhh.'
    ] },
  metamaterial: { pal: {f: "#136b5d", g: "#126759", a: "#6df8d4", b: "#46ddb7", d: "#259681", e: "#1d7e6c", c: "#34bb9c", h: "#0a5249"},
    grid: [
      '...fggffffgfffgfgfffffffffffffffffffgfgfffgfgg..',
      '.abdeaababaadaadaaaaadaaaaabaaaaaadaaeaabaafdda.',
      'gccfcfhbccehbcccfhccccehdcccehdcccchhbcccghbfdch',
      'heegeddhddcdgdddcdddddcdcdddcdcdddhddhdddddgggeh',
      '..hh........................................hh..'
    ] },
  aerogel: { pal: {h: "#2c4067", f: "#334a70", e: "#7ea6dd", b: "#bedaf8", c: "#b3d2f6", g: "#2f456b", d: "#9cc3f3", a: "#ddeaf9"},
    grid: [
      '..hh..........................................hh..',
      'ffhebbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbceffg',
      'hegedaaaacbaabbabbaaabdaaaadaaaaadabbbadaaaadaegeh',
      'gfhfeddddedddeedddcdddeddddedddddedddddeddddedfhfh',
      '.hhfgggggfggggggggggggggfggggggggggggggggggggghhh.'
    ] },
  programavel: { pal: {g: "#062048", a: "#8be1f3", e: "#1162bd", d: "#1c9afa", b: "#33abfa", f: "#0c2e60", h: "#051d44", c: "#209dfc"},
    grid: [
      '..gg..............gg........gg..............gg..',
      '.aaegaaadgbaaegaaaffaaaegbabffeaaegaaagfbaagebah',
      'fccfecbcddcbcdccbcffcbcdccbdefdbcddccdgccbdffddf',
      'fcafecacdccacddbacffbacddbacefcacddbadfdbacffacf',
      'gcdefdcddfdccfdcccffdccgdcddffdccdfccdhdcddhedcg',
      '..hghhhhhghhhghgggghhhghghgghgghggghhgghhggghh..'
    ] },
  gravitica: { pal: {g: "#330523", f: "#370525", h: "#310422", b: "#c14882", d: "#7a1449", e: "#6b1041", c: "#951f59", a: "#fdbddb"},
    grid: [
      '....gff...............fhg................hf.....',
      'fbddedfdddddddddddddddecfddddddddddddddddfddddbf',
      'fdfaadcaaaaaaaaaaaaaaaadfaaaaaaaaaaaaaaaaadaaadf',
      'fefcedhbbbbbbbbbbbbcccedhbbbbbbcbbbbbbbbcfdecdef',
      '.fgffehgggggggggggggggfefgggggggfggggggggfegfgg.'
    ] },
  asteroide: { pal: {g: "#302118", h: "#2e1e16", a: "#b9a393", b: "#9a8374", c: "#887163", d: "#6f5b4d", f: "#3b2b20", e: "#5e4a3e"},
    grid: [
      '....ggg.....................................hgg...',
      'gaaabcdgfaaaaaaacabdaaaaabaaaabegaacaaccacbaabdacf',
      'gccaaecccbfccgfacdacccbcccceggcccacccgfcccdacedccg',
      'geecdededdeeddbdedeedefdfeedffcefdeeddceeefddcceeg',
      '...ffgghgghghhgg.ggghffgghggghhhgfffggggggggfffgg.'
    ] },
  extraterrestre: { pal: {e: "#046827", h: "#036023", g: "#046325", a: "#97fb9c", c: "#07e144", d: "#029647", b: "#3df063", f: "#036427"},
    grid: [
      '...ehehhgghgeggghghgegegghhhgeghghheggggggggg...',
      '.aacaadbaaaadaaaaaaabdaaaaaaabdaaadbaaaaaaaadaae',
      'eccccccedcccccccddccccccccedcccdddeccccdccdcecch',
      '...effffefefeffefhfffefffeffhffffgfffffhffffh...'
    ] },
  antigravidade: { pal: {h: "#af5839", e: "#bd704d", g: "#b2583a", a: "#fde9d8", c: "#fdb587", b: "#fdcfac", d: "#ec986e"},
    grid: [
      '..heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeegeh.',
      'haacaaaacaaaaaaaacaaaacaaabbaaaaaabbaaabaaaaeabg',
      'hdddcccccccccccccccccccccccccccdccccccccdcccgdeg',
      '..hgggghgggggggggggggeggggggghgggggggghgggghh...'
    ] },
  plasma: { pal: {g: "#898388", h: "#615f61", a: "#fcecf3", b: "#f4e0e9", c: "#fda7c9", d: "#d7b6c6", e: "#fb88b1", f: "#fc7ca9"},
    grid: [
      '.........gh..........hg.........gh.........ghg..',
      '.aabcccccgaccccccccccagcccccccccgdccccccccceagah',
      'hddcaaaaahdaaaaaaaaaadhaaaaaaaaahdaaaaaaaaaddhdg',
      'hggcffffehdffffffffffghfffffffffhdffffffffffdhgh',
      '.........hh..........hh.........hh.........hhh..'
    ] },
  exotica: { pal: {e: "#544570", f: "#4f406b", g: "#453661", c: "#8978b0", a: "#fce9e0", b: "#d8c5d1", d: "#635382", h: "#42345e"},
    grid: [
      '.eeeeeeeeeeeeeeeeeefffeefefefeffeeeeeeeefeeffff.',
      'gccccaacaacbaccaccaacaaccaccaacaaccaccabcaaccccg',
      'gddaaddaddabdaadaaddaddaadaaddaddaadaadcaddadddg',
      '.ghhghgghghggggghggggghghhhhggghggggghghgghghhg.'
    ] },
  escura: { pal: {c: "#a084f9", b: "#a185fa", a: "#a88dfb", e: "#533e93", g: "#46347c", f: "#46357d", h: "#45337b"},
    grid: [
      '.cccbcccbbbabbbbbbbbbbcbbbccbbbccbccbbcbbbbbbcc.',
      'e..........................................a...e',
      'e..............................................e',
      '.gfhfffhgfgfffffgfgefgggggggghgfffgfffhfghhhghg.'
    ] },
  fotonica: { pal: {h: "#cd6b05", d: "#fbbb0f", e: "#fbb70f", b: "#fdfdfa", a: "#fdfdfb", f: "#fcb310", g: "#fcb20f"},
    grid: [
      '..hdedddddedddddddeedddeddeeddddeeeeddeddedddh..',
      'hebbaaabbaaabbbbbabbaabbbbbbaaaabbaababbaabbbbdh',
      '..hfeggfgffgffggffgfffgggffgfffffgfgfgfgfggfghh.'
    ] },
  espacotempo: { pal: {b: "#0364c9", e: "#093d8e", a: "#2484d6", f: "#072b69", d: "#005ccc", c: "#0160cd", g: "#0b112b", h: "#02020e"},
    grid: [
      '...bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...',
      'eaabfffffaffefffafffffffffffffffaffffffffefffaad',
      'eccgghhhhhhghhhhahhhhfhhhghhhhhhehaghghhghgahcce',
      '..edccccdcdddcdddddcddddcdddcdccdcdccdcccdddde..'
    ] },
  degenerada: { pal: {h: "#8b839c", f: "#aeaabc", e: "#b5b2c2", d: "#c4c1cc", a: "#fdfdfd", b: "#f5f2f1", g: "#a9a5b8", c: "#e9e4df"},
    grid: [
      '..hfeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeh..',
      'hdabaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabadh',
      'hgdccccccccccccccccccccccccccccccccccccccccccccegh',
      '..hggggggggggggggggggggggggggggggggggggggggggggh..'
    ] },
  realidade: { pal: {f: "#2cce69", h: "#e73267", g: "#818bc3", e: "#91c29a", c: "#e8e7e7", b: "#fdfcfd", a: "#fdfdfd"},
    grid: [
      '...ffhgfffhhhhgggffffffffffegffffffffhhhhhgggff...',
      'hccbbabaaabbbaaaaaabaaaaabaaaaabbbababbabbbaabbcce',
      'hecccccccccccccccccccccccccccccccccccccccccccccceh',
      '..ghhheeeggehheeeegheegghheeghhheeggghhheeeeeghf..'
    ] }
});
