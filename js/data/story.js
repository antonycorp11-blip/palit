/* =========================================================
   HISTÓRIA — personagens, cenas (diálogos), pistas do mistério
   e comentários soltos da vizinhança. 100% data-driven.

   Gatilhos de cena (when):
     { start: true }          primeira vez que a era começa
     { layer: N }             ao completar a camada N
     { on: 'evento' }         threat | damage | fire | limit | night | money |
                              tree100 | challenge | won | rebuild | perfect |
                              mission | choice | ball | lens | cat | bird
   ========================================================= */
var PALIT = window.PALIT = window.PALIT || {};

PALIT.CHARACTERS = {
  ademir:   { name: 'SEU ADEMIR',        sprite: 'pt_ademir',   color: '#ff004d', pitch: 1.0 },
  vo:       { name: 'VÓ ZULEICA',        sprite: 'pt_vo',       color: '#ff77a8', pitch: 1.35 },
  luca:     { name: 'LUQUINHAS',         sprite: 'pt_luca',     color: '#29adff', pitch: 1.6 },
  inspetor: { name: 'INSPETOR VALDEMAR', sprite: 'pt_inspetor', color: '#c2c3c7', pitch: 0.7 },
  pombo:    { name: 'GERVÁSIO (POMBO)',  sprite: 'pt_pombo',    color: '#83769c', pitch: 1.9 },
  voz:      { name: '???',               sprite: 'pt_voz',      color: '#ffec27', pitch: 0.45 },
  radio:    { name: 'RÁDIO TORRE FM',    sprite: 'pt_radio',    color: '#ffa300', pitch: 1.15 },
  bilhete:  { name: 'BILHETE',           sprite: 'pt_bilhete',  color: '#fff1e8', pitch: 1.2 },
  gato:     { name: 'BARTOLOMEU',        sprite: 'pt_gato',     color: '#ffa300', pitch: 1.5 }
};

/* pistas do mistério — aparecem no ARQUIVO DO MISTÉRIO (menu) */
PALIT.CLUES = [
  { id: 'regra4',     title: 'A Regra dos 4 Metros',  text: 'Vó Zuleica jura que, desde a época dela, ninguém nunca passou de 4 metros com palitos de fósforo. "Ninguém. NINGUÉM."' },
  { id: 'art4',       title: 'Artigo 4 do INPALI',    text: '"Nenhuma torre de fósforos ultrapassará quatro metros." O inspetor não está autorizado a explicar o porquê.' },
  { id: 'pombos40',   title: 'Os Pombos Observam',    text: 'Segundo Seu Ademir, os pombos começam a olhar fixamente para qualquer torre que passe de 40 centímetros.' },
  { id: 'tonico',     title: 'O Caso Tonico',         text: 'Numa noite de lua cheia, Tonico tentou passar dos 4 metros. Sumiu por três dias. Voltou falando de "um palito que flutua".' },
  { id: 'teoria',     title: 'A Teoria do Ademir',    text: 'Envolve pombos, a Receita Federal e um palito de dente muito antigo. Ainda não fecha. "Mas vai fechar."' },
  { id: 'tictic',     title: 'O Tic-Tic',             text: 'Depois dos 2 metros, Tonico começou a ouvir um "tic-tic-tic" vindo de cima. Você também está ouvindo?' },
  { id: 'relatorio87', title: 'Relatório de 1987',    text: 'Alguém passou dos 4 metros em 1987. O relatório foi lacrado. A única palavra legível: "DENTE".' },
  { id: 'plataforma', title: 'A Plataforma',          text: 'Gervásio afirma que existe uma plataforma lá em cima. Construída por alguém. Antes de todos nós.' },
  { id: 'voz',        title: 'A Voz do Topo',         text: '"Quem empilha... chega. Quem chega... troca." A voz vem de cima. Ninguém mais parece ouvir.' },
  { id: 'bilhete',    title: 'O Bilhete de A.',       text: '"Se você chegou aqui com fósforos, já não precisa deles. Os dentes te esperam. — A."' },
  { id: 'arquiteto',  title: 'Quem é A.?',            text: 'O inspetor acha que é "o Arquiteto" do relatório de 1987. Seu Ademir acha que pode ser ele mesmo, mas não lembra.' },
  { id: 'dentes',     title: 'Sem Regra para Dentes', text: 'O INPALI não tem nenhuma norma para palitos de dente. "Ainda", diz o inspetor, suando.' }
];

PALIT.STORY = [
  /* ================= ERA 01 — FÓSFORO ================= */
  { id: 'intro', era: 'fosforo', when: { start: true }, lines: [
    ['ademir', 'Psiu! Ei! Você aí, com a caixa de fósforos!'],
    ['ademir', 'Sou o Ademir, seu vizinho. Isso na minha cabeça é um chapéu. NÃO é uma caixa de fósforos. Não pergunte.'],
    ['ademir', 'Vai construir uma torre? Com FÓSFOROS? Hehehe... clássico.'],
    ['ademir', 'Toque na tela para colocar um palito. Um de cada vez. Paciência é a cola da alma.'],
    ['ademir', 'Ah, e uma coisinha: não passe de 4 metros.'],
    ['ademir', '...'],
    ['ademir', 'Brincadeira! ...Ou não. Tchau!']
  ] },
  { id: 'perfect1', era: 'fosforo', when: { layer: 3 }, lines: [
    ['ademir', 'Dica de ouro: toque de novo LOGO que o palito encaixar. No tique-taque certo.'],
    ['ademir', 'Isso é um ENCAIXE PERFEITO. Dá moedinha extra e faz um barulhinho que acalma até sogra.']
  ] },
  { id: 'vo1', era: 'fosforo', when: { layer: 8 }, clue: 'regra4', lines: [
    ['vo', 'Menino, o que é isso? Uma escadinha pra formiga?'],
    ['ademir', 'É uma TORRE, Dona Zuleica.'],
    ['vo', 'Na minha época a gente empilhava fósforo até 2 metros e ainda dava tempo de fazer bolo de fubá.'],
    ['vo', 'Mas ninguém passava de 4 metros. Ninguém.'],
    ['vo', 'NINGUÉM.']
  ] },
  { id: 'threat1', era: 'fosforo', when: { on: 'threat' }, lines: [
    ['ademir', 'UMA AMEAÇA! Toque nela! Várias vezes! Com ódio, mas com carinho!'],
    ['ademir', 'Enquanto tem bicho atacando, a caixa produz mais devagar. Bicho estressa o fósforo.']
  ] },
  { id: 'damage1', era: 'fosforo', when: { on: 'damage' }, lines: [
    ['ademir', 'Uma peça soltou! Arraste a tela para descer pela torre e toque na peça para consertar.'],
    ['ademir', 'Torre esburacada é igual dente: ignora hoje, chora amanhã. Uma peça ruim enfraquece as vizinhas.']
  ] },
  { id: 'money1', era: 'fosforo', when: { on: 'money' }, lines: [
    ['ademir', 'Opa, juntou umas moedinhas! Abre a ÁRVORE ali embaixo.'],
    ['ademir', 'Eu chamo de "árvore" porque "planilha de melhorias" não vende jogo.']
  ] },
  { id: 'luca1', era: 'fosforo', when: { layer: 30 }, lines: [
    ['luca', 'Moço, por que você tá empilhando palito?'],
    ['luca', 'Minha mãe disse que é porque você não tem televisão.'],
    ['luca', 'Posso chutar minha bola aqui perto? Prometo que não miro.'],
    ['luca', '...muito.']
  ] },
  { id: 'ball1', era: 'fosforo', when: { on: 'ball' }, lines: [
    ['luca', 'FOI SEM QUERER!'],
    ['ademir', 'Toque na bola antes dela bater! Duas vezes! É defesa, não é futebol!']
  ] },
  { id: 'limit1', era: 'fosforo', when: { on: 'limit' }, lines: [
    ['ademir', 'Travou? Isso é o LIMITE ESTRUTURAL. O fósforo é frágil, mas teimoso.'],
    ['ademir', 'Melhore a árvore (Construção, Resistência, Qualidade) e ele aguenta subir mais.'],
    ['ademir', 'Todo material tem um limite. Até eu. Meu limite é três cafés.']
  ] },
  { id: 'insp1', era: 'fosforo', when: { layer: 70 }, clue: 'art4', lines: [
    ['inspetor', 'Bom dia. Inspetor Valdemar, do INPALI. Instituto Nacional de Padronização de Palitos.'],
    ['inspetor', 'Recebemos denúncia de construção vertical com material inflamável sem alvará.'],
    ['inspetor', 'Pode continuar. Por enquanto. Mas lembre-se do Artigo 4.'],
    ['inspetor', '"Nenhuma torre de fósforos ultrapassará quatro metros."'],
    ['inspetor', 'Por quê? ...Não estou autorizado a dizer. Bom dia.']
  ] },
  { id: 'm100', era: 'fosforo', when: { layer: 100 }, clue: 'pombos40', lines: [
    ['ademir', 'CEM CAMADAS! Isso é 40 centímetros de pura teimosia!'],
    ['ademir', 'Repara: os pombos estão olhando. Eles SEMPRE olham quando passa dos 40.'],
    ['ademir', 'Ninguém sabe por quê. Eu tenho uma teoria. Ainda não posso contar.']
  ] },
  { id: 'pombo1', era: 'fosforo', when: { layer: 150 }, lines: [
    ['pombo', 'Pruu.'],
    ['ademir', 'Ele disse "cuidado lá em cima".'],
    ['pombo', 'Pruu pruu.'],
    ['ademir', 'E também "tem farelo de pão?". Não temos, Gervásio.'],
    ['pombo', 'Pruuuu.'],
    ['ademir', 'Ele te chamou de "arquiteto". Estranho. Ele nunca chamou ninguém disso.']
  ] },
  { id: 'night1', era: 'fosforo', when: { on: 'night' }, clue: 'tonico', lines: [
    ['vo', 'Ainda construindo? De noite? Seus palitos vão pegar sereno.'],
    ['vo', 'Quando eu era moça, o Tonico tentou passar dos 4 metros numa noite de lua cheia.'],
    ['vo', 'Sumiu por três dias. Voltou falando de um "palito que flutua".'],
    ['vo', 'Depois abriu uma lojinha de churrasco. Nunca mais tocou no assunto. Vai um chazinho?']
  ] },
  { id: 'lens1', era: 'fosforo', when: { layer: 190 }, lines: [
    ['luca', 'Moço! Ganhei uma LUPA! Dá pra ver formiga GIGANTE!'],
    ['luca', 'E dá pra acender coisa com o sol.'],
    ['luca', 'Que coisa? Nada. Nenhuma coisa. Tchau!']
  ] },
  { id: 'fire1', era: 'fosforo', when: { on: 'fire' }, lines: [
    ['ademir', 'FOGO! Toque no palito pegando fogo para apagar, rápido!'],
    ['ademir', 'Por isso eu uso um chapéu à prova de fogo. Que NÃO é uma caixa de fósforos.'],
    ['ademir', 'Na árvore tem um tal de "Cabeça Aparada". Fica a dica.']
  ] },
  { id: 'insp2', era: 'fosforo', when: { layer: 250 }, lines: [
    ['inspetor', 'Inspetor Valdemar, de novo. Um metro. Impressionante.'],
    ['inspetor', 'Ilegal em três estados, mas impressionante.'],
    ['inspetor', 'O INPALI recomenda FORTEMENTE que você pare em 3,99 metros.'],
    ['inspetor', 'Não é uma ameaça. É uma recomendação. Uma recomendação muito, muito forte.']
  ] },
  { id: 'teoria', era: 'fosforo', when: { layer: 320 }, clue: 'teoria', lines: [
    ['ademir', 'Sabe por que ninguém passa dos 4 metros com fósforo?'],
    ['ademir', 'Eu tenho uma teoria. Envolve pombos, a Receita Federal e um palito de dente muito antigo.'],
    ['ademir', 'Ainda não fecha. Mas vai fechar.'],
    ['ademir', 'Esquece a parte da Receita. Isso é outro assunto. Pessoal.']
  ] },
  { id: 'radio1', era: 'fosforo', when: { layer: 400 }, lines: [
    ['radio', 'Bom dia, ouvintes! Aqui é a Rádio Torre FM, a ÚNICA rádio que fala de torres de palito!'],
    ['radio', 'Um morador do bairro já passa de 1,6 metro! Especialistas chamam de "uma bobagem perigosa".'],
    ['radio', 'Outros especialistas chamam de "uma bobagem incrível". Os especialistas brigaram ao vivo.'],
    ['radio', 'E agora, o sucesso "Fósforo do Meu Coração", com Os Palitinhos!']
  ] },
  { id: 'vo2', era: 'fosforo', when: { layer: 500 }, clue: 'tictic', lines: [
    ['vo', 'Dois metros! O Tonico chegou nos dois metros também.'],
    ['vo', 'Depois disso ele começou a ouvir um "tic-tic-tic" vindo lá de cima.'],
    ['vo', 'Escuta...'],
    ['voz', '...tic... tic...'],
    ['vo', 'Tá ouvindo? Não? Melhor assim. Vou fazer um bolo.']
  ] },
  { id: 'voz1', era: 'fosforo', when: { layer: 600 }, lines: [
    ['voz', '...tic... tic... tic...'],
    ['ademir', 'Ouviu isso?'],
    ['ademir', 'Não? Eu também não. Vamos fingir que não ouvimos. Combinado?'],
    ['ademir', '...combinado.']
  ] },
  { id: 'insp3', era: 'fosforo', when: { layer: 700 }, clue: 'relatorio87', lines: [
    ['inspetor', 'Escute. Extraoficialmente.'],
    ['inspetor', 'O Artigo 4 existe por um motivo. Em 1987, alguém passou dos 4 metros.'],
    ['inspetor', 'O relatório foi lacrado. A única palavra legível era: "DENTE".'],
    ['inspetor', 'Eu não te disse nada. Este bigode nunca esteve aqui. Bom dia.']
  ] },
  { id: 'pombo2', era: 'fosforo', when: { layer: 800 }, clue: 'plataforma', lines: [
    ['pombo', 'Pruu. Pruu pruu. Pruuuu.'],
    ['ademir', 'Ele disse que lá em cima existe uma PLATAFORMA. Construída por alguém. Antes de nós.'],
    ['ademir', 'Gervásio nunca mentiu para mim.'],
    ['ademir', '...exceto sobre o farelo. Ele sempre diz que não comeu o farelo.']
  ] },
  { id: 'luca2', era: 'fosforo', when: { layer: 880 }, lines: [
    ['luca', 'Moço... dá pra ver o meu prédio daí?'],
    ['luca', 'Minha mãe disse que agora você é famoso. E que é pra eu parar de chutar bola na sua torre.'],
    ['luca', 'Desculpa pelas outras vezes. E pela lupa. E pelo gato. O gato não foi eu, mas desculpa também.']
  ] },
  { id: 'voz2', era: 'fosforo', when: { layer: 950 }, clue: 'voz', lines: [
    ['voz', 'Quem empilha... chega.'],
    ['voz', 'Quem chega... troca.'],
    ['ademir', 'Essa voz vem do TOPO. Eu sabia! Quer dizer... eu não sabia. Mas agora sei.']
  ] },
  { id: 'insp4', era: 'fosforo', when: { layer: 990 }, lines: [
    ['inspetor', 'PARE!'],
    ['inspetor', '...'],
    ['inspetor', 'Quer dizer, continue. Eu também quero saber o que tem lá em cima.'],
    ['inspetor', 'Mas se perguntarem, eu disse "pare".']
  ] },
  { id: 'top', era: 'fosforo', when: { layer: 1000 }, lines: [
    ['ademir', 'QUATRO METROS! Você chegou no limite que NINGUÉM passa!'],
    ['voz', 'Finalmente. Um empilhador de verdade.'],
    ['voz', 'O fósforo chega até aqui. Nenhum fósforo vai além. Não por lei. Por natureza.'],
    ['voz', 'Domine tudo o que o fósforo tem a ensinar. Então enfrente a VENTANIA.'],
    ['ademir', 'Ventania? Que ventania? Quem é você? Por que o pombo te obedece?'],
    ['voz', '...tic.']
  ] },
  { id: 'tree100', era: 'fosforo', when: { on: 'tree100' }, lines: [
    ['voz', 'Você aprendeu tudo o que um fósforo pode ensinar.'],
    ['voz', 'Agora prove. Quando estiver pronto, chame a GRANDE VENTANIA.']
  ] },
  { id: 'ch', era: 'fosforo', when: { on: 'challenge' }, lines: [
    ['ademir', 'Segura firme! Repara tudo o que soltar e espanta tudo o que voar!'],
    ['vo', 'Eu vou segurar o varal. Alguém segura o Ademir.']
  ] },
  { id: 'won', era: 'fosforo', when: { on: 'won' }, clue: 'bilhete', lines: [
    ['ademir', 'VOCÊ AGUENTOU A GRANDE VENTANIA!'],
    ['voz', 'Olhe para o topo.'],
    ['ademir', 'Tem... um PALITO DE DENTE. Flutuando. Com um bilhete amarrado.'],
    ['bilhete', '"Se você chegou aqui com fósforos, já não precisa deles. Os dentes te esperam. — A."'],
    ['inspetor', '"A"... de ARQUITETO! O relatório de 1987!'],
    ['ademir', 'Ou de "Ademir". Mas não fui eu. Eu acho. Eu esqueço muita coisa.'],
    ['pombo', 'Pruu.']
  ] },

  /* ================= ERA 02 — PALITO DE DENTE ================= */
  { id: 'dente_intro', era: 'dente', when: { start: true }, clue: 'arquiteto', lines: [
    ['ademir', 'Palitos de DENTE! Mais rígidos, sem cabeça, sem fogo. O sonho de todo empilhador!'],
    ['vo', 'E escorregam. As pontinhas escorregam. Cuidado, que eu já vi isso acabar em choro.'],
    ['inspetor', 'Chegou ao checkpoint dos 4 metros. Inacreditável. O Arquiteto existia mesmo.'],
    ['inspetor', 'Ele construía sempre recomeçando do ponto onde o material anterior parou. Uma plataforma de cada vez.'],
    ['ademir', 'Então o tic-tic... era alguém empilhando lá em cima esse tempo todo?'],
    ['voz', '...tic... tic...']
  ] },
  { id: 'dente_slip', era: 'dente', when: { layer: 12 }, lines: [
    ['ademir', 'Viu? Às vezes o palito escorrega e encaixa torto, já rachado.'],
    ['ademir', 'O ramo PONTAS da árvore resolve isso. Ponta bem feita, torre bem feita.']
  ] },
  { id: 'dente_insp', era: 'dente', when: { layer: 120 }, clue: 'dentes', lines: [
    ['inspetor', 'Fui verificar no INPALI. Não existe NENHUMA norma para palitos de dente.'],
    ['inspetor', 'Ninguém nunca chegou até aqui para precisar de uma.'],
    ['inspetor', 'Estou redigindo uma agora. Artigo 1: "Cuidado". Só isso por enquanto.']
  ] },
  { id: 'dente_radio', era: 'dente', when: { layer: 350 }, lines: [
    ['radio', 'Rádio Torre FM, edição extraordinária! A torre do bairro passou dos 7 metros!'],
    ['radio', 'Já foi vista da padaria, do posto e de um avião que pediu para não ser identificado.'],
    ['radio', 'Ouvintes relatam um "tic-tic" no céu. Nossos técnicos dizem que é o relógio da igreja. A igreja não tem relógio.']
  ] },
  { id: 'dente_vo', era: 'dente', when: { layer: 600 }, lines: [
    ['vo', 'Encontrei o Tonico na lojinha de churrasco. Contei da sua torre.'],
    ['vo', 'Ele derrubou todos os espetos no chão e disse: "Não deixa ele chegar nos espetos".'],
    ['vo', 'Depois pediu desculpa e me deu um espetinho de queijo. Estava ótimo.']
  ] },
  { id: 'dente_top', era: 'dente', when: { layer: 1000 }, lines: [
    ['voz', 'Dez metros. Dentes dominados... quase.'],
    ['voz', 'Mais acima, os palitos ficam compridos. E o Tonico ficou com medo deles.'],
    ['ademir', 'ESPETOS! Os espetos de churrasco! TUDO SE CONECTA!'],
    ['pombo', 'Pruu.'],
    ['ademir', 'O Gervásio disse que não conecta nada, que eu só estou com fome.']
  ] }
];

/* comentários soltos (não pausam o jogo) — aparecem de tempos em tempos */
PALIT.CHATTER = [
  ['ademir', 'Lembrete: isto é um chapéu.'],
  ['ademir', 'Já pensou em empilhar com a mão esquerda? Eu não. Nunca. Foi só uma ideia.'],
  ['ademir', 'Meu primo empilhou tampinhas. Chegou a 12 centímetros. Ele não fala sobre isso.'],
  ['ademir', 'Se cair um palito, não chora. Repara. Chorar não cola madeira.'],
  ['vo', 'Quer um bolinho? Tem de fubá e de fubá.'],
  ['vo', 'No meu tempo, torre de palito era coisa séria. Tinha até concurso. Eu ganhei. Duas vezes.'],
  ['vo', 'Fecha a janela, que o vento entra e derruba suas varetinhas.'],
  ['luca', 'Moço, quanto custa uma torre dessa? Eu tenho 3 reais e uma figurinha repetida.'],
  ['luca', 'Eu NÃO tenho mais lupa. Minha mãe guardou. Eu achei. Mas guardei de novo.'],
  ['luca', 'Quando eu crescer quero ser empilhador profissional. Ou astronauta. Ou os dois.'],
  ['inspetor', 'Estou de olho. Na verdade, de binóculo.'],
  ['inspetor', 'O formulário 27-B do INPALI tem 14 páginas. Todas sobre palitos.'],
  ['pombo', 'Pruu.'],
  ['pombo', 'Pruu?'],
  ['pombo', 'Pruuuuuu.'],
  ['gato', 'Miau. (Bartolomeu olha para a torre como quem planeja um crime.)'],
  ['gato', '(Bartolomeu derruba um copo da janela só para provar que pode.)'],
  ['radio', 'Previsão do tempo: rajadas de vento. Ótimo dia para NÃO construir torres de palito.'],
  ['radio', 'Pesquisa da Rádio Torre FM: 7 em cada 10 pombos preferem torres altas.'],
  ['radio', 'Promoção na mercearia: leve 3 caixas de fósforo e ganhe um olhar de pena do caixa.'],
  ['ademir', 'Aquele tic-tic de novo... deve ser cupim. Cupim musical.'],
  ['vo', 'O Ademir anda falando sozinho com o pombo. Acho que é a idade. A do pombo.']
];
