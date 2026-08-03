'use client'

import { Fragment, useEffect, useState } from 'react'
import { CONFIG } from '@/lib/config'

const UNIDADES = [
  { chave: 'd', rotulo: 'dias' },
  { chave: 'h', rotulo: 'horas' },
  { chave: 'm', rotulo: 'min' },
  { chave: 's', rotulo: 'seg' },
] as const

type Restante = Record<(typeof UNIDADES)[number]['chave'], string>

const ZERADO: Restante = { d: '00', h: '00', m: '00', s: '00' }

function calcular(alvo: number): Restante {
  const falta = Math.max(0, alvo - Date.now())
  const seg = Math.floor(falta / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    d: pad(Math.floor(seg / 86400)),
    h: pad(Math.floor((seg % 86400) / 3600)),
    m: pad(Math.floor((seg % 3600) / 60)),
    s: pad(seg % 60),
  }
}

/**
 * Contagem regressiva para o lançamento.
 *
 * Começa zerada de propósito. O HTML é gerado no build, então qualquer valor
 * calculado ali estaria errado quando a pessoa abrisse a página — e o React
 * acusaria divergência na hidratação. Zerado no servidor, real no primeiro
 * quadro do cliente.
 */
export function Countdown() {
  const [restante, setRestante] = useState<Restante>(ZERADO)

  useEffect(() => {
    const alvo = new Date(CONFIG.DATA_LANCAMENTO).getTime()
    const tique = () => setRestante(calcular(alvo))
    tique()
    const id = setInterval(tique, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="count" aria-label="Contagem regressiva para o lançamento">
      {UNIDADES.map(({ chave, rotulo }, i) => (
        <Fragment key={chave}>
          <div className="unit">
            {/* key={valor} recria o nó a cada troca, o que reinicia a animação
                `tick`. É o equivalente ao `void offsetWidth` que o código
                original usava para o mesmo fim. */}
            <b key={restante[chave]} className="tick">
              {restante[chave]}
            </b>
            <i>{rotulo}</i>
          </div>
          {i < UNIDADES.length - 1 ? <div className="sep">:</div> : null}
        </Fragment>
      ))}
    </div>
  )
}
