'use client'

import { useEffect, useRef } from 'react'
import {
  alfaDoGrao,
  cintilacao,
  CONTAGEM_GRAOS,
  corDoToken,
  fadeNascimento,
  fadeProximo,
  FAIXA_Z,
  paletaEmissao,
  progresso,
  raioDoGrao,
  sortearIdentidade,
  suave,
  TETO_ALFA,
  type RGB,
} from '@/lib/grao'
import { mergulho, REVELA_EM } from '@/lib/mergulho'
import { MODO_POEIRA } from '@/lib/poeira'

type Particula = {
  x: number
  y: number
  z: number
  /** Posição na rampa de cores — a mesma nos dois regimes, para o grão manter identidade ao atravessar. */
  tom: number
  brilho: number
  /** Fase da cintilação, para as estrelas não piscarem em coro. */
  fase: number
  cintila: number
  px: number | null
  py: number | null
}

/**
 * Retângulo de uma seção em coordenadas de TELA.
 *
 * As claras são as estações: recuadas e arredondadas, então a área
 * clara não atravessa mais a largura toda — daí o teste ser 2D e não
 * só pela altura. `op` acompanha o painel apagando ao passar, para o
 * branco do canvas sumir junto com ele.
 */
type Zona = {
  esq: number
  dir: number
  topo: number
  base: number
  claro: number
  op: number
  raio: number
}

/**
 * Poeira de fundo — partículas em perspectiva que avançam com o scroll
 * e derivam com o cursor. Fixo atrás de todo o conteúdo (z-index em
 * layout.css); cada seção que pinta o próprio fundo sólido cobre a
 * poeira ali — ela só aparece onde a seção deixar passagem.
 *
 * Os dois regimes de cor não são enfeite: são os dois jeitos de a mesma
 * poeira cósmica aparecer. Contra o vazio ela emite e reflete — grão
 * claro sobre fundo escuro, o campo de estrelas. Contra um fundo
 * luminoso ela bloqueia a luz e vira silhueta: é a nebulosa escura
 * (Saco de Carvão, Cabeça de Cavalo), grão escuro sobre claro. A
 * travessia entre os dois acontece na borda das seções, dissolvida numa
 * faixa de transição — a cor não troca, ela atravessa. Estrela só
 * cintila quando está brilhando, então a cintilação some junto na
 * silhueta.
 */
export function PoeiraFundo() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = cv.getContext('2d')
    if (!ctx) return

    const modo = MODO_POEIRA
    const toque = window.matchMedia('(pointer: coarse)').matches
    const N = toque ? CONTAGEM_GRAOS.toque : CONTAGEM_GRAOS.grande
    const Z_MIN_R = 0.09
    /* Fundo de profundidade mais raso que antes: o grão chega bem mais
       perto antes de ser reciclado, e é essa passagem rente à câmera que
       dá a escala do espaço. O núcleo da hero converge para esta mesma
       faixa, então ela vem de lib/grao.ts. */
    const Z_MIN_V = FAIXA_Z[0]
    const DERIVA_R = 0.014
    /** Deriva vertical da câmera — o eixo que segue o scroll. */
    const DERIVA_V = 0.04
    /** Avanço em profundidade: é o que faz atravessar em vez de deslizar. */
    const DERIVA_Z = 0.05
    const MARGEM = 90
    /* Profundidade representativa, para converter a taxa proporcional que
       o núcleo publica (`dz/dt = -z · taxa`) na taxa absoluta que este
       campo usa. É a mediana medida da distribuição de profundidade dos
       dois campos na travessia — o grão típico, não o mais perto nem o
       mais longe. */
    const Z_REPRESENTATIVA = 0.71
    /* Fração da taxa do núcleo com que este campo entra. Era 1 — entrada
       na velocidade exata do campo de dentro do cérebro. Abaixo disso ele
       entra mais devagar do que se vinha viajando e vai ganhando ritmo,
       o que lê como acelerar para dentro do site em vez de ser jogado
       nele. Voltar a 1 refaz a igualdade exata. */
    const FRACAO_ENTRADA = 0.55
    /* Ritmo do campo DEPOIS da travessia, em fração da velocidade própria.
       Vale para toda a página abaixo da hero, não só para a costura: uma
       vez passado o pin, `mergulho.v` fica em 1 e este é o ganho que
       permanece. Era 1 — a velocidade original do campo, de antes de tudo
       isto. Desceu porque, mesmo com a entrada casada, o campo seguia
       rápido demais para a leitura de estar viajando por dentro. */
    const RITMO_APOS = 0.6

    const raiz = getComputedStyle(document.documentElement)
    const ler = (nome: string) => raiz.getPropertyValue(nome)

    /* Emissão: o grão brilha contra o vazio. Extinção: o mesmo grão em
       silhueta contra a luz. Os índices se correspondem — cada partícula
       guarda um `tom` e caminha entre a sua cor de um lado e a do outro.

       A emissão vem de lib/grao.ts porque o núcleo da hero converge para
       ela e os dois precisam concordar; a extinção fica aqui, porque é
       sobre o fundo claro que só este campo atravessa. */
    const EMISSAO = paletaEmissao(ler)
    const EXTINCAO: RGB[] = [
      corDoToken(ler('--violet'), [69, 0, 249]),
      corDoToken(ler('--abyss'), [1, 3, 122]),
      corDoToken(ler('--abyss'), [1, 3, 122]),
    ]

    /* Uma seção é clara quando o texto dela é escuro — indicador mais
       confiável que ler o fundo, já que as seções com passagem para a
       poeira foram justamente as que ficaram sem cor de fundo própria.
       A cor do texto não muda em runtime, então isso é medido uma vez. */
    let secoes: { el: HTMLElement; claro: number; raioBase: number }[] = []
    function mapearSecoes() {
      /* A hero está FORA daqui de propósito. Ela tem o próprio campo, o
         núcleo estrelado recortado dentro do cérebro (HeroEstrelas), e
         pinta o próprio branco em CSS.
         Deixá-la no mapa não seria apenas redundante: como a hero clara tem
         texto escuro, a heurística abaixo a marcaria como zona clara e os
         grãos ali sairiam em silhueta. Quando o véu branco cede no fim do
         mergulho, o fundo já é escuro — silhueta escura sobre escuro é grão
         invisível, e a entrega do núcleo para este campo não aconteceria. */
      const alvos = document.querySelectorAll<HTMLElement>('.page section, .page .site-footer')
      secoes = Array.from(alvos, (secao) => {
        const m = getComputedStyle(secao).color.match(/-?\d+(\.\d+)?/g)
        const lum = m && m.length >= 3
          ? (0.2126 * Number(m[0]) + 0.7152 * Number(m[1]) + 0.0722 * Number(m[2])) / 255
          : 1
        /* Quando a seção é uma estação, quem tem a forma visível é o
           painel interno — é o retângulo dele que o branco tem de
           acompanhar, não o da vaga que o segura. */
        const el = secao.querySelector<HTMLElement>('.approach-stage') ?? secao
        return {
          el,
          claro: lum < 0.5 ? 1 : 0,
          raioBase: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
        }
      })
    }

    /* Zonas em coordenadas de TELA, remedidas a cada quadro. Ler o rect
       direto resolve de graça o caso da seção fixada pelo ScrollTrigger,
       que em coordenadas de documento ficaria à deriva enquanto o pin
       segura a seção parada. Nada escreve no DOM dentro do laço, então
       o layout continua limpo e essas leituras não forçam reflow. */
    let zonas: Zona[] = []
    function medirZonas() {
      zonas = secoes.map(({ el, claro, raioBase }) => {
        const r = el.getBoundingClientRect()
        // O rect já vem transformado; o raio aparente escala junto.
        const escala = claro ? Number(el.dataset.escala) || 1 : 1
        return {
          esq: r.left,
          dir: r.right,
          topo: r.top,
          base: r.bottom,
          claro,
          op: claro ? (el.style.opacity === '' ? 1 : parseFloat(el.style.opacity)) : 1,
          raio: raioBase * escala,
        }
      })
    }

    /**
     * Quanto de luz há atrás do grão neste ponto da tela, de 0 a 1.
     * Só as estações contam: fora delas o fundo é o vazio.
     */
    function claridadeEm(telaX: number, telaY: number) {
      for (const z of zonas) {
        if (!z.claro) continue
        if (telaX < z.esq || telaX >= z.dir || telaY < z.topo || telaY >= z.base) continue
        return z.op
      }
      return 0
    }

    /* O canvas pinta a base clara das estações.
       Sem isso não há contraste possível ali: o CSS delas cobria o canvas
       com um véu branco quase opaco, e o que sobrava por baixo era o preto
       da página — grão escuro sobre fundo escuro. Pintando o painel aqui, a
       silhueta ganha branco de verdade atrás, e ele apaga junto com a
       estação que se afasta. */
    const [pr, pg, pb] = corDoToken(ler('--paper'), [248, 240, 255])
    const temRoundRect = typeof ctx.roundRect === 'function'
    function pintaEstacoes() {
      for (const z of zonas) {
        if (!z.claro || z.op <= 0.01) continue
        const larg = z.dir - z.esq
        const alt = z.base - z.topo
        if (larg <= 0 || alt <= 0) continue
        ctx!.fillStyle = `rgba(${pr},${pg},${pb},${z.op})`
        ctx!.beginPath()
        if (temRoundRect) {
          ctx!.roundRect(z.esq, z.topo, larg, alt, Math.min(z.raio, larg / 2, alt / 2))
          ctx!.fill()
        } else {
          ctx!.fillRect(z.esq, z.topo, larg, alt)
        }
      }
    }

    let L = 0
    let A = 0
    let escala = 1
    let mx = 0
    let my = 0
    const mAlvo = { x: 0, y: 0 }
    let scrollAnterior = window.scrollY
    let velocidade = 0
    let camY = 0
    let visivel = true
    let raf = 0

    const pts: Particula[] = Array.from({ length: N }, () => ({
      x: 0,
      y: 0,
      z: 1,
      tom: 0,
      brilho: 1,
      fase: 0,
      cintila: 1,
      px: null,
      py: null,
    }))

    function sortearGrao(p: Particula) {
      Object.assign(p, sortearIdentidade())
    }
    function nascerRadial(p: Particula, z: number) {
      const ang = Math.random() * Math.PI * 2
      const raio = 0.15 + Math.random() * 0.95
      p.x = Math.cos(ang) * raio
      p.y = Math.sin(ang) * raio
      p.z = z
      sortearGrao(p)
      p.px = null
      p.py = null
    }
    function nascerVertical(p: Particula, ondeY: number | null, z: number | null) {
      p.z = z ?? Z_MIN_V + Math.random() * (1 - Z_MIN_V)
      sortearGrao(p)
      p.x = (Math.random() * 2 - 1) * (((L / 2 + MARGEM) * p.z) / escala)
      const alvoY = ondeY === null ? Math.random() * A : ondeY
      p.y = camY + ((alvoY - A / 2) * p.z) / escala
      p.px = null
      p.py = null
    }
    function semear() {
      camY = 0
      for (const p of pts) {
        if (modo === 'radial') nascerRadial(p, Z_MIN_R + Math.random() * (1 - Z_MIN_R))
        else nascerVertical(p, null, null)
      }
    }

    function medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      L = window.innerWidth
      A = window.innerHeight
      escala = Math.min(L, A) * 0.62
      cv!.width = Math.round(L * dpr)
      cv!.height = Math.round(A * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    /**
     * Resolve cor e opacidade do grão no ponto em que ele está.
     * `claro` 0 = vazio (emite), 1 = fundo luminoso (silhueta).
     */
    function regime(p: Particula, sx: number, sy: number, tempo: number, base: number) {
      const claro = claridadeEm(sx, sy)
      const emite = EMISSAO[p.tom]
      const some = EXTINCAO[p.tom]
      const r = Math.round(emite[0] + (some[0] - emite[0]) * claro)
      const g = Math.round(emite[1] + (some[1] - emite[1]) * claro)
      const b = Math.round(emite[2] + (some[2] - emite[2]) * claro)
      /* Estrela só cintila enquanto brilha: na silhueta o pulso se apaga.
         A amortização por `(1 - claro)` fica aqui, não no módulo: ela é
         sobre o fundo que só este campo atravessa. */
      const pulso = 1 + (cintilacao(tempo, p.fase, p.cintila) - 1) * (1 - claro)
      // Grão escuro sobre claro precisa de mais corpo para se ler.
      const a = Math.min(TETO_ALFA, base * pulso * (1 + claro * 0.5))
      return { cor: `${r},${g},${b}`, a }
    }

    function pinta(p: Particula, sx: number, sy: number, r: number, cor: string, a: number, forca: number) {
      if (p.px !== null && forca > 0.12) {
        ctx!.beginPath()
        ctx!.moveTo(p.px, p.py!)
        ctx!.lineTo(sx, sy)
        ctx!.lineWidth = r * 1.45
        ctx!.lineCap = 'round'
        ctx!.strokeStyle = `rgba(${cor},${a})`
        ctx!.stroke()
      } else {
        ctx!.beginPath()
        ctx!.arc(sx, sy, r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${cor},${a})`
        ctx!.fill()
      }
      p.px = sx
      p.py = sy
    }

    let anterior = performance.now()
    let quadros = 0
    function quadro(t: number) {
      raf = requestAnimationFrame(quadro)
      if (!visivel) {
        anterior = t
        return
      }
      const dt = Math.min((t - anterior) / 1000, 0.05)
      anterior = t
      const segundos = t / 1000
      medirZonas()
      ctx!.clearRect(0, 0, L, A)
      pintaEstacoes()

      /* Decaimento mais lento que o original: a velocidade sobrevive um
         instante a mais depois que a roda para, e o campo desacelera em
         vez de travar junto com o gesto. */
      velocidade *= Math.pow(0.14, dt)
      mx += (mAlvo.x - mx) * 0.05
      my += (mAlvo.y - my) * 0.05

      const cx = L / 2 + mx * 32
      const cy = A / 2 + my * 24
      const forca = Math.min(Math.abs(velocidade), 3)

      /* Entrada: este campo chega ABAIXO da velocidade do campo de dentro
         do cérebro e vai ganhando ritmo até `RITMO_APOS`.

         Sem isto ele assume voando. Medido: rolando, este campo avança
         ~3,1 de profundidade por segundo contra ~0,62 do núcleo — cinco
         vezes mais rápido. O salto de velocidade no instante da troca
         quebra a continuidade mesmo com tamanho, cor, alfa, densidade e
         direção todos casados, porque velocidade também é um eixo.

         O alvo não é uma fração calibrada, é a taxa que o núcleo publica
         (`mergulho.taxaVoo`). Os dois medem velocidade em unidades
         diferentes — aqui delta de rolagem em pixels, lá progresso de um
         pin de 4 telas —, então nenhuma constante casaria os dois; só a
         taxa resolvida casa. E assim o casamento sobrevive a mudanças de
         calibragem de qualquer um dos lados.

         A taxa de lá é proporcional à profundidade (`dz/dt = -z · taxa`),
         então entra multiplicada por uma profundidade representativa para
         virar uma taxa absoluta como a daqui.

         `mergulho.v` vale 1 depois que o pin termina, então da hero para
         baixo o campo roda no ritmo pleno de sempre. Antes dela ele está
         escondido atrás do cérebro. E se a hero não existir na página, `v`
         fica em 0 e o ganho não se aplica — sem ela não há travessia para
         costurar, e o campo não deve ficar preso a uma taxa que ninguém
         está publicando. */
      const entrada = progresso(mergulho.v, REVELA_EM, 1)
      const taxaPropria = DERIVA_Z + Math.abs(velocidade) * 0.55
      const taxaDoNucleo = Z_REPRESENTATIVA * mergulho.taxaVoo * FRACAO_ENTRADA
      const taxaDepois = taxaPropria * RITMO_APOS
      const ganhoEntrada =
        mergulho.v <= 0
          ? 1
          : (taxaDoNucleo + (taxaDepois - taxaDoNucleo) * suave(entrada)) / taxaPropria

      if (modo === 'radial') {
        const avanco = (DERIVA_R + velocidade * 0.9) * dt
        for (const p of pts) {
          p.z -= avanco
          if (p.z < Z_MIN_R) nascerRadial(p, 1)
          else if (p.z > 1) nascerRadial(p, Z_MIN_R + 0.02)
          const sx = cx + (p.x / p.z) * escala
          const sy = cy + (p.y / p.z) * escala
          /* NÃO trocar por `raioDoGrao`/`alfaDoGrao`. Estas constantes
             (1,7 · 0,28 · 0,55 · 0,12) são diferentes das do ramo vertical
             de propósito, e este ramo está morto — `MODO_POEIRA` é
             'vertical'. Unificá-las seria mudança de comportamento
             disfarçada de refatoração, e destruiria a prova de que a
             extração para lib/grao.ts não mexeu no campo que está no ar. */
          const r = Math.min(5, Math.max(0.5, (1.7 / p.z) * 0.42))
          const base = (0.28 + 0.55 * (1 - p.z)) * p.brilho * (1 + forca * 0.12)
          const { cor, a } = regime(p, sx, sy, segundos, base)
          pinta(p, sx, sy, r, cor, a, forca)
        }
      } else {
        camY += ((DERIVA_V + velocidade * 0.35) * A * dt * ganhoEntrada) / escala
        /* Avanço sempre para a frente, com o scroll acelerando a viagem
           em vez de invertê-la: rolar para cima ou para baixo muda para
           onde a câmera aponta, não o sentido do voo. */
        const avancoZ = (DERIVA_Z + Math.abs(velocidade) * 0.55) * dt * ganhoEntrada
        for (const p of pts) {
          p.z -= avancoZ
          if (p.z < Z_MIN_V) {
            nascerVertical(p, null, 1)
            continue
          }
          const sx = cx + (p.x / p.z) * escala
          const sy = cy + ((p.y - camY) / p.z) * escala
          if (sy < -MARGEM) {
            nascerVertical(p, A + MARGEM * 0.5, null)
            continue
          }
          if (sy > A + MARGEM) {
            nascerVertical(p, -MARGEM * 0.5, null)
            continue
          }
          if (sx < -MARGEM * 2 || sx > L + MARGEM * 2) {
            nascerVertical(p, null, 1)
            continue
          }
          /* Teto no raio (dentro de `raioDoGrao`): sem ele o grão mais
             próximo chegava a dezenas de px e virava bolha. A variação
             continua ampla o bastante para ler profundidade. */
          const r = raioDoGrao(p.z)
          /* Some ao nascer no fundo e ao passar rente à câmera — sem as
             duas bordas o grão pisca ao entrar e ao sair.
             `entrada` fica aqui: só faz sentido onde há reciclagem, e o
             núcleo da hero não recicla nada. `saida` foi para o módulo
             porque o núcleo herda esta faixa de profundidade e precisa do
             mesmo apagamento — sem ele os grãos dele ficariam parados no
             tamanho máximo, que é coisa que este campo nunca mostra. */
          const entrada = fadeNascimento(p.z)
          const saida = fadeProximo(p.z)
          const base =
            alfaDoGrao(p.z, p.brilho) * (1 + forca * 0.1) * entrada * saida
          const { cor, a } = regime(p, sx, sy, segundos, base)
          pinta(p, sx, sy, r, cor, a, forca)
        }
      }
    }

    function aoRolar() {
      const d = window.scrollY - scrollAnterior
      scrollAnterior = window.scrollY
      velocidade += Math.max(-2.2, Math.min(2.2, d / 90))
    }
    function aoMover(e: PointerEvent) {
      mAlvo.x = (e.clientX / window.innerWidth - 0.5) * 2
      mAlvo.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    function aoRedimensionar() {
      medir()
      mapearSecoes()
      medirZonas()
      semear()
    }
    function aoTrocarVisibilidade() {
      visivel = !document.hidden
    }

    medir()
    mapearSecoes()
    medirZonas()
    semear()
    window.addEventListener('resize', aoRedimensionar)
    window.addEventListener('scroll', aoRolar, { passive: true })
    if (!toque) window.addEventListener('pointermove', aoMover, { passive: true })
    document.addEventListener('visibilitychange', aoTrocarVisibilidade)
    raf = requestAnimationFrame(quadro)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', aoRedimensionar)
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('pointermove', aoMover)
      document.removeEventListener('visibilitychange', aoTrocarVisibilidade)
    }
  }, [])

  return <canvas id="poeira" ref={ref} aria-hidden="true" />
}
