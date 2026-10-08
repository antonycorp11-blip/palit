/* =========================================================
   ÁRVORES DAS ERAS — cada material tem a sua árvore, que
   cresce com as melhorias e dá o material como fruto.
   style: wood | cane | metal | stone | glass | cosmic
   bark: [claro, médio, escuro]  leaf: [claro, médio, escuro]
   ground: [topo, terra]
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

(function () {
  function T(name, style, bark, leaf, ground) { return { name: name, style: style, bark: bark, leaf: leaf, ground: ground }; }
  var BROWN = ['#a8703c', '#7a4a24', '#4a2a14'], GRASS = ['#00e436', '#5f3a20'];
  PALIT.TREE_LOOKS = {
    fosforo:        T('Fosforeira', 'wood', BROWN, ['#7ad84a', '#2e9a3a', '#1f5a3c'], GRASS),
    dente:          T('Palitzeiro', 'wood', ['#f0e0c0', '#c8b48a', '#8a7650'], ['#b8e86a', '#6ab83a', '#3a7a2a'], ['#c8644a', '#7a3a28']),
    churrasco:      T('Espetinheira', 'wood', ['#c8884a', '#8a5a2a', '#4a2a10'], ['#ffb04a', '#d86a2a', '#8a3a1a'], ['#a8a29a', '#5f574f']),
    bambu:          T('Bambuzal Gigante', 'cane', ['#c8e070', '#8ab040', '#4a7020'], ['#a8e86a', '#5aa83a', '#2a6a2a'], ['#c2c3c7', '#5f6a78']),
    canico:         T('Caniçal Suspenso', 'cane', ['#e8d8a0', '#b8a060', '#7a6a30'], ['#d8e890', '#a8b850', '#6a7a2a'], ['#c2c3c7', '#3a424e']),
    vassoura:       T('Vassourão', 'wood', ['#eab06a', '#d08a3a', '#9a5a20'], ['#e8d870', '#c8a838', '#8a6a1a'], ['#c2c3c7', '#3a424e']),
    galho:          T('Galhuda Velha', 'wood', ['#9a6a42', '#6a4224', '#3a2210'], ['#5ab84a', '#2a8a3a', '#1a5a2a'], ['#8a7a70', '#4a3a34']),
    tora:           T('Sequoia de Toras', 'wood', ['#b07a4a', '#7a4a28', '#4a2a14'], ['#e8f4ff', '#6aa8a0', '#2a6a5a'], ['#ffffff', '#6a7aa8']),
    viga:           T('Árvore-Viga', 'wood', ['#a86a3c', '#7a4a28', '#4a2a14'], ['#4aa86a', '#2a7a4a', '#14503a'], ['#8a7a70', '#4a3a34']),
    laminada:       T('Laminária', 'wood', ['#e8be80', '#c89858', '#8a6430'], ['#fff1e8', '#c8e8ff', '#8ab8e0'], ['#fff1e8', '#c2c3c7']),
    papel:          T('Árvore de Papel Dobrado', 'wood', ['#ffffff', '#e8e4d8', '#b0aa98'], ['#fff1e8', '#ffccaa', '#c8a890'], ['#fff1e8', '#c2c3c7']),
    bambu_carbo:    T('Bambu de Carbono', 'cane', ['#5a4a3a', '#3a3028', '#1a1410'], ['#6a6a7a', '#3a3a4a', '#1a1a24'], ['#fff1e8', '#c2c3c7']),
    aluminio:       T('Árvore de Alumínio', 'metal', ['#eef0f4', '#c2c3c7', '#8a8c94'], ['#d8e8f8', '#a8b8d0', '#6a7a94'], ['#c2c3c7', '#5f6a78']),
    aco:            T('Árvore de Aço', 'metal', ['#8a96a6', '#5f6a78', '#3a424e'], ['#c8d0dc', '#8a96a6', '#4a5260'], ['#c2c3c7', '#3a424e']),
    concreto:       T('Árvore de Concreto', 'stone', ['#c8c2ba', '#a8a29a', '#76706a'], ['#d8d2ca', '#a8a29a', '#76706a'], ['#e0e0e0', '#76706a']),
    titanio:        T('Titânia', 'metal', ['#d0d8e8', '#9aa4b8', '#5a6478'], ['#b8c8f0', '#7a8ac8', '#3a4a88'], ['#c2c3c7', '#3a424e']),
    carbono:        T('Fibra-Mãe', 'metal', ['#4a4a58', '#2a2a32', '#14141a'], ['#5a5a6a', '#3a3a48', '#1a1a24'], ['#c2c3c7', '#3a424e']),
    vidro:          T('Árvore de Vidro Soprado', 'glass', ['#e6faff', '#a0dcff', '#5a96c8'], ['#c0ffe8', '#5ae8b8', '#2aa888'], ['#e0ffff', '#4aa0b0']),
    ceramica:       T('Árvore de Porcelana', 'glass', ['#f8ece0', '#e0d0c0', '#a89480'], ['#c8e0ff', '#5a8ae8', '#2a4aa8'], ['#c2c3c7', '#3a424e']),
    basalto:        T('Árvore Vulcânica', 'stone', ['#5a5a5a', '#3a3a3a', '#1a1a1a'], ['#ffa300', '#ff004d', '#7e2553'], ['#8a7a70', '#2a201c']),
    memoria:        T('Liga da Memória', 'metal', ['#e8c8a0', '#c8a070', '#8a6a40'], ['#ffd8a0', '#e8a060', '#a86a30'], ['#c2c3c7', '#3a424e']),
    magnetica:      T('Ímã-Árvore', 'metal', ['#ff6a6a', '#c82a2a', '#7a1a1a'], ['#8ab8ff', '#3a6ae8', '#1a3a98'], ['#c2c3c7', '#3a424e']),
    meteorito:      T('Árvore Caída do Céu', 'stone', ['#8a7a6a', '#5a4a3a', '#2a201a'], ['#ffccaa', '#ff6a3a', '#a83a1a'], ['#8a7a70', '#2a201c']),
    cristal:        T('Cristaleira', 'glass', ['#e0ffff', '#9ae0e8', '#4aa0b0'], ['#ffccff', '#c88ae8', '#7a4aa8'], ['#e0ffff', '#4aa0b0']),
    quitina:        T('Árvore-Besouro', 'stone', ['#8ab84a', '#5a7a2a', '#2a4a14'], ['#3ae8a8', '#1aa878', '#0a6a48'], ['#fff1e8', '#8a8c94']),
    osso:           T('Árvore Fóssil', 'stone', ['#fff8e8', '#e8dcc0', '#b0a080'], ['#fff1e8', '#e0d0b0', '#a89470'], ['#fff1e8', '#83769c']),
    metamaterial:   T('Árvore Invisível', 'glass', ['#c8f0ff', '#78b8e8', '#3a6aa8'], ['#e8f8ff', '#a8d8f8', '#5a98c8'], ['#ff6a3a', '#7a3a20']),
    aerogel:        T('Árvore de Fumaça Sólida', 'glass', ['#e8f0ff', '#b8c8e8', '#7a8ab8'], ['#f0f4ff', '#c8d4f0', '#8a9ac8'], ['#8a7a70', '#2a201c']),
    programavel:    T('Árvore Programável', 'metal', ['#3a3a48', '#1a1a24', '#0a0a10'], ['#00e436', '#008751', '#004a2a'], ['#c2c3c7', '#3a424e']),
    gravitica:      T('Árvore Gravitacional', 'cosmic', ['#8a6ae8', '#5a3ab8', '#2a1a68'], ['#c8a8ff', '#8a6ae8', '#4a2a98'], ['#c2c3c7', '#3a424e']),
    asteroide:      T('Árvore de Asteroide', 'stone', ['#a09080', '#706050', '#403020'], ['#c8e8ff', '#5ab8e8', '#2a78a8'], ['#fff1e8', '#8a8c94']),
    extraterrestre: T('Árvore Alienígena', 'cosmic', ['#6ae8a8', '#2aa868', '#0a6838'], ['#ff77a8', '#c83a78', '#7e2553'], ['#a0ffb0', '#008751']),
    antigravidade:  T('Árvore Flutuante', 'cosmic', ['#e8e8ff', '#a8a8e8', '#6a6aa8'], ['#c8fff8', '#6ae8d8', '#2aa898'], ['#e0ffff', '#4aa0b0']),
    plasma:         T('Árvore de Plasma', 'cosmic', ['#ffd8a0', '#ffa300', '#c8501a'], ['#ffec27', '#ff6a1a', '#ff004d'], ['#a0ffb0', '#008751']),
    exotica:        T('Árvore Exótica', 'cosmic', ['#ff9ad8', '#c84aa8', '#7a1a68'], ['#9affff', '#3ac8e8', '#1a78a8'], ['#fff1e8', '#83769c']),
    escura:         T('Árvore da Matéria Escura', 'cosmic', ['#3a2a58', '#1a1030', '#08040f'], ['#6a4aa8', '#3a2a78', '#1a1048'], ['#fff1e8', '#83769c']),
    fotonica:       T('Árvore de Luz', 'cosmic', ['#fff8c8', '#ffe870', '#e8b820'], ['#ffffff', '#fff1a8', '#ffd84a'], ['#fff1e8', '#83769c']),
    espacotempo:    T('Árvore do Tempo', 'cosmic', ['#a8c8ff', '#5a7ae8', '#2a3a98'], ['#e8d8ff', '#a888e8', '#6a48b8'], ['#fff1e8', '#83769c']),
    degenerada:     T('Árvore Anã Branca', 'cosmic', ['#ffffff', '#d8d8e8', '#9a9ab8'], ['#ffffff', '#e8e8ff', '#b8b8d8'], ['#fff1e8', '#83769c']),
    realidade:      T('A Última Árvore', 'cosmic', ['#ffffff', '#ff77a8', '#7e2553'], ['#2cce69', '#e73267', '#818bc3'], ['#fff1e8', '#ff77a8'])
  };
  PALIT.treeLookOf = function (mat) { return PALIT.TREE_LOOKS[mat.id] || PALIT.TREE_LOOKS.fosforo; };
})();
