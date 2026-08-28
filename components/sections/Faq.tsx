import { LANDING } from '@/content/landing'

function PlusIcon() {
  return <svg className="plus" width="15" height="15" viewBox="0 0 16 16" stroke="#CD82FF" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>
}

/**
 * "Perguntas".
 *
 * NÃO É MAIS ESTAÇÃO desde 28/08/2026: perdeu a classe `estacao` quando o
 * dono pediu que estas seções parassem de vir de trás. Sem pin, sem viagem.
 * Continua sem `Reveal` próprio. Ver o mapa em app/page.tsx.
 *
 * SEM CASCATA desde 28/08/2026, a pedido do dono: as seis perguntas nascem
 * prontas junto com a seção, em vez de cada uma na sua vez.
 *
 * ISSO FECHOU UMA TENSÃO que estava anotada aqui como ponto a revisitar, e
 * vale registrar porque foi ganho e não só perda. As perguntas são
 * CLICÁVEIS, e enquanto a cascata rodava havia um trecho em que uma
 * pergunta já tinha aparecido mas ainda estava chegando — dava para abrir
 * uma ali, no meio do gesto dela. Nunca houve bloqueio de clique, de
 * propósito, porque travar a interação seria pior que a estranheza. Sem
 * cascata o trecho não existe: nada aparece no meio do caminho.
 */
export function Faq() {
  return (
    <section id="faq">
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
