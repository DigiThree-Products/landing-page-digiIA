'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'
import { guardaRolagem } from '@/lib/rolagem'

/**
 * A rolagem suave do site inteiro.
 *
 * Não desenha nada e não embrulha nada: monta ao lado do conteúdo em
 * `app/layout.tsx` e age sobre o documento. Por isso vale nas três rotas —
 * a landing e as duas páginas legais — sem nenhuma delas saber que existe.
 *
 * ---- UM RELÓGIO SÓ, e é por isso que `autoRaf` está desligado ----
 *
 * O Lenis sabe correr sozinho, num `requestAnimationFrame` próprio. Não
 * pode: o ScrollTrigger já tem o dele, e as seis estações leem a posição
 * de rolagem a cada quadro para escrever `--chegada`. Com dois relógios
 * independentes, a leitura da estação cai entre duas escritas do Lenis e a
 * chegada anda um quadro atrás da tela — o sintoma é a estação "nadando",
 * pior justamente onde há pin.
 *
 * `gsap.ticker.add` põe os dois no MESMO quadro, e nessa ordem: o Lenis
 * escreve a posição, o `scroll` dispara, o ScrollTrigger recalcula. Um
 * quadro, uma verdade.
 *
 * ---- `lagSmoothing(0)` NÃO É DETALHE ----
 *
 * O GSAP, por padrão, DESCARTA o tempo perdido quando um quadro demora mais
 * de 500ms (aba em segundo plano, um `build` roubando a CPU): ele finge que
 * passaram 33ms para que animações por tempo não pulem. Aqui a animação não
 * é por tempo — é a posição real da rolagem. Mentir sobre o relógio faria o
 * Lenis calcular o quanto avançar com um delta falso, e o salto apareceria
 * na tela como um tranco ao voltar para a aba. Zero desliga a compensação.
 *
 * A limpeza devolve 500/33, o padrão do GSAP, porque o ticker é global e
 * sobrevive a este componente.
 *
 * ---- MOVIMENTO REDUZIDO: NEM CHEGA A EXISTIR ----
 *
 * A guarda de `styles/responsive.css` é CSS e não alcança isto — ela zera
 * animações e devolve `scroll-behavior: auto`, mas nada em CSS desliga um
 * sequestrador de rolagem escrito em JavaScript. Quem pede movimento
 * reduzido pede sobretudo que a ROLAGEM não seja reinterpretada, então a
 * instância não é criada, `rolagem()` devolve `null`, e tudo que depende
 * dela cai no caminho nativo.
 *
 * Lido uma vez, na montagem: trocar a preferência no meio da sessão exige
 * recarregar. É o mesmo contrato que `Estacoes.tsx` já pratica, e o caso
 * real (mudar a configuração do sistema com o site aberto) não paga um
 * observador.
 *
 * ---- O `scroll-behavior: smooth` DO CSS TEM DE CALAR ----
 *
 * `styles/base.css` declara `scroll-behavior: smooth` no `html`, e a nota
 * de `AncoraSuave` explica por que ele fica: sem JavaScript, ele É o
 * comportamento. Com o Lenis vivo os dois brigam — cada posição que o
 * Lenis escreve viraria, ela própria, uma animação nativa por cima. Então
 * ele é silenciado inline enquanto esta instância existe e devolvido na
 * limpeza com `removeProperty`, para a regra da folha voltar a valer com o
 * valor que ela tiver no futuro, e não congelada no de hoje.
 */
export function RolagemSuave() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const raiz = document.documentElement
    raiz.style.scrollBehavior = 'auto'

    const lenis = new Lenis({ autoRaf: false })
    guardaRolagem(lenis)

    const atualiza = () => ScrollTrigger.update()
    lenis.on('scroll', atualiza)

    const quadro = (tempo: number) => lenis.raf(tempo * 1000)
    gsap.ticker.add(quadro)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(quadro)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.off('scroll', atualiza)
      lenis.destroy()
      guardaRolagem(null)
      raiz.style.removeProperty('scroll-behavior')
    }
  }, [])

  return null
}
