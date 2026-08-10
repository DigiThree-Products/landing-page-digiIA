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

      /**
       * Mergulho no cérebro — a passagem da primeira seção para a segunda.
       *
       * A hero prende e o objeto cresce até engolir a tela. Quem escala é
       * o `.palco`, nunca as camadas: o `transform` do cérebro e da mão
       * pertence ao HeroObject (paralaxe do cursor e o gesto de segurar),
       * e disputar a mesma propriedade quebraria as duas coisas.
       *
       * A origem da escala fica no cérebro, não no centro do palco (ver
       * hero.css). É esse detalhe que faz a leitura ser "entrar nele": a
       * mão e o resto se abrem para fora da tela enquanto o cérebro
       * permanece no eixo, crescendo em cima de você. Com origem no
       * centro, o conjunto só ficaria maior — passaria perto, não através.
       */
      const media = gsap.matchMedia()
      media.add(
        { grande: '(min-width: 981px)', pequena: '(max-width: 980px)' },
        (contexto) => {
          const { grande } = contexto.conditions as { grande: boolean }

          /* Só na descida. O avanço é monotônico: acompanha a rolagem
             para baixo, congela se você voltar a subir e só volta ao
             início quando a hero é reconquistada por inteiro. Sem isso,
             `scrub` reproduziria o mergulho de ré — sair do cérebro de
             costas, que não é o que a passagem conta. */
          let avanco = 0
          const mergulho = gsap.timeline({ paused: true })

          /* O progresso não vem do gatilho, e sim deste valor animado com
             `scrub`. Motivo: o `onUpdate` do próprio ScrollTrigger não
             chega a rodar quando a rolagem volta ao zero — e como a hero
             é a primeira seção, o `start` cai justamente no zero e
             `onLeaveBack` também nunca dispara. Resultado: a hero voltava
             presa no fim do mergulho, sem o texto. O callback do tween,
             ao contrário, roda em todo passo do scrub, inclusive no
             último. */
          const passo = { v: 0 }
          gsap.to(passo, {
            v: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${window.innerHeight * 1.6}`,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              /* Amortecido, não colado. Com `true` a animação segue a
                 roda do mouse quadro a quadro e herda cada solavanco do
                 gesto; com um valor em segundos o GSAP persegue a
                 posição, e é isso que dá o deslize de câmera. */
              scrub: 1.1,
              invalidateOnRefresh: true,
            },
            onUpdate: () => {
              if (passo.v > avanco) {
                avanco = passo.v
                mergulho.progress(avanco)
              } else if (passo.v <= 0.002 && avanco > 0) {
                avanco = 0
                mergulho.progress(0)
              }
            },
          })

          /* Leva o CÉREBRO ao centro da tela, não o palco. Os fatores são
             os mesmos da `transform-origin` em hero.css: é o ponto que
             vai crescer, então é ele que precisa estar no eixo antes de
             o mergulho começar. Somar o deslocamento atual mantém a
             conta certa quando o GSAP reavalia em resize. */
          const desloca = (eixo: 'x' | 'y') => () => {
            const palco = section.querySelector<HTMLElement>('.palco')
            const obj = section.querySelector<HTMLElement>('.hero-obj')
            if (!palco || !obj) return 0
            const r = palco.getBoundingClientRect()
            const atual = Number(gsap.getProperty(obj, eixo)) || 0
            return eixo === 'x'
              ? atual + (window.innerWidth / 2 - (r.left + r.width * 0.54))
              : atual + (window.innerHeight / 2 - (r.top + r.height * 0.36))
          }

          mergulho
            /* Primeiro tempo: o texto sai pela esquerda e o objeto vem
               para o centro. Só depois o mergulho — aproximar com a
               manchete ainda na tela e o cérebro fora do eixo faria a
               passagem parecer um zoom torto, não uma entrada. */
            .to('.hero-col', { xPercent: -22, autoAlpha: 0, ease: 'power2.in', duration: 0.3 }, 0)
            .to('.hero-obj', { x: desloca('x'), y: desloca('y'), ease: 'power2.inOut', duration: 0.34 }, 0)
            // Segundo tempo: centrado e sozinho, agora sim ele cresce.
            .to('.palco', { scale: grande ? 12 : 8, ease: 'power2.in', duration: 0.66 }, 0.34)
            // Dissolve no fim: passar do ponto só mostraria pixel esticado.
            .to('.hero-obj', { autoAlpha: 0, ease: 'none', duration: 0.16 }, 0.84)
        },
      )

      return () => media.revert()
    },
    { scope: root },
  )

  return (
    <header ref={root} className="hero" id="cadastro">
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
