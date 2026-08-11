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
/**
 * Peso da TAXA de mudança de `v` no avanço — não da posição de `v`.
 * Mesmo princípio da poeira do site (PoeiraFundo.tsx: `Math.abs(velocidade)`):
 * o campo acelera com o gesto de rolar, não com o quanto já se mergulhou.
 * Parar no meio do mergulho acalma o campo de volta a `DERIVA`, em vez de
 * mantê-lo acelerado só por `v` estar alto. `Math.abs` garante que subir ou
 * descer só acelera — nunca inverte o sentido do voo.
 */
const K_TAXA = 5
/** Quanto a mesma taxa vira "força" pra trocar ponto por traço no desenho —
    ver `forca` no laço de quadro. Mesmo padrão de PoeiraFundo.tsx:318. */
const K_FORCA = 8

/** Abertura do núcleo, em frações do raio aparente do cérebro. */
const NUCLEO = 0.38
const SILHUETA = 1.35
/* Em que ponto do mergulho a abertura termina de abrir. A seção inteira
   começa a apagar em 3,6/4,0 = 0,9 do trajeto (ver REVELA_POEIRA_INICIO
   em Hero.tsx) — o núcleo termina de abrir um pouco antes disso, para não
   estar visivelmente ainda se espalhando no instante em que tudo começa
   a escurecer. */
const ABRE_ATE = 0.88

type Grao = {
  /** Posição no disco unitário; o raio já sai com distribuição uniforme em área. */
  x: number
  y: number
  z: number
  tom: number
  brilho: number
  fase: number
  cintila: number
  /** Posição na tela no quadro anterior — o rastro do voo rápido. `null`
      logo após nascer, pra não puxar uma linha da posição antiga. */
  px: number | null
  py: number | null
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
 *    brilho sem depender do que está embaixo — ver a nota no loop mais
 *    abaixo.
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
    /** `v` do quadro anterior — dá a TAXA de mudança, não a posição. */
    let vAnterior = 0

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
      /* Mais branco que roxo, de propósito: lilás e violeta (--mid) são
         próximos demais da própria paleta do cérebro pra se destacarem —
         testei visualmente e um grão lilás sobre um filamento lilás não
         lê como grão nenhum. O branco (--paper) estoura de verdade contra
         qualquer coisa embaixo. */
      g.tom = Math.random() < 0.55 ? 2 : (Math.random() * 2) | 0
      g.brilho = 0.7 + Math.random() * 0.3
      g.fase = Math.random() * Math.PI * 2
      g.cintila = 0.7 + Math.random() * 1.7
      // Renasceu: nenhum rastro liga a posição antiga à nova.
      g.px = null
      g.py = null
    }

    const graos: Grao[] = Array.from({ length: N }, () => {
      const g: Grao = { x: 0, y: 0, z: 1, tom: 0, brilho: 1, fase: 0, cintila: 1, px: null, py: null }
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
      /* Taxa de mudança de `v`, não `v` em si — ver a nota em `K_TAXA`.
         `Math.max(dt, 1e-3)` só evita divisão por zero num quadro de
         duração nula; dt já vem sempre positivo do clamp acima. */
      const taxa = Math.abs(v - vAnterior) / Math.max(dt, 1e-3)
      vAnterior = v

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
         `R` acompanha o cérebro, e o cérebro escala 18×. Sem correção o
         alcance máximo do campo (R × abertura × perspectiva) chegava a
         ~4200px numa tela de 1440: medi 12 grãos visíveis de 150 no
         clímax. O campo esvaziava no ponto exato em que devia estar mais
         denso — o mesmo defeito que a poeira de fundo tem no scroll rápido.
         Em vez de limitar `R` (o que encolheria o núcleo em repouso), o
         campo INTEIRO é reescalado por um fator só quando seu alcance
         teórico passa do alvo. Em repouso o alcance é 242px contra um alvo
         de ~1050, então o fator é 1 e nada muda; no clímax ele cai para
         ~0,25 e o campo passa a preencher a tela em vez de atravessá-la.
         Um fator único preserva a distribuição — limitar grão por grão
         empilharia todos num anel na borda. */
      const alvoAlcance = Math.hypot(L, A) * 0.62
      const alcanceBruto = R * abertura * (0.6 + 0.4 / Z_MIN)
      const ajuste = alcanceBruto > alvoAlcance ? alvoAlcance / alcanceBruto : 1
      // Taxa, não posição — ver a nota em `K_TAXA`.
      const avanco = (DERIVA + taxa * K_TAXA) * dt
      /* Mesmo papel de `forca` em PoeiraFundo.tsx:318: acima do limiar, o
         grão desenha um traço em vez de um ponto — ver o laço abaixo. */
      const forca = Math.min(3, taxa * K_FORCA)
      /* O piso é alto porque o fundo destas estrelas é o próprio cérebro,
         que é uma imagem CLARA e MUITO carregada (a textura já tem os
         próprios pontos de brilho desenhados). Com o canvas em `screen`
         (ver hero.css) o grão soma luz: ele aparece forte nos vãos escuros
         entre os filamentos e se dissolve sobre os traços já brilhantes —
         que é justamente como um campo de estrelas se leria visto de
         dentro de algo luminoso. Medido: com presença 0,9 e grão de
         0,4–1,7px o canvas rendia ~700px de alfa>0 num quadro de 1,1
         milhão — nem em captura lado a lado dava pra notar a diferença
         contra a arte do cérebro. Presença baixa aqui não daria
         "discreto", daria invisível de verdade. */
      const presenca = 1.3 + v * 0.5
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
        const espalha = R * abertura * perspectiva * ajuste
        const sx = cx + g.x * espalha
        const sy = cy + g.y * espalha
        /* Capturado ANTES de qualquer `continue` abaixo, e sempre
           atualizado: se só guardássemos px/py quando o grão está visível,
           um grão que saiu da tela ou apagou por um instante voltaria
           puxando um rastro velho, de vários quadros atrás. Atualizando
           sempre, o rastro nunca é mais que um quadro. */
        const pxAntes = g.px
        const pyAntes = g.py
        g.px = sx
        g.py = sy
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

        let alfa = (0.65 + 0.5 * (1 - g.z)) * g.brilho * presenca * entrada * saida
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

        /* Grande o bastante pra vencer a própria arte do cérebro, que já
           tem dezenas de pontos de luz desenhados na textura. Medido:
           com o piso/teto/cor anteriores (1–2,6px, cor sorteada igual
           entre as três) o canvas somava ~1200px de alfa>0 num quadro de
           1,1 milhão, e lado a lado com o canvas escondido a captura era
           indistinguível a olho nu — inclusive no grão de maior alfa,
           ampliado 10×. Piso 2 e teto 4,5 continuam distinguindo
           profundidade (grão fundo vs. grão perto) sem virar bolha. */
        const raio = Math.min(4.5, Math.max(2, (0.62 / g.z) * 2.2 * engorda))
        const [r, gg, b] = PALETA[g.tom]
        const alfaCore = Math.min(1, alfa)
        const corHalo = `rgba(${r},${gg},${b},${(alfaCore * 0.22).toFixed(3)})`
        const corNucleo = `rgba(${r},${gg},${b},${alfaCore})`

        /* Dois traços, não um: um halo largo e fraco por trás do núcleo
           opaco. Com `mix-blend-mode: normal` (ver hero.css) o grão sozinho
           lia como um adesivo colado — um círculo de borda dura, sem
           relação com a luz que o cérebro já emite ao redor. O halo (2,8×
           o raio, ~22% do alfa) devolve a leitura de brilho sem depender
           de o composto aditivo vencer o fundo, que foi o que realmente
           falhava antes: medido, `screen` e `plus-lighter` empatavam com
           a própria arte do cérebro e ficavam invisíveis lado a lado.

           Ponto parado, traço rápido — mesma divisão de PoeiraFundo.tsx
           (`forca > 0.12`): sem isso, um mergulho rápido e um repouso
           pareciam a mesma coisa, só que com o núcleo maior ou menor. O
           traço é quem entrega "atravessando um campo" em vez de "um
           brilho que cresce". */
        if (pxAntes !== null && forca > 0.12) {
          ctx!.lineCap = 'round'
          ctx!.beginPath()
          ctx!.moveTo(pxAntes, pyAntes!)
          ctx!.lineTo(sx, sy)
          ctx!.lineWidth = raio * 2 * 2.8
          ctx!.strokeStyle = corHalo
          ctx!.stroke()

          ctx!.beginPath()
          ctx!.moveTo(pxAntes, pyAntes!)
          ctx!.lineTo(sx, sy)
          ctx!.lineWidth = raio * 2
          ctx!.strokeStyle = corNucleo
          ctx!.stroke()
        } else {
          ctx!.beginPath()
          ctx!.arc(sx, sy, raio * 2.8, 0, Math.PI * 2)
          ctx!.fillStyle = corHalo
          ctx!.fill()

          ctx!.beginPath()
          ctx!.arc(sx, sy, raio, 0, Math.PI * 2)
          ctx!.fillStyle = corNucleo
          ctx!.fill()
        }
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
