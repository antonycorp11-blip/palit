/* =========================================================
   CENÁRIOS por altitude global (metros).
   sky: faixas de cor de cima para baixo (degradê em degraus).
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.SCENES = [
  { max: 20,     name: 'Quintal',        sky: ['#1d6fd8', '#2a8cf0', '#29adff', '#5cc4ff', '#8fd8ff', '#c7f0ff'], city: true, hills: true, fence: true, clouds: true, sun: true },
  { max: 400,    name: 'Bairro',         sky: ['#1a5cc0', '#2477e0', '#29adff', '#5cc4ff', '#9adcff'], city: true, hills: true, clouds: true, sun: true },
  { max: 4000,   name: 'Montanhas',      sky: ['#164aa8', '#1d6fd8', '#2a8cf0', '#29adff', '#7fd4ff'], hills: true, clouds: true, sun: true },
  { max: 15000,  name: 'Acima das nuvens', sky: ['#103a8a', '#1a5cc0', '#2a8cf0', '#7fd4ff', '#fff1e8'], clouds: true, sun: true },
  { max: 60000,  name: 'Estratosfera',   sky: ['#060c2a', '#0c1a4a', '#1d2b53', '#2a4a8a', '#4a7ad0'], stars: 0.3, sun: true },
  { max: 1.2e5,  name: 'Mesosfera',      sky: ['#02040f', '#060c2a', '#0c1a4a', '#1d2b53'], stars: 0.7 },
  { max: 4e8,    name: 'Órbita',         sky: ['#000000', '#02040f', '#060c2a'], stars: 1, planet: true },
  { max: 1e13,   name: 'Sistema Solar',  sky: ['#000000', '#05020f', '#0a0420'], stars: 1 },
  { max: 1e18,   name: 'Interestelar',   sky: ['#000000', '#0a0420', '#1a0a30'], stars: 1.4 },
  { max: 1e21,   name: 'Galáxia',        sky: ['#05020f', '#1a0a30', '#3a1048', '#7e2553'], stars: 2 },
  { max: Infinity, name: 'Realidade',    sky: ['#000000', '#1a1423', '#7e2553', '#ff77a8', '#fff1e8'], stars: 2 }
];

PALIT.sceneFor = function (m) {
  for (var i = 0; i < PALIT.SCENES.length; i++) if (m < PALIT.SCENES[i].max) return PALIT.SCENES[i];
  return PALIT.SCENES[PALIT.SCENES.length - 1];
};

/* =========================================================
   CENÁRIO DE CADA ERA — cada material começa num lugar novo.
   layers: camadas de fundo visíveis (ver ambient.js)
   ground: estilo do ponto de partida (plataforma)
   amb:    vida que passa ao fundo
   col:    cores das camadas (variáveis CSS)
   ========================================================= */
(function () {
  var DAY = ['#1d6fd8', '#2a8cf0', '#29adff', '#5cc4ff', '#8fd8ff', '#c7f0ff'];
  function S(id, name, o) { o.id = id; o.name = name; return o; }
  PALIT.ERA_SCENES = {
    fosforo: S('fosforo', 'Quintal', { sky: DAY, day: true, sun: true, layers: ['mountains', 'city', 'hills', 'cloudbank', 'trees', 'houses', 'clouds'], ground: 'grass', amb: ['butterfly', 'birds', 'plane', 'balloon', 'kite'] }),
    dente: S('dente', 'Telhados do Bairro', { sky: ['#1a5cc0', '#2477e0', '#29adff', '#5cc4ff', '#9adcff', '#d8f4ff'], day: true, sun: true, layers: ['mountains', 'city', 'skyline', 'cloudbank', 'roofs', 'clouds'], ground: 'roof', amb: ['pigeons', 'plane', 'balloon', 'kite', 'heli'], col: { '--city': '#4a5a8a', '--sky2': '#3a4870' } }),
    churrasco: S('churrasco', 'Laje do Prédio', { sky: ['#164aa8', '#1d6fd8', '#2a8cf0', '#5cc4ff', '#9adcff', '#ffe0c0'], day: true, sun: true, layers: ['mountains', 'skyline', 'city', 'cloudbank', 'roofs', 'clouds'], ground: 'slab', amb: ['pigeons', 'heli', 'plane', 'balloon'], col: { '--city': '#5a6a9a', '--sky2': '#2a3860', '--roof': '#8a8c94' } }),
    bambu: S('bambu', 'Entre Arranha-Céus', { sky: ['#123f96', '#1a5cc0', '#2a8cf0', '#5cc4ff', '#a8e0ff', '#e0f6ff'], day: true, sun: true, layers: ['mountains', 'skyline', 'cloudbank', 'clouds'], ground: 'metal', amb: ['heli', 'plane', 'birds'], col: { '--sky2': '#283a6a' } }),
    canico: S('canico', 'Topo da Cidade', { sky: ['#103a8a', '#164aa8', '#2477e0', '#5cc4ff', '#a8e0ff', '#ffe8c8'], day: true, sun: true, layers: ['mountains', 'skyline', 'cloudbank', 'clouds'], ground: 'metal', amb: ['heli', 'plane', 'balloon'], col: { '--sky2': '#1f2c55', '--mtn': '#5a6aa0' } }),
    vassoura: S('vassoura', 'Torres de TV', { sky: ['#0e3480', '#164aa8', '#2477e0', '#5cc4ff', '#b0e4ff', '#fff1e8'], day: true, sun: true, layers: ['mountains', 'hills', 'cloudbank', 'clouds'], ground: 'metal', amb: ['plane', 'heli', 'balloon'], col: { '--hill': '#3a6a5a', '--hill2': '#2a5a4a' } }),
    galho: S('galho', 'Serra', { sky: ['#0c2e74', '#123f96', '#1d6fd8', '#5cc4ff', '#b8e8ff', '#e8fff0'], day: true, sun: true, layers: ['mountains', 'hills', 'cloudbank', 'clouds'], ground: 'rock', amb: ['birds', 'plane', 'balloon'], col: { '--mtn': '#4a6a8a', '--hill': '#2a6a3a' } }),
    tora: S('tora', 'Montanhas Nevadas', { sky: ['#0a2868', '#103a8a', '#1a5cc0', '#4ab0f0', '#b8e8ff', '#ffffff'], day: true, sun: true, layers: ['mountains', 'cloudbank', 'clouds'], ground: 'rock', amb: ['birds', 'plane'], col: { '--mtn': '#6a7aa8', '--snow': '#ffffff' } }),
    viga: S('viga', 'Pico da Montanha', { sky: ['#08225c', '#0e3480', '#164aa8', '#3a90e0', '#a0d8ff', '#e8f8ff'], day: true, sun: true, layers: ['mountains', 'seaclouds', 'clouds'], ground: 'rock', amb: ['plane', 'birds'], col: { '--mtn': '#8a9ac8' } }),
    laminada: S('laminada', 'Nuvens Baixas', { sky: ['#071e52', '#0c2e74', '#1a5cc0', '#2a8cf0', '#8fd8ff', '#ffffff'], day: true, sun: true, layers: ['seaclouds', 'cloudbank', 'clouds'], ground: 'cloud', amb: ['plane', 'balloon'] }),
    papel: S('papel', 'Mar de Nuvens', { sky: ['#061a48', '#0a2868', '#164aa8', '#2a8cf0', '#a0dcff', '#ffffff'], day: true, sun: true, layers: ['seaclouds', 'cloudbank'], ground: 'cloud', amb: ['plane', 'jet'] }),
    bambu_carbo: S('bambu_carbo', 'Acima das Nuvens', { sky: ['#05163e', '#081f58', '#123f96', '#2477e0', '#7fc8ff', '#e0f4ff'], day: true, sun: true, layers: ['seaclouds'], ground: 'cloud', amb: ['jet', 'plane'] }),
    aluminio: S('aluminio', 'Rota dos Aviões', { sky: ['#041234', '#071e52', '#0e3480', '#1d6fd8', '#6ab8f0', '#c8ecff'], day: true, sun: true, layers: ['seaclouds'], ground: 'metal', amb: ['jet', 'jet', 'plane'] }),
    aco: S('aco', 'Corrente de Jato', { sky: ['#030e2a', '#061a48', '#0c2e74', '#164aa8', '#4a90d8', '#a8d8ff'], day: true, sun: true, stars: 0.15, layers: ['seaclouds', 'curve'], ground: 'metal', amb: ['jet'], col: { '--curve': '#5cc4ff' } }),
    concreto: S('concreto', 'Estratosfera', { sky: ['#020a20', '#04122f', '#081f58', '#0e3480', '#2a6ac0', '#6ab0f0'], stars: 0.35, sun: true, layers: ['curve'], ground: 'slab', amb: ['balloon_hi'], col: { '--curve': '#4ab0f0' } }),
    titanio: S('titanio', 'Alta Estratosfera', { sky: ['#01061a', '#020c26', '#06163e', '#0c2a6a', '#1d4a9a', '#3a7ad0'], stars: 0.55, sun: true, layers: ['curve'], ground: 'metal', amb: ['balloon_hi'], col: { '--curve': '#3a9ae0' } }),
    carbono: S('carbono', 'Mesosfera', { sky: ['#000412', '#01061a', '#030e2a', '#081f58', '#14347a', '#2a5aa8'], stars: 0.75, sun: true, layers: ['curve'], ground: 'metal', amb: ['comet'], col: { '--curve': '#2a7ac8' } }),
    vidro: S('vidro', 'Aurora', { sky: ['#000308', '#020a1a', '#04203a', '#00563a', '#00e436', '#29adff'], stars: 1, layers: ['curve', 'nebula'], ground: 'crystal', amb: ['comet'], col: { '--curve': '#1a6aa8', '--neb1': 'rgba(0,228,54,.25)', '--neb2': 'rgba(41,173,255,.2)' } }),
    ceramica: S('ceramica', 'Linha de Kármán', { sky: ['#000000', '#01030c', '#020818', '#04122f', '#081f58', '#14347a'], stars: 1, layers: ['curve'], ground: 'metal', amb: ['satellite', 'comet'], col: { '--curve': '#29adff' } }),
    basalto: S('basalto', 'Órbita Baixa', { sky: ['#000000', '#000208', '#010510', '#020a20', '#04122f', '#061a48'], stars: 1, layers: ['curve'], ground: 'rock', amb: ['satellite', 'satellite'], col: { '--curve': '#1d6fd8' } }),
    memoria: S('memoria', 'Estação Espacial', { sky: ['#000000', '#000000', '#010308', '#020610', '#030a1c', '#04102c'], stars: 1, layers: ['curve'], ground: 'metal', amb: ['satellite', 'station'], col: { '--curve': '#1a5cc0' } }),
    magnetica: S('magnetica', 'Cinturão de Satélites', { sky: ['#000000', '#000000', '#010206', '#02040c', '#030818', '#040c24'], stars: 1, layers: ['curve'], ground: 'metal', amb: ['satellite', 'satellite', 'satellite'], col: { '--curve': '#164aa8' } }),
    meteorito: S('meteorito', 'Chuva de Meteoros', { sky: ['#000000', '#000000', '#020104', '#04020a', '#080414', '#100820'], stars: 1, layers: ['planet'], ground: 'rock', amb: ['comet', 'comet', 'comet'], planet: { color: '#29adff', dark: '#1d2b53', size: 60, x: 70, y: 70 } }),
    cristal: S('cristal', 'Caminho para a Lua', { sky: ['#000000', '#000000', '#000000', '#020208', '#040410', '#08081c'], stars: 1, layers: ['planet'], ground: 'crystal', amb: ['comet', 'satellite'], planet: { color: '#c2c3c7', dark: '#5f574f', size: 34, x: 25, y: 22 } }),
    quitina: S('quitina', 'Superfície da Lua', { sky: ['#000000', '#000000', '#000000', '#010102', '#020204', '#040408'], stars: 1, layers: ['planet', 'moonland'], ground: 'moon', amb: ['comet'], planet: { color: '#29adff', dark: '#008751', size: 22, x: 75, y: 18 } }),
    osso: S('osso', 'Além da Lua', { sky: ['#000000', '#000000', '#000000', '#020104', '#04020a', '#080414'], stars: 1.2, layers: ['planet'], ground: 'void', amb: ['comet'], planet: { color: '#c2c3c7', dark: '#5f574f', size: 28, x: 20, y: 72 } }),
    metamaterial: S('metamaterial', 'Marte', { sky: ['#0a0202', '#1a0404', '#2a0808', '#4a1008', '#7a2410', '#ab5236'], stars: 0.6, layers: ['planet', 'marsland'], ground: 'mars', amb: ['comet'], planet: { color: '#ff004d', dark: '#7e2553', size: 14, x: 78, y: 16 } }),
    aerogel: S('aerogel', 'Cinturão de Asteroides', { sky: ['#000000', '#000000', '#020104', '#04020a', '#0a0610', '#140c1c'], stars: 1.2, layers: ['asteroids'], ground: 'rock', amb: ['asteroid', 'asteroid', 'comet'] }),
    programavel: S('programavel', 'Júpiter', { sky: ['#000000', '#000000', '#020104', '#040208', '#0a0610', '#140c18'], stars: 1, layers: ['planet'], ground: 'metal', amb: ['comet'], planet: { color: '#ffa300', dark: '#ab5236', size: 110, x: 72, y: 62, bands: '#ffccaa' } }),
    gravitica: S('gravitica', 'Saturno', { sky: ['#000000', '#000000', '#020102', '#040206', '#08040c', '#100818'], stars: 1, layers: ['planet'], ground: 'metal', amb: ['comet'], planet: { color: '#ffec27', dark: '#ab5236', size: 70, x: 30, y: 60, ring: '#ffccaa' } }),
    asteroide: S('asteroide', 'Gigantes Gelados', { sky: ['#000000', '#000000', '#000204', '#00040a', '#000814', '#001020'], stars: 1.2, layers: ['planet'], ground: 'ice', amb: ['comet'], planet: { color: '#29adff', dark: '#1d2b53', size: 60, x: 70, y: 66, ring: '#83769c' } }),
    extraterrestre: S('extraterrestre', 'Fronteira do Sistema Solar', { sky: ['#000000', '#000000', '#000000', '#010102', '#020204', '#04040a'], stars: 1.4, layers: ['planet'], ground: 'alien', amb: ['ufo', 'comet'], planet: { color: '#ffec27', dark: '#ffa300', size: 4, x: 50, y: 50 } }),
    antigravidade: S('antigravidade', 'Nuvem de Oort', { sky: ['#000000', '#000000', '#000000', '#000000', '#020204', '#04040a'], stars: 1.6, layers: ['nebula'], ground: 'crystal', amb: ['comet', 'comet', 'ufo'], col: { '--neb1': 'rgba(194,195,199,.08)', '--neb2': 'rgba(131,118,156,.1)' } }),
    plasma: S('plasma', 'Estrelas Vizinhas', { sky: ['#000000', '#020004', '#04000a', '#080014', '#100020', '#18002c'], stars: 1.8, layers: ['planet', 'nebula'], ground: 'plasma', amb: ['ufo', 'comet'], planet: { color: '#ff004d', dark: '#7e2553', size: 40, x: 78, y: 30, glow: '#ffa300' }, col: { '--neb1': 'rgba(255,0,77,.12)', '--neb2': 'rgba(255,163,0,.1)' } }),
    exotica: S('exotica', 'Nebulosa', { sky: ['#05020f', '#0a0420', '#1a0a30', '#2a1048', '#3a1458', '#4a1868'], stars: 2, layers: ['nebula'], ground: 'void', amb: ['ufo'], col: { '--neb1': 'rgba(255,119,168,.25)', '--neb2': 'rgba(41,173,255,.2)' } }),
    escura: S('escura', 'Braço da Galáxia', { sky: ['#000000', '#020104', '#04020a', '#080414', '#0c0620', '#10082c'], stars: 2, layers: ['galaxy', 'nebula'], ground: 'void', amb: ['ufo'], col: { '--neb1': 'rgba(131,118,156,.18)', '--neb2': 'rgba(41,173,255,.08)' } }),
    fotonica: S('fotonica', 'Centro Galáctico', { sky: ['#0a0400', '#1a0a00', '#2a1400', '#4a2400', '#7a4000', '#ab6a10'], stars: 2.4, layers: ['galaxy', 'nebula'], ground: 'light', amb: ['comet'], col: { '--neb1': 'rgba(255,236,39,.25)', '--neb2': 'rgba(255,163,0,.2)' } }),
    espacotempo: S('espacotempo', 'Grupo Local', { sky: ['#000000', '#000208', '#000410', '#000818', '#001028', '#001838'], stars: 2, layers: ['galaxy'], ground: 'void', amb: ['ufo'] }),
    degenerada: S('degenerada', 'Teia Cósmica', { sky: ['#000000', '#04020a', '#0a0414', '#140820', '#200c30', '#2a1040'], stars: 2.4, layers: ['web', 'nebula'], ground: 'light', amb: [], col: { '--neb1': 'rgba(255,241,232,.08)', '--neb2': 'rgba(126,37,83,.2)' } }),
    realidade: S('realidade', 'Borda da Realidade', { sky: ['#000000', '#1a1423', '#7e2553', '#ff77a8', '#ffccaa', '#fff1e8'], stars: 2, layers: ['web', 'nebula'], ground: 'light', amb: [], col: { '--neb1': 'rgba(255,255,255,.2)', '--neb2': 'rgba(255,0,77,.15)' } })
  };
  PALIT.sceneOf = function (mat) {
    return PALIT.ERA_SCENES[mat.id] || PALIT.sceneFor(0);
  };
})();
