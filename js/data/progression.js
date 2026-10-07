/* =========================================================
   MISSÕES, CONQUISTAS, EVENTOS COM ESCOLHA, BESTIÁRIO.
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

/* ---------------- missões (sempre 3 ativas) ----------------
   n(tier) = meta; reward multiplica pela altura atual.          */
PALIT.MISSIONS = [
  { type: 'place',   text: 'Coloque {n} palitos',                 n: function (t) { return 20 + t * 10; }, reward: 6 },
  { type: 'layers',  text: 'Complete {n} camadas',                n: function (t) { return 10 + t * 5; },  reward: 7 },
  { type: 'perfect', text: 'Faça {n} encaixes perfeitos',         n: function (t) { return 5 + t * 3; },   reward: 8 },
  { type: 'streak',  text: 'Faça {n} perfeitos seguidos',         n: function (t) { return 3 + Math.min(12, t); }, reward: 10 },
  { type: 'defeat',  text: 'Expulse {n} ameaças',                 n: function (t) { return 2 + Math.floor(t / 2); }, reward: 9 },
  { type: 'repair',  text: 'Faça {n} reparos',                    n: function (t) { return 2 + Math.floor(t / 2); }, reward: 8, min: 20 },
  { type: 'buy',     text: 'Compre {n} melhorias na árvore',      n: function (t) { return 2 + Math.floor(t / 3); }, reward: 6, tree: true },
  { type: 'earn',    text: 'Ganhe ${n}',                          n: function (t, L) { return Math.round((40 + t * 25) * (1 + L / 150)); }, reward: 5 },
  { type: 'combo',   text: 'Chegue ao ritmo x{n}',                n: function (t) { return Math.min(6, 3 + Math.floor(t / 4)); }, reward: 7 },
  { type: 'safe',    text: 'Mantenha a estrutura acima de 90% por {n}s', n: function (t) { return 60 + t * 15; }, reward: 9, min: 30 },
  { type: 'gust',    text: 'Resista a {n} rajadas sem dano',       n: function (t) { return 1 + Math.floor(t / 3); }, reward: 10, min: 40 },
  { type: 'events',  text: 'Presencie {n} eventos',               n: function (t) { return 2 + Math.floor(t / 3); }, reward: 6 }
];

/* ---------------- conquistas ---------------- */
PALIT.ACHIEVEMENTS = [
  { id: 'p1',     icon: 'ico_match',  name: 'Primeiro Palito',       desc: 'Coloque o primeiro palito.',                 test: function (s) { return s.stats.placed >= 1; }, reward: 5 },
  { id: 'p100',   icon: 'ico_match',  name: 'Cem Palitos',           desc: 'Coloque 100 palitos.',                       test: function (s) { return s.stats.placed >= 100; }, reward: 20 },
  { id: 'p1000',  icon: 'ico_match',  name: 'Mil Palitos',           desc: 'Coloque 1.000 palitos.',                     test: function (s) { return s.stats.placed >= 1000; }, reward: 150 },
  { id: 'p5000',  icon: 'ico_match',  name: 'Palitomaníaco',         desc: 'Coloque 5.000 palitos.',                     test: function (s) { return s.stats.placed >= 5000; }, reward: 800 },
  { id: 'h05',    icon: 'ico_layers', name: 'Meio Metro',            desc: 'Torre local de 0,5 m.',                      test: function (s, g) { return g.localHeight() >= 0.5; }, reward: 30 },
  { id: 'h1',     icon: 'ico_layers', name: 'Um Metro de Teimosia',  desc: 'Torre local de 1 m.',                        test: function (s, g) { return g.localHeight() >= 1; }, reward: 80 },
  { id: 'h2',     icon: 'ico_layers', name: 'Dois Metros',           desc: 'Torre local de 2 m.',                        test: function (s, g) { return g.localHeight() >= 2; }, reward: 200 },
  { id: 'h3',     icon: 'ico_layers', name: 'Quase Proibido',        desc: 'Torre local de 3 m.',                        test: function (s, g) { return g.localHeight() >= 3; }, reward: 400 },
  { id: 'h4',     icon: 'ico_layers', name: 'Artigo 4',              desc: 'Chegue aos 4 metros com fósforos.',          test: function (s, g) { return s.matIndex > 0 || g.layersBuilt() >= 1000; }, reward: 800 },
  { id: 'd10',    icon: 'ico_fist',   name: 'Espanta-Mosca',         desc: 'Expulse 10 ameaças.',                        test: function (s) { return s.stats.defeated >= 10; }, reward: 25 },
  { id: 'd100',   icon: 'ico_fist',   name: 'Guardião do Quintal',   desc: 'Expulse 100 ameaças.',                       test: function (s) { return s.stats.defeated >= 100; }, reward: 200 },
  { id: 'd500',   icon: 'ico_fist',   name: 'Lenda do Bairro',       desc: 'Expulse 500 ameaças.',                       test: function (s) { return s.stats.defeated >= 500; }, reward: 900 },
  { id: 'r10',    icon: 'ico_wrench', name: 'Remendão',              desc: 'Faça 10 reparos.',                           test: function (s) { return s.stats.repaired >= 10; }, reward: 30 },
  { id: 'r100',   icon: 'ico_wrench', name: 'Mestre do Reparo',      desc: 'Faça 100 reparos.',                          test: function (s) { return s.stats.repaired >= 100; }, reward: 250 },
  { id: 'f10',    icon: 'ico_wrench', name: 'Bombeiro de Palito',    desc: 'Apague 10 incêndios.',                       test: function (s) { return (s.stats.extinguished || 0) >= 10; }, reward: 120 },
  { id: 'pf10',   icon: 'ico_bolt',   name: 'No Ritmo',              desc: 'Faça 10 encaixes perfeitos.',                test: function (s) { return (s.stats.perfect || 0) >= 10; }, reward: 20 },
  { id: 'pf100',  icon: 'ico_bolt',   name: 'Metrônomo Humano',      desc: 'Faça 100 encaixes perfeitos.',               test: function (s) { return (s.stats.perfect || 0) >= 100; }, reward: 150 },
  { id: 'pf1000', icon: 'ico_bolt',   name: 'Relógio Suíço',         desc: 'Faça 1.000 encaixes perfeitos.',             test: function (s) { return (s.stats.perfect || 0) >= 1000; }, reward: 1200 },
  { id: 'st10',   icon: 'ico_star',   name: 'Sequência Perfeita',    desc: '10 perfeitos seguidos.',                     test: function (s) { return (s.stats.bestStreak || 0) >= 10; }, reward: 80 },
  { id: 'st25',   icon: 'ico_star',   name: 'Inabalável',            desc: '25 perfeitos seguidos.',                     test: function (s) { return (s.stats.bestStreak || 0) >= 25; }, reward: 300 },
  { id: 'st50',   icon: 'ico_star',   name: 'Zen do Palito',         desc: '50 perfeitos seguidos.',                     test: function (s) { return (s.stats.bestStreak || 0) >= 50; }, reward: 900 },
  { id: 'm5',     icon: 'ico_flag',   name: 'Prestativo',            desc: 'Complete 5 missões.',                        test: function (s) { return (s.stats.missions || 0) >= 5; }, reward: 40 },
  { id: 'm25',    icon: 'ico_flag',   name: 'Faz-Tudo',              desc: 'Complete 25 missões.',                       test: function (s) { return (s.stats.missions || 0) >= 25; }, reward: 300 },
  { id: 'm100',   icon: 'ico_flag',   name: 'Empreiteiro',           desc: 'Complete 100 missões.',                      test: function (s) { return (s.stats.missions || 0) >= 100; }, reward: 1500 },
  { id: 'ev50',   icon: 'ico_warn',   name: 'Já Vi de Tudo',         desc: 'Presencie 50 eventos.',                      test: function (s) { return s.stats.events >= 50; }, reward: 150 },
  { id: 'ch5',    icon: 'ico_coin',   name: 'Negociador',            desc: 'Tome 5 decisões em eventos de escolha.',     test: function (s) { return (s.stats.choices || 0) >= 5; }, reward: 100 },
  { id: 't25',    icon: 'ico_tree',   name: 'Galhos',                desc: '25% de uma árvore.',                         test: function (s, g) { return g.progress() >= 0.25; }, reward: 100 },
  { id: 't50',    icon: 'ico_tree',   name: 'Copa',                  desc: '50% de uma árvore.',                         test: function (s, g) { return g.progress() >= 0.5; }, reward: 300 },
  { id: 't100',   icon: 'ico_tree',   name: 'Floresta',              desc: '100% de uma árvore.',                        test: function (s, g) { return g.progress() >= 1; }, reward: 1000 },
  { id: 'best',   icon: 'ico_book',   name: 'Naturalista',           desc: 'Veja todas as ameaças da era do fósforo.',   test: function (s) { var b = s.bestiary || {}; return ['fly', 'ant', 'beetle', 'ball', 'bird', 'gecko', 'cat', 'lens', 'kite', 'crow', 'hail'].every(function (k) { return b[k] && b[k].seen; }); }, reward: 400 },
  { id: 'best2',  icon: 'ico_book',   name: 'Naturalista dos Telhados', desc: 'Veja todas as ameaças da era do palito de dente.', test: function (s) { var b = s.bestiary || {}; return ['pigeon', 'wasp', 'paperplane', 'toydrone'].every(function (k) { return b[k] && b[k].seen; }); }, reward: 800 },
  { id: 'clue5',  icon: 'ico_q',      name: 'Curioso',               desc: 'Descubra 5 pistas do mistério.',             test: function (s) { return (s.clues || []).length >= 5; }, reward: 100 },
  { id: 'clue10', icon: 'ico_q',      name: 'Detetive de Palitos',   desc: 'Descubra 10 pistas do mistério.',            test: function (s) { return (s.clues || []).length >= 10; }, reward: 500 },
  { id: 'owl',    icon: 'ico_star',   name: 'Coruja',                desc: 'Atinja um marco durante a noite.',           test: function (s) { return !!(s.flags && s.flags.nightMilestone); }, reward: 60 },
  { id: 'mfos',   icon: 'ico_flag',   name: 'Mestre do Fósforo',     desc: 'Domine o palito de fósforo.',                test: function (s) { return s.mastered.indexOf('fosforo') >= 0 || (s.challengeDone && s.matIndex === 0); }, reward: 1500 },
  { id: 'mden',   icon: 'ico_flag',   name: 'Dentista',              desc: 'Domine o palito de dente.',                  test: function (s) { return s.mastered.indexOf('dente') >= 0 || (s.challengeDone && s.matIndex === 1); }, reward: 3000 }
];

/* ---------------- eventos com escolha ----------------
   options: { label, need(api) -> texto de bloqueio | null, run(api) -> texto }   */
PALIT.CHOICES = {
  mercador: {
    who: 'radio', title: 'MERCADOR AMBULANTE',
    text: function (api) { return '"Fósforo turbinado, freguês! Ou eu compro uns palitos seus, pago bem!"'; },
    options: [
      { label: function (api) { return 'ACELERADOR · $' + api.price(25, 0.4); },
        need: function (api) { return api.money() >= api.price(25, 0.4) ? null : 'Sem dinheiro'; },
        run: function (api) { api.pay(api.price(25, 0.4)); api.boost(120); return 'Produção +50% por 2 minutos!'; } },
      { label: function (api) { return 'VENDER 5 PALITOS · +$' + api.price(20, 0.5); },
        need: function (api) { return api.pieces() >= 5 ? null : 'Precisa de 5 peças'; },
        run: function (api) { api.takePieces(5); api.money(api.price(20, 0.5)); return 'Negócio fechado. Ele saiu assobiando.'; } },
      { label: function () { return 'NÃO, OBRIGADO'; }, run: function () { return '"Freguês difícil..."'; } }
    ]
  },
  cola: {
    who: 'ademir', title: 'COLA EXPERIMENTAL',
    text: function () { return '"Inventei uma cola nova! 70% de chance de consertar todas as rachaduras. 30% de chance de ser molho shoyu."'; },
    options: [
      { label: function () { return 'ACEITAR A COLA'; },
        run: function (api) { if (Math.random() < 0.7) { var n = api.repairCracked(); return 'Funcionou! ' + n + ' peça(s) consertada(s).'; } api.crack(2); return 'Era molho shoyu. Duas peças racharam. Cheiro bom, pelo menos.'; } },
      { label: function () { return 'RECUSAR'; }, run: function () { return '"Medroso!" — Seu Ademir provou a cola. Era shoyu.'; } }
    ]
  },
  luquinhas: {
    who: 'luca', title: 'LUQUINHAS PEDE UM PALITO',
    text: function () { return '"Moço, me empresta um palito? É pra uma maquete da escola. Juro que não é pra lupa."'; },
    options: [
      { label: function () { return 'DAR 1 PALITO'; },
        need: function (api) { return api.pieces() >= 1 ? null : 'Sem peças'; },
        run: function (api) { api.takePieces(1); api.luck(180); return 'Ele saiu feliz. Sua sorte em eventos aumentou por 3 minutos!'; } },
      { label: function () { return 'NEGAR'; }, run: function (api) { api.spawn('ball', 2); return '"Tá bom então." ...e duas bolas apareceram "sem querer".'; } }
    ]
  },
  inspetor: {
    who: 'inspetor', title: 'FISCALIZAÇÃO SURPRESA',
    text: function (api) { return '"Fiscalização do INPALI. Taxa de vistoria: $' + api.price(15, 0.25) + '. Ou podemos... discutir."'; },
    options: [
      { label: function (api) { return 'PAGAR · $' + api.price(15, 0.25); },
        need: function (api) { return api.money() >= api.price(15, 0.25) ? null : 'Sem dinheiro'; },
        run: function (api) { api.pay(api.price(15, 0.25)); api.calm(90); return 'Alvará carimbado. Estranhamente, o vento parou por 90s. O INPALI controla o vento? Não comente.'; } },
      { label: function () { return 'DISCUTIR'; },
        run: function (api) { if (Math.random() < 0.5) { api.money(api.price(10, 0.2)); return 'Ele se confundiu com os próprios formulários, pediu desculpas e te deu um vale.'; } api.jam(); return 'Ele lacrou sua caixa de fósforos. Toque na caixa para arrancar o lacre!'; } }
    ]
  },
  pombo: {
    who: 'pombo', title: 'GERVÁSIO QUER NEGOCIAR',
    text: function () { return '"Pruu." (Gervásio oferece um objeto brilhante em troca de 3 palitos.)'; },
    options: [
      { label: function () { return 'TROCAR 3 PALITOS'; },
        need: function (api) { return api.pieces() >= 3 ? null : 'Precisa de 3 peças'; },
        run: function (api) { api.takePieces(3); if (Math.random() < 0.6) { var m = api.price(40, 1); api.money(m); return 'Era uma moeda antiga! +$' + m + '.'; } api.money(1); return 'Era uma tampinha. Ele te deu 1 real de troco. Pruu.'; } },
      { label: function () { return 'RECUSAR'; }, run: function () { return '"Pruu." (ofendido)'; } }
    ]
  }
};

/* ---------------- bestiário: descrições ---------------- */
PALIT.BESTIARY = {
  fly:    'Zumbe em quatro tons diferentes. Acha que palito é açúcar.',
  ant:    'Trabalha em equipe. Infelizmente, contra você.',
  beetle: 'Blindado, lento e convencido.',
  ball:   'Do Luquinhas. Sempre "sem querer".',
  bird:   'Quer seus palitos para fazer um ninho. Arquiteto rival.',
  gecko:  'Escala qualquer coisa, derruba qualquer coisa, pede desculpas a nada.',
  lens:   'Luquinhas descobriu a ciência. A ciência descobriu seus fósforos.',
  cat:    'Bartolomeu, o gato do vizinho. Odeia verticalidade.',
  kite:   'Não tem cerol, mas enrosca, balança e rasga a paciência.',
  crow:   'Inteligente demais. Já tentou negociar os palitos com o Gervásio.',
  hail:   'Gelo caindo do céu. Parece pessoal.',
  pigeon: 'Primo do Gervásio. Não tem a mesma educação.',
  wasp:   'Mora na calha do vizinho. Paga aluguel em ferroadas.',
  paperplane: 'Lançado da janela do 3º andar. Engenharia aeronáutica infantil.',
  toydrone: 'O vizinho ganhou de Natal. Ainda não aprendeu a pilotar.'
};
