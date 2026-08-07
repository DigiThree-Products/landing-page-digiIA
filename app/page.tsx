import { Estacoes } from '@/components/layout/Estacoes'
import { PoeiraFundo } from '@/components/layout/PoeiraFundo'
import { ScrollRail } from '@/components/layout/ScrollRail'
import { WaitlistModalProvider } from '@/components/waitlist/WaitlistModal'
import { Nav } from '@/components/sections/Nav'
import { Hero } from '@/components/sections/Hero'
import { ApproachSection } from '@/components/sections/ApproachSection'
import { WhatItDoes } from '@/components/sections/WhatItDoes'
import { Demo } from '@/components/sections/Demo'
import { Offer } from '@/components/sections/Offer'
import { Credibility } from '@/components/sections/Credibility'
import { Faq } from '@/components/sections/Faq'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { LANDING } from '@/content/landing'

/**
 * A landing.
 *
 * A ordem das seções é o argumento da página: promessa → abordagem → o que faz
 * → como funciona → credibilidade → objeções → oferta.
 * A oferta é o destino: o site inteiro constrói o argumento até chegar nela,
 * por último, antes do rodapé. Mexer na ordem muda o argumento, não só o layout.
 */
export default function Home() {
  return (
    <WaitlistModalProvider>
      <a className="skip" href="#oferta">
        {LANDING.skipLink}
      </a>

      <ScrollRail />

      <div className="page">
        <PoeiraFundo />
        <Estacoes />
        <div className="wrap">
          <Nav />
          <Hero />
          <ApproachSection />
          <WhatItDoes />
          <Demo />
          <Credibility />
          <Faq />
          <Offer />
          <SiteFooter />
        </div>
      </div>
    </WaitlistModalProvider>
  )
}
