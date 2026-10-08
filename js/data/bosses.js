/* =========================================================
   CHEFÕES — aparecem em alturas fixas de cada era (marcadas
   na régua). Pulam na torre quebrando palitos até serem
   derrotados. Enquanto o chefão vive, não dá para construir.
   sprite: sprite base (ampliado); scale: tamanho na tela
   hp: vida · smash: segundos entre pancadas · hits: peças por pancada
   jump: segundos entre saltos · land: peças quebradas ao aterrissar
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.BOSSES = {
  fosforo: [
    { id: 'bartolomeu', layer: 220, name: 'BARTOLOMEU, O GATO GORDO', sprite: 'cat', scale: 3, tint: '',
      hp: 45, smash: 3.4, hits: 2, jump: 9, land: 2, reward: 600 },
    { id: 'corvorei', layer: 430, name: 'O CORVO-REI', sprite: 'crow', scale: 3.4, tint: 'hue-rotate(250deg) saturate(1.6)',
      hp: 95, smash: 2.8, hits: 2, jump: 7, land: 3, reward: 1600 }
  ],
  dente: [
    { id: 'domcascudo', layer: 260, name: 'DOM CASCUDO, O POMBO-CHEFÃO', sprite: 'pigeon', scale: 3.4, tint: 'saturate(1.8) contrast(1.1)',
      hp: 150, smash: 3, hits: 2, jump: 8, land: 2, reward: 3500 },
    { id: 'megadrone', layer: 620, name: 'MEGA-DRONE DO LUQUINHAS', sprite: 'toydrone', scale: 3.6, tint: 'hue-rotate(120deg) saturate(1.5)',
      hp: 240, smash: 2.4, hits: 2, jump: 6, land: 3, reward: 7000 },
    { id: 'gaivota', layer: 920, name: 'DONA GAIVOTA DO TELHADO', sprite: 'bird', scale: 3.8, tint: 'grayscale(.7) brightness(1.5)',
      hp: 340, smash: 2.2, hits: 3, jump: 6, land: 3, reward: 12000 }
  ]
};
