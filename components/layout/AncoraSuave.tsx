'use client'

import { useEffect } from 'react'
import { duracaoDoSalto, suavizaSalto } from '@/lib/ancora'
import { rolagem } from '@/lib/rolagem'

/**
 * Todo salto de âncora da página, com prazo.
 *
 * O navegador já faz isto sozinho por causa de `scroll-behavior: smooth`
 * (styles/base.css) — e é justamente o que precisava ser substituído. O
 * smooth nativo tira a duração da DISTÂNCIA, sem teto, então numa página
 * alta o clique vira espera: medido, "Garanta sua vaga" deixava a página
 * 2,34s imóvel antes de o primeiro pixel andar. Ver `lib/ancora.ts`.
 *
 * Um listener só, no documento, em vez de um por link: os links do menu, do
 * dock mobile, do "pular para a oferta" e os dois CTAs da hero são todos
 * âncoras da própria página, e nenhum deles precisa saber que isto existe.
 * Vale para o que for acrescentado depois pelo mesmo motivo.
 *
 * O CSS continua no lugar de propósito: sem JavaScript ele é o
 * comportamento, e lento é melhor que seco. Ele só é neutralizado enquanto
 * este componente está animando, porque os dois brigariam — cada `scrollTo`
 * de quadro viraria uma animação nativa própria.
 *
 * ---- DOIS MOTORES, UM CÁLCULO ----
 *
 * Desde que `RolagemSuave` existe, o salto tem dois caminhos: com o Lenis
 * no ar quem anima é ele, e sem Lenis (movimento reduzido, ou o efeito
 * ainda não montou) continua o laço de `requestAnimationFrame` daqui.
 *
 * O QUE NÃO SE DUPLICA é a conta do alvo. Tudo que está abaixo — a
 * `scroll-margin-top`, a medição pelo `.pin-spacer`, o teto do documento —
 * vale nos dois casos e é a parte difícil. `lenis.scrollTo(elemento)`
 * pareceria substituir este arquivo inteiro e reintroduziria o bug do
 * y=2340 no primeiro clique depois de visitar uma estação, porque mediria
 * o rect da seção presa. Passamos a ele o NÚMERO, não o elemento.
 *
 * O foco, o `pushState` e as guardas de link também não têm equivalente em
 * biblioteca de rolagem: são de navegação e de teclado, não de animação.
 */
export function AncoraSuave() {
  useEffect(() => {
    const raiz = document.documentElement
    let animacao = 0

    const reduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* Devolve o smooth do CSS. `removeProperty` e não `= 'smooth'`: a regra
       mora na folha de estilo, e reescrevê-la inline aqui a congelaria com
       o valor de hoje. */
    const devolveOSmooth = () => raiz.style.removeProperty('scroll-behavior')

    /* Como interromper um salto que NÃO é nosso. Com o Lenis vivo quem
       anima é ele, então cancelar é pedir que pare onde está — `immediate`
       porque o gesto do usuário já está em curso e um freio animado se
       somaria a ele. Fica `null` quando não há salto em voo, e é isso que
       impede `cancela` de brigar com a rolagem normal a cada quadro de
       roda. */
    let paraOLenis: (() => void) | null = null

    const cancela = () => {
      if (paraOLenis) {
        paraOLenis()
        paraOLenis = null
      }
      if (!animacao) return
      cancelAnimationFrame(animacao)
      animacao = 0
      devolveOSmooth()
    }

    /* Âncora move o FOCO, não só a rolagem — sem isto o teclado continua
       tabulando do topo depois de o "pular para a oferta" já ter levado a
       tela até lá, que é a falha clássica de skip link. O `tabindex` é
       emprestado e devolvido no blur para não deixar a seção tabulável para
       sempre. */
    const focaDestino = (destino: HTMLElement) => {
      if (!destino.hasAttribute('tabindex')) {
        destino.setAttribute('tabindex', '-1')
        destino.addEventListener('blur', () => destino.removeAttribute('tabindex'), { once: true })
      }
      destino.focus({ preventScroll: true })
    }

    const vaiPara = (destino: HTMLElement, hash: string) => {
      cancela()

      /* `scroll-margin-top` é do destino e vale 78px nas seções âncora
         (styles/shell.css) — a altura do cabeçalho fixo. Ignorá-lo
         encostaria o topo da seção embaixo do menu. */
      const margem = Number.parseFloat(getComputedStyle(destino).scrollMarginTop) || 0

      /* A CAIXA que mede a posição não é sempre o destino — mesma razão de
         `caudaAcima` em Estacoes.tsx. `#cadastro` (a hero) e as estações
         (`#video`, `#recursos`, `#como-funciona`, `#faq`) são presas por scroll, e o
         GSAP aplica ao elemento pinado um `transform: translateY(...)` do
         tamanho do próprio pin assim que ele é solto — é o que o mantém no
         lugar certo do fluxo depois de a rolagem passar por cima dele.

         `getBoundingClientRect()` do destino inclui esse transform, e uma
         vez que o pin já foi visitado ele fica ali — não reseta com a
         rolagem. Medido: clicar na logo depois de rolar até o FAQ mandava
         para y=2340, não para y=0 — exatamente o FIM do pin da hero
         (TOTAL × vh), o instante em que o cérebro termina de crescer e a
         hero já está com opacidade 0. "Ir para o início" virava "ir para
         onde o mergulho acaba".

         O `.pin-spacer` que o GSAP insere é quem sobra: um placeholder
         comum no fluxo do documento, nunca transformado, sempre na
         posição verdadeira de chegada da seção. Medir por ele é o mesmo
         truque que `caudaAcima` já usa para as mesmas seções, pelo mesmo
         motivo — e por isso ele já existe em toda estação, sem custo
         adicional aqui. Alvos sem pin (`#oferta`) não têm `.pin-spacer`
         ancestral, e o `?? destino` cai de volta no comportamento de
         sempre. */
      const caixa = destino.closest<HTMLElement>('.pin-spacer') ?? destino

      const teto = Math.max(0, raiz.scrollHeight - window.innerHeight)
      const inicio = window.scrollY
      const fim = Math.min(teto, Math.max(0, caixa.getBoundingClientRect().top + inicio - margem))
      const distancia = fim - inicio

      const encerra = () => {
        /* `pushState` e não `location.hash`: o segundo reposicionaria a
           página no destino que acabamos de alcançar, desfazendo o pouso
           suave no último quadro. */
        window.history.pushState(null, '', hash)
        focaDestino(destino)
      }

      if (Math.abs(distancia) < 2 || reduzido()) {
        window.scrollTo(0, fim)
        encerra()
        return
      }

      const duracao = duracaoDoSalto(distancia)

      /* COM O LENIS, ele anima e nós só dizemos para onde.

         O alvo continua sendo calculado aqui, e é esse o ponto: passar o
         ELEMENTO para `lenis.scrollTo` faria o Lenis medir o rect do
         destino — que mente em seção presa, pelo translateY do pin, e é
         exatamente o bug do y=2340 descrito acima. O número já resolvido
         pelo `.pin-spacer` não tem esse problema.

         `duration` do Lenis é em SEGUNDOS; `duracaoDoSalto` devolve ms. E
         `suavizaSalto` já é uma curva t→progresso clampada nas duas pontas,
         então entra como `easing` sem adaptação nenhuma — o salto tem a
         mesma cara de antes, com outro motor por baixo.

         `scroll-behavior` NÃO é tocado neste caminho: `RolagemSuave` já o
         silenciou enquanto o Lenis existe, e mexer aqui desfaria isso para
         a página inteira. */
      const suave = rolagem()
      if (suave) {
        paraOLenis = () => suave.scrollTo(suave.animatedScroll, { immediate: true })
        suave.scrollTo(fim, {
          duration: duracao / 1000,
          easing: suavizaSalto,
          onComplete: () => {
            paraOLenis = null
            encerra()
          },
        })
        return
      }

      const partiu = performance.now()
      raiz.style.scrollBehavior = 'auto'

      const quadro = (agora: number) => {
        const t = (agora - partiu) / duracao
        window.scrollTo(0, inicio + distancia * suavizaSalto(t))
        if (t < 1) {
          animacao = requestAnimationFrame(quadro)
          return
        }
        animacao = 0
        devolveOSmooth()
        encerra()
      }
      animacao = requestAnimationFrame(quadro)
    }

    const aoClicar = (evento: MouseEvent) => {
      if (evento.defaultPrevented || evento.button !== 0) return
      /* Ctrl/Cmd/Shift/Alt são intenções de abrir noutro lugar — o
         navegador cuida delas melhor do que nós. */
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return

      const alvo = evento.target
      const link = alvo instanceof Element ? alvo.closest('a[href]') : null
      if (!(link instanceof HTMLAnchorElement)) return
      if (link.target && link.target !== '_self') return
      if (link.hasAttribute('download')) return
      /* Âncora da PÁGINA ATUAL. Um `href` para outra rota que por acaso
         termine em `#algo` é navegação de verdade e não nos diz respeito. */
      if (link.host !== window.location.host || link.pathname !== window.location.pathname) return

      const id = decodeURIComponent(link.hash.slice(1))
      if (!id) return
      /* `getElementById` e não `querySelector`: um id que comece com dígito
         é HTML válido e seletor inválido, e derrubaria o handler. */
      const destino = document.getElementById(id)
      if (!destino) return

      evento.preventDefault()
      vaiPara(destino, link.hash)
    }

    /* Qualquer gesto de rolagem durante o salto devolve o controle na hora.
       Continuar animando por cima da roda do usuário é a forma mais rápida
       de fazer uma página parecer travada. */
    const aoIntervir = () => cancela()

    document.addEventListener('click', aoClicar)
    window.addEventListener('wheel', aoIntervir, { passive: true })
    window.addEventListener('touchstart', aoIntervir, { passive: true })
    window.addEventListener('keydown', aoIntervir)

    return () => {
      cancela()
      document.removeEventListener('click', aoClicar)
      window.removeEventListener('wheel', aoIntervir)
      window.removeEventListener('touchstart', aoIntervir)
      window.removeEventListener('keydown', aoIntervir)
    }
  }, [])

  return null
}
