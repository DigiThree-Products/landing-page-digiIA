import { LANDING } from '@/content/landing'

function PlusIcon() {
  return <svg className="plus" width="15" height="15" viewBox="0 0 16 16" stroke="#CD82FF" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>
}

/**
 * "Perguntas".
 *
 * Estação: sem `Reveal` próprio, pelo mesmo motivo das outras — ver
 * ApproachSection.tsx.
 *
 * Cada `<details>` é um bloco da cascata e nasce na sua vez. Vale saber de
 * uma tensão que isto cria e que as outras estações não têm: as perguntas
 * são CLICÁVEIS. Enquanto a viagem não termina, existe um trecho em que
 * uma pergunta já apareceu mas ainda está chegando, e abrir uma ali é
 * possível. Não há bloqueio de clique de propósito — travar a interação
 * seria pior que a estranheza —, mas é o ponto desta seção a revisitar se
 * a leitura incomodar.
 */
export function Faq() {
  const porColuna = Math.ceil(LANDING.faq.items.length / 2)
  const colunas = [
    LANDING.faq.items.slice(0, porColuna),
    LANDING.faq.items.slice(porColuna),
  ]

  return (
    <section id="faq" className="estacao" aria-labelledby="faq-titulo">
      <div className="estacao-palco">
        <div className="sec-head">
          <p className="tag">{LANDING.faq.eyebrow}</p>
          <h2 id="faq-titulo">{LANDING.faq.title}</h2>
        </div>

        <div className="faq">
          {colunas.map((itens, coluna) => (
            <div className="faq-coluna" key={coluna}>
              {itens.map(({ question, answer }, indiceLocal) => {
                const indice = coluna * porColuna + indiceLocal

                return (
                  /* `name` compartilhado = acordeão EXCLUSIVO, nativo e sem
                     JS: abrir uma fecha a anterior, inclusive entre colunas.
                     Isso limita a altura da estação presa por construção. */
                  <details name="faq" data-faq-item={indice + 1} key={question}>
                    <summary>
                      {/* Índice em mono, no mesmo idioma dos códigos das aulas
                          do Repertório e do relógio da janela de vídeo. */}
                      <em className="faq-indice" aria-hidden="true">
                        {String(indice + 1).padStart(2, '0')}
                      </em>
                      <span>{question}</span>
                      <PlusIcon />
                    </summary>
                    <div className="faq-body">
                      <div><p>{answer}</p></div>
                    </div>
                  </details>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
