'use client'

import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

type Props = {
  primaryText: string
  revealedText: string
  echoText: string
}

/**
 * Onde cada eco de "Garanta sua vaga" cai, em % do campo (que estoura a
 * caixa do título — ver .offer-reveal__campo).
 *
 * ESCRITO À MÃO, E ISSO É O PONTO. Um `Math.random` daria a mesma
 * aparência e quebraria a hidratação: servidor e cliente sorteariam
 * posições diferentes, e o erro só apareceria em produção. Com a lista
 * fixa, os dois lados geram a mesma marcação.
 *
 * O miolo está vazio de propósito — x entre 19% e 81% com y entre 22% e
 * 76% é onde mora o texto revelado. Eco ali vira ruído por cima da frase
 * que a lupa existe para mostrar.
 *
 * `forca` é opacidade E tamanho ao mesmo tempo: o que está mais fraco
 * também está menor, que é como a distância se parece.
 */
const ECOS = [
  { x: 6, y: 12, giro: -8, forca: 0.42 },
  { x: 22, y: 5, giro: 6, forca: 0.55 },
  { x: 41, y: 14, giro: -4, forca: 0.34 },
  { x: 59, y: 4, giro: 7, forca: 0.5 },
  { x: 77, y: 13, giro: -6, forca: 0.38 },
  { x: 93, y: 6, giro: 9, forca: 0.46 },

  { x: 10, y: 29, giro: -11, forca: 0.5 },
  { x: 4, y: 45, giro: 5, forca: 0.33 },
  { x: 12, y: 61, giro: -7, forca: 0.47 },
  { x: 5, y: 73, giro: 8, forca: 0.3 },

  { x: 89, y: 27, giro: 7, forca: 0.36 },
  { x: 96, y: 43, giro: -9, forca: 0.5 },
  { x: 87, y: 59, giro: 4, forca: 0.31 },
  { x: 95, y: 72, giro: -5, forca: 0.44 },

  { x: 9, y: 88, giro: 6, forca: 0.4 },
  { x: 27, y: 96, giro: -7, forca: 0.52 },
  { x: 45, y: 84, giro: 9, forca: 0.3 },
  { x: 63, y: 95, giro: -4, forca: 0.46 },
  { x: 80, y: 85, giro: 5, forca: 0.36 },
  { x: 95, y: 93, giro: -8, forca: 0.42 },
] as const

export function OfferCursorReveal({ primaryText, revealedText, echoText }: Props) {
  function trackPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const element = event.currentTarget
    const bounds = element.getBoundingClientRect()
    const x = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width)
    const y = Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height)

    element.style.setProperty('--offer-reveal-x', `${x}px`)
    element.style.setProperty('--offer-reveal-y', `${y}px`)
    element.dataset.active = 'true'
  }

  function hideLens(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.dataset.active = 'false'
  }

  return (
    <div
      className="offer-reveal"
      data-active="false"
      onPointerEnter={trackPointer}
      onPointerMove={trackPointer}
      onPointerLeave={hideLens}
      onPointerUp={hideLens}
      onPointerCancel={hideLens}
    >
      <div className="offer-reveal__stack">
        <h2 className="offer-reveal__text offer-reveal__text--primary">{primaryText}</h2>
        <div className="offer-reveal__mask" aria-hidden="true">
          {/* Dentro da máscara de propósito: o mesmo recorte circular que
              descobre o título descobre os ecos. Fora do vidro eles não
              existem — foi por aparecerem soltos na página que a primeira
              versão disto foi retirada. */}
          <div className="offer-reveal__campo">
            {ECOS.map((eco, index) => (
              <span
                key={index}
                className="offer-reveal__eco"
                style={{
                  '--eco-x': `${eco.x}%`,
                  '--eco-y': `${eco.y}%`,
                  '--eco-giro': `${eco.giro}deg`,
                  '--eco-forca': eco.forca,
                } as CSSProperties}
              >
                {echoText}
              </span>
            ))}
          </div>

          <p className="offer-reveal__text offer-reveal__text--revealed">{revealedText}</p>
        </div>
      </div>

      <span className="offer-reveal__lens" aria-hidden="true" />
      <p className="offer-reveal__accessible">Mensagem revelada: {revealedText}</p>
    </div>
  )
}
