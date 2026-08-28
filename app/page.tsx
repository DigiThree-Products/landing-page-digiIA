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
 * DUAS seções são estações e prendem a rolagem por ~2,2 telas cada: Approach
 * (o vídeo) e WhatItDoes (o satélite). Só elas.
 *
 * ERAM SEIS até 28/08/2026. ComoFunciona, Dna, Credibility e Faq deixaram de
 * ser, a pedido do dono — primeiro ele tirou a revelação de conteúdo delas
 * ("não quero que eles apareçam e nem venham em cascata"), depois viu que a
 * seção inteira ainda se aproximava e pediu isso também ("na porta 3005 ela
 * continua vindo de trás ainda"). Perguntado se o pin devia ficar sem a
 * viagem, escolheu tirar os dois.
 *
 * COMO ELAS DEIXARAM DE SER: perderam a classe `estacao`, e mais nada. Essa
 * classe não tem regra de CSS nenhuma — é só o gancho do seletor `PAINEIS`
 * em components/layout/Estacoes.tsx. O `.estacao-palco` continua na marcação
 * das quatro, porque ele carrega `position: relative` e os degraus de zoom
 * para telas baixas. Devolver a classe devolve a estação inteira.
 *
 * A página encurtou ~9 telas com isso: cada pin cobrava 2,2 telas de rolagem
 * pelo espaçador, e saíram quatro.
 *
 * O Repertório nunca foi estação — mais uma cobraria duas telas de rolagem
 * por um argumento só (ver Repertorio.tsx). Ele ficava ENTRE duas presas e
 * era o respiro daquele trecho; hoje as vizinhas também rolam normal, então
 * esse papel dele deixou de ser especial.
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
