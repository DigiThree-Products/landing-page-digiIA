'use client'

import { useEffect, useRef } from 'react'
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
import { ESCALA_EM, mergulho, REVELA_EM } from '@/lib/mergulho'

const TEXTURA = '/assets/hero/cerebro.webp'

/* Mesma contagem do campo do site (PoeiraFundo). Durante a dissolução os
   dois coexistem, e densidades diferentes seriam mais um eixo mudando
   junto com o resto — justamente o que esta convergência existe para
   evitar. */
const N_GRANDE = 260
const N_TOQUE = 110

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
      const alvoAlcance = Math.hypot(L, A) * 0.62
      const alcanceBruto = R * abertura * (0.6 + 0.4 / Z_PERTO)
      const ajuste = alcanceBruto > alvoAlcance ? alvoAlcance / alcanceBruto : 1
      /* Geometria converge cedo e devagar: de `ESCALA_EM` até o instante
         em que a dissolução começa. São ~3 telas de rolagem — lento
         demais para ser percebido como mudança, e terminado antes de a
         seção começar a apagar. */
      const tGeo = progresso(v, ESCALA_EM, REVELA_EM)
      const ganho = ganhoRaio(tGeo)
      const vies = viesBranco(tGeo)
      /* Presença ainda constante nesta etapa — o valor de repouso da
         curva, não um número solto. A fotometria entra depois e troca
         isto por `ganhoAlfa(tFoto)`, preso à dissolução. O piso é alto
         porque o fundo destas estrelas é o próprio cérebro, uma imagem
         CLARA e MUITO carregada (a textura já tem os próprios pontos de
         brilho desenhados) — presença baixa aqui não daria "discreto",
         daria invisível de verdade. */
      const presenca = ganhoAlfa(0)
      const bordaViva = abertura < 1.05

      ctx!.clearRect(0, 0, L, A)
      ctx!.globalCompositeOperation = 'source-over'

      for (const g of graos) {
        /* A projeção usa a profundidade de REPOUSO, fixa. É o que mantém
           `perspectiva` e `ajuste` válidos: com a profundidade que
           converge (que desce até 0,05) isto valeria 8,6 e jogaria o grão
           para fora da tela. Sem voo, nenhum grão cruza esta faixa. */
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

        /* O tamanho agora é o do campo do site multiplicado por um ganho
           que decai a 1 em `REVELA_EM`. O grão típico termina MENOR que
           antes, mas os maiores terminam maiores — porque `z` também
           abriu — e é essa troca de "todos médios" por "muitos finos e
           alguns grandes" que faz o campo parecer o do site em vez de um
           lençol uniforme. */
        const raio = raioDoGrao(z) * ganho
        const [r, gg, b] = corComVies(PALETA[g.tom], BRANCO, vies)
        const alfaCore = Math.min(TETO_ALFA, alfa)

        /* Halo largo e fraco por trás do núcleo opaco. Com
           `mix-blend-mode: normal` (ver hero.css) o grão sozinho lia como
           um adesivo colado — um círculo de borda dura, sem relação com a
           luz que o cérebro já emite ao redor. O halo (2,8× o raio, ~22%
           do alfa) devolve a leitura de brilho sem depender de o composto
           aditivo vencer o fundo. */
        ctx!.beginPath()
        ctx!.arc(sx, sy, raio * 2.8, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${gg},${b},${(alfaCore * 0.22).toFixed(3)})`
        ctx!.fill()

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
