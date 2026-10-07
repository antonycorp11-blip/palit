/* =========================================================
   AMEAÇAS — data-driven.
   kind:
     flyer      voa até a torre e ataca a cada `interval`
     climber    sobe pela lateral da torre e ataca
     projectile vem em direção à torre e impacta após `impact` s
     pounce     se aproxima, prepara o bote (`windup`) e acerta uma vez
     faller     cai do céu sobre a torre
   dmg: crack | drop | steal | impact | ignite
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.THREATS = {
  fly:    { name: 'Mosca',       sprite: 'fly',    hp: 2, speed: 70,  kind: 'flyer',      interval: 9,  dmg: 'crack',  reward: 2,  minLayer: 0,   w: 10, tags: ['insect'] },
  ant:    { name: 'Formiga',     sprite: 'ant',    hp: 1, speed: 16,  kind: 'climber',    interval: 6,  dmg: 'crack',  reward: 1,  minLayer: 10,  w: 7,  tags: ['insect', 'ground'], group: [2, 4] },
  beetle: { name: 'Besouro',     sprite: 'beetle', hp: 5, speed: 30,  kind: 'flyer',      interval: 7,  dmg: 'crack',  reward: 6,  minLayer: 40,  w: 6,  tags: ['insect'] },
  ball:   { name: 'Bola Perdida', sprite: 'ball',  hp: 2, speed: 0,   kind: 'projectile', impact: 3.6,  dmg: 'impact', hits: 2, reward: 4, minLayer: 15, w: 4, tags: ['ground'] },
  bird:   { name: 'Pássaro',     sprite: 'bird',   hp: 4, speed: 90,  kind: 'flyer',      interval: 6,  dmg: 'steal',  reward: 6,  minLayer: 50,  w: 6,  tags: ['bird'] },
  gecko:  { name: 'Lagartixa',   sprite: 'gecko',  hp: 6, speed: 22,  kind: 'climber',    interval: 8,  dmg: 'drop',   reward: 8,  minLayer: 80,  w: 5,  tags: ['ground'] },
  lens:   { name: 'Criança com Lupa', sprite: 'lens', hp: 4, speed: 40, kind: 'flyer',  interval: 7,  dmg: 'ignite', reward: 7,  minLayer: 120, w: 3 },
  cat:    { name: 'Gato',        sprite: 'cat',    hp: 8, speed: 40,  kind: 'pounce',     windup: 6,    dmg: 'impact', hits: 3, reward: 12, minLayer: 150, w: 3, tags: ['ground'] },
  kite:   { name: 'Pipa',        sprite: 'kite',   hp: 5, speed: 35,  kind: 'flyer',      interval: 5,  dmg: 'crack',  reward: 9,  minLayer: 350, w: 3 },
  crow:   { name: 'Corvo',       sprite: 'crow',   hp: 9, speed: 100, kind: 'flyer',      interval: 5,  dmg: 'steal',  reward: 15, minLayer: 400, w: 3, tags: ['bird'] },
  /* ---- era 02: telhados ---- */
  pigeon:     { name: 'Pombo Cascudo',     sprite: 'pigeon',     hp: 3, speed: 85, kind: 'flyer',      interval: 6, dmg: 'steal', reward: 8,  minLayer: 0,   w: 8, tags: ['bird'], group: [1, 3] },
  wasp:       { name: 'Vespa',             sprite: 'wasp',       hp: 2, speed: 95, kind: 'flyer',      interval: 5, dmg: 'crack', reward: 6,  minLayer: 20,  w: 6, tags: ['insect'], group: [2, 3] },
  paperplane: { name: 'Aviãozinho de Papel', sprite: 'paperplane', hp: 1, speed: 0, kind: 'projectile', impact: 2.6, dmg: 'impact', hits: 1, reward: 5, minLayer: 10, w: 6 },
  toydrone:   { name: 'Drone de Brinquedo', sprite: 'toydrone',  hp: 7, speed: 45, kind: 'flyer',      interval: 6, dmg: 'drop',  reward: 16, minLayer: 150, w: 4 },
  hail:   { name: 'Granizo',     sprite: 'hail',   hp: 1, speed: 150, kind: 'faller',                   dmg: 'crack',  reward: 1,  minLayer: 0,   w: 0 }
  /* Eras futuras: drone, helicopter, plane, lightning, balloon, debris,
     satellite, meteor, astronaut, alien, space_worm, anomaly, entity, rift... */
};
