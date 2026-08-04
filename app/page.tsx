import { MetaballField } from '@/components/layout/MetaballField'
import { Nav } from '@/components/sections/Nav'
import { Hero } from '@/components/sections/Hero'
import { VideoSection } from '@/components/sections/VideoSection'
import { WhatItDoes } from '@/components/sections/WhatItDoes'
import { Demo } from '@/components/sections/Demo'
import { Offer } from '@/components/sections/Offer'
import { Credibility } from '@/components/sections/Credibility'
import { Faq } from '@/components/sections/Faq'
import { FinalCta } from '@/components/sections/FinalCta'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { LANDING } from '@/content/landing'

/**
 * A landing.
 *
 * A ordem das seções é o argumento da página: promessa → prova (vídeo) → o que
 * faz → como funciona → oferta → credibilidade → objeções → última chamada.
 * Mexer na ordem muda o argumento, não só o layout.
 */
export default function Home() {
  return (
    <>
      <a className="skip" href="#cadastro">
        {LANDING.skipLink}
      </a>

      {/* Elemento-assinatura: campo de metaballs (a geometria do símbolo, viva) */}
      <MetaballField />
      <div className="vignette" aria-hidden="true" />

      <div className="page">
        <div className="wrap">
          <Nav />
          <Hero />
          <VideoSection />
          <WhatItDoes />
          <Demo />
          <Offer />
          <Credibility />
          <Faq />
          <FinalCta />
          <SiteFooter />
        </div>
      </div>
    </>
  )
}
