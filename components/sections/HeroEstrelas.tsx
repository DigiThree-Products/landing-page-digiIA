'use client'

import { useEffect, useRef } from 'react'
import { ESCALA_EM, mergulho, REVELA_EM } from '@/lib/mergulho'

const TEXTURA = '/assets/hero/cerebro.webp'

/** Fora do vidro o mundo é claro; o universo mora dentro. */
const N_GRANDE = 150
const N_TOQUE = 70

/**
 * Faixa de profundidade dos grãos — fixa por toda a vida do grão, sem voo
 * (ver a nota grande abaixo sobre por que o campo ficou parado). Perto o
 * bastante (`Z_PERTO`) pra dar alguma variação de tamanho e perspectiva
 * entre os grãos; longe o bastante (`Z_LONGE`) pra nunca esticar demais.
 * `Z_PERTO` também é o pior caso usado no ajuste de alcance, mais abaixo —
 * uma constante só, não dois números que podem dessincronizar.
 */
const Z_PERTO = 0.62
const Z_LONGE = 1

/** Abertura do núcleo, em frações do raio aparente do cérebro. */
const NUCLEO = 0.38
const SILHUETA = 1.35
/* Em que ponto do mergulho a abertura termina de abrir. A seção inteira
   começa a apagar em 3,6/4,0 = 0,9 do trajeto (ver REVELA_POEIRA_INICIO
   em Hero.tsx) — o núcleo termina de abrir um pouco antes disso, para não
   estar visivelmente ainda se espalhando no instante em que tudo começa
   a escurecer. */
const ABRE_ATE = 0.88

/**
 * Crescimento do GRÃO, separado da abertura do núcleo (que é sobre
 * posição, não tamanho). O grão nasce 80× menor que o tamanho final, no
 * mesmo instante em que o cérebro começa a crescer (`ESCALA_EM`), e chega
 * ao tamanho final no mesmo instante em que a seção começa a apagar
 * (`REVELA_EM`) — acompanha o scroll junto com o cérebro, na mesma janela.
 * `power2.in` do GSAP é cúbico (`t³`), não quadrático — usar a mesma curva
 * aqui é o que faz o grão "crescer junto", não só terminar no mesmo lugar.
 */
const FATOR_MINIMO = 1 / 80

type Grao = {
  /** Posição no disco unitário; o raio já sai com distribuição uniforme em área. */
  x: number
  y: number
  z: number
  tom: number
  brilho: number
  fase: number
  cintila: number
}

const limita = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const suave = (t: number) => t * t * (3 - 2 * t)

/**
 * Leitura de token com piso.
 *
 * O `parseInt` cego em hexadecimal é o jeito curto, mas devolve NaN sem
 * reclamar se o token virar `oklch()` ou `rgb()` — e cor NaN no canvas é
 * ignorada em silêncio, deixando o grão com a última cor do contexto.
 * Um alternativo declarado transforma isso em degradação visível em vez
 * de falha invisível.
 */
function corDoToken(raiz: CSSStyleDeclaration, nome: string, alternativo: [number, number, number]) {
  const bruto = raiz.getPropertyValue(nome).trim()
  const hex = /^#?([0-9a-f]{6})$/i.exec(bruto)
  if (!hex) return alternativo
  const n = parseInt(hex[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as [number, number, number]
}

/**
 * O universo dentro do cérebro.
 *
 * Um núcleo estrelado no miolo do cérebro — pequeno e quase invisível em
 * repouso, abre e cresce conforme o mergulho avança (posição via
 * `abertura`, tamanho via `crescimento`), mas fica PARADO: sem voo, sem
 * deslize, só ali. A sensação de viagem não é dele — é da revelação de
 * verdade, quando a seção inteira apaga (`REVELA_EM`, ver Hero.tsx) e
 * descobre a poeira cósmica real do site atrás do cérebro (mesmo
 * mecanismo de PoeiraFundo.tsx, que já tem o próprio túnel). Fingir um
 * voo próprio aqui dentro, numa silhueta pequena e recortada, competiria
 * com essa revelação em vez de prepará-la — testado (voo em profundidade,
 * rastro e um segundo eixo tipo túnel) e revertido por decisão: o campo
 * pequeno lia como poluído, não como viagem.
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
    const PALETA: [number, number, number][] = [
      corDoToken(raiz, '--lilac', [205, 130, 255]),
      corDoToken(raiz, '--mid', [142, 71, 251]),
      corDoToken(raiz, '--paper', [248, 240, 255]),
    ]

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
      g.z = Z_PERTO + Math.random() * (Z_LONGE - Z_PERTO)
      /* Mais branco que roxo, de propósito: lilás e violeta (--mid) são
         próximos demais da própria paleta do cérebro pra se destacarem —
         testei visualmente e um grão lilás sobre um filamento lilás não
         lê como grão nenhum. O branco (--paper) estoura de verdade contra
         qualquer coisa embaixo. */
      g.tom = Math.random() < 0.55 ? 2 : (Math.random() * 2) | 0
      g.brilho = 0.7 + Math.random() * 0.3
      g.fase = Math.random() * Math.PI * 2
      g.cintila = 0.7 + Math.random() * 1.7
    }

    const graos: Grao[] = Array.from({ length: N }, () => {
      const g: Grao = { x: 0, y: 0, z: 1, tom: 0, brilho: 1, fase: 0, cintila: 1 }
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
      /* O piso é alto porque o fundo destas estrelas é o próprio cérebro,
         que é uma imagem CLARA e MUITO carregada (a textura já tem os
         próprios pontos de brilho desenhados) — presença baixa aqui não
         daria "discreto", daria invisível de verdade. */
      const presenca = 1.3 + v * 0.5
      /* De `FATOR_MINIMO` (80× menor) em `ESCALA_EM` até 1 (tamanho final)
         em `REVELA_EM` — ver a nota em `FATOR_MINIMO`. `t³`, não a
         `suave()` de sempre: é a mesma curva do `power2.in` que anima
         `.palco`, para o grão crescer no mesmo ritmo do cérebro, não só
         terminar no mesmo tamanho na mesma hora. */
      const tCresce = limita((v - ESCALA_EM) / (REVELA_EM - ESCALA_EM))
      const crescimento = FATOR_MINIMO + (1 - FATOR_MINIMO) * tCresce * tCresce * tCresce
      const bordaViva = abertura < 1.05

      ctx!.clearRect(0, 0, L, A)
      ctx!.globalCompositeOperation = 'source-over'

      for (const g of graos) {
        /* Perspectiva contida: com `g.z` fixo entre `Z_PERTO` e `Z_LONGE`,
           a variação de tamanho/posição entre grãos é só a distinção de
           profundidade de sempre — não há voo, então não há grão cruzando
           essa faixa. */
        const perspectiva = 0.6 + 0.4 / g.z
        const espalha = R * abertura * perspectiva * ajuste
        const sx = cx + g.x * espalha
        const sy = cy + g.y * espalha
        if (sx < -8 || sx > L + 8 || sy < -8 || sy > A + 8) continue

        let alfa = (0.65 + 0.5 * (1 - g.z)) * g.brilho * presenca
        alfa *= 1 + Math.sin(t / 1000 * g.cintila + g.fase) * 0.28

        /* Enquanto o núcleo é menor que a silhueta, é ele quem define a
           borda — e ela precisa ser macia, senão o campo lê como um disco
           recortado em vez de um brilho. Depois de abrir, quem corta é a
           máscara do cérebro e este fade sai de cena. */
        if (bordaViva) {
          const rho = Math.hypot(g.x, g.y)
          alfa *= 1 - suave(limita((rho - 0.72) / 0.28))
        }
        if (alfa <= 0.004) continue

        /* Mesmo piso/teto/constantes de PoeiraFundo.tsx (0,5–5px, `1,6/z`
           × 0,42) — é o tamanho final, o mesmo da poeira do site, que o
           grão só atinge de verdade em `REVELA_EM`. Antes disso ele nasce
           `crescimento` vezes menor (até 80× em `ESCALA_EM`) e cresce com
           o scroll — ver a nota em `FATOR_MINIMO`. */
        const raioFinal = Math.min(5, Math.max(0.5, (1.6 / g.z) * 0.42))
        const raio = raioFinal * crescimento
        const [r, gg, b] = PALETA[g.tom]
        const alfaCore = Math.min(1, alfa)

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
