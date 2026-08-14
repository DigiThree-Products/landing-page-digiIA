import { LANDING } from '@/content/landing'

/**
 * "+15 anos".
 *
 * Estação: sem `Reveal` próprio. Quem revela é a chegada — ver a nota em
 * ApproachSection.tsx, que descreve por que uma segunda revelação por cima
 * da viagem briga com ela: são dois relógios para o mesmo conteúdo, e o do
 * `Reveal` roda por tempo enquanto o da estação roda por rolagem.
 *
 * Os três blocos (número, legenda, frase) recebem janelas próprias em
 * styles/estacao.css e nascem em cascata ao longo da viagem.
 */
export function Credibility() {
  return (
    <section className="credibility-section estacao">
      <div className="estacao-palco">
        <div className="cred">
          <div className="stat"><b>{LANDING.credibility.value}</b><i>{LANDING.credibility.label}</i></div>
          <p>{LANDING.credibility.description}</p>
        </div>
      </div>
    </section>
  )
}
