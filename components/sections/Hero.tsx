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

          const mergulho = gsap.timeline({ paused: true })

          /* O pin segura além do fim original do mergulho (1,6 telas):
             o cérebro continua crescendo, em vez de parar, até bem perto
             de onde a próxima seção começa a chegar (mesma folga do
             ATRASO em Estacoes.tsx). FATOR comprime as durações do texto
             e da centralização para o novo total, mantendo os dois no
             mesmo ponto físico de antes — só o crescimento da escala é
             que se estica até o novo fim. */
          const SEGURA = 4.4
          const TOTAL = 1.6 + SEGURA
          const FATOR = 1.6 / TOTAL

          /* O progresso não vem do gatilho, e sim deste valor animado com
             `scrub`, espelhado 1:1 no timeline a cada atualização — sobe
             com a rolagem para baixo e desce (reverte o mergulho) com a
             rolagem para cima. O `<= 0.002` trava em zero exato perto do
             topo, para não sobrar um resíduo de arredondamento do pin. */
          const passo = { v: 0 }
          gsap.to(passo, {
            v: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${window.innerHeight * TOTAL}`,
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
              mergulho.progress(passo.v <= 0.002 ? 0 : passo.v)
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
            .to('.hero-col', { xPercent: -22, autoAlpha: 0, ease: 'power2.in', duration: 0.3 * FATOR }, 0)
            .to('.hero-obj', { x: desloca('x'), y: desloca('y'), ease: 'power2.inOut', duration: 0.34 * FATOR }, 0)
            // Segundo tempo: centrado e sozinho, agora sim ele cresce —
            // até o novo fim do pin, não só até o fim do mergulho antigo.
            // Sem dissolver no fim: a opacidade fica cheia até cobrir a tela.
            .to(
              '.palco',
              { scale: grande ? 44 : 30, ease: 'power2.in', duration: 1 - 0.34 * FATOR },
              0.34 * FATOR,
            )
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
            {LANDING.hero.description} <a className="offer" href="#oferta">{LANDING.hero.offer}</a>
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
