'use client'

import { useEffect, useRef } from 'react'

/**
 * O objeto da hero — um cérebro sustentado por uma mão robótica, em duas
 * camadas empilhadas. O cursor inclina a cena de leve. É deleite: nenhuma
 * informação da página depende disso, por isso o conjunto inteiro é um
 * único role="img" com um rótulo só, não um controle focável. Com
 * prefers-reduced-motion nada disso roda.
 */
export function HeroObject() {
  const palcoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const palco = palcoRef.current
    if (!palco) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cerebro = palco.querySelector<HTMLElement>('[data-camada="cerebro"]')
    const cerebroDetalhe = palco.querySelector<HTMLElement>('[data-camada="cerebro-detalhe"]')
    const mao = palco.querySelector<HTMLElement>('[data-camada="mao"]')
    if (!cerebro || !mao) return

    let par = { x: 0, y: 0 } // paralaxe: -1 a 1 em cada eixo

    function aplicar() {
      const t = `translate3d(${par.x * 16}px, ${par.y * 12}px, 0)`
      cerebro!.style.transform = t
      // Mesma paralaxe do cérebro: são a mesma forma, só trocam de nitidez
      // no mergulho — sem isso, a camada de detalhe "descola" da outra.
      if (cerebroDetalhe) cerebroDetalhe.style.transform = t
      mao!.style.transform = `translate3d(${par.x * -6}px, ${par.y * -4}px, 0)`
    }

    // A inclinação é só do mouse: no toque ela brigaria com o scroll.
    function aoMover(ev: PointerEvent) {
      if (ev.pointerType !== 'mouse') return
      const r = palco!.getBoundingClientRect()
      par = {
        x: ((ev.clientX - r.left) / r.width - 0.5) * 2,
        y: ((ev.clientY - r.top) / r.height - 0.5) * 2,
      }
      aplicar()
    }

    function aoSair() {
      par = { x: 0, y: 0 }
      aplicar()
    }

    palco.addEventListener('pointermove', aoMover)
    palco.addEventListener('pointerleave', aoSair)

    return () => {
      palco.removeEventListener('pointermove', aoMover)
      palco.removeEventListener('pointerleave', aoSair)
    }
  }, [])

  return (
    <div className="hero-obj">
      <div
        ref={palcoRef}
        className="palco"
        role="img"
        aria-label="Uma mão robótica sustenta um cérebro luminoso, atravessado por trilhas de circuito."
      >
        <img
          className="camada camada--fundo"
          data-camada="fundo"
          src="/assets/hero/fundo.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          width={1600}
          height={1195}
          decoding="async"
        />
        <img
          className="camada camada--mao"
          data-camada="mao"
          src="/assets/hero/mao.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          width={1600}
          height={1195}
          decoding="async"
        />
        <img
          className="camada camada--cerebro"
          data-camada="cerebro"
          src="/assets/hero/cerebro.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          width={1600}
          height={1195}
          decoding="async"
        />
        {/* Mesma imagem, em resolução bem maior — só entra quando o
            mergulho já escalou o palco o bastante pra expor a diferença.
            Fica invisível (opacity 0) e fora do fluxo de carregamento
            crítico até lá; ver o crossfade em Hero.tsx. */}
        <img
          className="camada camada--cerebro-detalhe"
          data-camada="cerebro-detalhe"
          src="/assets/hero/cerebro-detalhe.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          width={4800}
          height={3585}
          decoding="async"
          loading="lazy"
        />
      </div>
    </div>
  )
}
