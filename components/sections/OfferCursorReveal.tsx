'use client'

import type { PointerEvent as ReactPointerEvent } from 'react'

type Props = {
  primaryText: string
  revealedText: string
}

export function OfferCursorReveal({ primaryText, revealedText }: Props) {
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
          <p className="offer-reveal__text offer-reveal__text--revealed">{revealedText}</p>
        </div>
      </div>

      <span className="offer-reveal__lens" aria-hidden="true" />
      <p className="offer-reveal__accessible">Mensagem revelada: {revealedText}</p>
    </div>
  )
}
