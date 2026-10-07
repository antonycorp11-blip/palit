# PALIT

Jogo incremental de construção vertical em pixel art, **100% HTML + CSS + JS puro** (sem build, sem imagens).
Toda a arte é CSS: sprites em `box-shadow` gerados a partir de ASCII, torre em projeção oblíqua (palitos gerados por material), cenário em blocos/degradês de corte seco, paleta PICO-8. Todos os sons são sintetizados em tempo real (Web Audio).

Abra `index.html` (ou sirva a pasta: `python3 -m http.server`). Use `?debug` para o painel de testes.

## Arquitetura

```
js/data/        dados (tudo data-driven)
  stats.js        atributos que upgrades modificam + formatação
  materials.js    as 40 eras (stats base, visual, problemas, ameaças, desafio final)
  trees/*.js      uma árvore por material (fosforo.js: 136 nós, 616 níveis, 10 ramos)
  threats.js      ameaças (tipo de movimento, dano, recompensa)
  events.js       eventos aleatórios
  scenes.js       cenário por altitude global
  sprites.js      pixel art ASCII
js/core/        simulação (sem DOM)
  econ.js         fórmulas de economia (compartilhadas com o simulador)
  tree.js         motor genérico de árvores (stats, custos, pré-requisitos, layout radial)
  state.js        save/load (localStorage)
  game.js         loop: produção, colocação, dano/reparo, vento, clima, eventos, ameaças,
                  automação, desafio final, reconstrução (altura global × local)
js/ui/          apresentação
  spritecss.js    compila sprites ASCII → CSS
  view.js         cena, torre virtualizada, câmera, ameaças, efeitos, entrada
  hud.js          HUD, régua da era, alertas, modais
  treeview.js     árvore arrastável com zoom + efeitos de compra
  audio.js        sons 8-bit sintetizados (Web Audio)
  juice.js        efeitos de HUD e sons ligados aos eventos do jogo
  ambient.js      cenário vivo: dia/noite, camadas de profundidade, vida ao fundo
tools/
  validate.js     valida árvores (ids, pré-requisitos, sobreposição, limite estrutural)
  sim.js          simulação de balanceamento (`node tools/sim.js [fração ativa]`)
```

## Adicionar uma nova era jogável

1. Criar `js/data/trees/<id>.js` registrando `PALIT.TREES.<id>` (mesmo formato de `fosforo.js`).
2. Em `materials.js`, definir `tree: '<id>'`, `challenge` e a lista `threats` da era.
3. Novos atributos → `stats.js`; novas ameaças/eventos → `threats.js` / `events.js`.
4. Incluir o script no `index.html` e rodar `node tools/validate.js` e `node tools/sim.js`.
