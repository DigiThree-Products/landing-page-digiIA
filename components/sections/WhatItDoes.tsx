import type { ReactNode } from 'react'
import { Reveal } from '@/components/ui/Reveal'

type Cartao = {
  verbo: string
  titulo: string
  texto: string
  itens: string[]
  icone: ReactNode
}

const CARTOES: Cartao[] = [
  {
    verbo: 'Planeja',
    titulo: 'Nada começa na folha em branco',
    texto: 'Você diz o objetivo. Ela devolve a estrutura inteira, pronta para revisar e aprovar.',
    itens: ['Planejamento de conteúdo', 'Calendário editorial do mês', 'Briefings detalhados'],
    icone: (
      <svg width="46" height="26" viewBox="0 0 46 26" fill="none" aria-hidden="true">
        <path
          d="M2 13c6 0 6-9 12-9s6 18 12 18 6-9 12-9 6 4 6 4"
          stroke="#CD82FF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="38" cy="13" r="4" fill="#4500F9" />
      </svg>
    ),
  },
  {
    verbo: 'Cria',
    titulo: 'A mesma voz em todo canal',
    texto: 'Ela aprende como sua marca fala uma vez e mantém o tom do post ao roteiro.',
    itens: [
      'Ideias de postagem',
      'Campanhas completas, com variações',
      'Roteiros para vídeo e audiovisual',
    ],
    icone: (
      <svg width="46" height="26" viewBox="0 0 46 26" fill="none" aria-hidden="true">
        <circle cx="9" cy="13" r="7" fill="#4500F9" />
        <path
          d="M16 13c5 0 8-6 13-6s10 3 15 3"
          stroke="#CD82FF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="30" cy="9" r="3.4" fill="#CD82FF" />
      </svg>
    ),
  },
  {
    verbo: 'Calcula',
    titulo: 'Os números junto com a criação',
    texto: 'A conta que costuma ficar para depois sai na mesma conversa da ideia.',
    itens: ['Custos com marketing', 'Projeção de ROI', 'Orçamento por campanha'],
    icone: (
      <svg width="46" height="26" viewBox="0 0 46 26" fill="none" aria-hidden="true">
        <path
          d="M4 21c0-8 5-13 11-13s7 6 13 6 8-5 14-5"
          stroke="#CD82FF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="15" cy="8" r="4.5" fill="#4500F9" />
        <circle cx="42" cy="9" r="3" fill="#CD82FF" />
      </svg>
    ),
  },
]

/**
 * "Eugências" saiu daqui: era sobra de edição, visível na página no ar, logo
 * antes de "Agências" na mesma lista.
 */
const PUBLICO = [
  'Micro e pequenos empresários',
  'Social media',
  'Equipes internas de marketing',
  'Agências',
]

export function WhatItDoes() {
  return (
    <section>
      <Reveal>
        <div className="sec-head">
          <p className="tag">O que ela faz</p>
          <h2>O método da DigiThree, agora do seu lado.</h2>
          <p>
            A Digi.IA foi construída em cima da forma como a DigiThree trabalha há mais de 15 anos
            em Comunicação, Marketing, Publicidade e Audiovisual. Ela não responde por achismo —
            responde pelo método.
          </p>
          <div className="method">
            <b>15+ anos</b>
            <span>
              de campanhas reais viraram o critério que ela usa para decidir o que funciona.
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal className="cards">
        {CARTOES.map((c) => (
          <article className="card" key={c.verbo}>
            {c.icone}
            <span className="verb">{c.verbo}</span>
            <h3>{c.titulo}</h3>
            <p>{c.texto}</p>
            <ul className="does">
              {c.itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </Reveal>

      <Reveal className="who">
        <p className="tag">Feita para quem faz</p>
        <ul>
          {PUBLICO.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
