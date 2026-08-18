'use client'

import { useEffect } from 'react'
import { duracaoDoSalto, suavizaSalto } from '@/lib/ancora'

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

    const cancela = () => {
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
      const teto = Math.max(0, raiz.scrollHeight - window.innerHeight)
      const inicio = window.scrollY
      const fim = Math.min(teto, Math.max(0, destino.getBoundingClientRect().top + inicio - margem))
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
