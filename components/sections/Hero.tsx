'use client'

import { useRef } from 'react'
import { Countdown } from '@/components/waitlist/Countdown'
import { HeroObject } from '@/components/sections/HeroObject'
import { LANDING } from '@/content/landing'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = root.current
      if (!section || prefersReducedMotion()) return

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro.from('.hero-reveal', { autoAlpha: 0, y: 22, filter: 'blur(7px)', duration: 0.78, stagger: 0.1 })
      intro.from('.hero-obj', { autoAlpha: 0, x: 38, scale: 0.96, duration: 1, ease: 'power4.out' }, 0.18)

      gsap.fromTo(
        '.hero-ribbon__path',
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', delay: 0.15 },
      )

      const media = gsap.matchMedia()
      media.add('(min-width: 981px)', () => {
        gsap.to('.hero-obj', {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
        })
      })

      return () => media.revert()
    },
    { scope: root },
  )

  return (
    <header ref={root} className="hero" id="cadastro">
      <svg className="hero-ribbon" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hero-line-gradient" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cd82ff" stopOpacity="0.08" />
            <stop offset="0.5" stopColor="#8e47fb" stopOpacity="0.5" />
            <stop offset="1" stopColor="#4500f9" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path className="hero-ribbon__path" pathLength="1" d="M1510 80 C 1240 110 1250 350 1040 400 C 820 452 830 650 610 700 C 360 758 230 610 -80 790" />
      </svg>

      <div className="hero-grid">
        <div className="hero-col">
          <p className="tag hero-reveal">{LANDING.hero.eyebrow}</p>

          <h1 className="hero-reveal">
            <span className="hero-title-line">{LANDING.hero.title}</span>
            <span className="glow hero-title-line">{LANDING.hero.highlight}</span>
          </h1>

          <p className="sub hero-reveal">
            {LANDING.hero.description} <span className="offer">{LANDING.hero.offer}</span>
          </p>

          <div className="meter hero-countdown hero-reveal">
            <div>
              <p className="tag">{LANDING.hero.countdownLabel}</p>
              <Countdown />
            </div>
          </div>
          <div className="hero-actions hero-reveal">
            <a className="hero-cta" href="#oferta">
              <span>{LANDING.hero.cta}</span>
              <span className="hero-cta__arrow" aria-hidden="true">↓</span>
            </a>
          </div>



        </div>

        <div className="hero-visual">
          <HeroObject />
        </div>
      </div>


    </header>
  )
}
