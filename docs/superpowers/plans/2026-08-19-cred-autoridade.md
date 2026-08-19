# Seção de Autoridade "Quem está por trás" — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a seção Credibility de "um número + uma frase" em uma seção de autoridade em camadas: kicker, título em duas linhas, manifesto com soco final destacado, o 15+ monumental ao lado, e as três provas (380+ campanhas, 120+ clientes, 9 segmentos) em trilho na base.

**Architecture:** Só copy, marcação e CSS — nenhuma lógica nova. A seção continua sendo uma `estacao` (presa por scroll, cascata dirigida por `--chegada`); o que muda é o conteúdo dentro do palco e as janelas da cascata em `styles/estacao.css`. Nenhum arquivo em `lib/` ou `components/layout/` é tocado.

**Tech Stack:** Next.js 16 static export, CSS puro (tokens existentes), coreografia via custom property `--chegada` já publicada por Estacoes.tsx.

**Mockup aprovado:** https://claude.ai/code/artifact/6ee6601c-9063-4507-a97d-b0dfd40d940a

## Global Constraints

- **Os números vão ao ar como fatos.** 380+, 120+ e 9 foram fornecidos pelo dono do produto; o "9" fica SEM "+" de propósito (número exato lê como medido, não como marketing). Nenhum número novo pode ser inventado durante a implementação.
- **Nenhum CTA na seção.** A página constrói o argumento até a oferta; um botão aqui competiria com o destino.
- **Encaixe vertical:** a seção é presa a `100svh`. O conteúdo completo (`.cred`) tem de medir ≤ 100svh em 1440×900 E em 390×844. Previsão do trilho: 523px de conteúdo contra 666px disponíveis no desktop (+143px), e 601px contra 692px no mobile (+91px). Se estourar mesmo assim, os dials em ordem: (1) padding vertical da seção, (2) `.stat b`, (3) vãos. **Nunca resolver com `min-height` menor** — foi exatamente o bug corrigido em 7a2fd70.
- **A cascata termina em 0,75 da chegada.** Hoje termina em 0,66; com mais blocos pode ir até 0,75, não além, para continuar acima da Demo (0,78).
- **`prefers-reduced-motion`:** todo seletor novo da cascata entra também no bloco reduce de `styles/estacao.css` (opacity 1, transform none).
- **Sem `Reveal`:** estação não usa Reveal (dois relógios brigando — nota em Credibility.tsx). A revelação é só a cascata.

## File Structure

| Arquivo | Mudança |
|---|---|
| `content/landing.ts` | Bloco `credibility` reescrito: kicker, título 2 linhas, manifesto, punch, array de 4 stats |
| `components/sections/Credibility.tsx` | Marcação nova: cabeçalho + corpo (estrela ‖ manifesto) + trilho de 3 provas |
| `styles/institutional.css` | Layout da seção nova (desktop + breakpoints 1023/620) |
| `styles/estacao.css` | Janelas da cascata: 3 seletores antigos → 6 novos, nos 3 lugares (amplitude, degraus, reduce) |

---

### Task 1: Copy em `content/landing.ts`

**Files:**
- Modify: `content/landing.ts` (bloco `credibility`, ~linha 208)

**Interfaces:**
- Produces: `LANDING.credibility = { kicker, title, titleLineTwo, description, punch, stats: [{value, label}, ...] }` — consumido só por `Credibility.tsx` (verificado por grep).

- [ ] **Step 1: Substituir o bloco `credibility`**

```ts
  credibility: {
    kicker: 'Quem está por trás',
    title: '15 anos de campanhas reais.',
    titleLineTwo: 'Agora na palma da sua mão.',
    description: `A ${SITE.organizacaoMae} atende comércio e serviço desde 2010. O planejamento mensal, o tom de voz, o cálculo de ROI, a criação do conteúdo pensada e planejada para te fazer vender mais — tudo que a ${SITE.nome} faz saiu de um processo que já rodou em conta de cliente.`,
    punch: 'A IA é nova. O método não.',
    /**
     * Números fornecidos pelo dono do produto (ago/2026) e publicados como
     * fatos. O "9" é exato de propósito — sem "+": número redondo demais lê
     * como marketing, número exato lê como medido. Atualizar aqui quando os
     * dados mudarem; nenhum componente conhece esses valores.
     *
     * O primeiro é a ESTRELA (fica monumental, ao lado do manifesto); os
     * três seguintes formam o trilho na base. A ordem importa: volume,
     * alcance, amplitude.
     */
    stats: [
      { value: '15+', label: 'anos de agência' },
      { value: '380+', label: 'campanhas no ar' },
      { value: '120+', label: 'clientes atendidos' },
      { value: '9', label: 'segmentos' },
    ],
  },
```

- [ ] **Step 2: `npm run typecheck`** — Expected: erro no consumidor (`Credibility.tsx` ainda usa `value`/`label` antigos). Esperado; resolve na Task 2.

---

### Task 2: Marcação em `Credibility.tsx`

**Files:**
- Modify: `components/sections/Credibility.tsx` (arquivo inteiro)

**Interfaces:**
- Consumes: `LANDING.credibility` da Task 1.
- Produces: classes `.cred-head`, `.cred-corpo`, `.cred-manifesto`, `.cred-trilho` para as Tasks 3 e 4.

- [ ] **Step 1: Reescrever o componente**

```tsx
import { LANDING } from '@/content/landing'

/**
 * "Quem está por trás" (a antiga "+15 anos").
 *
 * Estação: sem `Reveal` próprio. Quem revela é a chegada — ver a nota em
 * ApproachSection.tsx sobre os dois relógios.
 *
 * Autoridade em camadas: âncora temporal (título + "desde 2010"), volume
 * (380+ campanhas), alcance (120+ clientes) e amplitude (9 segmentos),
 * fechando com a ponte para o produto — "A IA é nova. O método não." é a
 * ÚNICA frase em branco cheio do manifesto, de propósito: é ela que liga a
 * autoridade da agência ao que está à venda.
 *
 * `stats[0]` é a estrela (monumental, ao lado do manifesto); as outras três
 * formam o trilho na base. Cada bloco recebe janela própria de chegada em
 * styles/estacao.css.
 */
export function Credibility() {
  const { credibility } = LANDING
  const [estrela, ...provas] = credibility.stats
  return (
    <section className="credibility-section estacao" aria-labelledby="cred-titulo">
      <div className="estacao-palco">
        <div className="cred">
          <header className="cred-head">
            <p className="tag">{credibility.kicker}</p>
            <h2 id="cred-titulo">
              <span className="cred-titulo-linha">{credibility.title}</span>
              <span className="cred-titulo-linha cred-titulo-linha--eco">
                {credibility.titleLineTwo}
              </span>
            </h2>
          </header>

          <div className="cred-corpo">
            <p className="stat">
              <b>{estrela.value}</b>
              <i>{estrela.label}</i>
            </p>
            <p className="cred-manifesto">
              {credibility.description} <strong>{credibility.punch}</strong>
            </p>
          </div>

          <ul className="cred-trilho">
            {provas.map((prova) => (
              <li key={prova.label}>
                <b>{prova.value}</b>
                <i>{prova.label}</i>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: `npm run typecheck`** — Expected: limpo.
- [ ] **Step 3: Commit** — `feat(cred): copy e marcacao da secao de autoridade`.

---

### Task 3: Layout em `styles/institutional.css`

**Files:**
- Modify: `styles/institutional.css` — bloco da credibilidade (~linhas 588-620) e os dois breakpoints (1023px, 620px)

**Interfaces:**
- Consumes: classes da Task 2.

- [ ] **Step 1: Substituir o bloco `.page .credibility-section .cred` e os `.stat`** por:

```css
.page .credibility-section .cred {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: var(--world-max);
  display: grid;
  gap: clamp(30px, 4.5vh, 48px);
  padding: 0;
  border: 0;
}

.page .cred-head h2 {
  margin: 16px 0 0;
  font-family: var(--font-display);
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -0.045em;
}
.page .cred-titulo-linha {
  display: block;
}
/* A segunda linha ecoa o título da hero ("Seu mês, na palma da sua mão") —
   a promessa do começo reaparecendo agora com prova atrás dela. O lilás
   marca esse eco. */
.page .cred-titulo-linha--eco {
  color: var(--lilac);
}

/* Estrela à esquerda, manifesto à direita. */
.page .cred-corpo {
  display: grid;
  grid-template-columns: minmax(240px, 0.8fr) minmax(320px, 1.2fr);
  align-items: center;
  gap: clamp(40px, 7vw, 120px);
}

.page .credibility-section .stat {
  margin: 0;
}
.page .credibility-section .stat b {
  display: block;
  color: var(--lilac);
  /* Era 250px quando a seção tinha só o número e uma frase. Cai para 216
     porque agora divide os 100svh com um cabeçalho, um manifesto e o
     trilho — ver o orçamento vertical no plano. */
  font-size: clamp(96px, 15vw, 216px);
  font-weight: 700;
  line-height: 0.78;
  letter-spacing: -0.04em;
}
.page .credibility-section .stat i {
  display: block;
  margin-top: 24px;
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--paper-56);
}

.page .cred-manifesto {
  margin: 0;
  max-width: 52ch;
  color: var(--paper-56);
  font-size: clamp(16px, 1.5vw, 19px);
  line-height: 1.55;
}
/* O punch é a única frase clara do manifesto — o soco fica onde o olho
   termina de ler. */
.page .cred-manifesto strong {
  display: block;
  margin-top: 10px;
  color: var(--paper);
  font-weight: 600;
}

/* O trilho: as três provas em linha na base, sob um filete.
   Em linha e não empilhadas porque três números lado a lado se leem como
   UM conjunto de provas; empilhados viram lista, e lista se lê item a
   item. `align-items: start` mantém os números na mesma linha mesmo
   quando um rótulo quebra em duas. */
.page .cred-trilho {
  list-style: none;
  margin: 0;
  padding: clamp(20px, 3vh, 30px) 0 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: start;
  gap: clamp(16px, 4vw, 64px);
  border-top: 1px solid var(--rule);
}
.page .cred-trilho li {
  display: grid;
  gap: 10px;
}
.page .cred-trilho b {
  font-family: var(--font-display);
  font-size: clamp(26px, 3vw, 46px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--lilac);
}
.page .cred-trilho i {
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--paper-56);
}
```

- [ ] **Step 2: Breakpoint 1023px** — substituir a regra existente `.page .credibility-section .cred { grid-template-columns: 1fr; gap: 48px; }` por:

```css
  .page .cred-corpo {
    grid-template-columns: 1fr;
    gap: 36px;
  }
```

E remover a regra `.page .credibility-section .cred p { max-width: 18ch; }` (o seletor `.cred p` não existe mais — o manifesto é `.cred-manifesto`).

- [ ] **Step 3: Breakpoint 620px** — substituir as regras existentes de `.stat b` e `.cred p` por:

```css
  .page .credibility-section {
    /* O celular é o viewport apertado: o padding cede antes de qualquer
       tipografia. */
    padding-block: 76px;
  }
  .page .credibility-section .stat b {
    font-size: clamp(84px, 29vw, 130px);
  }
  .page .cred-head h2 {
    font-size: clamp(28px, 8.5vw, 40px);
  }
  .page .cred-manifesto {
    font-size: 15px;
    line-height: 1.5;
  }
  .page .cred-trilho {
    gap: 14px;
  }
  .page .cred-trilho i {
    font-size: 10px;
    letter-spacing: 0.08em;
  }
```

- [ ] **Step 4: Varredura de seletores órfãos** — `grep -rn "cred p\|\.cred \.stat\|credibility-section .cred p" styles/` e atualizar/remover o que ainda mirar a estrutura antiga (há um `.cred p` em `sections.css:199`; o `.cred` base em `sections.css:172` tem `display:flex` + bordas que agora brigam com o grid — sobrescrever ou limpar).

- [ ] **Step 5: Commit** — `feat(cred): layout com trilho de provas na base`.

---

### Task 4: Cascata em `styles/estacao.css`

**Files:**
- Modify: `styles/estacao.css` — lista de amplitude (~linha 156), degraus da seção (~linha 285) e bloco reduce (~linha 316)

- [ ] **Step 1: Na lista compartilhada de amplitude**, trocar as 3 linhas antigas:

```
.page .credibility-section .stat b,
.page .credibility-section .stat i,
.page .credibility-section .cred p,
```

por:

```
.page .credibility-section .cred-head .tag,
.page .credibility-section .cred-head h2,
.page .credibility-section .cred-manifesto,
.page .credibility-section .stat b,
.page .credibility-section .stat i,
.page .credibility-section .cred-trilho li,
```

- [ ] **Step 2: Substituir o bloco de degraus** ("+15 anos — 3 degraus") por:

```css
/* --- Quem está por trás — 8 degraus. A ordem é a da leitura: quem somos
       (kicker/título), o argumento (manifesto), a estrela (15+) e as três
       provas do trilho, da esquerda para a direita, fechando a composição.

       O último degrau termina em 0,75 — era 0,66 com três blocos. A seção
       segue com a maior folga de leitura das cinco (ver a nota em
       Estacoes.tsx): 0,25 da chegada parada + os 0,40 da travada. --- */
.page .credibility-section .cred-head .tag { --de: 0; --dur: 0.12; }
.page .credibility-section .cred-head h2 { --de: 0.10; --dur: 0.16; }
.page .credibility-section .cred-manifesto { --de: 0.24; --dur: 0.16; }
.page .credibility-section .stat b { --de: 0.38; --dur: 0.20; }
.page .credibility-section .stat i { --de: 0.50; --dur: 0.10; }
.page .credibility-section .cred-trilho li:nth-child(1) { --de: 0.52; --dur: 0.12; }
.page .credibility-section .cred-trilho li:nth-child(2) { --de: 0.58; --dur: 0.12; }
.page .credibility-section .cred-trilho li:nth-child(3) { --de: 0.63; --dur: 0.12; }
```

- [ ] **Step 3: No bloco `prefers-reduced-motion`**, fazer a mesma troca de seletores do Step 1.

- [ ] **Step 4: Commit** — `feat(cred): cascata em 8 degraus`.

---

### Task 5: Verificação final

- [ ] **Step 1:** `npm run check` — typecheck limpo, 38/38 testes, build 7 rotas, `verificar` reprovando só nos 7 marcadores legais pré-existentes.
- [ ] **Step 2:** **Encaixe vertical medido** em 1440×900 e 390×844: altura de `.cred` + padding vertical da seção ≤ `innerHeight`. Previsão: +143px e +91px de folga.
- [ ] **Step 3:** Varredura de sobreposição (~120 posições, desktop + mobile): 0 conflitos.
- [ ] **Step 4:** `prefers-reduced-motion`: seção inteira montada e visível sem pin, nenhum bloco invisível (conferir os DOIS caminhos: `initial-value: 1` do `@property` e o bloco reduce).
- [ ] **Step 5:** Screenshots da chegada, da travada e da partida para conferência no preview.
- [ ] **Step 6:** Commit final e push.
