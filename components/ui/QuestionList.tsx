type Question = { question: string; answer: string }

/**
 * O ícone herda a cor do contexto (`currentColor`) em vez de trazer o lilás
 * cravado no SVG. A lista nasceu numa seção escura, mas hoje vive sobre papel
 * claro — com a cor fixa ela sumia no fundo.
 */
function PlusIcon() {
  return (
    <svg
      className="plus"
      width="15"
      height="15"
      viewBox="0 0 16 16"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 2v12M2 8h12" />
    </svg>
  )
}

/**
 * Lista de perguntas em acordeão.
 *
 * `<details>` nativo: abre e fecha sem JavaScript, continua funcionando se o
 * bundle falhar e já vem com a semântica que o leitor de tela espera.
 */
export function QuestionList({
  items,
  className = '',
}: {
  items: readonly Question[]
  className?: string
}) {
  return (
    <div className={`faq ${className}`.trim()}>
      {items.map(({ question, answer }) => (
        <details key={question}>
          <summary>
            {question}
            <PlusIcon />
          </summary>
          <div className="faq-body">
            <div>
              <p>{answer}</p>
            </div>
          </div>
        </details>
      ))}
    </div>
  )
}
