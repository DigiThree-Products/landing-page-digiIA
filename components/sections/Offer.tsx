import { OfferCursorReveal } from '@/components/sections/OfferCursorReveal'
import { OfferLupa } from '@/components/sections/OfferLupa'
import { WaitlistModalTrigger } from '@/components/waitlist/WaitlistModal'
import { Reveal } from '@/components/ui/Reveal'
import { LANDING } from '@/content/landing'

function ArrowRight() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" /></svg>
}

export function Offer() {
  return (
    <section id="oferta">
      {/* Primeiro filho de propósito: é uma camada de fundo, e vir antes
          mantém a ordem de pintura coerente com a de empilhamento. Não
          ocupa espaço no fluxo — ver a nota em OfferLupa.tsx. */}
      <OfferLupa />

      <div className="offer-ticker" aria-hidden="true">
        <div className="offer-ticker__track">
          {Array.from({ length: 4 }, (_, index) => <span key={index}>{LANDING.offer.ticker}</span>)}
        </div>
      </div>

      <Reveal className="offer-stage">
        <p className="tag">{LANDING.offer.eyebrow}</p>

        <OfferCursorReveal
          primaryText={LANDING.offer.title}
          revealedText={LANDING.offer.revealedTitle}
        />

        <div className="offer-action">
          <WaitlistModalTrigger className="offer-cta">
            <span>{LANDING.offer.cta}</span>
            <span className="offer-cta__icon"><ArrowRight /></span>
          </WaitlistModalTrigger>
        </div>
      </Reveal>
    </section>
  )
}
