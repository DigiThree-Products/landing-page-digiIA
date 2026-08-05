'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { LANDING } from '@/content/landing'
import { useActiveSection } from '@/hooks/useActiveSection'
import { MobileNav } from './MobileNav'

const LINKS = [
  { id: 'video', label: 'Funciona' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'demo', label: 'Demo' },
  { id: 'oferta', label: 'Oferta' },
  { id: 'faq', label: 'FAQ' },
] as const

const IDS = ['cadastro', ...LINKS.map((link) => link.id)] as const

export function Nav() {
  const [expanded, setExpanded] = useState(false)
  const active = useActiveSection(IDS)

  useEffect(() => {
    const update = () => setExpanded(window.scrollY > 40)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <>
      <header className="site-header">
        <nav className={`site-nav${expanded ? ' site-nav--expanded' : ''}`} aria-label="Navegação principal">
          <a className="brand" href="#cadastro" aria-label="Digi.IA — ir para o início">
            <Image className="logo" src="/assets/logo.png" alt="Digi.IA" width={427} height={149} priority />
            <span className="by site-nav__by">{LANDING.nav.byline}</span>
          </a>

          <div className="site-nav__links" aria-hidden={!expanded}>
            {LINKS.map((link) => (
              <a key={link.id} href={`#${link.id}`} aria-current={active === link.id ? 'page' : undefined} tabIndex={expanded ? undefined : -1}>
                {link.label}
              </a>
            ))}
          </div>

          <a className="site-nav__cta" href="#oferta">
            <span>Entrar na lista</span>
            <span aria-hidden="true">→</span>
          </a>
        </nav>
      </header>
      <MobileNav />
    </>
  )
}
