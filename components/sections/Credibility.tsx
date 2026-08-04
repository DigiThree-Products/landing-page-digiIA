import { Reveal } from '@/components/ui/Reveal'
import { LANDING } from '@/content/landing'

export function Credibility() {
  return (
    <section className="credibility-section">
      <Reveal className="cred">
        <div className="stat"><b>{LANDING.credibility.value}</b><i>{LANDING.credibility.label}</i></div>
        <p>{LANDING.credibility.description}</p>
      </Reveal>
    </section>
  )
}
