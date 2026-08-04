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
            end: () => `+=${window.innerHeight * 1.38}`,
            scrub: true,
            pin: true,
            pinSpacing: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })

        timeline
          .fromTo(
            '.approach-media',
            { autoAlpha: 0, xPercent: -8 },
            { autoAlpha: 1, xPercent: 0, ease: 'power2.out', duration: 0.68 },
            0,
          )
          .fromTo(
            '.approach-media__surface',
            { clipPath: 'inset(0 100% 0 0 round 28px)', scale: 0.94 },
            { clipPath: 'inset(0 0% 0 0 round 28px)', scale: 1, ease: 'power3.inOut', duration: 0.82 },
            0,
          )
          .fromTo(
            '.approach-media__chrome',
            { autoAlpha: 0 },
            { autoAlpha: 1, ease: 'power2.out', duration: 0.24 },
            0.52,
          )
          .fromTo(
            '.approach-copy',
            { xPercent: 8 },
            { xPercent: 0, ease: 'power2.inOut', duration: 0.68 },
            0,
          )
      })

      media.add('(max-width: 1023px)', () => {
        gsap.fromTo(
          '.approach-media__surface',
          { clipPath: 'inset(0 100% 0 0 round 22px)', scale: 0.96 },
          {
            clipPath: 'inset(0 0% 0 0 round 22px)',
            scale: 1,
            duration: 1.05,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: '.approach-media', start: 'top 84%' },
          },
        )

        gsap.from('.approach-kicker, .approach-title, .approach-description', {
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
        <div className="approach-layout">
          <div className="approach-media" role="img" aria-label="Espaço reservado para o vídeo de demonstração da Digi.IA">
            <div className="approach-media__surface">
              <div className="approach-media__chrome" aria-hidden="true">
                <span className="approach-media__dots"><i /><i /><i /></span>
                <span className="approach-media__time">00:00</span>
                <span className="approach-media__play">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M9 7.6v8.8L16 12 9 7.6Z" />
                  </svg>
                </span>
                <span className="approach-media__progress"><i /></span>
              </div>
            </div>
          </div>

          <div className="approach-copy">
            <p className="tag approach-kicker">{LANDING.video.eyebrow}</p>
            <h2 className="approach-title" id="approach-title">
              <span className="approach-title__line">{LANDING.video.title}</span>
              <span className="approach-title__line">{LANDING.video.titleLineTwo}</span>
              <span className="approach-title__line">
                <em className="approach-title__accent">{LANDING.video.titleAccent}</em>
              </span>
            </h2>
            <p className="approach-description">{LANDING.video.description}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
