import { Reveal } from '@/components/ui/Reveal'
import { WaitlistModalTrigger } from '@/components/waitlist/WaitlistModal'
import { LANDING } from '@/content/landing'

export function FinalCta() {
  return (
    <section id="lista-final">
      <Reveal className="final">
        <p className="tag">{LANDING.finalCta.eyebrow}</p>
        <h2>{LANDING.finalCta.title}</h2>
        <p className="assin">{LANDING.finalCta.signature}</p>
        <WaitlistModalTrigger className="final-open">
          <span>{LANDING.finalCta.cta}</span>
          <span aria-hidden="true">→</span>
        </WaitlistModalTrigger>
        <p className="final-note">{LANDING.finalCta.note}</p>
      </Reveal>
    </section>
  )
}
