'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { eixoDaRevelacao } from '@/lib/poeira'

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Aparição no scroll.
 *
 * Antes um único script varria `.rv` no documento inteiro depois do load. Aqui
 * cada bloco observa a si mesmo e para de observar assim que aparece — mesmo
 * efeito, sem depender de o script rodar depois da marcação existir.
 *
 * Com movimento reduzido, entra já visível: a animação é enfeite, o conteúdo
 * não pode depender dela.
 */
export function Reveal({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in')
      return
    }

    let frame = 0
    let revealed = false

    const reveal = () => {
      if (revealed) return
      revealed = true
      const [dx, dy] = eixoDaRevelacao(el)
      el.style.setProperty('--rv-dx', `${dx}px`)
      el.style.setProperty('--rv-dy', `${dy}px`)
      el.classList.add('in')
      observer.disconnect()
      window.removeEventListener('scroll', requestCheck)
    }

    const check = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      if (rect.top <= window.innerHeight * 0.92) reveal()
    }

    const requestCheck = () => {
      if (frame || revealed) return
      frame = window.requestAnimationFrame(check)
    }

    const observer = new IntersectionObserver(requestCheck, {
      threshold: 0,
      rootMargin: '0px 0px -8% 0px',
    })

    observer.observe(el)
    window.addEventListener('scroll', requestCheck, { passive: true })
    requestCheck()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', requestCheck)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={ref} className={`rv ${className}`.trim()}>
      {children}
    </div>
  )
}
