import { LANDING } from '@/content/landing'

/**
 * "Quem está por trás" — a estação da autoridade.
 *
 * Estação: sem `Reveal` próprio. Quem revela é a chegada — ver a nota em
 * ApproachSection.tsx, que descreve por que uma segunda revelação por cima
 * da viagem briga com ela: são dois relógios para o mesmo conteúdo, e o do
 * `Reveal` roda por tempo enquanto o da estação roda por rolagem.
 *
 * A composição tem três andares, e a ordem é a do argumento: quem somos
 * (kicker + título), por que isso importa para o produto (o manifesto, com o
 * soco em branco cheio no fim) e a prova dura (o trilho na base).
 *
 * `stats[0]` é a ESTRELA — fica monumental ao lado do manifesto. As outras
 * três formam o trilho. A divisão mora aqui, e não no conteúdo, porque é
 * decisão de apresentação: o conteúdo só declara quatro números em ordem.
 *
 * Os seis blocos recebem janelas próprias de chegada em styles/estacao.css e
 * nascem em cascata ao longo da viagem.
 */
export function Credibility() {
  const { credibility } = LANDING
  const [estrela, ...provas] = credibility.stats

  return (
    <section className="credibility-section estacao" aria-labelledby="cred-titulo">
      <div className="estacao-palco">
        <div className="cred">
          <header className="cred-head">
            <p className="tag">{credibility.kicker}</p>
            <h2 id="cred-titulo">
              <span className="cred-titulo-linha">{credibility.title}</span>
              <span className="cred-titulo-linha cred-titulo-linha--eco">
                {credibility.titleLineTwo}
              </span>
            </h2>
          </header>

          <div className="cred-corpo">
            <p className="stat">
              <b>{estrela.value}</b>
              <i>{estrela.label}</i>
            </p>
            <p className="cred-manifesto">
              {credibility.description} <strong>{credibility.punch}</strong>
            </p>
          </div>

          {/* A escassez vive aqui porque a seção da oferta está congelada — e
              escassez sem lugar nenhum é escassez perdida. Ela cabe nesta
              seção por mérito, não por sobra: o motivo do teto (a conta é
              montada à mão) é a mesma prova de autoridade que o resto do
              bloco sustenta. */}
          <p className="cred-escassez">{credibility.escassez}</p>

          <ul className="cred-trilho">
            {provas.map((prova) => (
              <li key={prova.label}>
                <b>{prova.value}</b>
                <i>{prova.label}</i>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
