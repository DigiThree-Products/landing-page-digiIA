import { Reveal } from '@/components/ui/Reveal'
import { LANDING } from '@/content/landing'

function CheckMark() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#CD82FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5" /></svg>
}

export function Offer() {
  return (
    <section>
      <Reveal><div className="sec-head"><p className="tag">{LANDING.offer.eyebrow}</p><h2>{LANDING.offer.title}</h2></div></Reveal>
      <Reveal className="offer-grid">
        <div><div className="pct">{LANDING.offer.badge}</div><p className="offer-copy">{LANDING.offer.description}</p></div>
        <ul className="terms">{LANDING.offer.conditions.map((condition) => <li key={condition}><CheckMark />{condition}</li>)}</ul>
      </Reveal>
    </section>
  )
}
