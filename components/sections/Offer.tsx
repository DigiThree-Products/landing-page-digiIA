import { Countdown } from '@/components/waitlist/Countdown'
import { WaitlistModalTrigger } from '@/components/waitlist/WaitlistModal'
import { Reveal } from '@/components/ui/Reveal'
import { LANDING } from '@/content/landing'

function CheckMark() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5" /></svg>
}

function ArrowRight() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" /></svg>
}

export function Offer() {
  return (
    <section id="oferta">
      <div className="offer-ticker" aria-hidden="true">
        <div className="offer-ticker__track">
          {Array.from({ length: 4 }, (_, index) => <span key={index}>{LANDING.offer.ticker}</span>)}
        </div>
      </div>

      <Reveal className="offer-urgency">
        <div className="offer-urgency__copy">
          <p className="tag">{LANDING.offer.eyebrow}</p>
          <h2>{LANDING.offer.title}</h2>
          <p className="offer-copy">{LANDING.offer.description}</p>

          <div className="offer-action">
            <WaitlistModalTrigger className="offer-cta">
              <span>{LANDING.offer.cta}</span>
              <span className="offer-cta__icon"><ArrowRight /></span>
            </WaitlistModalTrigger>
            <p><span aria-hidden="true" />{LANDING.offer.ctaNote}</p>
          </div>
        </div>

        <div className="offer-deadline">
          <div className="offer-edition" aria-label={`${LANDING.offer.badge} turma`}>
            <strong>{LANDING.offer.badge}</strong>
            <span>turma</span>
          </div>
          <div className="offer-countdown">
            <p className="tag">{LANDING.offer.countdownLabel}</p>
            <Countdown />
          </div>
        </div>
      </Reveal>

      <Reveal className="offer-conditions">
        <p className="tag">{LANDING.offer.conditionsLabel}</p>
        <ul className="terms">
          {LANDING.offer.conditions.map((condition) => <li key={condition}><CheckMark />{condition}</li>)}
        </ul>
      </Reveal>
    </section>
  )
}
