'use client'

import { useRef } from 'react'
import { LANDING } from '@/content/landing'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

export function ApproachSection() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = root.current
      if (!section || prefersReducedMotion()) return

      const media = gsap.matchMedia()

      media.add('(min-width: 1024px)', () => {
        gsap.from('.approach-kicker, .approach-title, .approach-description', {
          autoAlpha: 0,
          y: 28,
          filter: 'blur(8px)',
          stagger: 0.1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%' },
        })

        gsap.fromTo(
          '.approach-ribbon__path',
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top 75%', end: 'top top', scrub: true },
          },
        )

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * 1.15}`,
            scrub: true,
            pin: true,
            pinSpacing: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })

        timeline
          .to('.approach-copy', { xPercent: -34, yPercent: -8, ease: 'power2.inOut', duration: 0.55 }, 0)
          .to('.approach-title', { scale: 1.12, transformOrigin: 'left center', ease: 'power2.inOut', duration: 0.55 }, 0)
          .fromTo('.approach-foot', { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 0.28 }, 0.56)
      })

      media.add('(max-width: 1023px)', () => {
        gsap.from('.approach-kicker, .approach-title, .approach-description, .approach-foot', {
          autoAlpha: 0,
          y: 22,
          stagger: 0.1,
          duration: 0.72,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 78%' },
        })
      })

      return () => media.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="video" className="approach" aria-labelledby="approach-title">
      <svg className="approach-ribbon" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="approach-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#4500f9" stopOpacity="0" />
            <stop offset="0.45" stopColor="#8e47fb" stopOpacity="0.7" />
            <stop offset="1" stopColor="#cd82ff" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path className="approach-ribbon__path" pathLength="1" d="M-80 760 C 220 700 280 470 530 520 C 780 570 760 260 1010 240 C 1230 220 1320 90 1510 120" />
      </svg>

      <div className="approach-stage">
        <div className="approach-copy">
          <p className="tag approach-kicker">{LANDING.video.eyebrow}</p>
          <h2 className="approach-title" id="approach-title">{LANDING.video.title}</h2>
          <p className="approach-description">{LANDING.video.description}</p>
        </div>

        <div className="approach-foot">
          <p>{LANDING.video.caption}</p>
          <a className="ghost" href="#oferta">
            {LANDING.video.cta}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}
