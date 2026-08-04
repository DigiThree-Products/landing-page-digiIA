'use client'

import { useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/ui/Reveal'
import { LANDING, type DemoScene } from '@/content/landing'

const espera = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function Demo() {
  const [digitado, setDigitado] = useState('')
  const [cena, setCena] = useState<DemoScene | null>(null)
  const alvo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = alvo.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDigitado(LANDING.demo.scenes[0].prompt)
      setCena(LANDING.demo.scenes[0])
      return
    }

    let alive = true
    const cycle = async () => {
      let index = 0
      while (alive) {
        const current = LANDING.demo.scenes[index]
        for (let character = 0; character < current.prompt.length && alive; character++) {
          setDigitado(current.prompt.slice(0, character + 1))
          await espera(26 + Math.random() * 34)
        }
        if (!alive) return
        await espera(420)
        setCena(current)
        await espera(4600)
        if (!alive) return
        for (let character = current.prompt.length; character > 0 && alive; character--) {
          setDigitado(current.prompt.slice(0, character - 1))
          await espera(11)
        }
        setCena(null)
        index = (index + 1) % LANDING.demo.scenes.length
      }
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        void cycle()
      }
    }, { threshold: 0.3 })
    observer.observe(element)
    return () => { alive = false; observer.disconnect() }
  }, [])

  return (
    <section>
      <Reveal><div className="sec-head"><p className="tag">{LANDING.demo.eyebrow}</p><h2>{LANDING.demo.title}</h2></div></Reveal>
      <Reveal className="demo">
        <div className="demo-bar"><span className="dot live" aria-hidden="true" /><span>{LANDING.demo.windowLabel}</span></div>
        <div className="demo-body">
          <div className="prompt-line"><span className="chev" aria-hidden="true">&rsaquo;</span><span><span>{digitado}</span><span className="caret" aria-hidden="true" /></span></div>
          <div className="out" ref={alvo} aria-live="off">
            {cena ? <><p className="tag">{cena.label}</p>{cena.items.map(([mark, text], index) => (
              <div className="out-item" key={mark + text} style={{ animationDelay: `${0.22 + index * 0.13}s` }}><em>{mark}</em><span>{text}</span></div>
            ))}</> : null}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
