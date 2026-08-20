import { Estacoes } from '@/components/layout/Estacoes'
import { PoeiraFundo } from '@/components/layout/PoeiraFundo'
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

          {/* O fecho é UM plano de fundo só, e por isso a oferta e o rodapé
              vivem dentro de um mesmo elemento.

              Os dois já declaravam o MESMO gradiente, e mesmo assim havia
              emenda: gradiente é pintado em relação à caixa de cada um, então
              a oferta terminava no fim da rampa (violeta) e o rodapé
              recomeçava do início dela (azul-abismo), com o brilho radial
              nascendo uma segunda vez no canto de cima. Medido em 1440×900:
              1.035px de oferta e 346px de rodapé, dois degradês completos
              empilhados. Com o pai carregando o fundo, existe uma rampa só,
              de 1.381px, e a divisão desaparece sem ninguém precisar acertar
              números que mudam com a janela.

              Manter os dois aqui dentro. Um deles fora do `.fecho` volta a
              ficar sem fundo — o próprio foi removido — e aparece preto. */}
          <div className="fecho">
            <Offer />
            <SiteFooter />
          </div>
        </div>
      </div>
    </WaitlistModalProvider>
  )
}
