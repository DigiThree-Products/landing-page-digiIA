import { Reveal } from '@/components/ui/Reveal'

const CONDICOES = [
  'A primeira turma é limitada pela nossa capacidade de implantação — não por um número inventado.',
  'Nenhuma cobrança agora. Você escolhe o plano no lançamento.',
  'Se não quiser mais, é só não ativar. Sem multa, sem fidelidade.',
  'O desconto acompanha seu e-mail — não precisa correr no dia 14.',
]

function Confere() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#CD82FF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.5l3.2 3.2L13 5" />
    </svg>
  )
}

export function Offer() {
  return (
    <section>
      <Reveal>
        <div className="sec-head">
          <p className="tag">A oferta</p>
          <h2>O preço da lista não volta depois.</h2>
        </div>
      </Reveal>

      <Reveal className="offer-grid">
        <div>
          <div className="pct">1º</div>
          <p style={{ margin: '16px 0 0', color: 'var(--paper-80)', maxWidth: '26ch' }}>
            Quem está na lista vê a tabela de preços antes de todo mundo — com a condição de
            lançamento já aplicada.
          </p>
        </div>
        <ul className="terms">
          {CONDICOES.map((c) => (
            <li key={c}>
              <Confere />
              {c}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
