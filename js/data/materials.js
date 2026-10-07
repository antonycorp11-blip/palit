/* =========================================================
   MATERIAIS / ERAS — totalmente data-driven.
   Para adicionar uma era jogável basta:
     1) preencher a entrada aqui;
     2) registrar a árvore em PALIT.TREES[tree];
     3) (opcional) novas ameaças/eventos em threats.js/events.js.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

(function () {
  // goalM: altura total da torre desta era (metros) ao atingir goalLayers.
  function M(era, id, name, piece, pieces, goalM, o) {
    var goalLayers = o.goalLayers || 1000;
    return {
      era: era, id: id, name: name, piece: piece, pieces: pieces,
      goalM: goalM,
      goalLayers: goalLayers,
      layerHeightM: goalM / goalLayers,
      baseLimitLayers: o.baseLimit || 120,
      piecesPerLayer: 2,
      layerValue: o.layerValue || 1,
      passiveRate: o.passiveRate || 0.003,
      milestoneEvery: o.milestoneEvery || 100,
      costScale: o.costScale || 1,
      slip: o.slip || 0,
      base: Object.assign({ capacity: 10, rechargeSec: 5, placeSec: 0.9, repairSec: 2 }, o.base || {}),
      look: Object.assign({ len: 26, body: '#e8c27a', light: '#f6dca0', shade: '#b8894a', head: null, headDark: null, headLen: 3 }, o.look || {}),
      mechanic: o.mechanic || null,
      traits: o.traits || [],
      problems: o.problems || [],
      threats: o.threats || [],
      challenge: o.challenge || null,
      tree: o.tree || null
    };
  }

  PALIT.MATERIALS = [
    M(1, 'fosforo', 'Palito de Fósforo', 'fósforo', 'fósforos', 4, {
      costScale: 0.6, base: { capacity: 10, rechargeSec: 5, placeSec: 0.9, repairSec: 2 },
      look: { len: 34, body: '#e4bb73', light: '#f6d69d', shade: '#a4743f', head: '#c4261a', headDark: '#6a0e0c', headLen: 3 },
      traits: ['Frágil', 'Pequeno', 'Leve', 'Recarga razoavelmente rápida'],
      problems: ['Vento', 'Umidade', 'Pássaros', 'Peças que se soltam', 'Cabeças inflamáveis'],
      threats: ['fly', 'ant', 'beetle', 'ball', 'bird', 'gecko', 'cat', 'lens', 'hail', 'kite', 'crow'],
      challenge: { name: 'A GRANDE VENTANIA', dur: 90, gustEvery: 7, gustStr: 1.5, threatEvery: 10, minIntegrity: 60, startIntegrity: 80 },
      tree: 'fosforo'
    }),
    M(2, 'dente', 'Palito de Dente', 'palito', 'palitos', 10, {
      costScale: 0.6, layerValue: 2, slip: 0.14,
      base: { capacity: 12, rechargeSec: 6, placeSec: 1.0, repairSec: 2 },
      look: { len: 30, body: '#f0d9a8', light: '#fff1d0', shade: '#c9a46a' },
      traits: ['Um pouco maior', 'Mais rígido', 'Sem cabeça de fósforo'],
      problems: ['Pontas que escorregam', 'Vento mais forte', 'Pássaros maiores'],
      threats: ['fly', 'ant', 'beetle', 'bird', 'gecko', 'crow', 'cat', 'ball', 'kite', 'hail'],
      challenge: { name: 'A REVOADA', dur: 100, gustEvery: 9, gustStr: 1.4, threatEvery: 6, minIntegrity: 60, startIntegrity: 80 },
      tree: 'dente'
    }),
    M(3, 'churrasco', 'Palito de Churrasco', 'espeto', 'espetos', 30, {
      goalLayers: 900, base: { capacity: 10, rechargeSec: 9, placeSec: 1.3 },
      look: { len: 44, body: '#d9b77e', light: '#efd6a2', shade: '#a98450' },
      traits: ['Muito mais comprido', 'Cada camada sobe bem mais'],
      problems: ['Produção lenta', 'Alavanca do vento', 'Gatos curiosos'],
      threats: ['bird', 'crow', 'cat', 'kite', 'drone']
    }),
    M(4, 'bambu', 'Vareta de Bambu', 'vareta', 'varetas', 80, {
      mechanic: 'FLEXIBILIDADE', base: { capacity: 12, rechargeSec: 8, placeSec: 1.2 },
      look: { len: 44, body: '#a8c46a', light: '#cfe39a', shade: '#6f8c3a' },
      traits: ['Flexível', 'Excelente contra vento'],
      problems: ['Pode entortar', 'Fadiga por flexão'],
      threats: ['crow', 'kite', 'drone', 'storm']
    }),
    M(5, 'canico', 'Caniços Prensados', 'feixe', 'feixes', 160, {
      base: { capacity: 14, rechargeSec: 8, placeSec: 1.2 },
      look: { len: 40, body: '#c9b27a', light: '#e5d3a1', shade: '#8f7a48' },
      traits: ['Muito leve', 'Material estranho'],
      problems: ['Desfaz com dano repetitivo'],
      threats: ['crow', 'drone', 'storm', 'hail']
    }),
    M(6, 'vassoura', 'Cabo de Vassoura', 'cabo', 'cabos', 300, {
      base: { capacity: 8, rechargeSec: 12, placeSec: 1.6 },
      look: { len: 46, body: '#d08a3a', light: '#eab06a', shade: '#9a5a20' },
      traits: ['Peças absurdamente maiores', 'Visual levemente cômico'],
      problems: ['Pesado para o tamanho', 'Pintura descasca'],
      threats: ['drone', 'helicopter', 'storm']
    }),
    M(7, 'galho', 'Galhos Retos Selecionados', 'galho', 'galhos', 550, {
      mechanic: 'VARIAÇÃO', base: { capacity: 10, rechargeSec: 11, placeSec: 1.5 },
      look: { len: 44, body: '#8a5a32', light: '#b07a4a', shade: '#5a3a1e' },
      traits: ['Natural', 'Cada peça varia', 'Mais resistente'],
      problems: ['Imprevisível', 'Cupins'],
      threats: ['termite', 'crow', 'storm', 'helicopter']
    }),
    M(8, 'tora', 'Toras de Madeira', 'tora', 'toras', 1000, {
      base: { capacity: 8, rechargeSec: 15, placeSec: 2 },
      look: { len: 48, body: '#7a4a28', light: '#a86a3c', shade: '#4a2a14' },
      traits: ['A escala muda completamente'],
      problems: ['Peso', 'Rolagem lateral'],
      threats: ['storm', 'helicopter', 'plane']
    }),
    M(9, 'viga', 'Vigas de Madeira', 'viga', 'vigas', 1800, {
      mechanic: 'ENCAIXES', base: { capacity: 10, rechargeSec: 14, placeSec: 1.8 },
      look: { len: 48, body: '#b07840', light: '#d09a5e', shade: '#7a4e24' },
      traits: ['Madeira trabalhada', 'Encaixes estruturais'],
      problems: ['Encaixe errado enfraquece', 'Umidade'],
      threats: ['storm', 'plane', 'lightning']
    }),
    M(10, 'laminada', 'Madeira Laminada', 'lâmina', 'lâminas', 3000, {
      base: { capacity: 10, rechargeSec: 14, placeSec: 1.8 },
      look: { len: 48, body: '#c89858', light: '#e8be80', shade: '#8a6430' },
      traits: ['Industrial', 'Extremamente resistente'],
      problems: ['Delaminação', 'Custo'],
      threats: ['plane', 'lightning', 'balloon']
    }),
    M(11, 'papel', 'Tubos de Papel Hipercompactado', 'tubo', 'tubos', 5000, {
      base: { capacity: 14, rechargeSec: 10, placeSec: 1.4 },
      look: { len: 46, body: '#e8e4d8', light: '#ffffff', shade: '#b0aa98' },
      traits: ['Extremamente leve', 'Surpreendentemente resistente'],
      problems: ['Água', 'Chuva', 'Nuvens úmidas'],
      threats: ['rain', 'balloon', 'plane']
    }),
    M(12, 'bambu_carbo', 'Bambu Carbonizado', 'vara', 'varas', 8000, {
      base: { capacity: 12, rechargeSec: 12, placeSec: 1.5 },
      look: { len: 46, body: '#3a3028', light: '#5a4a3a', shade: '#1a1410' },
      traits: ['Leve', 'Muito resistente'],
      problems: ['Fica quebradiço'],
      threats: ['lightning', 'balloon', 'debris']
    }),
    M(13, 'aluminio', 'Vigas de Alumínio', 'viga', 'vigas', 12000, {
      base: { capacity: 12, rechargeSec: 13, placeSec: 1.6 },
      look: { len: 48, body: '#c2c3c7', light: '#eef0f4', shade: '#8a8c94' },
      traits: ['Primeiro grande metal', 'Muito leve'],
      problems: ['Raios', 'Fadiga térmica'],
      threats: ['lightning', 'plane', 'debris']
    }),
    M(14, 'aco', 'Vigas de Aço', 'viga', 'vigas', 20000, {
      mechanic: 'PESO', base: { capacity: 8, rechargeSec: 18, placeSec: 2.2 },
      look: { len: 48, body: '#5f6a78', light: '#8a96a6', shade: '#3a424e' },
      traits: ['Extremamente resistente', 'Muito pesado'],
      problems: ['Peso importa', 'Tempestades elétricas', 'Ferrugem'],
      threats: ['lightning', 'storm', 'debris']
    }),
    M(15, 'concreto', 'Vigas de Concreto Armado', 'viga', 'vigas', 32000, {
      base: { capacity: 6, rechargeSec: 26, placeSec: 2.6 },
      look: { len: 50, body: '#a8a29a', light: '#c8c2ba', shade: '#76706a' },
      traits: ['Enorme', 'Subida gigantesca por peça'],
      problems: ['Recarga lenta', 'Trincas'],
      threats: ['storm', 'debris', 'balloon']
    }),
    M(16, 'titanio', 'Titânio', 'barra', 'barras', 50000, {
      base: { capacity: 8, rechargeSec: 20, placeSec: 2 },
      look: { len: 48, body: '#9aa4b8', light: '#d0d8e8', shade: '#5a6478' },
      traits: ['Mais leve', 'Extremamente caro'],
      problems: ['Custo absurdo'],
      threats: ['debris', 'satellite']
    }),
    M(17, 'carbono', 'Fibra de Carbono', 'tubo', 'tubos', 80000, {
      base: { capacity: 10, rechargeSec: 18, placeSec: 1.8 },
      look: { len: 48, body: '#2a2a32', light: '#4a4a58', shade: '#14141a' },
      traits: ['Relação resistência/peso gigantesca'],
      problems: ['Impactos', 'Custo'],
      threats: ['debris', 'satellite', 'meteor']
    }),
    M(18, 'vidro', 'Vidro Estrutural Temperado', 'placa', 'placas', 120000, {
      base: { capacity: 8, rechargeSec: 20, placeSec: 2 },
      look: { len: 48, body: 'rgba(160,220,255,.55)', light: 'rgba(230,250,255,.8)', shade: 'rgba(90,150,200,.6)' },
      traits: ['Estrutura transparente', 'Alta resistência normal'],
      problems: ['Estilhaça com impactos específicos'],
      threats: ['meteor', 'debris', 'hail']
    }),
    M(19, 'ceramica', 'Cerâmica Estrutural', 'bloco', 'blocos', 200000, {
      base: { capacity: 8, rechargeSec: 22, placeSec: 2 },
      look: { len: 48, body: '#e0d0c0', light: '#f8ece0', shade: '#a89480' },
      traits: ['Resistente ao calor'],
      problems: ['Frágil à vibração'],
      threats: ['meteor', 'satellite']
    }),
    M(20, 'basalto', 'Basalto Sinterizado', 'viga', 'vigas', 350000, {
      base: { capacity: 8, rechargeSec: 24, placeSec: 2.2 },
      look: { len: 50, body: '#3c3a40', light: '#5c5a62', shade: '#222026' },
      traits: ['Rocha fundida', 'Ótimo em grandes altitudes'],
      problems: ['Peso', 'Choque térmico'],
      threats: ['meteor', 'debris']
    }),
    M(21, 'memoria', 'Liga com Memória de Forma', 'haste', 'hastes', 600000, {
      mechanic: 'AUTORREPARO', base: { capacity: 10, rechargeSec: 22, placeSec: 2 },
      look: { len: 48, body: '#b8a8c8', light: '#e0d4f0', shade: '#7a6a8c' },
      traits: ['Retorna à forma original'],
      problems: ['Calor muda a forma'],
      threats: ['meteor', 'satellite', 'astronaut']
    }),
    M(22, 'magnetica', 'Vigas Magnéticas', 'viga', 'vigas', 1e6, {
      mechanic: 'POLARIDADE', base: { capacity: 10, rechargeSec: 22, placeSec: 2 },
      look: { len: 48, body: '#c83030', light: '#f06060', shade: '#3050c8' },
      traits: ['Junções magnéticas'],
      problems: ['Peças podem se repelir'],
      threats: ['satellite', 'solar_wind']
    }),
    M(23, 'meteorito', 'Estrutura de Meteorito', 'fragmento', 'fragmentos', 2e6, {
      base: { capacity: 6, rechargeSec: 30, placeSec: 2.6 },
      look: { len: 50, body: '#5a4a44', light: '#8a7a70', shade: '#2a201c' },
      traits: ['Extremamente pesada e resistente'],
      problems: ['Coleta durante a subida'],
      threats: ['meteor', 'alien']
    }),
    M(24, 'cristal', 'Cristal Estrutural', 'cristal', 'cristais', 5e6, {
      mechanic: 'RESSONÂNCIA', base: { capacity: 8, rechargeSec: 26, placeSec: 2.2 },
      look: { len: 48, body: '#9ae0e8', light: '#e0ffff', shade: '#4aa0b0' },
      traits: ['Grandes vigas cristalinas'],
      problems: ['Vibrações perigosas'],
      threats: ['meteor', 'alien', 'anomaly']
    }),
    M(25, 'quitina', 'Quitina Colossal', 'placa', 'placas', 12e6, {
      mechanic: 'REGENERAÇÃO', base: { capacity: 8, rechargeSec: 26, placeSec: 2.2 },
      look: { len: 48, body: '#5a7a3a', light: '#8aaa5a', shade: '#2a4a1a' },
      traits: ['Material biológico', 'Regenera lentamente'],
      problems: ['Organismos atacam'],
      threats: ['space_worm', 'alien']
    }),
    M(26, 'osso', 'Osso Sintético', 'osso', 'ossos', 30e6, {
      base: { capacity: 8, rechargeSec: 26, placeSec: 2.2 },
      look: { len: 48, body: '#f0ece0', light: '#ffffff', shade: '#b8b0a0' },
      traits: ['Branco, estranho, resistente', 'Regeneração limitada'],
      problems: ['Fraturas'],
      threats: ['space_worm', 'alien']
    }),
    M(27, 'metamaterial', 'Metamaterial Hexagonal', 'célula', 'células', 80e6, {
      base: { capacity: 10, rechargeSec: 24, placeSec: 2 },
      look: { len: 48, body: '#40c0a0', light: '#80ffe0', shade: '#208060' },
      traits: ['Distribui impactos'],
      problems: ['Sobrecarga em cascata'],
      threats: ['meteor', 'alien', 'anomaly']
    }),
    M(28, 'aerogel', 'Vigas de Aerogel Reforçado', 'viga', 'vigas', 200e6, {
      base: { capacity: 14, rechargeSec: 20, placeSec: 1.8 },
      look: { len: 50, body: 'rgba(200,220,255,.5)', light: 'rgba(240,250,255,.7)', shade: 'rgba(140,160,200,.5)' },
      traits: ['Enormes', 'Ridiculamente leves'],
      problems: ['Impactos pontuais'],
      threats: ['meteor', 'debris']
    }),
    M(29, 'programavel', 'Matéria Programável', 'módulo', 'módulos', 400e6, {
      mechanic: 'RECONFIGURAÇÃO', base: { capacity: 10, rechargeSec: 24, placeSec: 2 },
      look: { len: 48, body: '#29adff', light: '#a0e0ff', shade: '#1d2b53' },
      traits: ['Peças ajustam sua forma'],
      problems: ['Exige energia'],
      threats: ['alien', 'anomaly']
    }),
    M(30, 'gravitica', 'Vigas Gravíticas', 'viga', 'vigas', 2e9, {
      mechanic: 'ENERGIA', base: { capacity: 10, rechargeSec: 26, placeSec: 2 },
      look: { len: 48, body: '#7e2553', light: '#ff77a8', shade: '#3a0f28' },
      traits: ['Reduzem o próprio peso'],
      problems: ['Consumo de energia'],
      threats: ['anomaly', 'alien']
    }),
    M(31, 'asteroide', 'Matéria de Asteroide Compactada', 'bloco', 'blocos', 1e11, {
      base: { capacity: 6, rechargeSec: 32, placeSec: 2.6 },
      look: { len: 50, body: '#6a5a50', light: '#9a8a7a', shade: '#3a2a20' },
      traits: ['Peças absurdamente gigantescas'],
      problems: ['Inércia'],
      threats: ['meteor', 'alien']
    }),
    M(32, 'extraterrestre', 'Liga Extraterrestre', 'liga', 'ligas', 1e12, {
      base: { capacity: 10, rechargeSec: 26, placeSec: 2 },
      look: { len: 48, body: '#00e436', light: '#a0ffb0', shade: '#008751' },
      traits: ['Material desconhecido', 'Extremamente eficiente'],
      problems: ['Reage de forma imprevisível'],
      threats: ['alien', 'anomaly']
    }),
    M(33, 'antigravidade', 'Cristal de Antigravidade', 'cristal', 'cristais', 1e13, {
      base: { capacity: 10, rechargeSec: 26, placeSec: 2 },
      look: { len: 48, body: '#ffccaa', light: '#fff1e8', shade: '#c08060' },
      traits: ['Parte do peso deixa de existir'],
      problems: ['A torre oscila no espaço'],
      threats: ['anomaly', 'alien']
    }),
    M(34, 'plasma', 'Vigas de Plasma Confinado', 'feixe', 'feixes', 1e15, {
      base: { capacity: 10, rechargeSec: 28, placeSec: 2 },
      look: { len: 48, body: '#ff77a8', light: '#ffe0f0', shade: '#a01060' },
      traits: ['Plasma em formato estrutural'],
      problems: ['Falhas de confinamento'],
      threats: ['solar_wind', 'anomaly']
    }),
    M(35, 'exotica', 'Matéria Exótica', 'fragmento', 'fragmentos', 1e17, {
      base: { capacity: 10, rechargeSec: 28, placeSec: 2 },
      look: { len: 48, body: '#83769c', light: '#c0b0e0', shade: '#4a3a60' },
      traits: ['Desafia algumas leis físicas'],
      problems: ['Comportamento paradoxal'],
      threats: ['anomaly', 'entity']
    }),
    M(36, 'escura', 'Filamentos de Matéria Escura', 'filamento', 'filamentos', 1e19, {
      base: { capacity: 10, rechargeSec: 28, placeSec: 2 },
      look: { len: 48, body: 'rgba(30,20,50,.35)', light: 'rgba(120,100,200,.5)', shade: 'rgba(10,5,20,.4)' },
      traits: ['Praticamente invisíveis'],
      problems: ['Difícil enxergar danos'],
      threats: ['entity', 'anomaly']
    }),
    M(37, 'fotonica', 'Vigas Fotônicas', 'feixe', 'feixes', 1e21, {
      base: { capacity: 10, rechargeSec: 28, placeSec: 2 },
      look: { len: 48, body: '#ffec27', light: '#ffffff', shade: '#ffa300' },
      traits: ['Luz confinada'],
      problems: ['Sombra apaga estrutura'],
      threats: ['entity', 'rift']
    }),
    M(38, 'espacotempo', 'Estruturas de Espaço-Tempo', 'região', 'regiões', 1e23, {
      base: { capacity: 10, rechargeSec: 30, placeSec: 2 },
      look: { len: 48, body: '#1d2b53', light: '#29adff', shade: '#000000' },
      traits: ['Cada peça é uma região estável do espaço'],
      problems: ['Dilatação temporal'],
      threats: ['rift', 'entity']
    }),
    M(39, 'degenerada', 'Matéria Degenerada', 'núcleo', 'núcleos', 1e25, {
      base: { capacity: 6, rechargeSec: 34, placeSec: 2.6 },
      look: { len: 50, body: '#fff1e8', light: '#ffffff', shade: '#c2c3c7' },
      traits: ['Escala cósmica', 'Extremamente densa'],
      problems: ['Colapso gravitacional'],
      threats: ['rift', 'entity']
    }),
    M(40, 'realidade', 'Vigas de Realidade', 'viga', 'vigas', 8.8e26, {
      base: { capacity: 8, rechargeSec: 30, placeSec: 2 },
      look: { len: 50, body: '#ffffff', light: '#ffffff', shade: '#83769c' },
      traits: ['Atravessa o universo'],
      problems: ['A própria realidade'],
      threats: ['rift', 'entity']
    })
  ];

  PALIT.materialById = function (id) {
    for (var i = 0; i < PALIT.MATERIALS.length; i++) if (PALIT.MATERIALS[i].id === id) return PALIT.MATERIALS[i];
    return null;
  };
})();
