import { ScrollRail } from '@/components/layout/ScrollRail'
import { WaitlistModalProvider } from '@/components/waitlist/WaitlistModal'
import { Nav } from '@/components/sections/Nav'
import { Hero } from '@/components/sections/Hero'
import { ApproachSection } from '@/components/sections/ApproachSection'
import { WhatItDoes } from '@/components/sections/WhatItDoes'
import { Demo } from '@/components/sections/Demo'
import { Offer } from '@/components/sections/Offer'
import { Credibility } from '@/components/sections/Credibility'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { LANDING } from '@/content/landing'

/**
 * A landing.
 *
 * A ordem das seções é o argumento da página: promessa → abordagem → o que faz
 * → como funciona (a demonstração e as objeções, lado a lado) → oferta →
 * credibilidade. Mexer na ordem muda o argumento, não só o layout.
 *
 * As perguntas já não têm seção própria antes do rodapé: elas responderam a
 * quem estava olhando a demonstração, então moraram ao lado dela. Quem chega
 * na oferta já passou pelas dúvidas.
 */
export default function Home() {
  return (
    <WaitlistModalProvider>
      <a className="skip" href="#oferta">
        {LANDING.skipLink}
      </a>

      <ScrollRail />

      <div className="page">
        <div className="wrap">
          <Nav />
          <Hero />
          <ApproachSection />
          <WhatItDoes />
          <Demo />
          <Offer />
          <Credibility />
          <SiteFooter />
        </div>
      </div>
    </WaitlistModalProvider>
  )
}
