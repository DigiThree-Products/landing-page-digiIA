import { Estacoes } from '@/components/layout/Estacoes'
import { PoeiraFundo } from '@/components/layout/PoeiraFundo'
import { WaitlistModalProvider } from '@/components/waitlist/WaitlistModal'
import { Nav } from '@/components/sections/Nav'
import { Hero } from '@/components/sections/Hero'
import { ApproachSection } from '@/components/sections/ApproachSection'
import { WhatItDoes } from '@/components/sections/WhatItDoes'
import { ComoFunciona } from '@/components/sections/ComoFunciona'
import { DnaEstrategico } from '@/components/sections/DnaEstrategico'
import { Offer } from '@/components/sections/Offer'
import { Credibility } from '@/components/sections/Credibility'
import { Repertorio } from '@/components/sections/Repertorio'
import { Faq } from '@/components/sections/Faq'
import { Fecho } from '@/components/sections/Fecho'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { LANDING } from '@/content/landing'

/**
 * A landing.
 *
 * A ordem das seções é o argumento da página: promessa → abordagem → o que faz
 * → como funciona → por que não sai genérico → credibilidade → objeções → oferta.
 * A oferta é o destino: o site inteiro constrói o argumento até chegar nela,
 * por último, antes do rodapé. Mexer na ordem muda o argumento, não só o layout.
 *
 * O DNA fica ENTRE o Como funciona e a credibilidade, e as duas vizinhanças são
 * deliberadas. Antes dele, a pessoa acabou de ver a máquina produzindo — é
 * exatamente aí que nasce a objeção "IA faz conteúdo genérico". Depois dele, o
 * "+15 anos" deixa de ser um selo solto e vira a história de origem do DNA: o
 * fecho da seção entrega o bastão, e a credibilidade responde com "A IA é
 * nova. O método não.". Separar os dois desfaz as duas costuras de uma vez.
 *
 * O Repertório vem LOGO DEPOIS da credibilidade pela mesma lógica de bastão: a
 * seção anterior acaba de estabelecer os 15 anos, e esta abre dizendo de quem
 * são as aulas. Em qualquer outro lugar da página ela lê como bônus solto.
 *
 * SEIS seções são estações e prendem a rolagem por ~2,2 telas cada: Approach,
 * WhatItDoes, ComoFunciona, Dna, Credibility e Faq. O Repertório entrou como seção
 * COMUM de propósito — mais uma estação cobraria duas telas de rolagem por um
 * argumento só (ver Repertorio.tsx).
 *
 * Ele fica ENTRE duas estações, e isso é caso previsto, não descuido:
 * `caudaAcima` em components/layout/Estacoes.tsx devolve 0 quando o vizinho
 * de cima não é uma estação presa. Na prática o Repertório passa a ser a
 * separação natural entre a cauda da credibilidade e a chegada das perguntas.
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
          <ComoFunciona />
          <DnaEstrategico />
          <Credibility />
          <Repertorio />
          <Faq />
          <Fecho>
            <Offer />
            <SiteFooter />
          </Fecho>
        </div>
      </div>
    </WaitlistModalProvider>
  )
}
