/* =========================================================
   EVENTOS — data-driven. `min` = camada mínima.
   good: eventos positivos (afetados por Sorte em Eventos).
   eras: lista de materiais onde aparecem (vazio = todos).
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.EVENTS = [
  { id: 'gust',       name: 'RAJADA DE VENTO',      w: 30, min: 0,   type: 'gust',  str: [0.6, 1.0] },
  { id: 'gust_strong', name: 'RAJADA FORTE',        w: 10, min: 200, type: 'gust',  str: [1.1, 1.5] },
  { id: 'whirl',      name: 'REDEMOINHO',           w: 1,  min: 700, type: 'gust',  str: [1.6, 2.0] },
  { id: 'windy',      name: 'VENTANIA',             w: 4,  min: 400, type: 'windy', dur: 30 },
  { id: 'breeze',     name: 'BRISA CONSTANTE',      w: 4,  min: 0,   type: 'breeze', dur: 40 },
  { id: 'dew',        name: 'ORVALHO DA MANHÃ',     w: 3,  min: 50,  type: 'rain',  dur: 20, str: 0.25 },
  { id: 'drizzle',    name: 'CHUVA LEVE',           w: 8,  min: 30,  type: 'rain',  dur: 40, str: 0.5 },
  { id: 'rain',       name: 'CHUVA',                w: 5,  min: 250, type: 'rain',  dur: 50, str: 1 },
  { id: 'hail',       name: 'GRANIZO',              w: 3,  min: 350, type: 'hail',  dur: 18 },
  { id: 'storm',      name: 'TEMPESTADE DE VERÃO',  w: 1.5, min: 600, type: 'storm', dur: 60 },
  { id: 'heat',       name: 'SOL FORTE',            w: 3,  min: 100, type: 'heat',  dur: 40 },
  { id: 'jam',        name: 'CAIXA EMPERRADA',      w: 5,  min: 20,  type: 'jam' },
  { id: 'defect',     name: 'LOTE DEFEITUOSO',      w: 4,  min: 40,  type: 'defect', n: 3 },
  { id: 'loose',      name: 'PEÇA SOLTA',           w: 5,  min: 30,  type: 'loose' },
  { id: 'dog',        name: 'CACHORRO ESBARROU NA BASE', w: 2, min: 100, type: 'bump' },
  { id: 'kid',        name: 'CRIANÇA CHUTOU A BOLA', w: 4, min: 15,  type: 'spawn', threat: 'ball', n: [1, 2] },
  { id: 'ants',       name: 'TRILHA DE FORMIGAS',   w: 3,  min: 60,  type: 'spawn', threat: 'ant', n: [4, 6] },
  { id: 'swarm',      name: 'ENXAME DE MOSCAS',     w: 2,  min: 300, type: 'spawn', threat: 'fly', n: [4, 6] },
  { id: 'flock',      name: 'REVOADA',              w: 1.5, min: 500, type: 'spawn', threat: 'bird', n: [3, 3] },
  { id: 'magnifier',  name: 'CRIANÇA COM LUPA',     w: 2,  min: 120, type: 'spawn', threat: 'lens', n: [1, 1] },
  { id: 'kites',      name: 'FESTIVAL DE PIPAS',    w: 1,  min: 450, type: 'spawn', threat: 'kite', n: [2, 3] },
  { id: 'boost',      name: 'PRODUÇÃO ACELERADA',   w: 6,  min: 0,   type: 'boost', dur: 30, good: true },
  { id: 'found',      name: 'FÓSFOROS ENCONTRADOS', w: 6,  min: 0,   type: 'found', n: [3, 8], good: true },
  { id: 'tip',        name: 'GORJETA DE VISITANTE', w: 6,  min: 10,  type: 'money', mult: 1, good: true },
  { id: 'photo',      name: 'FOTÓGRAFO AMADOR',     w: 3,  min: 150, type: 'money', mult: 3, good: true },
  { id: 'calm',       name: 'CALMARIA',             w: 4,  min: 0,   type: 'calm',  dur: 60, good: true },
  { id: 'c_mercador', name: 'MERCADOR AMBULANTE',   w: 1.4, min: 40,  type: 'choice', choice: 'mercador' },
  { id: 'c_cola',     name: 'COLA EXPERIMENTAL',    w: 1.1, min: 60,  type: 'choice', choice: 'cola' },
  { id: 'c_luca',     name: 'LUQUINHAS PEDE UM PALITO', w: 1.1, min: 35, type: 'choice', choice: 'luquinhas' },
  { id: 'c_insp',     name: 'FISCALIZAÇÃO SURPRESA', w: 1,  min: 90,  type: 'choice', choice: 'inspetor' },
  { id: 'c_pombo',    name: 'GERVÁSIO NEGOCIA',     w: 1,   min: 120, type: 'choice', choice: 'pombo' },
  { id: 'lucky',      name: 'CAIXA PREMIADA',       w: 0.6, min: 0,  type: 'refill', good: true }
];
