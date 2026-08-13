# Continuidade entre o núcleo estrelado e a poeira do site — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o núcleo estrelado da hero convergir para o campo de poeira do site antes da dissolução, para que a travessia seja sentida como limiar em vez de corte.

**Architecture:** Um módulo puro `lib/grao.ts` passa a ser a fonte única do que é um grão (paleta, raio, alfa, cintilação). `PoeiraFundo` consome sem mudar de comportamento. `HeroEstrelas` consome e expressa seu look próprio como multiplicadores que decaem a 1, em duas agendas: geometria presa ao scroll e fotometria presa à dissolução.

**Tech Stack:** TypeScript, React 19, Next.js 16 (export estático), canvas 2D, GSAP/ScrollTrigger. Testes com `node --test` nativo do Node 24 (type stripping), sem dependência nova.

**Spec:** `docs/superpowers/specs/2026-08-12-continuidade-poeira-design.md`

## Global Constraints

- Branch de trabalho: `worktree-feat+hero-branca-nucleo-estrelado`. NÃO mesclar na `main`.
- **Nunca reescrever histórico.** Proibido `git commit --amend`, `git reset`, `git rebase`, `git push --force` ou qualquer coisa que altere commits existentes. Só adicionar commits novos — inclusive ao corrigir achados de revisão. A branch é compartilhada entre quem implementa e quem coordena, e um `amend` seguido de `reset` já destruiu um commit de outra pessoa aqui. Se algo precisa ser desfeito, `git revert` cria um commit novo e é o caminho certo.
- Nenhuma dependência nova em `package.json`. O projeto é deliberadamente sem dependências de teste (ver o cabeçalho de `verificar.mjs`).
- **O portão de verificação é `npm run typecheck && npm run test && npm run build`**, e ele precisa passar antes de qualquer commit que toque em código.

  **Não use `npm run check`.** Ele encadeia `npm run verificar`, que reprova nesta branch por marcadores legais não preenchidos (`[RAZÃO SOCIAL]`, `[CNPJ]`, `[E-MAIL DE CONTATO]`, `[CIDADE/UF]` em `privacidade.html` e `termos.html`). Isso é deliberado — o `verificar` é um portão de publicação, e o README diz que ele "reprova de propósito" enquanto os dados legais forem marcadores. É condição pré-existente, fora do escopo deste plano, e não é falha sua.
- `tsconfig.json` precisa de `"allowImportingTsExtensions": true`. Os arquivos de teste importam com extensão explícita (`./grao.ts`) porque o runner do Node exige isso; sem a flag, `tsc` rejeita. É compatível com o `noEmit: true` que o projeto já tem.
- Comentários e nomes em português, seguindo o estilo do arquivo em que se mexe: explicar **por quê**, não o quê.
- O campo do site (`PoeiraFundo`) mantém profundidade, voo, rastro e ida e vinda inalterados. A única mudança permitida ali é passar a consumir `lib/grao.ts`.
- O ramo `radial` do `PoeiraFundo` (linhas 320-332) usa constantes próprias (`1.7 / p.z`, `0.28 + 0.55 * (1 - p.z)`, `forca * 0.12`) diferentes do ramo `vertical`. Ele está morto (`MODO_POEIRA = 'vertical'`). **NÃO tocar nele** — trocar suas constantes pelas compartilhadas seria mudança de comportamento disfarçada de refatoração.
- `prefers-reduced-motion: reduce` continua impedindo os dois canvases de inicializar.

## File Structure

| Arquivo | Responsabilidade |
| --- | --- |
| `lib/grao.ts` (criar) | Puro. Como um grão se parece a uma dada profundidade + as curvas de convergência. Sem DOM, sem React, sem estado. |
| `lib/grao.test.ts` (criar) | Fixa as fórmulas com valores numéricos exatos. É o que prova que a extração foi pura. |
| `package.json` (modificar) | Script `test`, encadeado em `check`. |
| `lib/mergulho.ts` (modificar) | `REVELA_EM` novo, `REVELA_FIM_EM` novo. |
| `components/sections/Hero.tsx` (modificar) | Janela de revelação 3,5→3,8. |
| `components/layout/PoeiraFundo.tsx` (modificar) | Consome `lib/grao.ts` no ramo vertical. Nada mais. |
| `components/sections/HeroEstrelas.tsx` (modificar) | Consome `lib/grao.ts` + multiplicadores de convergência. |

---

### Task 1: Módulo `lib/grao.ts` com as fórmulas do site, e o harness que as fixa

**Files:**
- Create: `lib/grao.ts`
- Create: `lib/grao.test.ts`
- Modify: `package.json:6-12`

**Interfaces:**
- Consumes: nada.
- Produces: `type RGB = [number, number, number]`; `type Identidade = { tom: number; brilho: number; fase: number; cintila: number }`; `FAIXA_Z: [number, number]`; `TETO_ALFA: number`; `limita(v: number): number`; `suave(t: number): number`; `corDoToken(bruto: string, alternativo: RGB): RGB`; `paletaEmissao(ler: (nome: string) => string): RGB[]`; `sortearIdentidade(): Identidade`; `raioDoGrao(z: number): number`; `alfaDoGrao(z: number, brilho: number): number`; `cintilacao(segundos: number, fase: number, ciclo: number): number`.

Os números vêm do ramo **vertical** do `PoeiraFundo` (o vivo): raio de `PoeiraFundo.tsx:362`, alfa de `:367-368`, identidade de `sortearGrao` em `:214-219`, teto e amplitude de cintilação de `regime` em `:269-271`.

`corDoToken` recebe a string bruta, não um `CSSStyleDeclaration`, para ser exercitável fora do navegador.

- [ ] **Step 1: Escrever o teste que falha**

Criar `lib/grao.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  alfaDoGrao,
  cintilacao,
  corDoToken,
  FAIXA_Z,
  limita,
  paletaEmissao,
  raioDoGrao,
  sortearIdentidade,
  suave,
  TETO_ALFA,
} from './grao.ts'

const perto = (a: number, b: number) => assert.equal(Number(a.toFixed(6)), Number(b.toFixed(6)))

test('raioDoGrao reproduz a fórmula do ramo vertical', () => {
  perto(raioDoGrao(1), 0.672)
  perto(raioDoGrao(0.5), 1.344)
  perto(raioDoGrao(0.05), 5) // teto
  perto(raioDoGrao(2), 0.5) // piso, fora da faixa viva
})

test('alfaDoGrao reproduz a base do ramo vertical', () => {
  perto(alfaDoGrao(1, 1), 0.26)
  perto(alfaDoGrao(1, 0.5), 0.13)
  perto(alfaDoGrao(0.05, 1), 0.754)
})

test('cintilacao oscila 30% em torno de 1', () => {
  perto(cintilacao(0, 0, 1), 1)
  perto(cintilacao(Math.PI / 2, 0, 1), 1.3)
  perto(cintilacao(0, Math.PI / 2, 1), 1.3)
})

test('corDoToken lê hex e cai no alternativo quando não é hex', () => {
  assert.deepEqual(corDoToken('#cd82ff', [0, 0, 0]), [205, 130, 255])
  assert.deepEqual(corDoToken('  #8e47fb  ', [0, 0, 0]), [142, 71, 251])
  assert.deepEqual(corDoToken('oklch(0.7 0.2 300)', [1, 2, 3]), [1, 2, 3])
  assert.deepEqual(corDoToken('', [1, 2, 3]), [1, 2, 3])
})

test('paletaEmissao usa lilac, mid e paper nessa ordem', () => {
  const falso: Record<string, string> = {
    '--lilac': '#cd82ff',
    '--mid': '#8e47fb',
    '--paper': '#f8f0ff',
  }
  assert.deepEqual(paletaEmissao((n) => falso[n] ?? ''), [
    [205, 130, 255],
    [142, 71, 251],
    [248, 240, 255],
  ])
})

test('sortearIdentidade respeita as faixas do campo do site', () => {
  for (let i = 0; i < 500; i++) {
    const g = sortearIdentidade()
    assert.ok(Number.isInteger(g.tom) && g.tom >= 0 && g.tom <= 2)
    assert.ok(g.brilho >= 0.5 && g.brilho < 1)
    assert.ok(g.fase >= 0 && g.fase < Math.PI * 2)
    assert.ok(g.cintila >= 0.6 && g.cintila < 2.1)
  }
})

test('limita e suave', () => {
  perto(limita(-1), 0)
  perto(limita(2), 1)
  perto(limita(0.5), 0.5)
  perto(suave(0), 0)
  perto(suave(0.5), 0.5)
  perto(suave(1), 1)
})

test('constantes do campo', () => {
  assert.deepEqual(FAIXA_Z, [0.05, 1])
  perto(TETO_ALFA, 0.92)
})
```

- [ ] **Step 2: Rodar o teste para ver falhar**

Adicionar a `package.json` nos `scripts`, entre `typecheck` e `verificar`:

```json
    "test": "node --test lib/",
```

E encadear em `check`:

```json
    "check": "npm run typecheck && npm run test && npm run build && npm run verificar"
```

Run: `npm test`
Expected: FAIL — `Cannot find module './grao.ts'`.

- [ ] **Step 3: Implementar `lib/grao.ts`**

```ts
/**
 * Fonte única do que é um grão.
 *
 * O campo de fundo (PoeiraFundo) e o núcleo estrelado da hero
 * (HeroEstrelas) precisam concordar sobre tamanho, cor e brilho de um
 * grão a uma dada profundidade — senão a travessia entre os dois, no fim
 * do mergulho, lê como corte. Guardar as fórmulas em dois arquivos
 * deixaria fácil um mudar sem o outro perceber.
 *
 * É o terceiro módulo desta família, pelo mesmo motivo dos anteriores:
 * `lib/poeira.ts` para o eixo da revelação, `lib/mergulho.ts` para o
 * progresso do mergulho.
 *
 * Os números vêm do ramo VERTICAL do PoeiraFundo, que é o vivo
 * (`MODO_POEIRA`). O ramo radial tem constantes próprias e está morto;
 * não é fonte de nada.
 *
 * Puro de propósito: sem DOM, sem React, sem estado. É o que permite
 * fixar as fórmulas em `grao.test.ts` — e esse teste é o que prova que a
 * extração não mudou o campo que já está no ar.
 */

export type RGB = [number, number, number]

/** O que um grão é, independente de onde ele está. */
export type Identidade = {
  /** Índice na paleta de emissão. */
  tom: number
  brilho: number
  /** Fase da cintilação, para as estrelas não piscarem em coro. */
  fase: number
  cintila: number
}

/** Faixa de profundidade do campo. */
export const FAIXA_Z: [number, number] = [0.05, 1]

/** Teto de alfa. Vale para os dois campos: um teto mais alto em um deles
    deixaria diferença residual justamente nos grãos mais visíveis. */
export const TETO_ALFA = 0.92

export const limita = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const suave = (t: number) => t * t * (3 - 2 * t)

/**
 * Leitura de token com piso.
 *
 * O `parseInt` cego em hexadecimal é o jeito curto, mas devolve NaN sem
 * reclamar se o token virar `oklch()` ou `rgb()` — e cor NaN no canvas é
 * ignorada em silêncio, deixando o grão com a última cor do contexto. Um
 * alternativo declarado transforma isso em degradação visível.
 *
 * Recebe a string bruta, não um `CSSStyleDeclaration`, para ser
 * exercitável fora do navegador.
 */
export function corDoToken(bruto: string, alternativo: RGB): RGB {
  const hex = /^#?([0-9a-f]{6})$/i.exec(bruto.trim())
  if (!hex) return alternativo
  const n = parseInt(hex[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Emissão: o grão brilhando contra o vazio. */
export function paletaEmissao(ler: (nome: string) => string): RGB[] {
  return [
    corDoToken(ler('--lilac'), [205, 130, 255]),
    corDoToken(ler('--mid'), [142, 71, 251]),
    corDoToken(ler('--paper'), [248, 240, 255]),
  ]
}

export function sortearIdentidade(): Identidade {
  return {
    tom: (Math.random() * 3) | 0,
    brilho: 0.5 + Math.random() * 0.5,
    fase: Math.random() * Math.PI * 2,
    cintila: 0.6 + Math.random() * 1.5,
  }
}

/** Teto e piso são rede de segurança: dentro de FAIXA_Z a fórmula nua
    rende 0,67–13,4 e só o teto chega a valer. */
export function raioDoGrao(z: number): number {
  return Math.min(5, Math.max(0.5, (1.6 / z) * 0.42))
}

/** Base do alfa — sem os fatores que são de cada campo (força do scroll,
    entrada/saída de reciclagem, silhueta). */
export function alfaDoGrao(z: number, brilho: number): number {
  return (0.26 + 0.52 * (1 - z)) * brilho
}

export function cintilacao(segundos: number, fase: number, ciclo: number): number {
  return 1 + Math.sin(segundos * ciclo + fase) * 0.3
}
```

- [ ] **Step 4: Rodar o teste para ver passar**

Run: `npm test`
Expected: PASS, 8 testes.

- [ ] **Step 5: Rodar a verificação completa**

Run: `npm run typecheck && npm run test && npm run build`
Expected: os tres passam.

- [ ] **Step 6: Commit**

```bash
git add lib/grao.ts lib/grao.test.ts package.json
git commit -m "feat(poeira): lib/grao.ts como fonte unica do que e um grao

Modulo puro com as formulas do ramo vertical do PoeiraFundo, que e o
vivo. Ainda nao tem consumidor: o proximo commit faz o PoeiraFundo
consumi-lo, e o teste aqui e o que prova que essa troca nao muda nada.

Harness com node --test nativo do Node 24, sem dependencia nova."
```

---

### Task 2: `PoeiraFundo` consome o módulo — extração pura

**Files:**
- Modify: `components/layout/PoeiraFundo.tsx:80-95` (leitura de token e paletas)
- Modify: `components/layout/PoeiraFundo.tsx:214-219` (`sortearGrao`)
- Modify: `components/layout/PoeiraFundo.tsx:261-273` (`regime`)
- Modify: `components/layout/PoeiraFundo.tsx:362-368` (raio e base do ramo vertical)

**Interfaces:**
- Consumes: de Task 1 — `alfaDoGrao`, `cintilacao`, `corDoToken`, `paletaEmissao`, `raioDoGrao`, `sortearIdentidade`, `TETO_ALFA`, `RGB`.
- Produces: nada novo. `PoeiraFundo` continua sem exportar nada além do componente.

**Zero mudança de comportamento.** É o objetivo desta task, e o motivo de ela ser um commit isolado: dá para revisar e reverter sozinha.

- [ ] **Step 1: Trocar a leitura de tokens e as paletas**

Substituir `PoeiraFundo.tsx:80-95` (o bloco `hexParaRgb` / `raiz` / `token` / `EMISSAO` / `EXTINCAO`) por:

```ts
    const raiz = getComputedStyle(document.documentElement)
    const ler = (nome: string) => raiz.getPropertyValue(nome)

    /* Emissão: o grão brilha contra o vazio. Extinção: o mesmo grão em
       silhueta contra a luz. Os índices se correspondem — cada partícula
       guarda um `tom` e caminha entre a sua cor de um lado e a do outro.
       A emissão vem de lib/grao.ts porque o núcleo da hero converge para
       ela; a extinção é só daqui, é sobre o fundo deste campo. */
    const EMISSAO = paletaEmissao(ler)
    const EXTINCAO: RGB[] = [
      corDoToken(ler('--violet'), [69, 0, 249]),
      corDoToken(ler('--abyss'), [1, 3, 122]),
      corDoToken(ler('--abyss'), [1, 3, 122]),
    ]
```

E o import, junto dos que já existem no topo:

```ts
import {
  alfaDoGrao,
  cintilacao,
  corDoToken,
  paletaEmissao,
  raioDoGrao,
  sortearIdentidade,
  TETO_ALFA,
  type RGB,
} from '@/lib/grao'
```

- [ ] **Step 2: Trocar `sortearGrao`**

Substituir `PoeiraFundo.tsx:214-219` por:

```ts
    function sortearGrao(p: Particula) {
      Object.assign(p, sortearIdentidade())
    }
```

- [ ] **Step 3: Trocar a cintilação e o teto em `regime`**

Em `PoeiraFundo.tsx:269-271`, trocar as duas linhas:

```ts
      // Estrela só cintila enquanto brilha: na silhueta o pulso se apaga.
      const pulso = 1 + (cintilacao(tempo, p.fase, p.cintila) - 1) * (1 - claro)
      // Grão escuro sobre claro precisa de mais corpo para se ler.
      const a = Math.min(TETO_ALFA, base * pulso * (1 + claro * 0.5))
```

A amortização por `(1 - claro)` fica aqui, não no módulo: é sobre o fundo deste campo.

- [ ] **Step 4: Trocar raio e base do ramo vertical**

Em `PoeiraFundo.tsx:362`, trocar a linha do raio:

```ts
          const r = raioDoGrao(p.z)
```

Em `PoeiraFundo.tsx:367-368`, trocar a base:

```ts
          const base =
            alfaDoGrao(p.z, p.brilho) * (1 + forca * 0.1) * entrada * saida
```

**Não tocar no ramo radial** (linhas 320-332). Ele tem constantes próprias e está morto.

- [ ] **Step 5: Conferir que a extração foi pura**

Run: `git diff components/layout/PoeiraFundo.tsx`

Ler o diff inteiro e confirmar, linha a linha, que nenhum número mudou:
- raio: `1.6`, `0.42`, teto `5`, piso `0.5` — agora dentro de `raioDoGrao`
- alfa: `0.26`, `0.52` — agora dentro de `alfaDoGrao`
- cintilação: amplitude `0.3` — agora dentro de `cintilacao`
- teto: `0.92` — agora `TETO_ALFA`
- identidade: `0.5 + rand*0.5`, `0.6 + rand*1.5`, `rand*2π`, `tom` inteiro em 0..2
- ramo radial intocado

`sortearIdentidade` usa `Math.random() * 3` onde o original usava `Math.random() * EMISSAO.length`. `EMISSAO` tem 3 cores; é o mesmo número.

- [ ] **Step 6: Rodar a verificação e olhar rodando**

Run: `npm run typecheck && npm run test && npm run build`
Expected: tudo passa.

Run: `npm run dev` e olhar a página. O campo de fundo tem que estar **idêntico** — mesma densidade, mesmo tamanho de grão, mesma silhueta sobre as estações claras.

- [ ] **Step 7: Commit**

```bash
git add components/layout/PoeiraFundo.tsx
git commit -m "refactor(poeira): PoeiraFundo consome lib/grao.ts

Extracao pura: nenhum numero mudou. O ramo radial fica intocado porque
tem constantes proprias e esta morto — troca-las seria mudanca de
comportamento disfarcada de refatoracao.

Ganha de brinde o alternativo declarado na leitura de token, que antes
so o HeroEstrelas tinha: token malformado agora degrada visivelmente em
vez de virar NaN silencioso."
```

---

### Task 3: Janela de revelação 3,5→3,8

**Files:**
- Modify: `lib/mergulho.ts:39-49`
- Modify: `components/sections/Hero.tsx:65-66`
- Modify: `components/sections/HeroEstrelas.tsx:26-31` (`ABRE_ATE`)

**Interfaces:**
- Consumes: nada de tasks anteriores.
- Produces: `REVELA_EM = 0.875`; `REVELA_FIM_EM = 0.95`. Tasks 5, 6 e 7 leem os dois.

Vem antes da convergência de propósito: as agendas se calibram contra estes números, e mudá-los depois obrigaria a recalibrar tudo.

- [ ] **Step 1: Atualizar `lib/mergulho.ts`**

Substituir o bloco de `REVELA_EM` (`lib/mergulho.ts:39-49`) por:

```ts
/**
 * Fração do mergulho em que a seção começa a apagar, revelando a poeira
 * cósmica de verdade atrás do cérebro (mesmo ponto — ver a nota sobre
 * `REVELA_POEIRA_INICIO`/`TOTAL` em Hero.tsx: `3,5 / 4,0`).
 * Exportada daqui pelo mesmo motivo que `ESCALA_EM`: `HeroEstrelas.tsx`
 * precisa saber quando a geometria dele termina de convergir — o campo
 * tem que já parecer o do site ANTES de a dissolução começar, não
 * durante.
 */
export const REVELA_EM = 0.875

/**
 * Fração em que a seção terminou de apagar (`3,8 / 4,0`).
 *
 * A janela era 0,1 tela (3,6→3,7) e foi para 0,3 (3,5→3,8), usando folga
 * que já existia no fim do pin — `TOTAL` não mudou. É dentro desta
 * janela que a fotometria do núcleo converge: alfa e halo não podem
 * convergir antes, porque enquanto o cérebro cobre a tela o fundo do
 * grão ainda é claro, e grão fraco sobre fundo claro é grão nenhum.
 */
export const REVELA_FIM_EM = 0.95
```

- [ ] **Step 2: Atualizar a timeline em `Hero.tsx`**

Em `components/sections/Hero.tsx:65-66`:

```ts
          const REVELA_POEIRA_INICIO = 3.5
          const REVELA_POEIRA_FIM = 3.8
```

O comentário logo acima já descreve o mecanismo; atualizar as duas telas citadas nele de "3,6 e 3,7" para "3,5 e 3,8".

- [ ] **Step 3: Recalibrar `ABRE_ATE`**

Em `components/sections/HeroEstrelas.tsx:26-31`, trocar o valor e o comentário:

```ts
/* Em que ponto do mergulho a abertura termina de abrir. A seção começa a
   apagar em 3,5/4,0 = 0,875 do trajeto (`REVELA_EM`) — o núcleo termina
   de abrir um pouco antes disso, para não estar visivelmente ainda se
   espalhando no instante em que tudo começa a escurecer. */
const ABRE_ATE = 0.85
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck && npm run test && npm run build`
Expected: passa.

Run: `npm run dev`. Rolar o mergulho até o fim e voltar. A dissolução agora ocupa um trecho de rolagem visível em vez de um instante. Nada mais mudou ainda — o salto entre os campos continua lá, só que mais lento.

- [ ] **Step 5: Commit**

```bash
git add lib/mergulho.ts components/sections/Hero.tsx components/sections/HeroEstrelas.tsx
git commit -m "feat(hero): janela de revelacao de 0,1 para 0,3 tela

De 3,6-3,7 para 3,5-3,8, usando folga que ja existia no fim do pin; TOTAL
segue 4,0 e nada muda para as secoes seguintes. A janela antiga era curta
demais para a convergencia de alfa caber sem ninguem ver.

ABRE_ATE cai de 0,88 para 0,85 junto: ele existia para a abertura do
nucleo terminar antes da dissolucao, e com REVELA_EM em 0,875 o valor
antigo passou a terminar depois dela."
```

---

### Task 4: Curvas de convergência em `lib/grao.ts`

**Files:**
- Modify: `lib/grao.ts` (acrescentar ao fim)
- Modify: `lib/grao.test.ts` (acrescentar ao fim)

**Interfaces:**
- Consumes: de Task 1 — `limita`, `suave`, `RGB`.
- Produces: `progresso(v: number, de: number, ate: number): number`; `ganhoRaio(t: number): number`; `ganhoAlfa(t: number): number`; `ganhoHalo(t: number): number`; `viesBranco(t: number): number`; `corComVies(cor: RGB, branco: RGB, vies: number): RGB`; `zConvergente(zRepouso: number, zFundo: number, t: number): number`.

- [ ] **Step 1: Escrever os testes que falham**

Acrescentar ao fim de `lib/grao.test.ts`:

```ts
import {
  corComVies,
  ganhoAlfa,
  ganhoHalo,
  ganhoRaio,
  progresso,
  viesBranco,
  zConvergente,
} from './grao.ts'

test('progresso normaliza e limita a janela', () => {
  perto(progresso(0.136, 0.136, 0.875), 0)
  perto(progresso(0.875, 0.136, 0.875), 1)
  perto(progresso(0, 0.136, 0.875), 0)
  perto(progresso(1, 0.136, 0.875), 1)
  perto(progresso(0.5055, 0.136, 0.875), 0.5)
})

test('ganhoRaio sai do repouso e chega em 1', () => {
  perto(ganhoRaio(0), 0.397)
  perto(ganhoRaio(1), 1)
  perto(ganhoRaio(0.5), 0.6985)
})

test('ganhoAlfa decai de 4 para 1', () => {
  perto(ganhoAlfa(0), 4)
  perto(ganhoAlfa(1), 1)
  perto(ganhoAlfa(0.5), 2.5)
})

test('ganhoHalo decai de 1 para 0', () => {
  perto(ganhoHalo(0), 1)
  perto(ganhoHalo(1), 0)
  perto(ganhoHalo(0.5), 0.5)
})

test('viesBranco decai de 0,33 para 0', () => {
  perto(viesBranco(0), 0.33)
  perto(viesBranco(1), 0)
  perto(viesBranco(0.5), 0.165)
})

test('corComVies caminha da cor até o branco', () => {
  assert.deepEqual(corComVies([200, 100, 250], [248, 240, 255], 0), [200, 100, 250])
  assert.deepEqual(corComVies([200, 100, 250], [248, 240, 255], 1), [248, 240, 255])
  assert.deepEqual(corComVies([200, 100, 250], [248, 240, 255], 0.5), [224, 170, 253])
})

test('zConvergente vai do repouso ao alvo', () => {
  perto(zConvergente(0.62, 0.05, 0), 0.62)
  perto(zConvergente(0.62, 0.05, 1), 0.05)
  perto(zConvergente(0.62, 0.05, 0.5), 0.335)
})
```

- [ ] **Step 2: Rodar para ver falhar**

Run: `npm test`
Expected: FAIL — `progresso is not a function` (ou erro de import equivalente).

- [ ] **Step 3: Implementar as curvas**

Acrescentar ao fim de `lib/grao.ts`:

```ts
/* ------------------------------------------------------------------
   Convergência do núcleo da hero para este campo.

   O núcleo estrelado (HeroEstrelas) tem um look próprio em repouso —
   grão maior, mais opaco, com halo, mais branco — e isso está certo:
   o fundo dele é a textura do cérebro, uma imagem clara e cheia de
   pontos de luz desenhados. Só que essa justificativa se dissolve
   conforme o mergulho avança, e em 80× o fundo vira um banho suave.

   Então o look do núcleo não é um conjunto de constantes, é um DESVIO
   deste campo que decai a zero. Quando a dissolução começa, não sobra
   nada para revelar: o corte não tem o que cortar.

   As curvas usam `suave`, não o `t³` que o `crescimento` original usava
   para casar com o `power2.in` do palco. O `t³` concentra a mudança no
   fim, que era o que se queria quando o crescimento do grão ERA o
   efeito; aqui o objetivo é o oposto — a convergência precisa ser lenta
   e espalhada o bastante para não ser percebida como mudança.
   ------------------------------------------------------------------ */

/** Progresso normalizado de `v` dentro da janela `[de, ate]`. */
export function progresso(v: number, de: number, ate: number): number {
  return limita((v - de) / (ate - de))
}

/** Multiplicador do raio sobre `raioDoGrao`. O valor de repouso 0,397 é
    `(1 / 0,42) × (1/6)` — reproduz exatamente o tamanho que o núcleo
    tinha em repouso antes desta mudança, com `FATOR_MINIMO` e a razão
    entre as duas fórmulas de raio já embutidos. */
const RAIO_REPOUSO = 0.397
export function ganhoRaio(t: number): number {
  return RAIO_REPOUSO + (1 - RAIO_REPOUSO) * suave(t)
}

/** Multiplicador do alfa sobre `alfaDoGrao`. Não é a `presenca` antiga
    (1,3–1,75): as duas fórmulas de base diferem, e o ganho que reproduz
    o look atual fica entre ~2,9 e ~4,9 conforme a profundidade. Um
    escalar não casa com nenhum — 4,0 é calibragem no olho. */
const ALFA_REPOUSO = 4
export function ganhoAlfa(t: number): number {
  return 1 + (ALFA_REPOUSO - 1) * (1 - suave(t))
}

/** O halo existe para dar leitura de brilho contra fundo claro. Contra o
    vazio o campo do site não tem halo nenhum, então ele sai inteiro. */
export function ganhoHalo(t: number): number {
  return 1 - suave(t)
}

/** Quanto o grão puxa para o branco. Era sorteio (55% dos grãos
    brancos); virou mistura porque um tom sorteado não converge
    continuamente. */
const VIES_REPOUSO = 0.33
export function viesBranco(t: number): number {
  return VIES_REPOUSO * (1 - suave(t))
}

export function corComVies(cor: RGB, branco: RGB, vies: number): RGB {
  return [
    Math.round(cor[0] + (branco[0] - cor[0]) * vies),
    Math.round(cor[1] + (branco[1] - cor[1]) * vies),
    Math.round(cor[2] + (branco[2] - cor[2]) * vies),
  ]
}

/** A profundidade do grão caminha da faixa de repouso do núcleo até um
    alvo sorteado em `FAIXA_Z`. Governa SÓ raio e alfa — a posição
    converge por outro caminho (ver HeroEstrelas), porque abrir `z` até
    0,05 na projeção do disco faria a perspectiva valer 8,6 e jogaria os
    grãos para fora da tela. */
export function zConvergente(zRepouso: number, zFundo: number, t: number): number {
  return zRepouso + (zFundo - zRepouso) * suave(t)
}
```

- [ ] **Step 4: Rodar para ver passar**

Run: `npm test`
Expected: PASS, 15 testes.

- [ ] **Step 5: Commit**

```bash
git add lib/grao.ts lib/grao.test.ts
git commit -m "feat(poeira): curvas de convergencia do nucleo para o campo

O look do nucleo deixa de ser um conjunto de constantes e passa a ser um
desvio deste campo que decai a zero. Ainda sem consumidor.

Usam suave() e nao o t3 do crescimento original: o t3 concentra a mudanca
no fim, que era o desejado quando o crescimento do grao ERA o efeito.
Aqui o objetivo e o oposto — convergir sem ser percebido."
```

---

### Task 5: `HeroEstrelas` consome o módulo e converge geometria

**Files:**
- Modify: `components/sections/HeroEstrelas.tsx:1-60` (imports, constantes, tipo)
- Modify: `components/sections/HeroEstrelas.tsx:74-80` (remover `corDoToken` local)
- Modify: `components/sections/HeroEstrelas.tsx:142-188` (paleta, N, sorteio)
- Modify: `components/sections/HeroEstrelas.tsx:246-313` (o laço de desenho)

**Interfaces:**
- Consumes: de Task 1 e 4 — `alfaDoGrao`, `cintilacao`, `corComVies`, `ganhoRaio`, `paletaEmissao`, `progresso`, `raioDoGrao`, `sortearIdentidade`, `viesBranco`, `zConvergente`, `FAIXA_Z`, `TETO_ALFA`, `type Identidade`, `type RGB`. De Task 3 — `REVELA_EM`.
- Produces: nada. A posição ainda é a do disco; Task 6 troca isso.

- [ ] **Step 1: Trocar imports e constantes**

No topo, trocar o import de `lib/mergulho` e acrescentar o de `lib/grao`:

```ts
import { ESCALA_EM, mergulho, REVELA_EM } from '@/lib/mergulho'
import {
  alfaDoGrao,
  cintilacao,
  corComVies,
  FAIXA_Z,
  ganhoAlfa,
  ganhoRaio,
  type Identidade,
  limita,
  paletaEmissao,
  progresso,
  raioDoGrao,
  type RGB,
  sortearIdentidade,
  suave,
  TETO_ALFA,
  viesBranco,
  zConvergente,
} from '@/lib/grao'
```

Trocar as contagens (`:9-10`):

```ts
/* Mesma contagem do campo do site (PoeiraFundo): durante a dissolução os
   dois coexistem, e densidades diferentes seriam mais um eixo saltando
   junto com o resto. */
const N_GRANDE = 260
const N_TOQUE = 110
```

Remover `FATOR_MINIMO` (`:33-49` — o bloco de comentário e a constante). Está subsumido por `ganhoRaio`: o valor de repouso 0,397 já embute o 1/6.

Trocar o comentário de `Z_PERTO`/`Z_LONGE` (`:12-21`) para deixar claro que agora é a faixa de **repouso**:

```ts
/**
 * Faixa de profundidade de REPOUSO — a que governa a projeção do disco.
 * Fica fixa: é ela que mantém `perspectiva` e o ajuste de alcance
 * válidos. A profundidade que CONVERGE para a do campo do site é outra
 * (ver `zConvergente` no laço), e governa só raio e alfa.
 */
const Z_PERTO = 0.62
const Z_LONGE = 1
```

- [ ] **Step 2: Trocar o tipo do grão e o sorteio**

Substituir `type Grao` (`:51-60`) por:

```ts
type Grao = Identidade & {
  /** Posição no disco unitário; o raio já sai com distribuição uniforme em área. */
  x: number
  y: number
  /** Profundidade de repouso — só a projeção do disco usa. */
  zRepouso: number
  /** Alvo em FAIXA_Z; `zConvergente` caminha até ele. */
  zFundo: number
}
```

Remover a função `corDoToken` local (`:65-80`, o bloco de comentário e a função) — agora vem de `lib/grao.ts`.

Substituir a paleta (`:142-147`) por:

```ts
    const raiz = getComputedStyle(document.documentElement)
    const PALETA: RGB[] = paletaEmissao((nome) => raiz.getPropertyValue(nome))
    /* O branco para onde o viés puxa é o próprio `--paper` da paleta. */
    const BRANCO = PALETA[2]
```

Substituir `sortear` (`:166-182`) por:

```ts
    function sortear(g: Grao) {
      const ang = Math.random() * Math.PI * 2
      // sqrt para o disco encher por igual; sem ele o centro fica denso demais
      const rho = Math.sqrt(Math.random())
      g.x = Math.cos(ang) * rho
      g.y = Math.sin(ang) * rho
      g.zRepouso = Z_PERTO + Math.random() * (Z_LONGE - Z_PERTO)
      g.zFundo = FAIXA_Z[0] + Math.random() * (FAIXA_Z[1] - FAIXA_Z[0])
      /* Identidade sorteada nas faixas do campo do site, não em faixas
         próprias: `brilho` é sorteado uma vez, no nascimento, e faixas
         divergentes seriam uma diferença que nenhum multiplicador faz
         convergir depois. O brilho menor em repouso é compensado por
         `ganhoAlfa`. O viés para o branco, que antes era sorteio de tom,
         virou mistura contínua — ver `corComVies` no laço. */
      Object.assign(g, sortearIdentidade())
    }
```

Substituir a criação do array (`:184-188`) por:

```ts
    const graos: Grao[] = Array.from({ length: N }, () => {
      const g = { x: 0, y: 0, zRepouso: 1, zFundo: 1, tom: 0, brilho: 1, fase: 0, cintila: 1 }
      sortear(g)
      return g
    })
```

- [ ] **Step 3: Trocar o laço de desenho**

Substituir o bloco de `presenca` até `crescimento` (`:244-253`) por:

```ts
      /* Geometria converge cedo e devagar, ao longo de todo o mergulho:
         de `ESCALA_EM` até o instante em que a dissolução começa. São ~3
         telas de rolagem — lento demais para ser percebido como mudança,
         e terminado antes de a seção começar a apagar. */
      const tGeo = progresso(v, ESCALA_EM, REVELA_EM)
      const ganho = ganhoRaio(tGeo)
      const vies = viesBranco(tGeo)
      /* Presença ainda constante nesta task — o valor de repouso da curva,
         não um número solto. A fotometria entra na Task 7 e troca isto
         por `ganhoAlfa(tFoto)`. */
      const presenca = ganhoAlfa(0)
```

Substituir o corpo do laço `for (const g of graos)` (`:259-313`) por:

```ts
      for (const g of graos) {
        /* A projeção do disco usa a profundidade de REPOUSO, fixa. É o
           que mantém `perspectiva` e `ajuste` válidos: com a
           profundidade convergente (que desce até 0,05) a perspectiva
           valeria 8,6 e jogaria o grão para fora da tela. */
        const perspectiva = 0.6 + 0.4 / g.zRepouso
        const espalha = R * abertura * perspectiva * ajuste
        const sx = cx + g.x * espalha
        const sy = cy + g.y * espalha
        if (sx < -8 || sx > L + 8 || sy < -8 || sy > A + 8) continue

        /* A profundidade que converge governa só raio e alfa. É ela que
           faz o campo GANHAR variação: em repouso todo grão é médio; no
           fim há muitos finos e alguns grandes, que é o desenho do campo
           do site. */
        const z = zConvergente(g.zRepouso, g.zFundo, tGeo)

        let alfa = alfaDoGrao(z, g.brilho) * presenca
        alfa *= cintilacao(t / 1000, g.fase, g.cintila)

        /* Enquanto o núcleo é menor que a silhueta, é ele quem define a
           borda — e ela precisa ser macia, senão o campo lê como um disco
           recortado em vez de um brilho. Depois de abrir, quem corta é a
           máscara do cérebro e este fade sai de cena. */
        if (bordaViva) {
          const rho = Math.hypot(g.x, g.y)
          alfa *= 1 - suave(limita((rho - 0.72) / 0.28))
        }
        if (alfa <= 0.004) continue

        const raio = raioDoGrao(z) * ganho
        const [r, gg, b] = corComVies(PALETA[g.tom], BRANCO, vies)
        const alfaCore = Math.min(TETO_ALFA, alfa)

        /* Halo largo e fraco por trás do núcleo opaco. Com
           `mix-blend-mode: normal` (ver hero.css) o grão sozinho lia como
           um adesivo colado — um círculo de borda dura, sem relação com a
           luz que o cérebro já emite ao redor. */
        ctx!.beginPath()
        ctx!.arc(sx, sy, raio * 2.8, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${gg},${b},${(alfaCore * 0.22).toFixed(3)})`
        ctx!.fill()

        ctx!.beginPath()
        ctx!.arc(sx, sy, raio, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${gg},${b},${alfaCore})`
        ctx!.fill()
      }
```

Remover as funções locais `limita` e `suave` (`:62-63`) e importá-las de `lib/grao.ts` junto do resto, já que agora existem lá.

- [ ] **Step 4: Verificar**

Run: `npm run typecheck && npm run test && npm run build`
Expected: passa. Se o typecheck reclamar de `Grao` sem `zRepouso`/`zFundo` no literal do Step 2, é porque o objeto inicial não bate com o tipo — conferir que os dois campos estão no literal.

- [ ] **Step 5: Olhar rodando**

Run: `npm run dev`

Três coisas, nesta ordem:
1. **Repouso.** O núcleo em repouso deve estar praticamente igual ao de antes — pequeno, discreto, no miolo do cérebro. Um pouco mais denso (260 em vez de 150). Se estiver visivelmente maior ou menor, `RAIO_REPOUSO` está errado.
2. **Durante a descida.** O campo cresce e **ganha variação** — grãos de tamanhos diferentes, não mais um lençol uniforme.
3. **No fim.** O salto ao apagar continua existindo (a fotometria só entra na Task 7), mas o tamanho e a cor dos grãos já não saltam.

- [ ] **Step 6: Commit**

```bash
git add components/sections/HeroEstrelas.tsx
git commit -m "feat(hero): nucleo consome lib/grao.ts e converge geometria

Raio, faixa de profundidade e vies de branco caminham do look de repouso
ate o do campo do site, entre ESCALA_EM e REVELA_EM — ~3 telas, devagar
demais para ser percebido.

A profundidade que converge governa so raio e alfa; a projecao do disco
segue usando a de repouso, senao a perspectiva valeria 8,6 em z=0,05 e
jogaria os graos para fora da tela.

Contagem sobe para 260, igualando o site: na dissolucao os dois campos
coexistem e densidades diferentes seriam mais um eixo saltando."
```

---

### Task 6: Convergência de posição

**Files:**
- Modify: `components/sections/HeroEstrelas.tsx` (tipo `Grao`, `sortear`, o laço)

**Interfaces:**
- Consumes: de Task 5 — `Grao`, `sortear`, o laço com `tGeo`. De Task 4 — `suave`.
- Produces: nada.

Sem isto o campo termina com posições de disco, não uniformes na tela: a densidade fica concentrada no meio onde o site a tem espalhada.

- [ ] **Step 1: Acrescentar o alvo ao tipo e ao sorteio**

No `type Grao`, acrescentar:

```ts
  /** Alvo da posição, em fração de tela [0,1]. Guardado em fração, não em
      pixels, para sobreviver a resize sem o grão pular. */
  alvoX: number
  alvoY: number
```

Em `sortear`, acrescentar antes do `Object.assign`:

```ts
      g.alvoX = Math.random()
      g.alvoY = Math.random()
```

E no literal de criação do array, acrescentar `alvoX: 0, alvoY: 0`.

- [ ] **Step 2: Interpolar a posição no laço**

Substituir as quatro linhas de projeção no laço (de `const perspectiva` até o `continue` do descarte) por:

```ts
        /* A projeção do disco usa a profundidade de REPOUSO, fixa. É o
           que mantém `perspectiva` e `ajuste` válidos: com a
           profundidade convergente (que desce até 0,05) a perspectiva
           valeria 8,6 e jogaria o grão para fora da tela. */
        const perspectiva = 0.6 + 0.4 / g.zRepouso
        const espalha = R * abertura * perspectiva * ajuste
        const discoX = cx + g.x * espalha
        const discoY = cy + g.y * espalha

        /* A posição converge em espaço de TELA, não no modelo. O campo do
           site distribui os grãos uniformemente na janela (ele sorteia
           `x` proporcional a `z`, o que cancela a divisão da
           perspectiva); o núcleo os distribui num disco. Interpolar as
           duas posições finais é o que casa as duas distribuições sem
           precisar de nenhuma delas virar a outra. */
        const p = suave(tGeo)
        const sx = discoX + (g.alvoX * L - discoX) * p
        const sy = discoY + (g.alvoY * A - discoY) * p
        if (sx < -8 || sx > L + 8 || sy < -8 || sy > A + 8) continue
```

- [ ] **Step 3: Verificar**

Run: `npm run typecheck && npm run test && npm run build`
Expected: passa.

- [ ] **Step 4: Olhar rodando**

Run: `npm run dev`

O repouso continua idêntico (em `tGeo = 0` a interpolação vale 0 e a posição é a do disco, exatamente como antes). Descendo, os grãos se espalham para ocupar a tela toda em vez de ficarem concentrados no miolo. No fim da descida a distribuição deve parecer a do campo do site.

Rolar **para cima** também: o `scrub` é bidirecional e a posição tem que voltar ao disco sem solavanco.

- [ ] **Step 5: Commit**

```bash
git add components/sections/HeroEstrelas.tsx
git commit -m "feat(hero): posicao do nucleo converge para a distribuicao do site

Em espaco de tela, nao no modelo: o campo do site distribui uniformemente
na janela e o nucleo num disco, e interpolar as duas posicoes finais casa
as distribuicoes sem nenhuma precisar virar a outra.

Alvo guardado em fracao de tela para sobreviver a resize sem o grao
pular."
```

---

### Task 7: Fotometria presa à dissolução

**Files:**
- Modify: `components/sections/HeroEstrelas.tsx` (imports, o cálculo de presença, o halo)

**Interfaces:**
- Consumes: de Task 3 — `REVELA_EM`, `REVELA_FIM_EM`. De Task 4 — `ganhoAlfa`, `ganhoHalo`, `progresso`.
- Produces: nada. Última task.

Alfa e halo não podem convergir com a geometria: enquanto o cérebro cobre a tela o fundo do grão é claro, e grão fraco sobre fundo claro é grão nenhum. Eles convergem dentro da janela de dissolução, quando o mundo escurece — o contraste percebido fica constante e a mudança não é vista.

- [ ] **Step 1: Importar o que falta**

Acrescentar `REVELA_FIM_EM` ao import de `@/lib/mergulho` e `ganhoHalo` ao de `@/lib/grao` (`ganhoAlfa` já entrou na Task 5).

- [ ] **Step 2: Trocar a presença constante pelas curvas**

Substituir a linha `const presenca = ganhoAlfa(0)` (posta na Task 5) por:

```ts
      /* Fotometria converge dentro da janela de dissolução, não com a
         geometria. Enquanto o cérebro cobre a tela o fundo do grão é uma
         imagem clara; baixar o alfa ali apagaria o campo. Preso à
         dissolução, o alfa cai na mesma medida em que o mundo escurece e
         o contraste percebido não muda — não se vê o alfa mudando, vê-se
         o mundo apagando com o grão constante em cima. */
      const tFoto = progresso(v, REVELA_EM, REVELA_FIM_EM)
      const presenca = ganhoAlfa(tFoto)
      const halo = ganhoHalo(tFoto)
```

- [ ] **Step 3: Fazer o halo sair**

Substituir o desenho do halo no laço por:

```ts
        /* O halo existe para dar leitura de brilho contra fundo claro —
           o campo do site, contra o vazio, não tem halo nenhum. Some
           junto com a dissolução; abaixo de meio pixel de alfa não há o
           que rasterizar, então nem vale a chamada. */
        const alfaHalo = alfaCore * 0.22 * halo
        if (alfaHalo > 0.004) {
          ctx!.beginPath()
          ctx!.arc(sx, sy, raio * 2.8, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${r},${gg},${b},${alfaHalo.toFixed(3)})`
          ctx!.fill()
        }
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck && npm run test && npm run build`
Expected: passa.

- [ ] **Step 5: Calibrar rodando — este é o passo que decide o resultado**

Run: `npm run dev`

Rolar o mergulho inteiro, devagar, para baixo **e para cima**. Julgar nesta ordem:

1. **Repouso igual ao aprovado.** Se o núcleo em repouso ficou fraco demais, `ALFA_REPOUSO` (`lib/grao.ts`) sobe; se ficou forte demais, desce. Foi calibrado em 4,0 no escuro — este é o número que mais provavelmente precisa de ajuste.
2. **Nada salta em `v ≈ 0,875`**, quando a dissolução começa. Se saltar, a geometria não terminou de convergir: conferir que `tGeo` chega a 1 exatamente em `REVELA_EM`.
3. **A corcova em `v ≈ 0,91`.** No meio da dissolução os dois campos coexistem — 260 grãos do núcleo a meia opacidade somados a 260 do site emergindo. É inerente a qualquer dissolução entre campos independentes e não some; a questão é se está tolerável. Se adensar demais, a mitigação é o núcleo ceder mais rápido que o cérebro: multiplicar `presenca` por `(1 - tFoto)` eleva a queda e tira peso do miolo. Anotar no commit qual valor ficou.
4. **Movimento reduzido.** Ligar `prefers-reduced-motion` no navegador e recarregar: a hero continua legível, sem canvas, sem erro no console.

- [ ] **Step 6: Commit**

```bash
git add components/sections/HeroEstrelas.tsx lib/grao.ts
git commit -m "feat(hero): alfa e halo do nucleo convergem na dissolucao

Presos a janela de revelacao, nao ao scroll: enquanto o cerebro cobre a
tela o fundo do grao e claro, e alfa baixo ali seria grao invisivel.
Convergindo junto com a dissolucao, o contraste percebido fica constante
— nao se ve o alfa mudando, ve-se o mundo apagando com o grao em cima.

Com isso a unica coisa que muda ao atravessar e o campo estar em
movimento. Uma mudanca so, no momento certo, que e o que 'passagem
sentida' queria dizer."
```

---

## Verificação final

Depois da Task 7, antes de considerar pronto:

- [ ] `npm run typecheck && npm run test && npm run build` passa (15 testes). O `npm run verificar` segue reprovando por marcadores legais — pre-existente, fora de escopo.
- [ ] `git log --oneline` mostra 7 commits (um por task), com a extração pura isolada no segundo.
- [ ] O campo de fundo do site, nas seções abaixo da hero, está idêntico ao de antes — inclusive a silhueta escura sobre as estações claras.
- [ ] O mergulho reverte limpo ao rolar para cima, sem grão pulando de tamanho ou de lugar.
- [ ] Com `prefers-reduced-motion: reduce` a hero é uma imagem estática legível.

## Fora de escopo

Mesclar na `main`. Remover o ramo `radial` morto do `PoeiraFundo`. Fechar a janela em que a textura ainda não carregou e os grãos aparecem fora da silhueta. Qualquer mudança no campo do site além de consumir `lib/grao.ts`.
