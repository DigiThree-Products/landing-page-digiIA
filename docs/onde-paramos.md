# Onde paramos — 28/08/2026

Documento de retomada. Escrito para ser lido de outro computador, sem o
histórico da conversa em que este trabalho foi feito.

O estado é: **tudo empurrado, nada em produção ainda, e duas decisões
esperando o teu olho.** Nenhum PR aberto, de propósito — ver "Por que não
há PR aberto".

---

## 1. Como retomar em outro computador

```bash
git clone https://github.com/DigiThree-Products/landing-page-digiIA.git
cd landing-page-digiIA
git checkout dev/continuacao
npm install
npm run dev
```

O trabalho desta rodada está **todo** em `dev/continuacao`. Não há nada
solto em worktree, stash ou máquina local: o branch remoto e o local batem
exatamente (verificado com `git rev-list --left-right --count`, resultado
`0 0`).

O script é `next dev` puro, sem porta fixada, então num clone limpo ele
sobe em **3000**. O `3005` que aparece no histórico desta rodada foi
passado à mão nesta máquina, não vem do repositório — ver 3000 não é sinal
de que clonaste errado. De qualquer modo, o `next dev` imprime o endereço
ao subir.

---

## 2. Estado do repositório

**Já está em produção** (`main`, via PR #60 mergeado, commit `29a8dfd`):
rolagem suave com Lenis no site inteiro, e a chegada da Estação 02 (o
satélite) a 2,40 tela.

**Está em `dev/continuacao` e NÃO está em `main`** — oito commits,
divididos em dois assuntos.

*A revelação de conteúdo:*

| commit | o que faz |
|---|---|
| `5957260` | Como funciona chega inteira, sem revelação de conteúdo |
| `6d4f69d` | DNA, credibilidade e FAQ chegam inteiras, sem cascata |
| `ae327d6` | as quatro deixam de ser estações (sem pin, sem viagem) |
| `2682b37` | o conteúdo de Como funciona desce e para de encostar no cabeçalho |

*O retrato que olha para o cursor:*

| commit | o que faz |
|---|---|
| `3bf605a` | o eixo vertical para de ler como cartão inclinando |
| `fa94d89` | o desenho sai do evento de mouse e passa a ser amortecido |
| `0efebad` | a troca do espelho dissolve em vez de cortar seco |
| `0318c50` | separa o que é fato sobre a atriz do que é fato sobre a tomada |

**A ponta empurrada (`0318c50`) está verde nas três verificações**, o que
importa porque vais puxar isto num clone limpo: typecheck sem erro, 38 de
38 testes passando, e `next build` completo — sete páginas estáticas
(`/`, `/_not-found`, `/privacidade`, `/robots.txt`, `/sitemap.xml`,
`/termos`), sem avisos.

---

## 3. O que espera decisão tua

São **dois números**, os dois em `components/ui/RetratoQueOlha.tsx`, e os
dois só se julgam olhando o movimento numa janela de verdade.

### `SEGUE_S = 0.1` — o amortecimento

Quanto o desenho demora para alcançar o cursor.

- Menor (0,05): fica nervoso, quase colado no mouse.
- Maior (0,20): a cabeça fica atrasada em relação à mão.

**Cuidado ao mexer:** isto é um *tau*, não um fator por quadro. A conta é
`k = 1 - e^(-dt/SEGUE_S)`, e é por isso que o movimento tem a mesma
velocidade num monitor de 60Hz e num de 144Hz. Trocar por algo como
`atual += (alvo - atual) * 0.1` parece equivalente e **não é** — passa a
depender da taxa de quadros da máquina de quem olha.

### `DISSOLVE_S = 0.12` — a dissolução do espelho

Quando o cursor cruza o centro, a imagem espelha. Isso era um corte seco e
saltava; agora a imagem anterior apaga por cima da nova em 120ms.

- Se ainda parecer que pula: sobe.
- Se a virada parecer preguiçosa: desce.

*Por que isto foi mexido:* o corte do espelho era o maior salto visual do
percurso inteiro — **30,1 de distância visual contra 6,4 de passo normal**,
quase cinco vezes, bem no centro, que é onde o cursor mais passa. Não era
recorte nem alinhamento do atlas (o alinhamento foi varrido de -24 a +24px
e o mínimo cai exatamente em zero): é a assimetria real do rosto — o
cabelo cai de um lado, os brilhos ficam de um lado — e isso inverte de uma
vez só.

*Como funciona:* uma terceira camada congela a imagem que já estava na
tela no instante da virada e apaga por cima da nova. Daí `N_CAMADAS = 3`:
dois degraus vizinhos da pose, mais o véu da troca.

---

## 4. Por que não há PR aberto

A regra da casa é preview aprovado antes do PR, e os dois números acima
não têm veredito. Quando aprovares, o PR sai de `dev/continuacao` para
`main`, como os anteriores.

---

## 5. Armadilha de medição — ler antes de tentar verificar por automação

**Os dois vereditos acima não são mensuráveis por aba automatizada.** Numa
aba controlada por Playwright ou pela extensão, o `requestAnimationFrame`
é estrangulado para cerca de 1Hz. A rampa de 120ms da dissolução cabe
inteira dentro de um único intervalo entre quadros: não existe amostra
possível entre o acender e o apagar.

Uma varredura assim devolve "não pula" **por ausência de amostra**, não
por aprovação. Isso é falso negativo, não aval.

O mesmo vale, por outro motivo, para julgar o salto do espelho pelo
*índice da pose*: o espelho troca a imagem de lado praticamente sem mexer
no índice, então essa métrica é cega justamente ao defeito que se quer
medir. Foi assim que o problema passou despercebido até ser visto a olho.

---

## 6. Regras que não podem ser esquecidas

- **Hero, CTA e rodapé são intocáveis.** Nenhuma alteração, nem por ganho
  de conversão.
- **O método do produto não vai para a landing.** Campos do DNA, palavras
  proibidas e prompts são segredo comercial. A página mostra o efeito,
  nunca a causa.
- **Puxar antes de qualquer alteração.** Há outro desenvolvedor nos mesmos
  repositórios.
- **Nunca empurrar para `main`,** nem forçar push, nem fazer merge pela
  linha de comando.

---

## 7. Pendências conhecidas, deliberadamente não tocadas

Nada aqui está quebrado. São coisas vistas e adiadas de propósito.

1. **Ganho não uniforme do retrato.** O movimento acelera perto do centro:
   varia 1,81x ao longo do percurso (0,94 na borda contra 1,70 perto do
   centro, por passo de 17px do cursor), por causa do `Math.pow(mag, 0.85)`
   em `camadas()`. É conserto de uma linha, mas altera o eixo horizontal,
   que já foi dado como bom. **Só encostar se aparecer queixa de aceleração
   no meio do caminho.**

2. **`LiquidPortrait` está morto.** O componente
   (`components/ui/LiquidPortrait.tsx`) foi substituído pelo
   `RetratoQueOlha` em 27/08 e não é importado em lugar nenhum — só
   sobrevive citado num comentário. O CSS dele continua em
   `styles/institutional.css`, por volta das linhas 1186-1221. Limpeza
   segura, não urgente.

3. **A escada de zoom encolhe demais Como funciona.** O fator aplicado é
   0,76 onde 0,84 bastaria. O comentário de calibração ao lado cita um
   conteúdo de ~930px quando ele mede 673 — a conta foi feita sobre um
   número que envelheceu.

4. **`scroll-margin-top` computando 0.** O comentário em
   `components/layout/AncoraSuave.tsx` (linha 89) afirma que as seções
   âncora valem 78px. Vale reconferir agora que quatro seções deixaram de
   ser estações.

5. **Desalinhamento de blocos** de 8px/16px, visto mas não investigado.

---

## 8. Mapa do que foi mexido

- `styles/estacao.css` — de onde saíram as cascatas. Cada remoção deixou
  no lugar um comentário dizendo o que havia ali e com que valores, para
  que dê para desfazer sem arqueologia.
- `components/sections/` — `ComoFunciona`, `DnaEstrategico`, `Credibility`
  e `Faq` perderam a classe `estacao`. **Devolver a classe devolve a
  estação inteira** (pin, viagem e tudo): é o único mecanismo, e o
  `.estacao-palco` continua na marcação de propósito.
- `app/page.tsx` — o comentário que explica quais seções são estações e
  por quê. **A classe em si não está aqui**: vive em cada componente de
  seção. Hoje são **duas**, `ApproachSection` (o vídeo, linha 24) e
  `WhatItDoes` (o satélite, linha 64).
- `styles/institutional.css` — o respiro de Como funciona: 55px em cima e
  55 embaixo, em vez dos 17px que encostavam no cabeçalho.
- `components/ui/RetratoQueOlha.tsx` — o retrato. As constantes de ajuste
  estão no topo, cada uma com o seu cabeçalho explicando a faixa útil.

---

## 9. Detalhe operacional

Se duas sessões construírem no mesmo worktree ao mesmo tempo, a segunda
apanha `Another next build process is already running`. É um cadeado do
Next, não falha do código: esperar, não matar o processo.
