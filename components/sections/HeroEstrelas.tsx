'use client'

import { useEffect, useRef } from 'react'
import {
  alfaDoGrao,
  cintilacao,
  CONTAGEM_GRAOS,
  corComVies,
  fadeProximo,
  FAIXA_Z,
  ganhoAlfa,
  ganhoHalo,
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
import { ESCALA_EM, mergulho, REVELA_EM, REVELA_FIM_EM } from '@/lib/mergulho'

const TEXTURA = '/assets/hero/cerebro.webp'

/* A contagem vem de lib/grao.ts, não escrita aqui: os dois campos
   coexistem durante a dissolução, e densidades diferentes seriam mais um
   eixo mudando junto com o resto. Dois números iguais em dois arquivos é
   um número que vai divergir. */
const { grande: N_GRANDE, toque: N_TOQUE } = CONTAGEM_GRAOS

/**
 * Faixa de profundidade de REPOUSO — a que governa a projeção do disco.
 *
 * Fica fixa, e é ela que mantém `perspectiva` e o ajuste de alcance
 * válidos: a profundidade que CONVERGE (ver `zConvergente` no laço) desce
 * até 0,05, onde a perspectiva valeria 8,6 e jogaria o grão para fora da
 * tela. Por isso as duas são coisas separadas — esta projeta, aquela só
 * governa raio e alfa.
 *
 * `Z_PERTO` também é o pior caso usado no ajuste de alcance, mais abaixo —
 * uma constante só, não dois números que podem dessincronizar.
 */
const Z_PERTO = 0.62
const Z_LONGE = 1

/** Abertura do núcleo, em frações do raio aparente do cérebro. */
const NUCLEO = 0.38
const SILHUETA = 1.35
/* Em que ponto do mergulho a abertura termina de abrir. A seção inteira
   começa a apagar em 3,5/4,0 = 0,875 do trajeto (`REVELA_EM`, ver
   REVELA_POEIRA_INICIO em Hero.tsx) — o núcleo termina de abrir um pouco
   antes disso, para não estar visivelmente ainda se espalhando no
   instante em que tudo começa a escurecer.
   Era 0,88, calibrado contra a janela antiga que abria em 0,9. Com a
   janela nova esse valor passou a terminar DEPOIS do início da
   dissolução, invertendo a intenção original. */
const ABRE_ATE = 0.85

/**
 * Um grão, aqui, é a identidade compartilhada com o campo do site mais
 * duas profundidades e uma posição no disco.
 *
 * `zRepouso` projeta (a perspectiva do disco depende dela e só dela);
 * `zFundo` é o alvo em `FAIXA_Z` para onde a profundidade caminha, e só
 * governa raio e alfa. Separar as duas é o que permite o campo ganhar a
 * profundidade do site sem os grãos voarem para fora da tela.
 */
type Grao = Identidade & {
  /** Posição no disco unitário; o raio já sai com distribuição uniforme em área. */
  x: number
  y: number
  zRepouso: number
  zFundo: number
  /** Alvo da posição, em fração de tela [0,1]. Guardado em fração e não
      em pixels para sobreviver a resize sem o grão pular de lugar. */
  alvoX: number
  alvoY: number
}

/**
 * O universo dentro do cérebro.
 *
 * Um núcleo estrelado no miolo do cérebro — pequeno e quase invisível em
 * repouso, abre e cresce conforme o mergulho avança (posição via
 * `abertura`, tamanho via `ganhoRaio` junto com `zConvergente`), mas fica
 * PARADO: sem voo, sem deslize, só ali. A sensação de viagem não é dele —
 * é da revelação de verdade, quando a seção inteira apaga (`REVELA_EM`,
 * ver Hero.tsx) e descobre a poeira cósmica real do site atrás do cérebro
 * (mesmo mecanismo de PoeiraFundo.tsx, que já tem o próprio túnel).
 * Fingir um voo próprio aqui dentro, numa silhueta pequena e recortada,
 * competiria com essa revelação em vez de prepará-la — testado (voo em
 * profundidade, rastro e um segundo eixo tipo túnel) e revertido por
 * decisão: o campo pequeno lia como poluído, não como viagem.
 *
 * **Este campo converge para o do site.** O look próprio dele — grão
 * maior, mais opaco, com halo, mais branco — não é um conjunto de
 * constantes: é um desvio do campo de fundo que decai a zero ao longo do
 * mergulho (as curvas moram em `lib/grao.ts`). Quando a dissolução
 * termina, não sobra nada para revelar, e a única coisa que muda ao
 * atravessar é o campo estar em movimento. Antes disso os dois eram
 * desenhados isoladamente e sete variáveis saltavam no mesmo quadro — a
 * travessia lia como corte, não como limiar.
 *
 * Quatro decisões que não são livres:
 *
 * 1. **O canvas não é filho de `.palco`.** O palco escala até 80× no
 *    mergulho, e um canvas escalado por CSS escala os pixels: as estrelas
 *    ficariam 80× maiores e borradas, o oposto do que se quer. Aqui ele
 *    fica em resolução 1:1 e a projeção usa o retângulo aparente do
 *    cérebro, lido a cada quadro. Assim o tamanho do grão é escolhido, não
 *    herdado.
 * 2. **O recorte é feito no canvas, não em `mask-image` do CSS.** Um
 *    `destination-in` com a própria textura do cérebro dá o alfa exato sem
 *    depender de `mask-composite`, e sem escrever estilo a cada quadro.
 * 3. **O brilho cresce com o mergulho.** Não é só gosto: `cerebro.webp`
 *    tem 1600px de largura num box de 720px, então perto do fim da escala
 *    a imagem está ampliada além do nativo e amolece. O campo ganhando
 *    presença move a atenção da superfície para o interior justamente
 *    onde a superfície tem menos a mostrar.
 * 4. **Composição normal, com halo, não mescla aditiva.** `screen` e
 *    `plus-lighter` pareciam a escolha óbvia (o campo deveria somar luz,
 *    não cobrir) — mas medido lado a lado contra a própria arte do
 *    cérebro, que já é uma imagem clara e carregada de pontos de brilho
 *    desenhados, as duas ficavam indistinguíveis do fundo. Aditivo só
 *    vence contra um fundo escuro; aqui o fundo raramente é. Grão opaco
 *    (`normal`) com um halo largo e fraco por trás garante a leitura de
 *    brilho sem depender do que está embaixo.
 *
 * Puro enfeite: sem JS, sem WebGL ou com movimento reduzido, a hero
 * continua branca, legível e completa — o cérebro é uma imagem, não um
 * canvas. Nada de conteúdo depende disto.
 */
export function HeroEstrelas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = cv.getContext('2d')
    if (!ctx) return

    /* Busca a partir da hero, não do pai direto: assim mover o canvas de
       lugar dentro da seção não quebra o acoplamento em silêncio. */
    const cerebro = cv.closest('.hero')?.querySelector<HTMLElement>('[data-camada="cerebro"]')
    if (!cerebro) return

    const raiz = getComputedStyle(document.documentElement)
    const PALETA: RGB[] = paletaEmissao((nome) => raiz.getPropertyValue(nome))
    /* O branco para onde o viés puxa é o próprio `--paper` da paleta. */
    const BRANCO = PALETA[2]

    const toque = window.matchMedia('(pointer: coarse)').matches
    const N = toque ? N_TOQUE : N_GRANDE

    let L = 0
    /** Altura em que os grãos se distribuem — ver `medir()`. */
    let spanY = 0
    let A = 0
    let dpr = 1
    let raf = 0
    let visivel = true
    let naTela = true

    const textura = new Image()
    let prontaTextura = false
    textura.onload = () => {
      prontaTextura = true
    }
    textura.src = TEXTURA

    function sortear(g: Grao) {
      const ang = Math.random() * Math.PI * 2
      // sqrt para o disco encher por igual; sem ele o centro fica denso demais
      const rho = Math.sqrt(Math.random())
      g.x = Math.cos(ang) * rho
      g.y = Math.sin(ang) * rho
      g.zRepouso = Z_PERTO + Math.random() * (Z_LONGE - Z_PERTO)
      g.zFundo = FAIXA_Z[0] + Math.random() * (FAIXA_Z[1] - FAIXA_Z[0])
      g.alvoX = Math.random()
      g.alvoY = Math.random()
      /* Identidade sorteada nas faixas do campo do site, não em faixas
         próprias. `brilho` é sorteado uma vez, no nascimento — faixas
         divergentes seriam uma diferença que nenhum multiplicador faz
         convergir depois. O brilho menor em repouso é compensado por
         `ganhoAlfa`.

         O viés para o branco também deixou de ser sorteio aqui. Ele
         existia porque lilás e violeta são próximos demais da paleta do
         cérebro pra se destacarem — um grão lilás sobre um filamento
         lilás não lê como grão nenhum. Mas um tom sorteado não converge:
         não dá para um grão "ficar menos branco" se o branco dele foi
         decidido no nascimento. Virou mistura contínua, ver `corComVies`
         no laço. */
      Object.assign(g, sortearIdentidade())
    }

    const graos: Grao[] = Array.from({ length: N }, () => {
      const g: Grao = {
        x: 0,
        y: 0,
        zRepouso: 1,
        zFundo: 1,
        alvoX: 0,
        alvoY: 0,
        tom: 0,
        brilho: 1,
        fase: 0,
        cintila: 1,
      }
      sortear(g)
      return g
    })

    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      L = cv!.clientWidth
      A = cv!.clientHeight
      if (!L || !A) return
      /* A altura em que os grãos se distribuem NÃO é a do canvas.
         Até 980px a hero perde o `min-height: 100svh` (hero.css) e passa a
         ter a altura do conteúdo — plausivelmente o dobro da janela. Como
         a posição converge para `alvoY * span`, usar `A` ali espalharia os
         110 grãos por uma caixa da qual só metade está na tela, enquanto o
         campo do site põe os mesmos 110 dentro da janela. A densidade que
         a contagem igual existe para casar se desfaria justamente no
         breakpoint em que ela foi calibrada. */
      spanY = Math.min(A, window.innerHeight)
      cv!.width = Math.round(L * dpr)
      cv!.height = Math.round(A * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function quadro(t: number) {
      raf = requestAnimationFrame(quadro)
      if (!visivel || !naTela) return
      if (!L || !A) return

      const v = limita(mergulho.v)

      /* LEITURAS primeiro, escritas depois. Os dois rects custam um
         recálculo de layout por quadro — o GSAP escreveu o transform do
         palco neste mesmo tick, então a primeira leitura o resolve. É um
         flush, não dois: nada abaixo escreve no DOM. */
      const rc = cv!.getBoundingClientRect()
      const rb = cerebro!.getBoundingClientRect()
      if (rb.width <= 0 || rb.height <= 0) return

      // Caixa do cérebro em coordenadas do canvas.
      const bx = rb.left - rc.left
      const by = rb.top - rc.top
      /* 54%/36% não é chute: é a `transform-origin` do palco em hero.css, o
         ponto que o autor escolheu como foco do cérebro. Na textura o
         desenho está longe do centro geométrico da caixa — a massa fica no
         terço superior e o tronco desce sozinho. Usar a mesma origem
         garante que o núcleo estrelado está exatamente no ponto para onde o
         mergulho aponta: você entra no que estava olhando. */
      const cx = bx + rb.width * 0.54
      const cy = by + rb.height * 0.36
      const R = Math.max(rb.width, rb.height) * 0.5

      const abertura = NUCLEO + (SILHUETA - NUCLEO) * suave(limita(v / ABRE_ATE))

      /* Ajuste de alcance — o que impede o campo de fugir da janela.
         `R` acompanha o cérebro, e o cérebro escala 80×. Sem correção o
         alcance máximo do campo (R × abertura × perspectiva) cresce sem
         limite junto com a escala, e o campo esvaziava no ponto exato em
         que devia estar mais denso. Em vez de limitar `R` (o que
         encolheria o núcleo em repouso), o campo INTEIRO é reescalado por
         um fator só quando seu alcance teórico passa do alvo. Perspectiva
         no pior caso usa `Z_PERTO`, o grão mais próximo que a faixa de
         repouso permite — sem voo não há grão mais perto que isso. */
      /* `spanY`, não `A`: o comentário acima fala em não deixar o campo
         fugir da JANELA, e abaixo de 980px a hero é mais alta que ela (ver
         `medir()`). Com `A` o alcance afrouxaria na mesma proporção e os
         grãos cairiam abaixo da dobra — o descarte logo adiante também
         mede contra a caixa, então nem seriam pulados. */
      const alvoAlcance = Math.hypot(L, spanY) * 0.62
      const alcanceBruto = R * abertura * (0.6 + 0.4 / Z_PERTO)
      const ajuste = alcanceBruto > alvoAlcance ? alvoAlcance / alcanceBruto : 1
      /* Geometria converge cedo e devagar: de `ESCALA_EM` até o instante
         em que a dissolução começa. São ~3 telas de rolagem — lento
         demais para ser percebido como mudança, e terminado antes de a
         seção começar a apagar. */
      const tGeo = progresso(v, ESCALA_EM, REVELA_EM)
      const ganho = ganhoRaio(tGeo)
      const vies = viesBranco(tGeo)
      /* Fotometria converge DENTRO da janela de dissolução, não com a
         geometria. Enquanto o cérebro cobre a tela o fundo do grão é uma
         imagem CLARA e MUITO carregada — a textura já tem os próprios
         pontos de brilho desenhados — e baixar o alfa ali não daria
         "discreto", daria invisível de verdade.

         Presa à dissolução, a opacidade cai junto com o cérebro que ela
         precisava vencer — contra ELE o contraste percebido fica estável.

         Contra o campo do site não fica, e quem for calibrar precisa
         saber: o site está noutra camada de opacidade, então o peso do
         grão do núcleo em relação a um grão de lá é `ganhoAlfa × opacidade
         da seção`, que decai bem mais rápido que qualquer uma das duas
         sozinha. O risco no meio da dissolução é o núcleo ceder DEMAIS, e
         não o adensamento que o spec previa. */
      const tFoto = progresso(v, REVELA_EM, REVELA_FIM_EM)
      const presenca = ganhoAlfa(tFoto)
      const halo = ganhoHalo(tFoto)
      /* Três cores por quadro, não uma por grão: o viés é o mesmo para
         todos e só o tom muda. Com 260 grãos isso eram 260 arrays por
         quadro para três resultados distintos. */
      const CORES = PALETA.map((c) => corComVies(c, BRANCO, vies))

      ctx!.clearRect(0, 0, L, A)
      ctx!.globalCompositeOperation = 'source-over'

      for (const g of graos) {
        /* A projeção usa a profundidade de REPOUSO, fixa. É o que mantém
           `perspectiva` e `ajuste` válidos: com a profundidade que
           converge (que desce até 0,05) isto valeria 8,6 e jogaria o grão
           para fora da tela. Sem voo, nenhum grão cruza esta faixa. */
        const perspectiva = 0.6 + 0.4 / g.zRepouso
        const espalha = R * abertura * perspectiva * ajuste
        const discoX = cx + g.x * espalha
        const discoY = cy + g.y * espalha

        /* A posição converge em espaço de TELA, não no modelo.
           O campo do site distribui os grãos uniformemente na janela — ele
           sorteia `x` proporcional a `z`, o que cancela a divisão da
           perspectiva — enquanto este os distribui num disco em volta do
           cérebro. São dois modelos incompatíveis; interpolar as posições
           finais casa as distribuições sem nenhum precisar virar o outro.
           Sem isto o campo terminaria com a densidade concentrada no meio,
           onde o do site a tem espalhada. */
        const p = suave(tGeo)
        const sx = discoX + (g.alvoX * L - discoX) * p
        const sy = discoY + (g.alvoY * spanY - discoY) * p
        if (sx < -8 || sx > L + 8 || sy < -8 || sy > A + 8) continue

        /* A profundidade que converge governa só raio e alfa. É ela que
           faz o campo GANHAR variação: em repouso todo grão é médio; no
           fim há muitos finos e alguns grandes, que é o desenho do campo
           do site. */
        const z = zConvergente(g.zRepouso, g.zFundo, tGeo)

        /* `fadeProximo` não é herança cega do campo de fundo. Lá ele
           existe porque o grão é reciclado e piscaria ao sair; aqui nada
           recicla — mas a profundidade converge para a MESMA faixa, e sem
           isto os grãos sorteados no fundo dela ficariam parados no
           tamanho máximo por três telas. O campo do site nunca mostra
           isso: um grão desse tamanho lá está de passagem. */
        let alfa = alfaDoGrao(z, g.brilho) * presenca * fadeProximo(z)
        alfa *= cintilacao(t / 1000, g.fase, g.cintila)

        /* Enquanto o núcleo é menor que a silhueta, é ele quem define a
           borda — e ela precisa ser macia, senão o campo lê como um disco
           recortado em vez de um brilho. Depois de abrir, quem corta é a
           máscara do cérebro e este fade sai de cena.

           `rho` é a distância no DISCO, não na tela, e a posição do grão
           deixa de ser a do disco conforme converge para o alvo uniforme.
           Por isso a máscara perde força junto com `p`: a borda macia
           pertence ao disco, e o disco vai deixando de existir. Sem esse
           fator, o grão já espalhado continuaria sendo escurecido por uma
           distância de onde ele não está mais — escurecimento sem relação
           com o que se vê na tela. */
        if (p < 1) {
          const rho = Math.hypot(g.x, g.y)
          alfa *= 1 - suave(limita((rho - 0.72) / 0.28)) * (1 - p)
        }
        if (alfa <= 0.004) continue

        /* O tamanho agora é o do campo do site multiplicado por um ganho
           que decai a 1 em `REVELA_EM`. O grão típico termina MENOR que
           antes, mas os maiores terminam maiores — porque `z` também
           abriu — e é essa troca de "todos médios" por "muitos finos e
           alguns grandes" que faz o campo parecer o do site em vez de um
           lençol uniforme. */
        const raio = raioDoGrao(z) * ganho
        const [r, gg, b] = CORES[g.tom]
        const alfaCore = Math.min(TETO_ALFA, alfa)

        /* Halo largo e fraco por trás do núcleo opaco. Com
           `mix-blend-mode: normal` (ver hero.css) o grão sozinho lia como
           um adesivo colado — um círculo de borda dura, sem relação com a
           luz que o cérebro já emite ao redor. O halo (2,8× o raio, ~22%
           do alfa) devolve a leitura de brilho sem depender de o composto
           aditivo vencer o fundo.

           Ele existe para vencer um fundo CLARO. Contra o vazio, o campo
           do site não tem halo nenhum — então este sai junto com a
           dissolução. Abaixo de meio milésimo de alfa não há o que
           rasterizar, e a chamada é desperdício. */
        const alfaHalo = alfaCore * 0.22 * halo
        if (alfaHalo > 0.004) {
          ctx!.beginPath()
          ctx!.arc(sx, sy, raio * 2.8, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${r},${gg},${b},${alfaHalo.toFixed(3)})`
          ctx!.fill()
        }

        ctx!.beginPath()
        ctx!.arc(sx, sy, raio, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${gg},${b},${alfaCore})`
        ctx!.fill()
      }

      /* O recorte. Mantém só o que cai dentro do alfa do cérebro, então as
         estrelas existem exclusivamente dentro dele — inclusive enquanto
         ele cresce, porque o destino do draw é o rect medido agora. */
      if (prontaTextura) {
        ctx!.globalCompositeOperation = 'destination-in'
        ctx!.drawImage(textura, bx, by, rb.width, rb.height)
        ctx!.globalCompositeOperation = 'source-over'
      }
    }

    const aoRedimensionar = () => medir()
    const aoTrocarVisibilidade = () => {
      visivel = !document.hidden
    }

    medir()
    window.addEventListener('resize', aoRedimensionar)
    document.addEventListener('visibilitychange', aoTrocarVisibilidade)

    /* A hero é a primeira seção e fica presa por 4 telas; passado isso
       não há motivo para seguir desenhando atrás do conteúdo. */
    const observador = new IntersectionObserver(
      ([entrada]) => {
        naTela = entrada?.isIntersecting ?? true
      },
      { rootMargin: '10% 0px' },
    )
    observador.observe(cv)

    raf = requestAnimationFrame(quadro)

    return () => {
      cancelAnimationFrame(raf)
      observador.disconnect()
      window.removeEventListener('resize', aoRedimensionar)
      document.removeEventListener('visibilitychange', aoTrocarVisibilidade)
      textura.onload = null
    }
  }, [])

  return <canvas className="hero-estrelas" ref={ref} aria-hidden="true" />
}
