import { Reveal } from '@/components/ui/Reveal'
import { LANDING } from '@/content/landing'

function PlusIcon() {
  return <svg className="plus" width="15" height="15" viewBox="0 0 16 16" stroke="#CD82FF" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>
}

export function Faq() {
  return (
    <section id="faq">
      <Reveal><div className="sec-head"><p className="tag">{LANDING.faq.eyebrow}</p><h2>{LANDING.faq.title}</h2></div></Reveal>
      <Reveal className="faq">
        {LANDING.faq.items.map(({ question, answer }) => (
          <details key={question}><summary>{question}<PlusIcon /></summary><div className="faq-body"><div><p>{answer}</p></div></div></details>
        ))}
      </Reveal>
    </section>
  )
}
