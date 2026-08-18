'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { ANGULO, paradaDoVioleta } from '@/lib/fecho'

/**
 * O fecho — o CTA e o rodapé como um campo pintado uma vez só.
 *
 * Declarar o mesmo `background` nos dois não produz continuidade: todo
 * gradiente é pintado a partir da caixa do próprio elemento, então seriam duas
 * cópias reiniciadas encostadas uma na outra. Aqui existe uma pintura só, e as
 * duas seções são janelas para ela.
 *
 * A medição é necessária, não preguiça: `conversion.css` dá ao `#oferta`
 * `min-height: 115svh` E recuos em `clamp()`, e a altura real é o conteúdo —
 * não existe expressão CSS que a reproduza. Daí o ResizeObserver.
 */
export function Fecho({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const envelope = ref.current
    if (!envelope) return
    const oferta = envelope.querySelector<HTMLElement>('#oferta')
    if (!oferta) return

    // O ângulo não muda; publicá-lo aqui é o que impede o CSS de guardar uma
    // segunda cópia do 125 que poderia divergir de lib/fecho.ts em silêncio.
    envelope.style.setProperty('--fecho-angulo', `${ANGULO}deg`)

    const medir = () => {
      const { width, height } = oferta.getBoundingClientRect()
      if (!width || !height) return
      envelope.style.setProperty('--oferta-h', `${height}px`)
      envelope.style.setProperty('--fecho-parada', `${paradaDoVioleta(width, height)}px`)
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(oferta)
    return () => observador.disconnect()
  }, [])

  return (
    <div className="fecho" ref={ref}>
      {children}
    </div>
  )
}
