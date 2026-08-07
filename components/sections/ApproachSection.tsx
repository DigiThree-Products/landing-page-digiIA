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

        /* Sem pin: a seção agora é uma estação que se aproxima e passa
           (components/layout/Estacoes.tsx), e prender ela na tela
           brigaria com esse movimento. O desenho da mídia continua,
           disparado na entrada em vez de amarrado ao scroll. */
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 78%' },
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
