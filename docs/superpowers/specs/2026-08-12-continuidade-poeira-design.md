# Continuidade entre o núcleo estrelado e a poeira do site

Data: 2026-08-12
Branch: `worktree-feat+hero-branca-nucleo-estrelado`

## Problema

No fim do mergulho da hero, a seção inteira apaga e revela a poeira cósmica do
site atrás do cérebro. Nesse instante **sete variáveis mudam de uma vez** — os
dois campos foram desenhados isoladamente e nunca precisaram se encontrar:

| | núcleo (`HeroEstrelas`) | site (`PoeiraFundo`) |
| --- | --- | --- |
| raio | 1,6 – 2,58 px | 0,67 – 5 px |
| alfa | ~1,0 (satura no `min(1, …)`) | 0,18 – 0,73 |
| halo | 2,8× o raio a 22% | nenhum |
| cor | 55% branco | 1/3 uniforme |
| faixa de z | 0,62 – 1 | 0,05 – 1 |
| voo | parado | `DERIVA_Z` + módulo da velocidade · 0,55 |
| grãos | 150 | 260 |

O resultado é lido como corte, não como travessia.

## Objetivo

A passagem deve ser **sentida** — é um limiar e deve continuar sendo — mas sem
solavanco. Alguma diferença entre os campos pode sobreviver, desde que a
mudança seja gradual.

Não é objetivo tornar a emenda invisível. Não é objetivo alterar o campo do
site: ele mantém profundidade, voo e ida e vinda exatamente como estão.

## Princípio

**O fundo carrega o momento; os grãos carregam a continuidade.**

O cérebro apagando já é o evento, e é dramático por conta própria. Os grãos são
a prova de que é o mesmo espaço. Se eles também saltarem, há dois eventos no
mesmo quadro e a leitura vira corte.

Consequência: o núcleo **não ganha voo**. A decisão do commit `28b1802`
continua valendo. Quando a dissolução termina, a única coisa que mudou é que o
espaço está em movimento — uma mudança só, no momento certo, que é exatamente o
que "passagem sentida" quer dizer.

### Correção de mecanismo

A hero **não tem fundo branco**. A `body` é preta (`--ink`, `base.css`) e a
`.hero` não declara fundo nenhum. O que cobre a tela no fim do mergulho é a
própria textura do cérebro em 80×, e ela apaga junto com a seção.

Como o canvas do núcleo é filho de `.hero`, ele já apaga na mesma taxa que o
cérebro. A convergência de alfa **não precisa compensar o fundo** — o
`opacity` da seção faz isso.

O que a fotometria precisa garantir é que o grão do núcleo tenha virado um
grão do site **quando a dissolução terminar**, não quando ela começa. Se
convergisse antes, o grão estaria fraco enquanto o cérebro ainda cobre a
tela, que é exatamente o fundo claro contra o qual ele precisa se ler. É por
isso que a Agenda 2, abaixo, roda *dentro* da janela e não antes dela.

Um alerta para quem for calibrar: essa estabilidade de contraste vale contra
o **cérebro**, que está na mesma camada de opacidade. Contra o campo do site,
que está em outra, o peso do grão do núcleo é `ganhoAlfa × opacidade da
seção` — decai bem mais rápido que qualquer uma das duas curvas sozinha. O
risco no meio da travessia é o núcleo ceder demais, não o adensamento
previsto mais abaixo em "Riscos conhecidos".

## Arquitetura

Fronteira: **`lib/grao.ts` decide como um grão se parece a uma dada
profundidade. Cada canvas decide onde seus grãos estão e o que o fundo dele faz
com eles.**

```
lib/grao.ts          puro — sem DOM, sem React, sem estado
  paletaEmissao(raiz)          cores com alternativo declarado
  sortearIdentidade()          tom, brilho, fase, cintila
  raioDoGrao(z)                min(5, max(0.5, (1.6/z)·0.42))
  alfaDoGrao(z, brilho)        (0.26 + 0.52·(1-z))·brilho
  cintilacao(seg, fase, ciclo) 1 + sin(seg·ciclo + fase)·0.3
  FAIXA_Z                      [0.05, 1]
  TETO_ALFA                    0.92
        │
        ├── PoeiraFundo   mantém: extinção/silhueta, entrada+saída de
        │                 reciclagem, rastro, camY, voo, pintura das estações
        │
        └── HeroEstrelas  mantém: recorte pelo alfa da textura, abertura,
                          ajuste de alcance
                          adiciona: multiplicadores de convergência
```

Fica **fora** do módulo, de propósito: o regime de extinção do `PoeiraFundo` (é
sobre o fundo daquele campo, não sobre o grão), o `entrada`/`saída` (existe por
causa da reciclagem do voo, que o núcleo não tem) e o recorte (só do núcleo).
Sem essa disciplina o módulo vira depósito.

Este é o terceiro módulo desta família, pelo mesmo motivo dos dois anteriores:
`lib/poeira.ts` existe porque o canvas e o `Reveal` precisam concordar sobre o
eixo; `lib/mergulho.ts` porque a timeline e o canvas precisam concordar sobre o
progresso; `lib/grao.ts` porque os dois campos precisam concordar sobre o que é
um grão.

### Duas correções que a extração carrega

1. **`brilho` passa a ser sorteado em 0,5–1,0** (faixa do site), não em
   0,7–1,0. O sorteio acontece uma vez, no nascimento — faixas divergentes são
   uma diferença que nenhum multiplicador faz convergir depois. A perda de
   brilho em repouso é compensada por `ganhoAlfa`.
2. **O viés de branco deixa de ser sorteio e vira mistura.** Hoje o núcleo
   sorteia 55% dos grãos como brancos; um tom sorteado não converge
   continuamente. Vira `lerp(PALETA[tom], paper, vies)` com `vies` decaindo a
   zero.

`PoeiraFundo` também herda o `corDoToken` com alternativo declarado, que hoje só
existe no `HeroEstrelas`. Hoje todos os tokens são hex de 6 dígitos e o
`parseInt` cego funciona; o alternativo só dispara com token malformado.

## As duas agendas de convergência

### Agenda 1 — geometria, presa a `v`

De `ESCALA_EM` (0,136) a `REVELA_INICIO` (0,875). Trecho longo, ~3 telas de
rolagem: lento demais para ser percebido como mudança.

| | de | para |
| --- | --- | --- |
| `ganhoRaio` | 0,397 | 1,0 |
| `z` (raio/alfa) | 0,62 – 1 | 0,05 – 1 |
| posição | disco atual | alvo uniforme na tela |
| `vies` (branco) | 0,33 | 0 |

`ganhoRaio` **substitui** `crescimento` e `FATOR_MINIMO`. O valor de repouso
0,397 = 2,381 × 1/6 reproduz exatamente o tamanho atual em repouso (2,381 é
`1 / 0,42`, a razão entre as duas fórmulas de raio).

### Agenda 2 — fotometria, presa à dissolução

De `REVELA_INICIO` (0,875) a `REVELA_FIM` (0,95).

| | início | fim |
| --- | --- | --- |
| `ganhoAlfa` | ~4,0 | 1,0 |
| halo | 2,8× a 22% | 0 |

`ganhoAlfa` não é 1,74 (a `presenca` de hoje) porque as duas fórmulas de base
diferem: o núcleo usa `0,65 + 0,5·(1-z)` e o site `0,26 + 0,52·(1-z)`. Aplicado
sobre `alfaDoGrao`, o ganho que reproduz o look atual fica entre ~2,9 e ~4,9
conforme `z`. Um escalar não casa exatamente; **~4,0 é ponto de partida a
calibrar no olho**, não número derivado.

### Convergência de posição

Converger `z` para 0,05 quebraria a projeção: `perspectiva = 0,6 + 0,4/z` vale
**8,6** em z = 0,05, os grãos sairiam da tela e o `ajuste` de alcance — que usa
`Z_PERTO` como pior caso — deixaria de valer.

Solução: **desacoplar**.

- A projeção do disco continua usando o `z` de repouso, fixo em 0,62–1. Assim
  `perspectiva` e `ajuste` seguem válidos e nada estoura.
- O `z` que converge governa **só raio e alfa**, via as funções compartilhadas.
- A posição converge por caminho próprio: cada grão guarda `alvoX`/`alvoY` em
  fração de tela `[0,1]`, e a posição interpola do disco até `alvoX·L, alvoY·A`.
  Guardado em fração para sobreviver a resize.

Em `REVELA_INICIO` o campo tem posições uniformes na tela, `z` uniforme em
0,05–1, raio e alfa vindos do módulo comum — estatisticamente o campo do site,
sem o movimento.

## Mudanças na timeline

`Hero.tsx`:

- `REVELA_POEIRA_INICIO`: 3,6 → **3,5**
- `REVELA_POEIRA_FIM`: 3,7 → **3,8**
- `TOTAL` continua 4,0. A janela sai de 0,1 para 0,3 tela usando folga que já
  existia; nada muda para as seções seguintes.

`lib/mergulho.ts`:

- `REVELA_EM`: 0,9 → **0,875** (= 3,5 / 4,0)
- novo `REVELA_FIM_EM` = **0,95** (= 3,8 / 4,0), que a Agenda 2 consome

`HeroEstrelas.tsx`:

- `ABRE_ATE`: 0,88 → **0,85**, para a abertura do núcleo terminar antes da
  dissolução começar — que era a intenção original do valor.
- `N_GRANDE`: 150 → **260**; `N_TOQUE`: 70 → **110**. Iguala o `PoeiraFundo`.
- `FATOR_MINIMO` e `crescimento`: removidos, subsumidos por `ganhoRaio`.
- `Z_PERTO`/`Z_LONGE` passam a ser a faixa de **repouso** e a base da projeção
  do disco; a faixa que converge é a de `lib/grao.ts`.
- O teto de alfa passa a ser `TETO_ALFA` (0,92, do site). Hoje o núcleo corta em
  1,0 — um teto mais alto que o do campo para o qual ele converge deixaria uma
  diferença residual justamente nos grãos mais brilhantes.

## Riscos conhecidos

**A corcova da dissolução.** Toda dissolução entre dois campos independentes
adensa no meio: em `v ≈ 0,91` vêem-se 260 grãos do núcleo a meia opacidade
somados a 260 do site emergindo. Os extremos casam (260 → 260), o miolo vai a
~520 parciais. Não há como eliminar sem os dois campos serem literalmente os
mesmos grãos, o que a distribuição em repouso impede.

Mitigação: as curvas de opacidade não podem ser lineares — o núcleo precisa
ceder um pouco mais rápido que o cérebro. **Parâmetro a calibrar no olho, não
número resolvido neste spec.**

**O grão típico fica menor.** Hoje o campo termina entre 1,6 e 2,58 px, todos
parecidos. Depois termina entre 0,67 e 5 px: o típico encolhe, mas os maiores
passam do máximo atual e o campo ganha profundidade real. É o eixo que mais
mexe no look aprovado e o que mais precisa de julgamento rodando.

**Repouso levemente mais denso.** 260 grãos em vez de 150 no núcleo em repouso.
Em repouso eles têm ~0,27 px e alfa baixo, então o efeito é sutil; se incomodar,
`N` volta a ser independente do site e a densidade converge junto com o resto.

## Degradação

Sem mudanças de comportamento aqui — o que já vale continua valendo:

- `prefers-reduced-motion: reduce`: nenhum dos dois canvases inicializa.
- Sem JS: a hero é uma imagem, legível e completa. Nada de conteúdo depende
  disto.
- Textura não carregada: enquanto `prontaTextura` é falso o recorte não é
  aplicado e os grãos aparecem fora da silhueta do cérebro. Comportamento atual,
  mantido sem alteração. A janela é curta — é a mesma `cerebro.webp` que a
  `<img>` já carrega, normalmente em cache — mas existe, e este spec não a
  fecha.
- Token de cor malformado: `paletaEmissao` devolve o alternativo declarado em
  vez de `NaN` silencioso. Passa a valer também para o `PoeiraFundo`.

## Verificação

1. `npm run check` (typecheck + build + `verificar.mjs`) passa.
2. **A extração é pura.** Depois de extrair `lib/grao.ts` e antes de aplicar
   qualquer convergência, o `PoeiraFundo` deve produzir as mesmas fórmulas com
   os mesmos números. Conferível por leitura do diff; é o motivo de a extração
   ser um commit separado.
3. Julgamento rodando (`npm run dev`), rolando o mergulho para baixo **e para
   cima** — o `scrub` é bidirecional e a convergência tem que reverter limpa.
   Três coisas a olhar: o repouso continua igual ao aprovado; nada salta em
   `v ≈ 0,875`; a corcova em `v ≈ 0,91` está tolerável.
4. Movimento reduzido ligado: a hero continua legível e sem canvas.

## Escopo

Fica nesta branch, que é onde `HeroEstrelas.tsx` existe — a `main` não o tem. A
branch está 18 commits à frente da `main` e 0 atrás.

Ordem dos commits, deliberada:

1. Extrair `lib/grao.ts` e fazer `PoeiraFundo` consumi-lo, sem mudança de
   comportamento. Revisável e reversível isoladamente.
2. `HeroEstrelas` consome o módulo e ganha os multiplicadores de convergência.
3. Ajustes de timeline (`Hero.tsx`, `lib/mergulho.ts`).

Fora de escopo: mesclar a branch na `main`; remover o caminho `radial` morto do
`PoeiraFundo`; qualquer mudança no campo do site além de consumir o módulo.
