# Seção de Autoridade "+15 anos" — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a seção Credibility de "um número + uma frase" em uma seção de autoridade em camadas: kicker, título em duas linhas, manifesto com soco final destacado, o 15+ monumental como estrela e três provas de apoio (380+ campanhas, 120+ clientes, 9 segmentos).

**Architecture:** Só copy, marcação e CSS — nenhuma lógica nova. A seção continua sendo uma `estacao` (presa por scroll, cascata dirigida por `--chegada`); o que muda é o conteúdo dentro do palco e as janelas da cascata em `styles/estacao.css`. Nenhum arquivo em `lib/` ou `components/layout/` é tocado.

**Tech Stack:** Next.js 16 static export, CSS puro (tokens existentes), coreografia via custom property `--chegada` já publicada por Estacoes.tsx.

## Global Constraints

- **Os números vão ao ar como fatos.** 380+, 120+ e 9 foram fornecidos pelo dono do produto; o "9" fica SEM "+" de propósito (número exato lê como medido, não como marketing). Nenhum número novo pode ser inventado durante a implementação.
- **Nenhum CTA na seção.** A página constrói o argumento até a oferta; um botão aqui competiria com o destino.
- **Encaixe vertical é restrição dura:** a seção é presa a `100svh`. O conteúdo completo (`.cred`) tem de medir ≤ 100svh em 1440×900 E em 390×844. Os dials de ajuste, em ordem de preferência: (1) padding vertical da seção, (2) tamanho do `.stat b`, (3) gaps internos. Nunca resolver com `min-height` menor — foi exatamente o bug corrigido em 7a2fd70.
- **A cascata termina em ≤ 0,75 da chegada.** Hoje o último bloco termina em 0,66 e a seção tem a maior folga de leitura das cinco (nota em Estacoes.tsx). Com mais blocos ela pode ceder um pouco — até 0,75 — mas não além, para continuar acima da Demo (0,78).
- **`prefers-reduced-motion`:** todo seletor novo da cascata entra também no bloco reduce de `styles/estacao.css` (opacity 1, transform none).
- **Sem `Reveal`:** estação não usa Reveal (dois relógios brigando — nota em Credibility.tsx). A revelação é só a cascata.

## File Structure

| Arquivo | Mudança |
|---|---|
| `content/landing.ts` | Bloco `credibility` reescrito: kicker, título 2 linhas, manifesto, punch, array de 4 stats |
| `components/sections/Credibility.tsx` | Marcação nova: header + manifesto + corpo (estrela + provas), `aria-labelledby` |
| `styles/institutional.css` | Layout da seção nova (desktop + breakpoints 1023/620) |
| `styles/estacao.css` | Janelas da cascata: 3 seletores antigos → 7 novos, nos 3 lugares (degraus, amplitude, reduce) |

---

### Task 1: Copy em `content/landing.ts`

**Files:**
- Modify: `content/landing.ts` (bloco `credibility`, ~linha 208)

**Interfaces:**
- Produces: `LANDING.credibility = { kicker, title, titleLineTwo, description, punch, stats: [{value, label}, ...] }` — consumido só por `Credibility.tsx` (verificado por grep: nenhum outro consumidor).

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
     */
    stats: [
      { value: '15+', label: 'anos de agência' },
      { value: '380+', label: 'campanhas no ar' },
      { value: '120+', label: 'clientes atendidos' },
      { value: '9', label: 'segmentos' },
    ],
  },
```

- [ ] **Step 2: `npm run typecheck`** — Expected: limpo (o consumidor ainda usa os campos antigos; quebra aqui aparece na Task 2, então rodar typecheck só ao fim da Task 2 se preferir — mas rodar agora documenta o estado).

---

### Task 2: Marcação em `Credibility.tsx`

**Files:**
- Modify: `components/sections/Credibility.tsx` (arquivo inteiro)

**Interfaces:**
- Consumes: `LANDING.credibility` da Task 1.
- Produces: classes `.cred-head`, `.cred-manifesto`, `.cred-corpo`, `.cred-provas` para as Tasks 3 e 4. A estrela é `stats[0]`; as provas são `stats[1..3]`.

- [ ] **Step 1: Reescrever o componente**

```tsx
import { LANDING } from '@/content/landing'

/**
 * "Quem está por trás" (a antiga "+15 anos").
 *
 * Estação: sem `Reveal` próprio. Quem revela é a chegada — ver a nota em
 * ApproachSection.tsx sobre os dois relógios.
 *
 * Autoridade em camadas: âncora temporal (título + desde 2010), volume
 * (380+ campanhas), alcance (120+ clientes) e amplitude (9 segmentos),
 * fechando com a ponte para o produto ("A IA é nova. O método não." — o
 * punch é a ÚNICA frase destacada do manifesto, de propósito).
 *
 * A estrela é stats[0] (o 15+ monumental); as demais são prova de apoio.
 * Cada bloco recebe janela própria em styles/estacao.css.
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
              <span className="cred-titulo-linha cred-titulo-linha--eco">{credibility.titleLineTwo}</span>
            </h2>
          </header>
          <div className="cred-corpo">
            <div className="stat">
              <b>{estrela.value}</b>
              <i>{estrela.label}</i>
            </div>
            <div className="cred-lado">
              <p className="cred-manifesto">
                {credibility.description} <strong>{credibility.punch}</strong>
              </p>
              <ul className="cred-provas">
                {provas.map((prova) => (
                  <li key={prova.label}>
                    <b>{prova.value}</b>
                    <i>{prova.label}</i>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: `npm run typecheck`** — Expected: limpo.
- [ ] **Step 3: Commit** — `feat(cred): marcacao da secao de autoridade em camadas` (copy + componente juntos; a página renderiza sem estilo novo, feio mas íntegro).

---

### Task 3: Layout em `styles/institutional.css`

**Files:**
- Modify: `styles/institutional.css` — bloco da credibilidade (~linhas 588-620) e os dois breakpoints (1023px ~888, 620px ~944)

**Interfaces:**
- Consumes: classes da Task 2.
- Produces: layout final; a Task 4 só anima o que existe aqui.

- [ ] **Step 1: Substituir o bloco `.page .credibility-section .cred` e os `.stat`**

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
  margin-top: 16px;
  font-family: var(--font-display);
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -0.045em;
}
.page .cred-titulo-linha {
  display: block;
}
.page .cred-titulo-linha--eco {
  color: var(--lilac);
}

/* Estrela à esquerda, manifesto + provas à direita. */
.page .cred-corpo {
  display: grid;
  grid-template-columns: minmax(240px, 0.8fr) minmax(320px, 1.2fr);
  align-items: center;
  gap: clamp(40px, 7vw, 120px);
}

.page .credibility-section .stat b {
  color: var(--lilac);
  /* Menor que os 250px antigos: o palco agora divide o 100svh com o
     cabeçalho e o manifesto — ver a restrição de encaixe no plano. */
  font-size: clamp(96px, 13vw, 190px);
  font-weight: 700;
  line-height: 0.78;
}

.page .credibility-section .stat i {
  margin-top: 24px;
  color: var(--paper-56);
}

.page .cred-manifesto {
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

.page .cred-provas {
  list-style: none;
  margin: clamp(22px, 3.5vh, 34px) 0 0;
  padding: 0;
  display: grid;
  gap: clamp(14px, 2.2vh, 22px);
}
.page .cred-provas li {
  display: grid;
  grid-template-columns: minmax(84px, auto) 1fr;
  align-items: baseline;
  gap: 18px;
  border-top: 1px solid var(--rule);
  padding-top: clamp(12px, 1.8vh, 18px);
}
.page .cred-provas b {
  font-family: var(--font-display);
  font-size: clamp(30px, 3vw, 46px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--lilac);
}
.page .cred-provas i {
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--paper-56);
}
```

- [ ] **Step 2: Breakpoint 1023px** — substituir a regra existente `.page .credibility-section .cred { grid-template-columns: 1fr; ... }` (que hoje mira o grid antigo) por:

```css
  .page .cred-corpo {
    grid-template-columns: 1fr;
    gap: 36px;
  }
```

- [ ] **Step 3: Breakpoint 620px** — substituir as regras existentes de `.stat b` e `.cred p` por:

```css
  .page .credibility-section .stat b {
    font-size: clamp(84px, 26vw, 130px);
  }
  .page .cred-head h2 {
    font-size: clamp(30px, 8.5vw, 40px);
  }
  .page .cred-manifesto {
    font-size: 15px;
  }
  .page .cred-provas b {
    font-size: clamp(26px, 8vw, 34px);
  }
```

- [ ] **Step 4: Varredura de seletores órfãos** — `grep -rn "\.cred p\|credibility-section .cred p" styles/` e atualizar o que ainda mirar `.cred p` (existe um em `sections.css:199` e possivelmente nos breakpoints de `institutional.css`) para `.cred-manifesto`, ou confirmar que a regra órfã não atinge nada.

- [ ] **Step 5: Encaixe vertical (restrição dura)** — com o dev server rodando, medir via Playwright em 1440×900 e 390×844:
  `document.querySelector('.credibility-section .cred').getBoundingClientRect().height` + 2× o padding vertical da seção ≤ `window.innerHeight`. Se estourar, ajustar na ordem: padding da seção (`clamp(90px, 13vh, 150px)` → pode descer até `clamp(56px, 8vh, 110px)`), depois `.stat b`, depois gaps.

- [ ] **Step 6: Commit** — `feat(cred): layout da autoridade em camadas`.

---

### Task 4: Cascata em `styles/estacao.css`

**Files:**
- Modify: `styles/estacao.css` — lista de amplitude (~linha 156), degraus da seção (~linha 285) e bloco reduce (~linha 316)

**Interfaces:**
- Consumes: classes das Tasks 2-3.
- Produces: os 7 degraus da chegada. O último termina em 0,75 (restrição global).

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
.page .credibility-section .cred-provas li,
```

- [ ] **Step 2: Substituir o bloco de degraus** ("+15 anos — 3 degraus") por:

```css
/* --- Quem está por trás — 7 degraus. A ordem é a da leitura: quem somos
       (kicker/título), o argumento (manifesto), a estrela (15+) e as três
       provas em sequência. O último degrau termina em 0,75 — a seção segue
       com a maior folga de leitura das cinco (ver a nota em Estacoes.tsx),
       agora com 0,34 tela de folga própria + 0,40 da travada. --- */
.page .credibility-section .cred-head .tag { --de: 0; --dur: 0.12; }
.page .credibility-section .cred-head h2 { --de: 0.10; --dur: 0.16; }
.page .credibility-section .cred-manifesto { --de: 0.24; --dur: 0.16; }
.page .credibility-section .stat b { --de: 0.38; --dur: 0.20; }
.page .credibility-section .stat i { --de: 0.50; --dur: 0.10; }
.page .credibility-section .cred-provas li:nth-child(1) { --de: 0.52; --dur: 0.12; }
.page .credibility-section .cred-provas li:nth-child(2) { --de: 0.575; --dur: 0.12; }
.page .credibility-section .cred-provas li:nth-child(3) { --de: 0.63; --dur: 0.12; }
```

- [ ] **Step 3: No bloco `prefers-reduced-motion`**, fazer a mesma troca de seletores do Step 1 (mesmas 6 linhas novas).

- [ ] **Step 4: Verificação visual da cascata** — rolar a chegada da seção no preview e conferir: blocos entram na ordem de leitura, nenhum "pisca" (sobreposição de janelas vizinhas ~0,04 é intencional), e na travada tudo está montado e parado.

- [ ] **Step 5: Commit** — `feat(cred): cascata em 7 degraus para a autoridade`.

---

### Task 5: Verificação final

- [ ] **Step 1:** `npm run check` — typecheck limpo, 38/38 testes, build 7 rotas, `verificar` reprovando só nos 7 marcadores legais pré-existentes.
- [ ] **Step 2:** Varredura de sobreposição (mesmo script das rodadas anteriores, ~120 posições, desktop + 390px): 0 conflitos.
- [ ] **Step 3:** Encaixe vertical re-medido nos dois viewports (o gate da Task 3 Step 5, repetido após a cascata).
- [ ] **Step 4:** `prefers-reduced-motion`: seção inteira visível e montada sem pin, sem bloco invisível (o `@property --chegada` tem initial-value 1, e o bloco reduce força opacity 1 — conferir os DOIS caminhos).
- [ ] **Step 5:** Screenshots das 4 fases (chegada, meio, travada, partida) para conferência do usuário no preview da porta 3200.
- [ ] **Step 6:** Commit final se sobrou ajuste, push da branch.
