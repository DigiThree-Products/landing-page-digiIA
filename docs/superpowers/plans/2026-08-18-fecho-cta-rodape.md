# Fecho CTA + rodapé — plano de implementação

> **Para trabalhadores agênticos:** SUB-SKILL OBRIGATÓRIA: use
> superpowers:subagent-driven-development (recomendado) ou
> superpowers:executing-plans para implementar tarefa a tarefa. Os passos usam
> caixas (`- [ ]`) para acompanhamento.

**Goal:** Fazer o rodapé ser a continuação exata do campo de cor do CTA, sem
emenda visível e sem alterar um pixel do CTA.

**Architecture:** Um envelope `.fecho` envolve `<Offer/>` e `<SiteFooter/>` e
passa a ser o único elemento que pinta o fundo dos dois. O CTA continua idêntico
porque a parada do violeta deixa de ser porcentagem (relativa ao comprimento da
linha, que cresce com a caixa) e passa a ser pixel absoluto, calculado a partir
da caixa do próprio CTA. A geometria mora em `lib/fecho.ts`, puro e testado; o
componente só mede o DOM e publica variáveis CSS.

**Tech Stack:** Next.js 16 (export estático), React 19, TypeScript strict,
CSS autoral por domínio, `node --test` para as unidades puras.

## Global Constraints

- **O CTA não pode mudar.** Qualquer diferença visível no `#oferta` é falha da
  tarefa, não efeito colateral aceitável.
- **`#oferta` mantém `overflow: hidden`.** Ele recorta a faixa do ticker, que é
  `width: 106vw; left: -3vw` (`styles/conversion.css:152`). Removê-lo cria barra
  de rolagem horizontal.
- **`.foot-bot` mantém seu `border-top`.** É separador interno do rodapé
  (`styles/sections.css:363`), sem relação com a junta.
- **Módulos em `lib/` são puros:** sem DOM, sem React, sem estado — é o que
  permite testá-los. Segue `lib/grao.ts`, `lib/mergulho.ts`, `lib/poeira.ts`.
- **Imports:** componentes usam `@/lib/x` (sem extensão); testes usam `./x.ts`
  (com extensão — `allowImportingTsExtensions` está ligado).
- **Commits em português, sem acento no assunto**, no formato
  `tipo(escopo): assunto`.
- **Portão de verificação:** `npm run check` (typecheck + testes + build +
  auditoria do HTML). A auditoria reprova nos 4 marcadores legais — isso é
  esperado e pré-existente; qualquer problema ALÉM desses 7 é regressão.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `lib/fecho.ts` (criar) | Geometria do degradê: direção, comprimento da linha, distância de um ponto, parada do violeta. Puro. |
| `lib/fecho.test.ts` (criar) | Fixa a fórmula e trava a invariância que sustenta o desenho. |
| `components/sections/Fecho.tsx` (criar) | Envelope. Mede o `#oferta` e publica `--oferta-h`, `--fecho-angulo`, `--fecho-parada`. |
| `styles/fecho.css` (criar) | O campo pintado uma vez só, e o arco. |
| `app/globals.css` (modificar) | Importar `fecho.css`. |
| `app/page.tsx` (modificar) | Envolver `<Offer/>` + `<SiteFooter/>`. |
| `styles/institutional.css` (modificar) | Tirar os dois fundos e o arco. |
| `styles/sections.css` (modificar) | Tirar o fundo e a linha do rodapé. |

---

### Task 1: A geometria, pura e testada

**Files:**
- Create: `lib/fecho.ts`
- Test: `lib/fecho.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `ANGULO: number` (125), `PARADA_VIOLETA: number` (0.76),
  `direcao(anguloGraus?: number): [number, number]`,
  `comprimentoDaLinha(largura: number, altura: number, anguloGraus?: number): number`,
  `distanciaNoPonto(x: number, y: number, anguloGraus?: number): number`,
  `paradaDoVioleta(largura: number, altura: number): number`.

- [ ] **Step 1: Escrever o teste que falha**

Crie `lib/fecho.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ANGULO,
  comprimentoDaLinha,
  direcao,
  distanciaNoPonto,
  PARADA_VIOLETA,
  paradaDoVioleta,
} from './fecho.ts'

const perto = (a: number, b: number) => assert.equal(Number(a.toFixed(6)), Number(b.toFixed(6)))

test('direcao aponta para a direita e para baixo em 125 graus', () => {
  const [dx, dy] = direcao()
  perto(dx, 0.819152)
  perto(dy, 0.573576)
  assert.equal(ANGULO, 125)
})

test('comprimentoDaLinha soma as projecoes da largura e da altura', () => {
  const [dx, dy] = direcao()
  perto(comprimentoDaLinha(1425, 1633), 1425 * dx + 1633 * dy)
  perto(comprimentoDaLinha(1425, 1633), 2103.941984)
})

test('distanciaNoPonto e a projecao do ponto na direcao do degrade', () => {
  const [dx, dy] = direcao()
  perto(distanciaNoPonto(0, 0), 0)
  perto(distanciaNoPonto(0, 1633), 1633 * dy)
  perto(distanciaNoPonto(1425, 0), 1425 * dx)
  perto(distanciaNoPonto(712, 800), 712 * dx + 800 * dy)
})

/* A propriedade que sustenta o desenho inteiro. Crescer a caixa para baixo
   desloca o ponto inicial do degrade PERPENDICULARMENTE a sua direcao, e
   translacao perpendicular nao altera projecao nenhuma. Por isso a distancia
   nao recebe largura nem altura: ela nao depende delas. Se este teste cair,
   o CTA deixou de renderizar igual e o desenho perdeu a base. */
test('a distancia nao depende da caixa — CTA e fecho dao o mesmo valor', () => {
  const alturaCta = 1633
  const alturaFecho = 1979
  const largura = 1425
  const [dx, dy] = direcao()
  for (const [x, y] of [[0, 0], [0, alturaCta], [largura, 0], [712, 800], [largura, alturaCta]]) {
    const naCaixaDoCta = 0.5 * comprimentoDaLinha(largura, alturaCta)
      + (x - largura / 2) * dx + (y - alturaCta / 2) * dy
    const naCaixaDoFecho = 0.5 * comprimentoDaLinha(largura, alturaFecho)
      + (x - largura / 2) * dx + (y - alturaFecho / 2) * dy
    perto(naCaixaDoCta, naCaixaDoFecho)
    perto(naCaixaDoCta, distanciaNoPonto(x, y))
  }
})

test('paradaDoVioleta e a fracao do comprimento da linha do CTA', () => {
  assert.equal(PARADA_VIOLETA, 0.76)
  perto(paradaDoVioleta(1425, 1633), comprimentoDaLinha(1425, 1633) * 0.76)
  perto(paradaDoVioleta(1425, 1633), 1598.995908)
})
```

- [ ] **Step 2: Rodar o teste para ver falhar**

Run: `npm run test`
Expected: FALHA — `Cannot find module './fecho.ts'`.

- [ ] **Step 3: Escrever a implementação mínima**

Crie `lib/fecho.ts`:

```ts
/**
 * Fonte única da geometria do fecho.
 *
 * O CTA e o rodapé são pintados por um campo só (ver `styles/fecho.css`), e
 * esse campo precisa cobrir os dois SEM mudar o CTA. Com a parada do violeta
 * em porcentagem isso é impossível: porcentagem é relativa ao comprimento da
 * linha do degradê, que cresce junto com a caixa, então toda cor escorrega.
 * Em pixel absoluto não escorrega — e é esta a razão de este módulo existir.
 *
 * É o quarto da família, pelo mesmo motivo dos anteriores: `lib/poeira.ts`
 * para o eixo da revelação, `lib/mergulho.ts` para o progresso do mergulho,
 * `lib/grao.ts` para o que é um grão.
 *
 * Puro de propósito: sem DOM, sem React, sem estado. É o que permite fixar a
 * geometria em `fecho.test.ts`.
 */

/** Ângulo do degradê, em graus, como o CSS mede: 0 = para cima, horário. */
export const ANGULO = 125

/** Onde o violeta satura, como fração do comprimento da linha do CTA. */
export const PARADA_VIOLETA = 0.76

/**
 * Direção do degradê em coordenadas de tela — x para a direita, y para baixo.
 * Em 125° as duas componentes são positivas: o degradê desce para a direita.
 */
export function direcao(anguloGraus: number = ANGULO): [number, number] {
  const a = (anguloGraus * Math.PI) / 180
  return [Math.sin(a), -Math.cos(a)]
}

/** Comprimento da linha do degradê numa caixa de `largura` × `altura`. */
export function comprimentoDaLinha(
  largura: number,
  altura: number,
  anguloGraus: number = ANGULO,
): number {
  const [dx, dy] = direcao(anguloGraus)
  return Math.abs(largura * dx) + Math.abs(altura * dy)
}

/**
 * Distância de um ponto ao início do degradê, em pixels.
 *
 * Não recebe a caixa porque não depende dela. A conta longa é
 * `L/2 + (x − W/2)·dx + (y − H/2)·dy`; substituindo `L = W·dx + H·dy` os
 * termos de W e H se cancelam e sobra a projeção pura. Vale enquanto as duas
 * componentes da direção forem positivas (ângulo entre 90° e 180°), que é o
 * caso do canto inicial ser o superior esquerdo.
 */
export function distanciaNoPonto(x: number, y: number, anguloGraus: number = ANGULO): number {
  const [dx, dy] = direcao(anguloGraus)
  return x * dx + y * dy
}

/** Onde fixar o violeta, em pixels, para o CTA renderizar como hoje. */
export function paradaDoVioleta(largura: number, altura: number): number {
  return comprimentoDaLinha(largura, altura) * PARADA_VIOLETA
}
```

- [ ] **Step 4: Rodar o teste para ver passar**

Run: `npm run test`
Expected: PASSA — 18 testes antigos + 5 novos = 23, `fail 0`.

- [ ] **Step 5: Rodar o typecheck**

Run: `npm run typecheck`
Expected: sem saída, código 0.

- [ ] **Step 6: Commit**

```bash
git add lib/fecho.ts lib/fecho.test.ts
git commit -m "feat(fecho): lib/fecho.ts como fonte unica da geometria do degrade"
```

---

### Task 2: O campo pintado uma vez só

Entrega: a emenda some e o CTA continua idêntico. O arco ainda para na junta —
é a Task 3.

**Files:**
- Create: `components/sections/Fecho.tsx`, `styles/fecho.css`
- Modify: `app/globals.css`, `app/page.tsx`,
  `styles/institutional.css` (bloco `.page #oferta`, bloco `.page .site-footer`),
  `styles/sections.css` (bloco `.site-footer`)

**Interfaces:**
- Consumes: `ANGULO`, `paradaDoVioleta` de `lib/fecho.ts`.
- Produces: componente `Fecho({ children }: { children: ReactNode })`, classe
  CSS `.fecho`, e as variáveis `--oferta-h`, `--fecho-angulo`, `--fecho-parada`
  publicadas no elemento `.fecho`.

- [ ] **Step 1: Capturar o CTA de referência, ANTES de mudar nada**

Com o dev server rodando, no navegador em 1440×900, role até o fim e guarde uma
captura da região do CTA. É contra ela que a Task 2 será julgada.

Run: `npm run dev` e capture `antes-cta.png` na mesma posição de rolagem.
Expected: uma imagem de referência salva fora do repositório.

- [ ] **Step 2: Criar o envelope**

Crie `components/sections/Fecho.tsx`:

```tsx
'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { ANGULO, paradaDoVioleta } from '@/lib/fecho'

/**
 * O fecho — o CTA e o rodapé como um campo pintado uma vez só.
 *
 * Declarar o mesmo `background` nos dois não produz continuidade: todo
 * gradiente é pintado a partir da caixa do próprio elemento, então seriam duas
 * cópias reiniciadas encostadas uma na outra. Aqui existe uma pintura só, e as
 * duas seções são janelas para ela.
 *
 * A medição é necessária, não preguiça: `conversion.css` dá ao `#oferta`
 * `min-height: 115svh` E recuos em `clamp()`, e a altura real é o conteúdo —
 * não existe expressão CSS que a reproduza. Daí o ResizeObserver.
 */
export function Fecho({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const envelope = ref.current
    if (!envelope) return
    const oferta = envelope.querySelector<HTMLElement>('#oferta')
    if (!oferta) return

    // O ângulo não muda; publicá-lo aqui é o que impede o CSS de guardar uma
    // segunda cópia do 125 que poderia divergir de lib/fecho.ts em silêncio.
    envelope.style.setProperty('--fecho-angulo', `${ANGULO}deg`)

    const medir = () => {
      const { width, height } = oferta.getBoundingClientRect()
      if (!width || !height) return
      envelope.style.setProperty('--oferta-h', `${height}px`)
      envelope.style.setProperty('--fecho-parada', `${paradaDoVioleta(width, height)}px`)
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(oferta)
    return () => observador.disconnect()
  }, [])

  return (
    <div className="fecho" ref={ref}>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Criar o CSS do campo**

Crie `styles/fecho.css`:

```css
/* ============================================================
   FECHO — o CTA e o rodapé como um campo só
   ============================================================ */

/* Os fallbacks reproduzem exatamente a declaração antiga (`125deg` e `76%`).
   Sem JS o campo continua contínuo — só deixa de preservar o CTA ao pé da
   letra, porque a porcentagem passa a ser relativa à caixa dos dois. Degrada
   para "um pouco diferente", nunca para "quebrado". */
.fecho {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(70% var(--oferta-h, 100svh) at 8% 0%,
      rgba(205, 130, 255, 0.34), transparent 58%),
    linear-gradient(var(--fecho-angulo, 125deg),
      var(--abyss), var(--violet) var(--fecho-parada, 76%));
}

/* Acima do arco (z-index 0, Task 3). Depender da ordem do DOM funcionaria
   hoje e inverteria em silêncio se alguém reordenasse. */
.fecho > #oferta,
.fecho > .site-footer {
  position: relative;
  z-index: 1;
}
```

O raio vertical do brilho radial deixa de ser `100%` de propósito: na caixa dos
dois, `100%` seria a altura somada e o halo cresceria. Amarrado a `--oferta-h`,
fica do tamanho de hoje.

- [ ] **Step 4: Importar o CSS**

Em `app/globals.css`, logo depois da linha `@import '../styles/estacao.css';`,
acrescente:

```css
@import '../styles/fecho.css';
```

Depois de `estacao.css` e antes de `responsive.css`: precisa vencer os blocos de
`institutional.css`, e ainda ceder aos recuos responsivos.

- [ ] **Step 5: Envolver as duas seções**

Em `app/page.tsx`, acrescente o import junto dos outros de `components/sections`:

```tsx
import { Fecho } from '@/components/sections/Fecho'
```

E troque as duas linhas soltas:

```tsx
          <Offer />
          <SiteFooter />
```

por:

```tsx
          <Fecho>
            <Offer />
            <SiteFooter />
          </Fecho>
```

- [ ] **Step 6: Tirar o fundo do CTA**

Em `styles/institutional.css`, o bloco `.page #oferta` fica exatamente assim —
saem as três linhas do fundo, `overflow: hidden` FICA:

```css
.page #oferta {
  width: 100%;
  min-height: 100svh;
  margin: 0;
  padding: clamp(100px, 14vh, 160px) var(--world-edge);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  color: var(--paper);
}
```

- [ ] **Step 7: Tirar o fundo e a cor da borda do rodapé**

Em `styles/institutional.css`, o bloco `.page .site-footer` fica exatamente
assim — saem `border-color` e as três linhas do fundo:

```css
.page .site-footer {
  width: 100%;
  margin: 0;
  padding: 72px var(--world-edge) 42px;
  color: var(--paper);
}
```

- [ ] **Step 8: Tirar a linha e o fundo do rodapé de base**

Em `styles/sections.css`, o bloco `.site-footer` fica exatamente assim — saem
`border-top` e as quatro linhas do fundo:

```css
.site-footer {
  padding-block: 44px 60px;
  margin-top: clamp(70px, 10vh, 120px);
}
```

Não confunda com o `border-top` do `.foot-bot`, mais abaixo no mesmo arquivo:
esse fica.

- [ ] **Step 9: Verificar no navegador**

Run: `npm run dev`, role até o fim em 1440×900.
Expected:
- Nenhuma emenda horizontal onde o CTA termina e o rodapé começa.
- Nenhuma linha de 1px.
- O halo lilás NÃO reaparece no topo do rodapé.
- A região do CTA idêntica a `antes-cta.png` do Step 1.

Se o CTA mudou, o culpado é `--fecho-parada` não ter sido aplicado: confira no
inspetor se o elemento `.fecho` tem as três variáveis.

- [ ] **Step 10: Rodar o portão**

Run: `npm run typecheck` e `npm run test`
Expected: typecheck sem saída; 23 testes, `fail 0`.

- [ ] **Step 11: Commit**

```bash
git add components/sections/Fecho.tsx styles/fecho.css app/globals.css app/page.tsx styles/institutional.css styles/sections.css
git commit -m "feat(fecho): CTA e rodape passam a ser um campo pintado uma vez so"
```

---

### Task 3: O arco atravessa a junta

Hoje o `#oferta::before` é recortado pelo `overflow: hidden` do CTA e morre na
junta. Passando ao envelope, quem recorta é o fecho — e a curva segue.

**Files:**
- Modify: `styles/institutional.css` (remover `.page #oferta::before`),
  `styles/fecho.css` (acrescentar `.fecho::before`)

**Interfaces:**
- Consumes: `--oferta-h`, publicada pelo `Fecho` na Task 2.
- Produces: nada que outra tarefa use.

- [ ] **Step 1: Mover o arco para o envelope**

Em `styles/fecho.css`, acrescente depois do bloco `.fecho`:

```css
/* O arco. Era `inset: -18%` no #oferta; aqui as medidas verticais são
   amarradas a --oferta-h porque a caixa do envelope é mais alta, e `-18%`
   dela desenharia um anel maior. Estas contas reproduzem o anel de hoje:
   -18% de cima, 136% de altura (18% + 100% + 18%). */
.fecho::before {
  content: '';
  position: absolute;
  z-index: 0;
  left: -18%;
  width: 136%;
  top: calc(var(--oferta-h, 100svh) * -0.18);
  height: calc(var(--oferta-h, 100svh) * 1.36);
  border: clamp(60px, 8vw, 120px) solid rgba(248, 240, 255, 0.04);
  border-radius: 50%;
  transform: translate(38%, 30%);
}
```

- [ ] **Step 2: Remover o arco antigo**

Em `styles/institutional.css`, apague o bloco `.page #oferta::before` inteiro
(as 8 linhas, de `content: ''` a `transform`, mais as chaves).

- [ ] **Step 3: Verificar no navegador**

Run: `npm run dev`, role até o fim.
Expected: a curva do anel atravessa a junta e continua pelo rodapé, em vez de
terminar nela. O anel sobre o CTA tem o mesmo tamanho e posição de antes.

- [ ] **Step 4: Commit**

```bash
git add styles/fecho.css styles/institutional.css
git commit -m "feat(fecho): arco decorativo atravessa a junta em vez de morrer nela"
```

---

### Task 4: Bordas, responsivo e portão final

**Files:**
- Test: nenhum arquivo novo; verificação em navegador e `npm run check`.

**Interfaces:**
- Consumes: tudo das tarefas 1–3.
- Produces: nada.

- [ ] **Step 1: Conferir em largura de celular**

Run: `npm run dev`, viewport 390×844, role até o fim.
Expected: sem emenda; sem barra de rolagem horizontal (o ticker de `106vw`
continua recortado pelo `overflow: hidden` do `#oferta`); os recuos do rodapé de
`institutional.css` (`padding: 60px var(--gutter) 120px`) continuam valendo.

- [ ] **Step 2: Conferir o redimensionamento ao vivo**

Arraste a janela de 1440 para 900 de largura com o fecho na tela.
Expected: o campo reflui sem emenda — o `ResizeObserver` republica
`--fecho-parada` e `--oferta-h`. Se a emenda aparecer ao redimensionar, o
observador não está observando o `#oferta`.

- [ ] **Step 3: Conferir a queda sem JS**

No DevTools, desabilite o JavaScript e recarregue.
Expected: o fecho continua um campo contínuo, usando os fallbacks `125deg`/`76%`.
O CTA pode ficar levemente mais escuro — é a degradação aceita e documentada.

- [ ] **Step 4: Conferir movimento reduzido**

DevTools → Rendering → `prefers-reduced-motion: reduce`, recarregue.
Expected: nada muda no fecho. Ele não tem animação; a única coisa que o
`Reveal` controla é a entrada do conteúdo, que já respeitava a preferência.

- [ ] **Step 5: Conferir que a poeira de fundo não mudou de leitura**

O `PoeiraFundo` mapeia `.page .hero, .page section, .page .site-footer` e decide
por seção se o grão emite (fundo escuro) ou vira silhueta (fundo claro), lendo a
luminância da COR DO TEXTO. O envelope é um `<div>` no meio do caminho, e os
seletores não são de filho direto — então devem continuar casando.

Run: `npm run dev`, role do FAQ até o fim observando o campo de poeira.
Expected: os grãos continuam claros sobre o fecho, como hoje. Se aparecer um
retângulo branco atrás do CTA ou do rodapé, o mapeamento passou a classificar a
seção como clara e a correção é em `PoeiraFundo.tsx`, não aqui.

- [ ] **Step 6: Rodar o portão completo**

Run: `npm run check`
Expected: typecheck limpo; 23 testes passando; build gerando 7 rotas; a
auditoria reprovando **apenas** nos 7 marcadores legais conhecidos
(`[RAZÃO SOCIAL]`, `[CNPJ]`, `[E-MAIL DE CONTATO]` em `privacidade.html` e os
quatro em `termos.html`). Qualquer problema além desses é regressão — em
especial "link quebrado", que apontaria erro na marcação nova.

- [ ] **Step 7: Commit final, se algo foi ajustado**

```bash
git add -A
git commit -m "fix(fecho): ajustes das bordas responsivas do campo continuo"
```

Se nada precisou de ajuste, não faça commit vazio — apenas registre no relatório
que as quatro verificações passaram.
