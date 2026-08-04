'use client'

import { Fragment, useEffect, useState } from 'react'
import { PRODUCT_CONFIG } from '@/config/product'

const UNITS = [{ key: 'd', label: 'dias' }, { key: 'h', label: 'horas' }, { key: 'm', label: 'min' }, { key: 's', label: 'seg' }] as const
type Remaining = Record<(typeof UNITS)[number]['key'], string>
const ZERO: Remaining = { d: '00', h: '00', m: '00', s: '00' }

function calculate(target: number): Remaining {
  const seconds = Math.floor(Math.max(0, target - Date.now()) / 1000)
  const pad = (value: number) => String(value).padStart(2, '0')
  return { d: pad(Math.floor(seconds / 86400)), h: pad(Math.floor((seconds % 86400) / 3600)), m: pad(Math.floor((seconds % 3600) / 60)), s: pad(seconds % 60) }
}

export function Countdown() {
  const [remaining, setRemaining] = useState<Remaining>(ZERO)
  useEffect(() => {
    const target = new Date(PRODUCT_CONFIG.launchAt).getTime()
    const tick = () => setRemaining(calculate(target))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])
  return <div className="count" aria-label="Contagem regressiva para o lançamento">{UNITS.map(({ key, label }, index) => <Fragment key={key}><div className="unit"><b key={remaining[key]} className="tick">{remaining[key]}</b><i>{label}</i></div>{index < UNITS.length - 1 ? <div className="sep">:</div> : null}</Fragment>)}</div>
}
