# Continuidade entre o CTA e o rodapé

Data: 2026-08-18
Branch: `worktree-fecho-cta-rodape`

## Problema

O `#oferta` e o `.site-footer` declaram fundos **idênticos** —
`institutional.css:467` e `institutional.css:791`:

```css
background:
  radial-gradient(70% 100% at 8% 0%, rgba(205, 130, 255, 0.34), transparent 58%),
  linear-gradient(125deg, var(--abyss), var(--violet) 76%);
```

Declaração idêntica não produz continuidade. Todo gradiente é pintado a partir
da caixa do **próprio** elemento, então são duas cópias reiniciadas encostadas
uma na outra. Medido no preview a 1440×1420, com os dois blocos colados
(`vão = 0px`):

| | `#oferta` | `.site-footer` |
| --- | --- | --- |
| caixa | 1425 × 1633 | 1425 × 346 |
| degradê linear | `--abyss` no topo → `--violet` na base | **recomeça** em `--abyss` |
| brilho radial | ancorado no seu canto superior esquerdo | **re-floresce** no dele |
| borda superior | nenhuma | `1px solid var(--rule)` |
| arco `::before` | desenhado e recortado pelo `overflow: hidden` | não recebe |

São quatro descontinuidades somadas na mesma linha horizontal. A dominante é a
primeira: `--abyss` é `#01037a`, quase preto, e `--violet` é `#4500f9`. No fim
do CTA a cor chegou perto do violeta; um pixel abaixo ela volta ao quase preto.

## Objetivo

O rodapé deve ser lido como **o mesmo bloco de cor do CTA, mais abaixo** — não
como uma seção nova que por acaso usa a mesma paleta. Nenhuma emenda visível.

O CTA **não muda**. Ele já foi afinado e é o destino do argumento da página;
qualquer alteração nele seria efeito colateral, não objetivo.

## Princípio

**O campo é um só; o rodapé é a parte dele que fica embaixo.**

A consequência prática é que ninguém "copia" o fundo do outro. Existe uma
pintura só, feita uma vez, e as duas seções são janelas para ela.

## A conta que torna isso possível

A dificuldade é que o CTA precisa continuar idêntico enquanto a caixa pintada
cresce. Com *stops* em porcentagem isso é impossível: a porcentagem é relativa
ao comprimento da linha do gradiente, que cresce junto com a caixa, então toda
cor escorrega.

Com *stops* em **pixels absolutos**, não escorrega. Prova:

Para o ângulo `125deg`, a direção é `d = (sin 125°, −cos 125°) = (0,81915,
0,57358)` — para a direita e para baixo. O comprimento da linha é
`L = W·0,81915 + H·0,57358`, e o ponto inicial é `S = centro − (L/2)·d`.

Ao crescer a altura em `ΔH`, o centro anda `(0, ΔH/2)` e `L` cresce
`ΔH·0,57358`. Logo:

```
ΔS = (0, ΔH/2) − (ΔH·0,57358/2)·d
   = ΔH/2 · (−0,46990,  0,67101)

ΔS · d = ΔH/2 · (−0,46990·0,81915 + 0,67101·0,57358)
       = ΔH/2 · (−0,38494 + 0,38487)  ≈  0
```

**O ponto inicial se desloca perpendicularmente à direção do gradiente.** Uma
translação perpendicular não altera projeção nenhuma — então a distância
absoluta de qualquer ponto físico ao início do gradiente é invariante à altura
da caixa.

Conferido em três pontos (W=1425; caixa do CTA H=1633, L=2104,0; caixa
estendida H=1979, L=2302,4):

| ponto | distância na caixa do CTA | na caixa estendida |
| --- | --- | --- |
| (0, 0) | 0,0 px | 0,0 px |
| (0, 1633) | 936,6 px | 936,6 px |
| (1425, 0) | 1167,3 px | 1167,2 px |

Portanto: fixar o violeta em `0,76 × L_cta` pixels reproduz o CTA **pixel a
pixel** e deixa o campo prosseguir sozinho pelo rodapé.

## Arquitetura

### O envelope

Um elemento `.fecho` envolve `<Offer/>` e `<SiteFooter/>` em `app/page.tsx` e
passa a ser o único a pintar. `#oferta` e `.site-footer` ficam transparentes.

```css
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
```

O CSS não faz conta nenhuma. O ângulo e a parada chegam prontos, publicados por
`lib/fecho.ts` através do `Fecho.tsx` — inclusive o próprio `125deg`. Uma versão
anterior deste spec deixava a trigonometria em `calc()` no CSS, encostada no
ângulo, para que não divergissem. Publicar os dois da mesma fonte é mais forte:
em vez de confiar na proximidade, elimina a segunda cópia, e ainda torna a
geometria testável em `lib/fecho.test.ts`. É o mesmo arranjo de `lib/grao.ts`.

Os fallbacks `125deg`/`76%` reproduzem exatamente a declaração antiga, então
sem JS o campo continua contínuo — só deixa de preservar o CTA ao pé da letra.

O raio vertical do brilho radial também deixa de ser `100%`: na caixa estendida
`100%` seria a altura dos dois somados e o halo cresceria. Amarrado a
`--oferta-h`, ele fica do tamanho de hoje.

### A medida

`components/sections/Fecho.tsx`, client, mede o `#oferta` com `ResizeObserver` e
publica três variáveis no próprio envelope: `--oferta-h` (para o halo e o arco),
`--fecho-parada` (a parada do violeta em pixels, de `paradaDoVioleta()`) e
`--fecho-angulo` (de `ANGULO`).

A geometria em si mora em `lib/fecho.ts`, puro — sem DOM, sem React, sem estado
—, que é o que permite travá-la em `lib/fecho.test.ts`. O teste central fixa a
invariância provada acima: se a distância deixar de ser independente da caixa, o
CTA parou de renderizar igual e o desenho perdeu a base.

Medir é necessário, não preguiça: `conversion.css:140` dá ao `#oferta`
`min-height: 115svh` **e** recuos em `clamp()`, e a altura real observada
(1633px a 1420 de viewport) não é nenhum dos dois — é o conteúdo. Não existe
expressão CSS que a reproduza.

Os fallbacks `100vw`/`100svh` cobrem o primeiro paint e o caso sem JS: erram a
altura, mas entregam um campo contínuo e plausível em vez de nada.

### O arco

O `#oferta::before` migra para `.fecho::before`, com as medidas amarradas a
`--oferta-h` para reproduzir o anel atual:

```css
.fecho::before {
  content: '';
  position: absolute;
  z-index: 0;
  left: -18%;
  top: calc(var(--oferta-h, 100svh) * -0.18);
  width: 136%;
  height: calc(var(--oferta-h, 100svh) * 1.36);
  border: clamp(60px, 8vw, 120px) solid rgba(248, 240, 255, 0.04);
  border-radius: 50%;
  transform: translate(38%, 30%);
}
```

Quem recorta passa a ser o envelope, então a curva atravessa a junta em vez de
morrer nela.

### A linha

`border-top` do `.site-footer` (`sections.css:321`) vai a zero. O `border-top`
do `.foot-bot` **fica** — é outro elemento, separa o copyright dentro do rodapé
e não tem relação com a junta.

## O que não muda

- **O `overflow: hidden` do `#oferta` fica.** Ele existe para recortar a faixa
  do ticker, que é `width: 106vw; left: -3vw` (`conversion.css:152`), mais larga
  que a tela de propósito. Tirá-lo deixaria a faixa vazar e criar barra
  horizontal.
- **O `border-top` interno do `.foot-bot`**, pelo motivo acima.
- **Os recuos responsivos do rodapé** (`institutional.css:974`): mexem em
  `padding`, não em fundo.
- **`PoeiraFundo`**: o seletor `.page .hero, .page section, .page .site-footer`
  continua casando com um `<div>` intermediário no caminho. As duas seções
  seguem escuras (texto claro), então nada passa a ser pintado de branco.

## Riscos conhecidos

**Empilhamento.** Com o arco no envelope, o conteúdo do rodapé precisa ficar
acima dele. O `.site-footer` já resolve `position: relative`; falta garantir um
`z-index`. Decisão: o `::before` fica em `z-index: 0` e tanto `#oferta` quanto
`.site-footer` recebem `z-index: 1`. Em ordem de DOM o `::before` já viria antes,
mas depender disso é frágil — um reordenamento futuro inverteria a pilha em
silêncio.

**Primeiro quadro.** Entre o paint inicial e o `ResizeObserver`, o campo usa os
fallbacks. Como o fecho está a ~24 telas de rolagem do topo, ninguém o vê nesse
estado — mas a queda precisa ser suave, não um flash.

**Ângulo acoplado — resolvido.** A trigonometria vale só para `125deg`, então
uma segunda cópia do ângulo em outro arquivo seria um jeito silencioso de
quebrar o CTA. Por isso não existe segunda cópia: `ANGULO` mora em
`lib/fecho.ts`, e até o `125deg` do CSS chega de lá, via `--fecho-angulo`. Mudar
o ângulo num lugar só passa a estar correto por construção.

## Verificação

1. Medir no navegador a cor logo acima e logo abaixo da junta: a diferença tem
   de ser a de um degradê contínuo, não um salto.
2. Comparar o CTA antes e depois — tem de estar idêntico.
3. Conferir em 1440 e em 390 de largura, e com a página redimensionada ao vivo
   (o `ResizeObserver` precisa reagir).
4. `npm run check` — typecheck, testes, build e auditoria do HTML gerado.
