'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import { useActiveSection } from '@/hooks/useActiveSection'

const ITEMS = [
  { id: 'cadastro', label: 'Início', icon: <HomeIcon /> },
  { id: 'video', label: 'Funciona', icon: <SparkIcon /> },
  { id: 'recursos', label: 'Recursos', icon: <GridIcon /> },
  { id: 'demo', label: 'Demo', icon: <PlayIcon /> },
  { id: 'oferta', label: 'Oferta', icon: <ArrowIcon /> },
] as const

const IDS = ITEMS.map((item) => item.id)

export function MobileNav() {
  const active = useActiveSection(IDS)
  const maskId = useId()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const targets = [document.querySelector('#faq'), document.querySelector('footer')]
      .filter((target): target is Element => target instanceof Element)
    if (!targets.length) return

    const visible = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      })
      setHidden(visible.size > 0)
    }, {
      rootMargin: '0px 0px -8% 0px',
    })

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  const activeIndex = Math.max(0, ITEMS.findIndex((item) => item.id === active))
  const slot = 20
  const center = activeIndex * slot + slot / 2

  return (
    <nav className={`mobile-dock${hidden ? ' mobile-dock--hidden' : ''}`} aria-label="Navegação rápida">
      <div className="mobile-dock__shell">
        <svg className="mobile-dock__shape" viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <mask id={maskId}>
              <rect width="100" height="22" rx="11" fill="white" />
              <circle cx={center} cy="0" r="9" fill="black" />
            </mask>
          </defs>
          <rect width="100" height="22" rx="11" fill="var(--dock-bg)" mask={`url(#${maskId})`} />
        </svg>

        <span className="mobile-dock__active" style={{ left: `${center}%` }} aria-hidden="true">
          {ITEMS[activeIndex]?.icon}
        </span>

        <ul>
          {ITEMS.map((item) => {
            const selected = item.id === active
            return (
              <li key={item.id}>
                <a href={`#${item.id}`} aria-current={selected ? 'page' : undefined}>
                  <span className={selected ? 'mobile-dock__icon mobile-dock__icon--hidden' : 'mobile-dock__icon'}>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
}

function HomeIcon() {
  return <Icon><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></Icon>
}
function SparkIcon() {
  return <Icon><path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7Z" /><path d="m18 15 .9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9Z" /></Icon>
}
function GridIcon() {
  return <Icon><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Icon>
}
function PlayIcon() {
  return <Icon><circle cx="12" cy="12" r="9" /><path d="m10 8.5 6 3.5-6 3.5Z" /></Icon>
}
function ArrowIcon() {
  return <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
}
