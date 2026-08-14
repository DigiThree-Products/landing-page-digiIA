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
  return (
    <section id="faq" className="estacao">
      <div className="estacao-palco">
        <div className="sec-head"><p className="tag">{LANDING.faq.eyebrow}</p><h2>{LANDING.faq.title}</h2></div>
        <div className="faq">
          {LANDING.faq.items.map(({ question, answer }, i) => (
            /* `name` compartilhado = acordeão EXCLUSIVO, nativo e sem JS: abrir
               uma fecha a anterior. Aqui isso não é preferência de estilo, é
               requisito de layout. A estação é presa e `overflow: hidden`, e a
               página não rola enquanto o pin segura — medido numa janela de
               900px, a lista fechada termina em 731px e com UMA resposta aberta
               em 768px, mas com todas abertas vai a 1103px e passa 203px da
               dobra, levando as últimas perguntas para fora do alcance.
               Exclusivo, a altura fica limitada por construção.
               Em navegador sem suporte a `name`, degrada para o comportamento
               independente de antes — pior, mas não quebrado. */
            <details name="faq" key={question}>
              <summary>
                {/* Índice em mono, no mesmo idioma dos códigos das aulas do
                    Repertório e do relógio da janela de vídeo: a página trata
                    número pequeno como telemetria de bordo. */}
                <em className="faq-indice" aria-hidden="true">{String(i + 1).padStart(2, '0')}</em>
                <span>{question}</span>
                <PlusIcon />
              </summary>
              <div className="faq-body"><div><p>{answer}</p></div></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
