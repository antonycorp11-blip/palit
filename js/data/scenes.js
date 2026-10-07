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
