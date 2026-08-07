'use client'

import { useEffect, useRef } from 'react'
import { mergulho } from '@/lib/mergulho'

const TEXTURA = '/assets/hero/cerebro.webp'

/** Fora do vidro o mundo é claro; o universo mora dentro. */
const N_GRANDE = 150
const N_TOQUE = 70

/**
 * Profundidade mínima antes de reciclar. Em 0.16 o grão chega a ~6× o
 * raio da abertura antes de sair — passa pela periferia em vez de
 * desaparecer no meio da tela.
 */
const Z_MIN = 0.16
/**
 * Deriva de repouso: o núcleo respira mesmo sem ninguém rolar.
 * Baixa de propósito — a 0,02/s um grão leva ~20s para atravessar a
 * profundidade semeada, então o campo tem vida sem ter pressa.
 */
const DERIVA = 0.02

/** Abertura do núcleo, em frações do raio aparente do cérebro. */
const NUCLEO = 0.3
const SILHUETA = 1.35
/** Em que ponto do mergulho a abertura termina de abrir. */
const ABRE_ATE = 0.85

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
 * Em repouso é um núcleo estrelado no miolo do cérebro — pequeno, quieto,
 * do tamanho de uma sugestão. Conforme o mergulho avança, ele **abre**: os
 * grãos se espalham até a silhueta inteira e a profundidade acelera, então
 * você deixa de olhar um brilho e passa a atravessar um campo.
 *
 * Três decisões que não são livres:
 *
 * 1. **O canvas não é filho de `.palco`.** O palco escala até 11× no
 *    mergulho, e um canvas escalado por CSS escala os pixels: as estrelas
 *    ficariam 11× maiores e borradas, o oposto do que se quer. Aqui ele
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
    let anterior = performance.now()

    const textura = new Image()
    let prontaTextura = false
    textura.onload = () => {
      prontaTextura = true
    }
    textura.src = TEXTURA

    function sortear(g: Grao, z: number) {
      const ang = Math.random() * Math.PI * 2
      // sqrt para o disco encher por igual; sem ele o centro fica denso demais
      const rho = Math.sqrt(Math.random())
      g.x = Math.cos(ang) * rho
      g.y = Math.sin(ang) * rho
      g.z = z
      g.tom = (Math.random() * PALETA.length) | 0
      g.brilho = 0.45 + Math.random() * 0.55
      g.fase = Math.random() * Math.PI * 2
      g.cintila = 0.7 + Math.random() * 1.7
    }

    const graos: Grao[] = Array.from({ length: N }, () => {
      const g: Grao = { x: 0, y: 0, z: 1, tom: 0, brilho: 1, fase: 0, cintila: 1 }
      /* Semeia no terço da frente da profundidade, não na faixa inteira. Em
         repouso o avanço é lento e a distribuição inicial é a que se vê: com
         z uniforme boa parte dos grãos já nascia longe, espalhada pela
         perspectiva para fora da silhueta e recortada — núcleo ralo desde o
         primeiro quadro. A faixa cheia é alcançada durante o mergulho, que é
         quando ela tem função. */
      sortear(g, 0.62 + Math.random() * 0.38)
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
      if (!visivel || !naTela) {
        anterior = t
        return
      }
      const dt = Math.min((t - anterior) / 1000, 0.05)
      anterior = t
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
      // v² para o campo acelerar conforme você se compromete a entrar.
      const avanco = (DERIVA + v * v * 1.15) * dt
      /* O piso é alto porque o fundo destas estrelas é o próprio cérebro,
         que é uma imagem CLARA. Com o canvas em `screen` (ver hero-clara.css)
         o grão soma luz: ele aparece forte nos vãos escuros entre os
         filamentos e se dissolve sobre os traços já brilhantes — que é
         justamente como um campo de estrelas se leria visto de dentro de
         algo luminoso. Presença baixa aqui não daria "discreto", daria
         "invisível". */
      const presenca = 0.9 + v * 0.5
      const engorda = 1 + v * 0.7
      const bordaViva = abertura < 1.05

      ctx!.clearRect(0, 0, L, A)
      ctx!.globalCompositeOperation = 'source-over'

      for (const g of graos) {
        g.z -= avanco
        if (g.z < Z_MIN) sortear(g, 1)

        /* Perspectiva contida: em `1/z` puro o grão a z=0,16 saltava a 6× o
           raio do núcleo, o que despejava a maioria fora da silhueta e
           esvaziava o núcleo em repouso. Assim z=1 fica em 1,0× e z=0,16 em
           ~3,1× — há passagem rente à câmera, mas o núcleo continua um
           núcleo. */
        const perspectiva = 0.6 + 0.4 / g.z
        const espalha = R * abertura * perspectiva
        const sx = cx + g.x * espalha
        const sy = cy + g.y * espalha
        if (sx < -8 || sx > L + 8 || sy < -8 || sy > A + 8) continue

        /* Some ao nascer no fundo e ao passar rente: sem as duas bordas o
           grão pisca ao entrar e ao sair do campo.
           A janela de entrada é estreita (0,1) porque em repouso a semeadura
           vive em z 0,62–1: com a janela larga que estava aqui, um terço do
           núcleo nascia permanentemente apagado — o fade existe para o grão
           que aparece no fundo durante o mergulho, não para punir quem está
           parado. */
        const entrada = Math.min(1, (1 - g.z) / 0.1)
        const saida = Math.min(1, (g.z - Z_MIN) / 0.08)

        let alfa = (0.42 + 0.5 * (1 - g.z)) * g.brilho * presenca * entrada * saida
        alfa *= 1 + Math.sin(t / 1000 * g.cintila + g.fase) * 0.28

        /* Enquanto o núcleo é menor que a silhueta, é ele quem define a
           borda — e ela precisa ser macia, senão o campo lê como um disco
           recortado em vez de um brilho. Depois de abrir, quem corta é a
           máscara do cérebro e este fade sai de cena. */
        if (bordaViva) {
          /* Medido no DISCO, não na tela.
             Em coordenadas de tela a distância já vem multiplicada pela
             perspectiva, então qualquer grão fundo estourava o limiar e era
             zerado — o núcleo perdia a maior parte dos grãos e ficava
             invisível. O raio no disco é independente da profundidade, que é
             a grandeza que a borda do núcleo realmente descreve. */
          const rho = Math.hypot(g.x, g.y)
          alfa *= 1 - suave(limita((rho - 0.72) / 0.28))
        }
        if (alfa <= 0.004) continue

        /* Bem menores que os da poeira de fundo, que vão de 0,5 a 5px: aqui
           o teto é 1,7 e o piso 0,4.
           A constante é 0,62 e não 0,3 porque com o valor anterior a conta
           dava 0,19–0,30 na faixa de repouso — TODO grão batia no piso e o
           núcleo perdia a leitura de profundidade, virando um chuvisco de
           pontos idênticos. Agora o repouso rende ~0,53 a 0,85px, então o
           grão fundo e o grão perto se distinguem sem nenhum deles crescer. */
        const raio = Math.min(1.7, Math.max(0.4, (0.62 / g.z) * 0.85 * engorda))
        const [r, gg, b] = PALETA[g.tom]
        ctx!.beginPath()
        ctx!.arc(sx, sy, raio, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${gg},${b},${Math.min(0.95, alfa)})`
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

    /* A hero é a primeira seção e fica presa por 2,4 telas; passado isso
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
