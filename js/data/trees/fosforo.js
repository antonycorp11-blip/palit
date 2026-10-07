/* =========================================================
   ÁRVORE — ERA 01 — PALITO DE FÓSFORO
   136 nós · 10 ramos · ~500 compras para dominar o material.
   Formato do nó:
     id  : identificador único na árvore
     b   : ramo
     n   : nome
     d   : descrição / sabor
     lv  : níveis máximos
     c   : custo base (nível 1)
     g   : crescimento do custo por nível (padrão 1.3)
     e   : efeitos por nível { stat: valor | [valor por nível] }
     r   : pré-requisitos ['id', 'id:nivel']
     sp  : nó especial (marco do ramo)
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};
PALIT.TREES = PALIT.TREES || {};

PALIT.TREES.fosforo = {
  id: 'fosforo',
  name: 'Árvore do Fósforo',
  branches: [
    { id: 'prod', name: 'PRODUÇÃO',   color: '#ffa300', icon: 'gear' },
    { id: 'cap',  name: 'CAPACIDADE', color: '#ab5236', icon: 'box' },
    { id: 'spd',  name: 'VELOCIDADE', color: '#ffec27', icon: 'bolt' },
    { id: 'con',  name: 'CONSTRUÇÃO', color: '#00e436', icon: 'layers' },
    { id: 'res',  name: 'RESISTÊNCIA', color: '#29adff', icon: 'shield' },
    { id: 'rep',  name: 'REPAROS',    color: '#ff77a8', icon: 'wrench' },
    { id: 'def',  name: 'DEFESA',     color: '#ff004d', icon: 'fist' },
    { id: 'eff',  name: 'EFICIÊNCIA', color: '#83769c', icon: 'coin' },
    { id: 'qual', name: 'QUALIDADE DO FÓSFORO', color: '#ffccaa', icon: 'match' },
    { id: 'auto', name: 'AUTOMAÇÃO CONTROLADA', color: '#c2c3c7', icon: 'robot' }
  ],
  nodes: [
    { id: 'root', b: null, n: 'Primeira Caixa', d: 'Uma caixinha amassada de fósforos e uma ideia ridícula: construir para cima.', lv: 1, c: 3, e: { capacity: 1 }, r: [] },

    /* ================= PRODUÇÃO ================= */
    { id: 'p1', b: 'prod', n: 'Riscar Mais Rápido', d: 'A prática acende a mão. Cada fósforo sai da linha um pouco antes.', lv: 5, c: 6, e: { rechargeSec: -0.2 }, r: ['root'] },
    { id: 'p2', b: 'prod', n: 'Lixa Nova na Caixa', d: 'Trocar a lateral gasta da caixa acelera a separação dos palitos.', lv: 5, c: 20, e: { rechargeSec: -0.1 }, r: ['p1:3'] },
    { id: 'p3', b: 'prod', n: 'Ritmo de Fábrica', d: 'Uma rotina. Separar, alinhar, entregar. Repetir.', lv: 10, c: 15, g: 1.22, e: { prodMult: 0.02 }, r: ['p1'] },
    { id: 'p4', b: 'prod', n: 'Lote Pré-Separado', d: 'Fósforos já separados por tamanho chegam mais rápido à caixa.', lv: 5, c: 60, e: { rechargeSec: -0.1 }, r: ['p2'] },
    { id: 'p5', b: 'prod', n: 'Esteira de Papelão', d: 'Uma rampinha de papelão que leva fósforos direto até a caixa.', lv: 5, c: 80, e: { prodMult: 0.03 }, r: ['p3:5'] },
    { id: 'p6', b: 'prod', n: 'Turno Extra', d: 'Mais tempo dedicado à produção. A mesa nunca esfria.', lv: 10, c: 150, g: 1.2, e: { prodMult: 0.02 }, r: ['p5'] },
    { id: 'p7', b: 'prod', n: 'Produção Offline', d: 'Deixar uma pilha preparada antes de sair.', lv: 3, c: 25, e: { offlineMin: 2 }, r: ['p3'] },
    { id: 'p8', b: 'prod', n: 'Gaveta da Cozinha', d: 'Uma gaveta inteira dedicada a fósforos soltos.', lv: 2, c: 120, e: { offlineMin: 5 }, r: ['p7'] },
    { id: 'p9', b: 'prod', n: 'Estoque do Vizinho', d: 'O vizinho deixa caixas na porta enquanto você está fora.', lv: 1, c: 400, e: { offlineMin: 10 }, r: ['p8'] },
    { id: 'p10', b: 'prod', n: 'Produção Sob Pressão', d: 'Continuar separando fósforos mesmo com bichos rondando a torre.', lv: 10, c: 70, g: 1.2, e: { attackProd: 0.05 }, r: ['p4'] },
    { id: 'p11', b: 'prod', n: 'Recarga Contínua', d: 'A caixa continua recarregando enquanto você faz reparos.', lv: 1, c: 500, e: { rechargeWhileRepair: 1 }, r: ['p10:5', 'p6:3'] },
    { id: 'p12', b: 'prod', n: 'Mão Calejada', d: 'Anos de fósforos. Os dedos já sabem o caminho.', lv: 10, c: 250, g: 1.18, e: { rechargeSec: -0.05 }, r: ['p4', 'p6:5'] },
    { id: 'p13', b: 'prod', n: 'Máquina de Palitar', d: 'Uma geringonça de manivela que separa fósforos sozinha. Barulhenta.', lv: 4, c: 900, g: 1.35, e: { prodMult: 0.05 }, r: ['p12:5'] },
    { id: 'p14', b: 'prod', n: 'Pacote Econômico', d: 'Às vezes vêm dois fósforos grudados. Aproveite.', lv: 10, c: 200, g: 1.2, e: { doubleChance: 0.01 }, r: ['p12'] },
    { id: 'p15', b: 'prod', n: 'FÁBRICA DE FÓSFOROS', d: 'Uma linha de produção completa na mesa da cozinha.', lv: 1, c: 3000, sp: true, e: { prodMult: 0.1, doubleChance: 0.02 }, r: ['p13', 'p14', 'p9', 'p11'] },

    /* ================= CAPACIDADE ================= */
    { id: 'c1', b: 'cap', n: 'Caixa Maior', d: 'Uma caixa um pouco mais funda.', lv: 5, c: 5, e: { capacity: [2, 2, 3, 3, 5] }, r: ['root'] },
    { id: 'c2', b: 'cap', n: 'Divisória Interna', d: 'Arrumar melhor os palitos libera espaço.', lv: 10, c: 30, g: 1.2, e: { capacity: 1 }, r: ['c1:3'] },
    { id: 'c3', b: 'cap', n: 'Bolso do Avental', d: 'Alguns fósforos guardados só para emergências.', lv: 2, c: 25, e: { reserveCap: [2, 3] }, r: ['c1'] },
    { id: 'c4', b: 'cap', n: 'Reserva Emergencial', d: 'Um estoque separado para reparos rápidos.', lv: 5, c: 60, e: { reserveCap: 1 }, r: ['c3'] },
    { id: 'c5', b: 'cap', n: 'Caixa Dupla', d: 'Duas caixas coladas lado a lado.', lv: 2, c: 150, e: { capacity: 5 }, r: ['c2:5'] },
    { id: 'c6', b: 'cap', n: 'Gaveta Organizada', d: 'Fileiras perfeitas. Nenhum espaço desperdiçado.', lv: 10, c: 200, g: 1.18, e: { capacity: 2 }, r: ['c5'] },
    { id: 'c7', b: 'cap', n: 'Reserva Lacrada', d: 'Pote de vidro com tampa. Nada se perde.', lv: 2, c: 300, e: { reserveCap: 3 }, r: ['c4'] },
    { id: 'c8', b: 'cap', n: 'Transbordo Inteligente', d: 'Quando a caixa enche, a produção escorre para a reserva.', lv: 5, c: 80, e: { reserveFill: 0.15 }, r: ['c4:2'] },
    { id: 'c9', b: 'cap', n: 'Pequeno Estoque Secundário', d: 'Uma segunda caixa sempre à mão.', lv: 5, c: 400, g: 1.25, e: { capacity: 3 }, r: ['c6:5'] },
    { id: 'c10', b: 'cap', n: 'Caixa de Madeira', d: 'Abandonar o papelão. Uma caixinha de madeira de verdade.', lv: 5, c: 700, g: 1.25, e: { capacity: 4 }, r: ['c9'] },
    { id: 'c11', b: 'cap', n: 'Empilhamento Compacto', d: 'Encaixar cabeça com pé. Um palito a mais por vez.', lv: 20, c: 300, g: 1.1, e: { capacity: 1 }, r: ['c10:3'] },
    { id: 'c12', b: 'cap', n: 'Saque Rápido', d: 'Quando a caixa esvazia, a reserva também serve para construir.', lv: 1, c: 600, e: { reserveBuild: 1 }, r: ['c7', 'c8:3'] },
    { id: 'c13', b: 'cap', n: 'ARMÁRIO DE DESPENSA', d: 'Uma prateleira inteira só para fósforos.', lv: 1, c: 3000, sp: true, e: { capacity: 10, reserveCap: 5 }, r: ['c11', 'c12'] },

    /* ================= VELOCIDADE ================= */
    { id: 's1', b: 'spd', n: 'Dedos Firmes', d: 'Mão menos trêmula, peça posicionada mais rápido.', lv: 5, c: 8, e: { placeSpeed: 0.03 }, r: ['root'] },
    { id: 's2', b: 'spd', n: 'Pinça de Cozinha', d: 'Uma pinça improvisada para segurar o palito.', lv: 3, c: 40, e: { placeSpeed: 0.04 }, r: ['s1:3'] },
    { id: 's3', b: 'spd', n: 'Mira Treinada', d: 'Acertar o encaixe de primeira.', lv: 5, c: 30, e: { placeSpeed: 0.03 }, r: ['s1'] },
    { id: 's4', b: 'spd', n: 'Ritmo de Construção', d: 'Toques em sequência aceleram a colocação (até 5 acúmulos).', lv: 5, c: 50, e: { comboStep: 0.01 }, r: ['s3:2'] },
    { id: 's5', b: 'spd', n: 'Retorno Rápido ao Topo', d: 'Voltar ao topo da torre instantaneamente.', lv: 1, c: 40, e: { quickReturn: 1 }, r: ['s1'] },
    { id: 's6', b: 'spd', n: 'Fila de Toque', d: 'Um toque durante a colocação já prepara a próxima peça.', lv: 1, c: 150, e: { tapQueue: 1 }, r: ['s4:3'] },
    { id: 's7', b: 'spd', n: 'Precisão de Relojoeiro', d: 'Movimentos mínimos. Nada sobra.', lv: 10, c: 120, g: 1.2, e: { placeSpeed: 0.02 }, r: ['s3:5'] },
    { id: 's8', b: 'spd', n: 'Mão Dupla', d: 'Chance de posicionar duas peças de uma vez.', lv: 10, c: 250, g: 1.2, e: { doublePlace: 0.01 }, r: ['s7:5'] },
    { id: 's9', b: 'spd', n: 'Postura Correta', d: 'Coluna reta, cotovelo apoiado.', lv: 5, c: 90, e: { placeSpeed: 0.03 }, r: ['s2'] },
    { id: 's10', b: 'spd', n: 'Ergonomia', d: 'Pequenos ajustes de mesa, cadeira e luz.', lv: 15, c: 180, g: 1.14, e: { placeSpeed: 0.01 }, r: ['s9', 's7:5'] },
    { id: 's11', b: 'spd', n: 'Ritmo Constante', d: 'O ritmo não quebra. A sequência rende mais.', lv: 5, c: 400, e: { comboStep: 0.01 }, r: ['s6'] },
    { id: 's12', b: 'spd', n: 'MESTRE DO ENCAIXE', d: 'Cada fósforo encontra seu lugar como se soubesse o caminho.', lv: 1, c: 2800, sp: true, e: { placeSpeed: 0.1, doublePlace: 0.03 }, r: ['s10', 's8', 's11'] },

    /* ================= CONSTRUÇÃO ================= */
    { id: 'k1', b: 'con', n: 'Valor por Camada', d: 'Camadas bem feitas atraem mais curiosos.', lv: 5, c: 6, e: { layerValue: [0.02, 0.03, 0.02, 0.03, 0.02] }, r: ['root'] },
    { id: 'k2', b: 'con', n: 'Esquadro de Papelão', d: 'Um cantinho de caixa de cereal para conferir os ângulos.', lv: 3, c: 10, e: { limitLayers: 20 }, r: ['root'] },
    { id: 'k3', b: 'con', n: 'Peças Maiores', d: 'Escolher sempre os fósforos mais compridos do lote.', lv: 3, c: 40, e: { pieceSize: [0.02, 0.03, 0.04] }, r: ['k1:2'] },
    { id: 'k4', b: 'con', n: 'Comprimento Máximo', d: 'Aproveitar até o último milímetro de cada palito.', lv: 1, c: 200, e: { pieceSize: 0.05 }, r: ['k3:3'] },
    { id: 'k5', b: 'con', n: 'Nível de Bolha', d: 'Camadas perfeitamente horizontais aguentam mais altura.', lv: 2, c: 60, e: { limitLayers: 30 }, r: ['k2:3'] },
    { id: 'k6', b: 'con', n: 'Base Alargada', d: 'Uma base mais firme permite subir mais.', lv: 2, c: 150, e: { limitLayers: 40 }, r: ['k5'] },
    { id: 'k7', b: 'con', n: 'Camada Reforçada', d: 'A cada 10 camadas, uma amarração de linha.', lv: 1, c: 400, e: { limitLayers: 50, visBands: 1 }, r: ['k6'] },
    { id: 'k8', b: 'con', n: 'Junção Reforçada', d: 'Cruzamentos mais justos entre os palitos.', lv: 2, c: 300, e: { limitLayers: 25, looseResist: 0.02 }, r: ['k6'] },
    { id: 'k9', b: 'con', n: 'Canto Reforçado', d: 'Os quatro cantos recebem uma volta de linha.', lv: 1, c: 700, e: { limitLayers: 50, visCorners: 1 }, r: ['k8', 'k7'] },
    { id: 'k10', b: 'con', n: 'Reforço Cruzado', d: 'Travamento diagonal invisível. A torre deixa de torcer.', lv: 1, c: 1200, e: { limitLayers: 60, sway: 0.05 }, r: ['k9', 'r5'] },
    { id: 'k11', b: 'con', n: 'Valor Estético', d: 'Uma torre bonita vale mais.', lv: 10, c: 35, g: 1.2, e: { layerValue: 0.02 }, r: ['k1'] },
    { id: 'k12', b: 'con', n: 'Marco Comemorativo', d: 'Cada marco de 100 camadas paga um bônus maior.', lv: 5, c: 120, e: { milestoneBonus: 0.1 }, r: ['k11:5'] },
    { id: 'k13', b: 'con', n: 'Prumo Perfeito', d: 'Um fio com uma porca na ponta. Verticalidade absoluta.', lv: 5, c: 900, g: 1.25, e: { limitLayers: 20 }, r: ['k10'] },
    { id: 'k14', b: 'con', n: 'Arquitetura de Palito', d: 'Você já não empilha. Você projeta.', lv: 5, c: 800, g: 1.3, e: { layerValue: 0.05 }, r: ['k12', 'k13:3'] },
    { id: 'k15', b: 'con', n: 'COROAMENTO', d: 'A técnica final que permite atingir o limite absoluto do fósforo.', lv: 1, c: 4000, sp: true, e: { limitLayers: 80 }, r: ['k14', 'k13', 'k4'] },

    /* ================= RESISTÊNCIA ================= */
    { id: 'r1', b: 'res', n: 'Resistência ao Vento', d: 'Palitos alinhados contra a direção predominante do vento.', lv: 3, c: 8, e: { windResist: [0.03, 0.04, 0.03] }, r: ['root'] },
    { id: 'r2', b: 'res', n: 'Base Pesada', d: 'Uma moeda embaixo de cada canto.', lv: 5, c: 25, e: { sway: 0.02 }, r: ['r1'] },
    { id: 'r3', b: 'res', n: 'Peça Não Se Solta', d: 'Chance de peça se soltar reduzida.', lv: 3, c: 20, e: { looseResist: [0.02, 0.02, 0.03] }, r: ['r1'] },
    { id: 'r4', b: 'res', n: 'Aerodinâmica de Palito', d: 'Cabeças viradas para dentro cortam o vento.', lv: 10, c: 50, g: 1.2, e: { windResist: 0.02 }, r: ['r1:3'] },
    { id: 'r5', b: 'res', n: 'Redução de Oscilação', d: 'Menos balanço no topo.', lv: 2, c: 80, e: { sway: [0.02, 0.03] }, r: ['r2:3'] },
    { id: 'r6', b: 'res', n: 'Vento Sem Dano', d: 'Chance de uma rajada passar sem soltar nada.', lv: 5, c: 120, e: { windImmune: 0.02 }, r: ['r4:3'] },
    { id: 'r7', b: 'res', n: 'Amarração de Linha', d: 'Linha de costura passada entre as camadas.', lv: 3, c: 100, e: { limitLayers: 30, looseResist: 0.01 }, r: ['r3'] },
    { id: 'r8', b: 'res', n: 'Contrapeso', d: 'Um peso pendurado no centro da torre.', lv: 5, c: 200, e: { sway: 0.03 }, r: ['r5'] },
    { id: 'r9', b: 'res', n: 'Tempo Até Dano Estrutural', d: 'Peças danificadas demoram mais para afetar as vizinhas.', lv: 5, c: 150, e: { spreadResist: 0.05 }, r: ['r7:2'] },
    { id: 'r10', b: 'res', n: 'Escudo de Papelão', d: 'Um anteparo de papelão contra as rajadas mais fortes.', lv: 3, c: 500, e: { windResist: 0.05 }, r: ['r8', 'r6'] },
    { id: 'r11', b: 'res', n: 'Estrutura Assentada', d: 'As camadas antigas se acomodaram. Agora aguentam mais.', lv: 1, c: 800, e: { limitLayers: 60 }, r: ['r7', 'r9'] },
    { id: 'r12', b: 'res', n: 'Esqueleto Firme', d: 'Cada camada trava a próxima um pouco melhor.', lv: 15, c: 200, g: 1.15, e: { looseResist: 0.01 }, r: ['r11'] },
    { id: 'r13', b: 'res', n: 'Resiliência', d: 'Rajadas que antes derrubavam agora só assobiam.', lv: 10, c: 300, g: 1.18, e: { windImmune: 0.01 }, r: ['r10'] },
    { id: 'r14', b: 'res', n: 'TORRE INABALÁVEL', d: 'O vento ainda vem. A torre só não se importa mais.', lv: 1, c: 4000, sp: true, e: { windResist: 0.1, sway: 0.1 }, r: ['r12', 'r13'] },

    /* ================= REPAROS ================= */
    { id: 'e1', b: 'rep', n: 'Velocidade de Reparo', d: 'Reparar sem hesitar.', lv: 3, c: 8, e: { repairSpeed: [0.05, 0.05, 0.07] }, r: ['root'] },
    { id: 'e2', b: 'rep', n: 'Custo de Reparo', d: 'Menos cola desperdiçada por reparo.', lv: 2, c: 15, e: { repairFee: [0.02, 0.03] }, r: ['e1'] },
    { id: 'e3', b: 'rep', n: 'Material Recuperado', d: 'Peças que caem às vezes podem ser reaproveitadas.', lv: 3, c: 30, e: { recoverChance: [0.05, 0.02, 0.03] }, r: ['e1'] },
    { id: 'e4', b: 'rep', n: 'Pinça de Reparo', d: 'Uma pinça fina só para encaixes difíceis.', lv: 5, c: 60, e: { repairSpeed: 0.04 }, r: ['e1:3'] },
    { id: 'e5', b: 'rep', n: 'Detecção de Dano', d: 'Perceber danos mais abaixo do topo.', lv: 5, c: 40, e: { detectRange: 10 }, r: ['e2'] },
    { id: 'e6', b: 'rep', n: 'Marcadores na Régua', d: 'Danos detectados aparecem marcados na régua da era.', lv: 1, c: 150, e: { rulerMarkers: 1 }, r: ['e5:2'] },
    { id: 'e7', b: 'rep', n: 'Atalho Até o Dano', d: 'Um botão que desce direto até a próxima peça danificada.', lv: 1, c: 300, e: { jumpToDamage: 1 }, r: ['e6'] },
    { id: 'e8', b: 'rep', n: 'Reparo Pós-Tempestade', d: 'O primeiro reparo após cada tempestade é gratuito.', lv: 1, c: 250, e: { freeStormRepair: 1 }, r: ['e2:2'] },
    { id: 'e9', b: 'rep', n: 'Reparo Econômico', d: 'Reparo manual consome 1 peça a menos a cada X reparos.', lv: 4, c: 200, g: 1.4, e: { freeRepairLv: 1 }, r: ['e8'] },
    { id: 'e10', b: 'rep', n: 'Cola de Reparo', d: 'Uma cola específica para remendos.', lv: 5, c: 150, e: { repairFee: 0.03 }, r: ['e9:2'] },
    { id: 'e11', b: 'rep', n: 'Recuperação de Peças', d: 'Procurar fósforos caídos ao pé da torre.', lv: 10, c: 120, g: 1.2, e: { recoverChance: 0.01 }, r: ['e3:3'] },
    { id: 'e12', b: 'rep', n: 'Remendo Duradouro', d: 'Peças reparadas sobrecarregam menos as vizinhas.', lv: 5, c: 250, e: { spreadResist: 0.03 }, r: ['e4:5', 'e11:3'] },
    { id: 'e13', b: 'rep', n: 'Kit de Reparo', d: 'Pinça, cola, linha e lupa numa latinha de bala.', lv: 10, c: 300, g: 1.16, e: { repairSpeed: 0.03 }, r: ['e12', 'e10'] },
    { id: 'e14', b: 'rep', n: 'RESTAURAÇÃO COMPLETA', d: 'Nenhum dano é definitivo.', lv: 1, c: 3500, sp: true, e: { repairSpeed: 0.15, repairFee: 0.1 }, r: ['e13', 'e11', 'e7'] },

    /* ================= DEFESA ================= */
    { id: 'd1', b: 'def', n: 'Peteleco Treinado', d: 'Cada toque em uma ameaça causa mais dano.', lv: 5, c: 8, e: { threatPower: 0.2 }, r: ['root'] },
    { id: 'd2', b: 'def', n: 'Recompensa por Defesa', d: 'Expulsar ameaças rende mais dinheiro.', lv: 5, c: 15, e: { threatReward: 0.05 }, r: ['d1'] },
    { id: 'd3', b: 'def', n: 'Alerta Antecipado de Vento', d: 'Perceber a rajada antes que ela chegue.', lv: 2, c: 40, e: { windWarn: 1 }, r: ['d1'] },
    { id: 'd4', b: 'def', n: 'Espantalho de Papel', d: 'Pássaros às vezes desistem assim que chegam.', lv: 5, c: 50, e: { birdRepel: 0.03 }, r: ['d1:2'] },
    { id: 'd5', b: 'def', n: 'Repelente Caseiro', d: 'Vinagre e cravo. Insetos ficam mais lentos.', lv: 5, c: 50, e: { insectSlow: 0.04 }, r: ['d2'] },
    { id: 'd6', b: 'def', n: 'Sentinela', d: 'Setas indicam ameaças fora da tela.', lv: 1, c: 200, e: { threatWarn: 1 }, r: ['d3'] },
    { id: 'd7', b: 'def', n: 'Tapa Certeiro', d: 'Golpes mais firmes.', lv: 10, c: 80, g: 1.2, e: { threatPower: 0.2 }, r: ['d1:5', 'd2:2'] },
    { id: 'd8', b: 'def', n: 'Barreira de Fita', d: 'Fita adesiva ao redor: ameaças demoram mais a atacar.', lv: 5, c: 150, e: { threatDelay: 0.05 }, r: ['d5'] },
    { id: 'd9', b: 'def', n: 'Rede de Proteção', d: 'Uma tela de mosquiteiro protege contra granizo.', lv: 5, c: 180, e: { hailResist: 0.05 }, r: ['d6'] },
    { id: 'd10', b: 'def', n: 'Caçador de Recompensas', d: 'Toda ameaça expulsa vira lucro.', lv: 10, c: 150, g: 1.18, e: { threatReward: 0.03 }, r: ['d7:5'] },
    { id: 'd11', b: 'def', n: 'Cerca do Quintal', d: 'Formigas, lagartixas e gatos aparecem menos.', lv: 5, c: 250, e: { groundResist: 0.04 }, r: ['d8'] },
    { id: 'd12', b: 'def', n: 'Alerta Antecipado II', d: 'Mais um segundo de aviso antes das rajadas.', lv: 1, c: 400, e: { windWarn: 1 }, r: ['d9'] },
    { id: 'd13', b: 'def', n: 'GUARDIÃO DA TORRE', d: 'Nada encosta na torre sem a sua permissão.', lv: 1, c: 3000, sp: true, e: { threatPower: 1, threatDelay: 0.1 }, r: ['d10', 'd11', 'd12'] },

    /* ================= EFICIÊNCIA ================= */
    { id: 'f1', b: 'eff', n: 'Economizar Peça', d: 'Chance de um posicionamento não gastar fósforo.', lv: 2, c: 12, e: { saveChance: [0.01, 0.02] }, r: ['root'] },
    { id: 'f2', b: 'eff', n: 'Visitantes Curiosos', d: 'Gente parando para olhar a torre deixa umas moedas.', lv: 5, c: 10, e: { passiveMult: 0.05 }, r: ['root'] },
    { id: 'f3', b: 'eff', n: 'Gorjeta', d: 'Eventos bons aparecem com mais frequência.', lv: 5, c: 40, e: { eventLuck: 0.03 }, r: ['f2:2'] },
    { id: 'f4', b: 'eff', n: 'Desperdício Zero', d: 'Nada de fósforo quebrado no lixo.', lv: 10, c: 60, g: 1.2, e: { saveChance: 0.005 }, r: ['f1'] },
    { id: 'f5', b: 'eff', n: 'Placa de Exposição', d: '"TORRE DE FÓSFOROS — NÃO TOCAR".', lv: 10, c: 50, g: 1.2, e: { passiveMult: 0.04 }, r: ['f2:5'] },
    { id: 'f6', b: 'eff', n: 'Contabilidade', d: 'Anotar tudo num caderninho. Cada camada rende um pouco mais.', lv: 10, c: 80, g: 1.2, e: { layerValue: 0.01 }, r: ['f4:3'] },
    { id: 'f7', b: 'eff', n: 'Planejamento de Obra', d: 'Desenhar antes de construir permite ir mais alto.', lv: 2, c: 400, e: { limitLayers: 35 }, r: ['f6:5'] },
    { id: 'f8', b: 'eff', n: 'Caixa Não Emperra', d: 'Lubrificar a gaveta da caixa com vela.', lv: 5, c: 100, e: { jamResist: 0.1 }, r: ['f3'] },
    { id: 'f9', b: 'eff', n: 'Patrocínio da Mercearia', d: 'A mercearia da esquina coloca um cartaz na torre.', lv: 2, c: 600, e: { passiveMult: 0.15 }, r: ['f5'] },
    { id: 'f10', b: 'eff', n: 'Reaproveitamento', d: 'Até fósforo riscado tem utilidade.', lv: 5, c: 500, g: 1.25, e: { saveChance: 0.01 }, r: ['f7', 'f4'] },
    { id: 'f11', b: 'eff', n: 'Sorte de Principiante', d: 'Coisas boas acontecem com quem insiste.', lv: 10, c: 150, g: 1.18, e: { eventLuck: 0.02 }, r: ['f8'] },
    { id: 'f12', b: 'eff', n: 'Recordista', d: 'O bairro inteiro acompanha cada marco.', lv: 5, c: 300, e: { milestoneBonus: 0.1 }, r: ['f9'] },
    { id: 'f13', b: 'eff', n: 'ECONOMIA DE ESCALA', d: 'A torre virou ponto turístico.', lv: 1, c: 3500, sp: true, e: { passiveMult: 0.25, layerValue: 0.1 }, r: ['f10', 'f11', 'f12'] },

    /* ================= QUALIDADE DO FÓSFORO ================= */
    { id: 'q1', b: 'qual', n: 'Cola Simples', d: 'Cola branca escolar nos cruzamentos.', lv: 1, c: 10, e: { visGlue: 1, looseResist: 0.03 }, r: ['root'] },
    { id: 'q2', b: 'qual', n: 'Cola Ligeiramente Melhor', d: 'Cola de madeira. Seca amarelada.', lv: 1, c: 40, e: { visGlue: 1, looseResist: 0.03 }, r: ['q1'] },
    { id: 'q3', b: 'qual', n: 'Cola Resistente', d: 'Cola de contato. Cheiro forte, pega forte.', lv: 1, c: 150, e: { visGlue: 1, looseResist: 0.04, limitLayers: 30 }, r: ['q2'] },
    { id: 'q4', b: 'qual', n: 'Cola Flexível', d: 'Cede um pouco no vento em vez de partir.', lv: 1, c: 400, e: { visGlue: 1, sway: 0.05, limitLayers: 30 }, r: ['q3'] },
    { id: 'q5', b: 'qual', n: 'Cola Resistente à Umidade', d: 'Chuva já não descola as junções.', lv: 1, c: 800, e: { visGlue: 1, moistureResist: 0.2 }, r: ['q4'] },
    { id: 'q6', b: 'qual', n: 'Palito Selecionado', d: 'Descartar palitos tortos antes de usar.', lv: 5, c: 30, e: { defectResist: 0.05 }, r: ['q1'] },
    { id: 'q7', b: 'qual', n: 'Cabeça Aparada', d: 'Cortar a cabeça inflamável dos fósforos. A torre muda de cor.', lv: 1, c: 120, e: { visHeadless: 1, igniteResist: 0.3 }, r: ['q6:3'] },
    { id: 'q8', b: 'qual', n: 'Fósforo de Segurança', d: 'Palitos que só acendem na lixa certa.', lv: 10, c: 100, g: 1.2, e: { igniteResist: 0.05 }, r: ['q7'] },
    { id: 'q9', b: 'qual', n: 'Madeira de Álamo', d: 'Fósforos de madeira mais fibrosa e firme.', lv: 10, c: 80, g: 1.2, e: { looseResist: 0.01 }, r: ['q6'] },
    { id: 'q10', b: 'qual', n: 'Parafina Protetora', d: 'Uma camada fina de vela derretida repele água.', lv: 10, c: 200, g: 1.18, e: { moistureResist: 0.05 }, r: ['q5'] },
    { id: 'q11', b: 'qual', n: 'Estufa de Secagem', d: 'Fósforos secos são produzidos mais rápido.', lv: 5, c: 500, g: 1.25, e: { prodMult: 0.02 }, r: ['q10:5'] },
    { id: 'q12', b: 'qual', n: 'Fibra Alinhada', d: 'Usar sempre o veio da madeira na vertical.', lv: 1, c: 1000, e: { limitLayers: 60 }, r: ['q9:5', 'q3'] },
    { id: 'q13', b: 'qual', n: 'Fósforo Extra-Longo', d: 'Fósforos de lareira, cortados na medida.', lv: 3, c: 900, g: 1.4, e: { pieceSize: 0.03 }, r: ['q12'] },
    { id: 'q14', b: 'qual', n: 'FÓSFORO PERFEITO', d: 'O limite teórico de um palito de fósforo.', lv: 1, c: 4000, sp: true, e: { looseResist: 0.05, igniteResist: 0.1, defectResist: 0.25 }, r: ['q13', 'q8', 'q11'] },

    /* ================= AUTOMAÇÃO CONTROLADA ================= */
    { id: 'a1', b: 'auto', n: 'Assistente de Danos', d: 'O assistente identifica qualquer camada danificada, em qualquer altura.', lv: 1, c: 150, e: { autoDetect: 1 }, r: ['root'] },
    { id: 'a2', b: 'auto', n: 'Ajudante de Cola', d: 'Pequenos reparos em peças rachadas, sozinho e devagar.', lv: 4, c: 200, e: { autoRepair: 0.5 }, r: ['a1'] },
    { id: 'a3', b: 'auto', n: 'Braço Mecânico', d: 'Posiciona algumas peças lentamente — só enquanto você joga.', lv: 5, c: 300, e: { autoPlace: 1 }, r: ['a1'] },
    { id: 'a4', b: 'auto', n: 'Espanta-Moscas Automático', d: 'Golpeia ameaças de vez em quando.', lv: 5, c: 250, e: { autoDefend: 2 }, r: ['a1'] },
    { id: 'a5', b: 'auto', n: 'Atenção do Assistente', d: 'A automação continua ativa por mais tempo após seu último toque.', lv: 4, c: 300, e: { autoActiveSec: 30 }, r: ['a7:2'] },
    { id: 'a6', b: 'auto', n: 'Ajudante de Cola II', d: 'Reparos automáticos um pouco mais frequentes.', lv: 4, c: 600, e: { autoRepair: 0.5 }, r: ['a2:4'] },
    { id: 'a7', b: 'auto', n: 'Braço Mecânico II', d: 'Engrenagens melhores, um pouco mais de peças por minuto.', lv: 5, c: 900, e: { autoPlace: 1 }, r: ['a3:5'] },
    { id: 'a8', b: 'auto', n: 'Ventilador Defensivo', d: 'Um ventiladorzinho que afasta insetos.', lv: 5, c: 700, e: { autoDefend: 2 }, r: ['a4:5'] },
    { id: 'a9', b: 'auto', n: 'Reparador Noturno', d: 'O assistente também repõe peças que caíram, usando o estoque.', lv: 1, c: 1500, e: { autoRepairMissing: 1 }, r: ['a6'] },
    { id: 'a10', b: 'auto', n: 'Mapa de Integridade', d: 'A régua mostra a saúde de cada trecho da torre.', lv: 1, c: 500, e: { rulerHeat: 1 }, r: ['a6'] },
    { id: 'a11', b: 'auto', n: 'Painel de Produção', d: 'Estatísticas detalhadas de produção e renda.', lv: 1, c: 400, e: { statsPanel: 1 }, r: ['a5'] },
    { id: 'a12', b: 'auto', n: 'ROBÔ DE PALITOS', d: 'Um robozinho de sucata que ajuda — mas nunca joga por você.', lv: 1, c: 5000, sp: true, e: { autoPlace: 5, autoRepair: 2, autoDefend: 5 }, r: ['a7', 'a8', 'a9', 'a11'] }
  ]
};
