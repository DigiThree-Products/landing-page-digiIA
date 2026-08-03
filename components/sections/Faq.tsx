import { Reveal } from '@/components/ui/Reveal'

const PERGUNTAS: [string, string][] = [
  [
    'Quanto vai custar?',
    'Os planos serão anunciados no lançamento. Quem está na lista recebe a tabela antes de todo mundo, já com o desconto aplicado — e decide depois de ver o preço, não antes.',
  ],
  [
    'O desconto é garantido mesmo?',
    'Sim, enquanto houver vagas. Ele fica vinculado ao e-mail que você cadastrar e vale por 12 meses a partir da ativação. Se a primeira turma lotar antes de 14 de setembro, avisamos por e-mail.',
  ],
  [
    'Preciso saber usar IA?',
    'Não. Você escreve o que precisa como escreveria para um colega. Não existe técnica de prompt para aprender — se souber explicar a campanha, sabe usar.',
  ],
  [
    'Meus dados vão treinar algum modelo?',
    'Não. O conteúdo da sua marca é usado apenas para gerar as suas peças e fica isolado na sua conta.',
  ],
  [
    'O que acontece se eu não gostar?',
    'Entrar na lista não é compra. No dia do lançamento você testa e decide. Se não fizer sentido, basta não ativar — nenhum dado de pagamento foi pedido até aqui.',
  ],
  [
    'Quando exatamente libera?',
    '14 de setembro. Quem está na lista recebe o acesso pela manhã, antes da abertura pública.',
  ],
]

function Mais() {
  return (
    <svg
      className="plus"
      width="15"
      height="15"
      viewBox="0 0 16 16"
      stroke="#CD82FF"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 2v12M2 8h12" />
    </svg>
  )
}

/**
 * `<details>` nativo: abre e fecha sem uma linha de JavaScript, funciona com
 * teclado e leitor de tela por padrão, e continua legível se o script falhar.
 */
export function Faq() {
  return (
    <section>
      <Reveal>
        <div className="sec-head">
          <p className="tag">Perguntas</p>
          <h2>O que costumam perguntar antes de entrar.</h2>
        </div>
      </Reveal>

      <Reveal className="faq">
        {PERGUNTAS.map(([pergunta, resposta]) => (
          <details key={pergunta}>
            <summary>
              {pergunta}
              <Mais />
            </summary>
            <div className="faq-body">
              <div>
                <p>{resposta}</p>
              </div>
            </div>
          </details>
        ))}
      </Reveal>
    </section>
  )
}
