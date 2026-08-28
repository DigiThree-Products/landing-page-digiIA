import { LANDING } from '@/content/landing'

/**
 * "Quem está por trás" — a seção da autoridade.
 *
 * NÃO É MAIS ESTAÇÃO desde 28/08/2026: perdeu a classe `estacao` junto com
 * ComoFunciona, Dna e Faq, quando o dono pediu que elas parassem de vir de
 * trás. Rola normal, sem pin e sem viagem. Ver o mapa em app/page.tsx.
 *
 * Continua sem `Reveal` próprio, e agora sem revelação nenhuma — o motivo
 * antigo era que dois relógios brigavam (o do `Reveal` roda por tempo, o da
 * estação rodava por rolagem); hoje não há relógio nenhum para brigar.
 *
 * A composição tem três andares, e a ordem é a do argumento: quem somos
 * (kicker), por que isso importa para o produto (título + manifesto, com o
 * soco em branco cheio no fim) e a prova dura (o trilho na base).
 *
 * `stats[0]` é a ESTRELA — fica monumental ao lado do manifesto. As outras
 * três formam o trilho. A divisão mora aqui, e não no conteúdo, porque é
 * decisão de apresentação: o conteúdo só declara quatro números em ordem.
 *
 * SEM CASCATA desde 28/08/2026, a pedido do dono. Os seis blocos tinham
 * janelas próprias de chegada em styles/estacao.css e nasciam um a um ao
 * longo da viagem; hoje a seção chega inteira, e quem revela é só a
 * aproximação do palco. As janelas antigas ficaram registradas lá, no lugar
 * de onde saíram.
 */
export function Credibility() {
  const { credibility } = LANDING
  const [estrela, ...provas] = credibility.stats

  return (
    <section className="credibility-section" aria-labelledby="cred-titulo">
      <div className="estacao-palco">
        <div className="cred">
          <header className="cred-head">
            <p className="tag">{credibility.kicker}</p>
          </header>

          <div className="cred-corpo">
            <p className="stat">
              <b>{estrela.value}</b>
              <i>{estrela.label}</i>
            </p>
            <div className="cred-copy">
              <h2 id="cred-titulo">
                <span className="cred-titulo-linha">{credibility.title}</span>
                <span className="cred-titulo-linha cred-titulo-linha--eco">
                  {credibility.titleLineTwo}
                </span>
              </h2>
              <p className="cred-manifesto">
                {credibility.description} <strong>{credibility.punch}</strong>
              </p>
            </div>
          </div>

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
