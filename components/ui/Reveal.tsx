'use client'

import { useEffect, useRef, type ReactNode } from 'react'

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

    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          entrada.target.classList.add('in')
          io.unobserve(entrada.target)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`rv ${className}`.trim()}>
      {children}
    </div>
  )
}
