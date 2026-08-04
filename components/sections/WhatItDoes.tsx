import { Reveal } from '@/components/ui/Reveal'
import { LANDING, type FeatureIcon } from '@/content/landing'

function FeatureMark({ name }: { name: FeatureIcon }) {
  if (name === 'planeja') {
    return (
      <svg width="46" height="26" viewBox="0 0 46 26" fill="none" aria-hidden="true">
        <path d="M2 13c6 0 6-9 12-9s6 18 12 18 6-9 12-9 6 4 6 4" stroke="#CD82FF" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="38" cy="13" r="4" fill="#4500F9" />
      </svg>
    )
  }
  if (name === 'cria') {
    return (
      <svg width="46" height="26" viewBox="0 0 46 26" fill="none" aria-hidden="true">
        <circle cx="9" cy="13" r="7" fill="#4500F9" />
        <path d="M16 13c5 0 8-6 13-6s10 3 15 3" stroke="#CD82FF" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="30" cy="9" r="3.4" fill="#CD82FF" />
      </svg>
    )
  }
  return (
    <svg width="46" height="26" viewBox="0 0 46 26" fill="none" aria-hidden="true">
      <path d="M4 21c0-8 5-13 11-13s7 6 13 6 8-5 14-5" stroke="#CD82FF" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="15" cy="8" r="4.5" fill="#4500F9" />
      <circle cx="42" cy="9" r="3" fill="#CD82FF" />
    </svg>
  )
}

export function WhatItDoes() {
  const content = LANDING.features
  return (
    <section id="recursos">
      <Reveal>
        <div className="sec-head">
          <p className="tag">{content.eyebrow}</p>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
          <div className="method"><b>{content.proofValue}</b><span>{content.proofText}</span></div>
        </div>
      </Reveal>
      <Reveal className="cards">
        {content.cards.map((card) => (
          <article className="card" key={card.verb}>
            <FeatureMark name={card.icon} />
            <span className="verb">{card.verb}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <ul className="does">{card.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </Reveal>
    </section>
  )
}
