import { Reveal } from '@/components/ui/Reveal'
import { WaitlistForm } from '@/components/waitlist/WaitlistForm'
import { LANDING } from '@/content/landing'

export function FinalCta() {
  return (
    <section>
      <Reveal className="final">
        <p className="tag">{LANDING.finalCta.eyebrow}</p>
        <h2>{LANDING.finalCta.title}</h2>
        <p className="assin">{LANDING.finalCta.signature}</p>
        <WaitlistForm variante="curto" />
      </Reveal>
    </section>
  )
}
