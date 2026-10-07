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
