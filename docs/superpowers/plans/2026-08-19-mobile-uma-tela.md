# Mobile em Uma Tela — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No celular, cada estação mostra o conteúdo INTEIRO em uma tela — como "+15 anos" já faz — em vez de esconder o que passa da dobra. Corrige também a hero quebrada (coluna de texto esmagada até 0px) e os alvos de toque/fontes abaixo do mínimo.

**Architecture:** A causa raiz é uma só, em duas formas. (1) No mobile, `#recursos`, `#demo` e `#faq` recebem `min-height: auto` + `display: block` — código de quando eram seções de rolagem normal — mas continuam PRESAS pelo pin, então o conteúdo além da tela fica inalcançável: o pin segura a seção parada e rolar só avança a animação. (2) A hero tem um bug de especificidade: `.page .hero-grid` (0,2,0) com duas colunas vence `.hero-grid` (0,1,0) dentro das media queries de empilhamento, que NUNCA funcionaram — a coluna de texto chega a 0px em 390px de largura. O modelo do conserto é o que "+15 anos" já usa: seção em `100svh` + `place-items: center`, conteúdo desenhado para caber, e compressão disparada por ALTURA de tela (nunca `min-height` menor — ver 7a2fd70). Nenhuma constante de scroll (TRAVESSIA/CHEGOU/PARTIU/SEGURA) muda; nenhuma janela de cascata muda (são frações, imunes a layout).

**Tech Stack:** CSS puro nos arquivos existentes. Única mudança de marcação: nenhuma — o carrossel do Recursos é só CSS sobre o `.bento` atual.

## Global Constraints

- **O teste que define "pronto":** em cada viewport da matriz, NENHUMA seção presa pode ser mais alta que a tela (`sec.offsetHeight ≤ innerHeight` com o pin ativo). É esse o teste que captura conteúdo inalcançável — `scrollHeight` não captura, porque o pin esconde sem overflow.
- **Matriz de medição:** 1440×900 (regressão desktop), 390×844, 393×852, 375×667, 360×740, 412×915, e paisagem 844×390.
- **Compressão sempre por `max-height`**, nunca por largura sozinha (notebook 1366×768 e celular deitado estouram pelo mesmo motivo). Ordem dos dials: padding → vãos → mídia/número → tipografia de apoio. Títulos não encolhem além do já previsto.
- **Nunca resolver com `min-height` menor que `100svh`** numa seção presa — foi o bug da "+15 anos" (7a2fd70).
- **Nenhuma mudança em Estacoes.tsx, Hero.tsx, mergulho.ts** — os pins continuam como estão em TODAS as larguras; o conteúdo é que passa a caber.
- **Cascata intocada** — `--de`/`--dur` são frações da chegada e valem para qualquer layout.
- **`prefers-reduced-motion` e as páginas legais não são tocadas.**
- **Decisão de formato (Recursos): carrossel horizontal** — recomendação aprovada por padrão; se o dono do produto preferir outra direção, só a Task 3 muda.

## File Structure

| Arquivo | Mudança |
|---|---|
| `styles/hero.css` | Empilhamento da hero com especificidade certa + encaixe em 100svh |
| `styles/responsive.css` | Remove o bloco duplicado e morto de `.hero-grid` |
| `styles/conversion.css` | Nada (a regra base de duas colunas fica; quem muda é quem a sobrescreve) |
| `styles/recursos.css` | Bento vira carrossel horizontal no mobile; seção volta a 100svh |
| `styles/institutional.css` | Demo e FAQ voltam a 100svh centrado; compressões por altura; rodapé/toque |
| `styles/shell.css` | CTA do header ≥44px; rótulos do dock 9→10px |

---

### Task 1: Hero — o empilhamento que nunca funcionou

**Files:**
- Modify: `styles/hero.css` (bloco `@media (max-width: 980px)`, ~linha 187)
- Modify: `styles/responsive.css` (remover o bloco `.hero-grid`/`.hero p.sub` duplicado, ~linhas 6-20)

**Interfaces:**
- Consumes: `.page .hero-grid { grid-template-columns: minmax(0,1.08fr) minmax(390px,.92fr) }` de conversion.css — a regra que precisa ser vencida.
- Produces: hero empilhada e cabendo em 100svh abaixo de 981px.

- [ ] **Step 1: Em `styles/hero.css`, reescrever o bloco 980px com a especificidade certa** (duas classes, igual à regra que ele precisa vencer):

```css
@media (max-width: 980px) {
  /* `.page .hero-grid`, com DUAS classes, e não é estilo: é especificidade.
     A regra de duas colunas em conversion.css é `.page .hero-grid` (0,2,0),
     e media query não soma especificidade — o seletor de uma classe que
     morava aqui perdia SEMPRE, e o empilhamento nunca aconteceu. Medido
     antes do conserto: a coluna do texto tinha 195px em 700 de largura,
     15px em 500 e 0px em 390 — a primeira tela do site sem título, sem
     contagem e sem CTA no celular. */
  .page .hero-grid {
    grid-template-columns: 1fr;
    gap: clamp(22px, 4vh, 40px);
  }
  .page .hero { align-items: stretch; }
  .page .hero-col { max-width: 650px; }
  .page .hero h1 { max-width: 12ch; font-size: clamp(38px, 8.5vw, 64px); }
  .page .hero p.sub { max-width: 56ch; }
  /* O objeto divide a tela com o texto agora — encolhe para o conjunto
     caber em 100svh. A altura real é medida no gate do Step 4. */
  .page .hero-obj { width: min(72vw, 340px); margin: 0 auto; }
  .page .hero-visual { min-height: 0; }
}
```

ATENÇÃO: manter o `min-height: auto` FORA da regra — a hero continua presa e o mergulho precisa da altura cheia. Se `hero.css:188` tiver `.hero { min-height: auto; ... }`, trocar por `min-height: 100svh` (o conteúdo é que passa a caber, como na "+15 anos").

- [ ] **Step 2: Em `styles/responsive.css`, remover o bloco duplicado** (`@media (max-width: 980px) { .hero-grid {...} .palco {...} .hero-obj::before {...} .hero p.sub {...} }`) deixando um comentário de uma linha apontando para hero.css — duas cópias da mesma intenção foi o que deixou o bug invisível. Mover `.palco { max-width: 460px }` e `.hero-obj::before { inset: -8% -4% }` para o bloco novo de hero.css com o prefixo `.page`.

- [ ] **Step 3: Compressão por altura para o conjunto caber** (em hero.css, depois do bloco 980px):

```css
/* A hero empilhada divide 100svh entre texto, contagem, CTA e objeto.
   Em telas baixas o RESPIRO cede primeiro; o objeto é o segundo; o
   título nunca. Gatilho por altura: celular deitado e notebook baixo
   estouram pelo mesmo motivo. */
@media (max-width: 980px) and (max-height: 900px) {
  .page .hero { padding-top: 92px; padding-bottom: 28px; }
  .page .hero-countdown { margin-top: 14px; }
  .page .hero-actions { margin-top: 14px; }
  .page .hero-obj { width: min(58vw, 280px); }
}
@media (max-width: 980px) and (max-height: 700px) {
  .page .hero-obj { width: min(44vw, 210px); }
  .page .hero h1 { font-size: clamp(32px, 7.5vw, 44px); }
}
```

Os valores acima são ponto de partida — o gate do Step 4 é quem manda; ajustar os dials na ordem global (padding → vãos → objeto → tipografia).

- [ ] **Step 4: GATE de encaixe** — com o dev server rodando, medir `document.querySelector('.hero').offsetHeight ≤ innerHeight` em TODA a matriz mobile (390×844, 393×852, 375×667, 360×740, 412×915, 844×390). Ajustar dials até passar. Registrar os números.

- [ ] **Step 5: Conferência visual** — screenshot da hero em 390×844 e 844×390: tag, título inteiro, descrição, contagem, CTA e cérebro todos visíveis.

- [ ] **Step 6: Commit** — `fix(hero): o empilhamento mobile perdia por especificidade e nunca rodou`

---

### Task 2: FAQ — seis perguntas numa tela

**Files:**
- Modify: `styles/institutional.css` (bloco 1023px do #faq, ~linha 999; bloco 620px, ~linha 1033)

**Interfaces:**
- Consumes: `.page #faq > .estacao-palco` (grid 2 colunas no desktop), `.faq summary { padding-block: 28px }`.
- Produces: FAQ presa, centrada e cabendo em 100svh no mobile.

- [ ] **Step 1: No bloco `@media (max-width: 1023px)`, substituir** o trio `min-height: auto; display: block` + `.sec-head+.faq { margin-top: 48px }` por:

```css
  /* PRESA e centrada como no desktop — `min-height: auto` + `block` eram
     de quando a FAQ rolava solta; presa, o que passa da tela fica
     inalcançável (o pin segura a seção parada). Mesmo bug de família do
     72svh da "+15 anos". O palco empilha: cabeçalho em cima, lista
     embaixo. */
  .page #faq > .estacao-palco {
    grid-template-columns: 1fr;
    gap: 28px;
    align-items: start;
  }
  .page #faq .sec-head h2 {
    font-size: clamp(34px, 8vw, 44px);
  }
  .page #faq .faq summary {
    padding-block: 16px;
    font-size: 16px;
  }
```

- [ ] **Step 2: Compressão por altura** (vale para qualquer largura ≤1023):

```css
@media (max-width: 1023px) and (max-height: 820px) {
  .page #faq { padding-block: clamp(56px, 8vh, 84px); }
  .page #faq .faq summary { padding-block: 12px; font-size: 15px; }
  .page #faq .sec-head h2 { font-size: clamp(30px, 7vw, 38px); }
}
```

- [ ] **Step 3: Resposta aberta não pode estourar** — abrir uma pergunta cresce a seção; como `name="faq"` já garante UMA aberta por vez, limitar o corpo: `.page #faq .faq-body { max-height: 32svh; overflow-y: auto; }` no bloco 1023px, para a resposta rolar por dentro em vez de empurrar a seção para fora da tela.

- [ ] **Step 4: GATE de encaixe** na matriz mobile — fechada E com a resposta mais longa aberta.

- [ ] **Step 5: Commit** — `fix(faq): presa e inteira numa tela no mobile`

---

### Task 3: Demo ("Como funciona") — retrato e janela na mesma tela

**Files:**
- Modify: `styles/institutional.css` (bloco 1023px do #demo, ~linha 971; bloco 620px `.demo-body`)

- [ ] **Step 1: No bloco `@media (max-width: 1023px)`, substituir** `min-height: auto; gap: 34px` e o empilhamento atual por:

```css
  /* PRESA como no desktop (mesma família de bug da FAQ). O retrato deixa
     de ocupar uma faixa própria de 220px: vira vizinho do cabeçalho, numa
     linha só, e a janela de demonstração fica com o resto da tela. */
  .page #demo .demo-layout {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .page #demo .demo-lado {
    --retrato: 96px;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 16px;
  }
  .page #demo .demo-head h2 { font-size: clamp(26px, 6.4vw, 34px); }
  .page #demo .demo-head__sub { display: none; }
  .page #demo .demo-body { min-height: clamp(300px, 42svh, 420px); }
```

O `demo-head__sub` some no mobile por decisão de orçamento: é subtítulo de apoio, e a tela inteira é o que compra a janela de demonstração visível — o conteúdo que prova o produto. Se fizer falta, o dial de troca é o `--retrato`.

- [ ] **Step 2: Compressão por altura:**

```css
@media (max-width: 1023px) and (max-height: 780px) {
  .page #demo { padding-block: clamp(48px, 7vh, 72px); }
  .page #demo .demo-body { min-height: clamp(250px, 38svh, 340px); }
  .page #demo .demo-lado { --retrato: 72px; }
}
```

- [ ] **Step 3: GATE de encaixe** na matriz + conferir que o mockup da demo continua legível (screenshot).

- [ ] **Step 4: Commit** — `fix(demo): retrato ao lado do cabecalho e a secao inteira numa tela`

---

### Task 4: Recursos ("O que ela faz") — carrossel horizontal

**Files:**
- Modify: `styles/recursos.css` (bloco `@media (max-width: 1023px)`, ~linha 626)

**Interfaces:**
- Consumes: `.bento` com 5 `.rec-cell` (cria, planeja, calcula, dna, repertorio); `.calc__controle` (o slider de ROI).
- Produces: seção presa em 100svh com os 5 cards em deslize lateral com snap.

- [ ] **Step 1: Substituir o miolo do bloco 1023px** (`min-height: auto; display: block` + bento empilhado) por:

```css
  .page #recursos {
    min-height: 100svh;
    padding: clamp(72px, 10vh, 104px) 0 clamp(28px, 4vh, 48px);
    display: grid;
    align-content: center;
    overflow: hidden;
  }
  .page #recursos .rec-head {
    margin: 0 var(--gutter) 22px;
  }
  .page #recursos .rec-head h2 {
    max-width: 16ch;
    font-size: clamp(32px, 6.4vw, 44px);
  }

  /* CARROSSEL: os cinco cards em deslize lateral, um por tela, com snap.
     Empilhados eles somam ~1.760px — mais de duas telas — e a seção é
     PRESA: tudo abaixo da dobra era inalcançável. Medido antes disto, em
     390×844: CALCULA, DNA e Repertório (a calculadora de ROI e o bônus
     dos planos) nunca apareciam para quem navega no celular.

     Horizontal e não "mais curto" porque o conteúdo dos cards é o
     argumento (post real, calendário, calculadora) — encolher os cards
     mataria justamente a prova. O deslize lateral é o único formato que
     preserva os cinco inteiros dentro de uma tela presa. */
  .page #recursos .bento {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 14px;
    padding-inline: var(--gutter);
    scrollbar-width: none;
    --vem: 34px;
  }
  .page #recursos .bento::-webkit-scrollbar { display: none; }
  .page #recursos .bento .rec-cell {
    flex: 0 0 min(84vw, 360px);
    scroll-snap-align: center;
    min-height: 0;
  }
  /* Os gestos de chegada laterais (--vem-x) empurrariam os cards contra o
     eixo do deslize — no carrossel todos chegam de baixo. */
  .page #recursos .rec-cell--cria,
  .page #recursos .rec-cell--dna {
    --vem-x: 0px;
    --sobe: 34px;
  }
  /* O slider de ROI é um arrasto HORIZONTAL dentro de um carrossel
     horizontal: sem isto, arrastar o controle desliza o carrossel. O
     controle passa a ser dono do próprio gesto. */
  .page #recursos .calc__controle { touch-action: none; }
```

Conferir o que o bloco antigo fazia com `grid-column` das células e remover o que sobrar sem uso.

- [ ] **Step 2: Pista de que existe mais conteúdo** — o carrossel precisa se anunciar. Sem tocar na marcação: deixar o card vizinho aparecer na borda (o `flex-basis: 84vw` já faz isso — conferir no screenshot que uma fatia do card 2 é visível à direita).

- [ ] **Step 3: GATE de encaixe** (`#recursos.offsetHeight ≤ innerHeight` na matriz) + gate FUNCIONAL: via Playwright, arrastar/scrollar o `.bento` até o último card e confirmar `rec-cell--repertorio` visível; mexer o slider da calculadora e confirmar que o carrossel NÃO deslizou junto.

- [ ] **Step 4: Compressão por altura** se o gate pedir (mesma ordem: padding → cabeçalho → altura interna dos cards via `--post`/minhas alturas — medir antes de mexer).

- [ ] **Step 5: Commit** — `feat(recursos): os cinco cards viram carrossel no celular`

---

### Task 5: Alvos de toque e fontes mínimas

**Files:**
- Modify: `styles/shell.css` (`.site-nav__cta` mobile, rótulos do dock)
- Modify: `styles/institutional.css` (links do rodapé)
- Modify: `styles/recursos.css` (chips de variação)

- [ ] **Step 1: CTA do header** — em `styles/shell.css`, no bloco `@media (max-width: 1023px)`, `.site-nav__cta { min-height: 38px }` → `min-height: 44px`. Conferir que o nav não cresce a ponto de mudar o `scroll-margin-top: 78px` (medir a altura do header depois).
- [ ] **Step 2: Rótulos do dock** — em `styles/shell.css`, localizar o `font-size` de 9px dos rótulos (`grep -n "9px" styles/shell.css`) e subir para 10px; conferir que as cinco palavras ainda cabem sem quebra em 360px de largura.
- [ ] **Step 3: Links do rodapé** — dar área de toque sem mudar o visual: `.page .site-footer .foot-links a { padding-block: 12px; margin-block: -12px; }` (o padding estende o alvo, o margin negativo devolve o layout).
- [ ] **Step 4: Chips de variação** (botões de 27px em Recursos) — subir o padding vertical até o alvo medir ≥34px de altura (44 deformaria o post preview; 34 é o mínimo do Android, e os chips são secundários).
- [ ] **Step 5: Medir de novo os alvos** com o mesmo script da auditoria (offsetWidth/Height) e registrar o antes/depois.
- [ ] **Step 6: Commit** — `fix(toque): CTA do header, dock, chips e rodape alcancam o minimo de toque`

---

### Task 6: Verificação final

- [ ] **Step 1:** `npm run check` — typecheck, 38/38, build, verificar (só os 7 marcadores legais).
- [ ] **Step 2: O teste-mestre da matriz** — nas 7 telas da matriz: nenhuma seção presa mais alta que a tela; zero scroll horizontal; varredura de sobreposição (~120 posições) com 0 conflitos.
- [ ] **Step 3: `prefers-reduced-motion`** — sem pins, tudo visível, carrossel do Recursos ainda navegável por toque.
- [ ] **Step 4: Desktop intacto** — screenshots 1440×900 de hero, recursos, demo e FAQ comparados com o estado atual (nada deve mudar acima de 1024px).
- [ ] **Step 5: Screenshots mobile** das quatro seções consertadas para o dono do produto conferir no preview.
- [ ] **Step 6: Push** da branch e PR.
