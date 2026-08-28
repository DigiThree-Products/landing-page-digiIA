import { LANDING } from '@/content/landing'

const D = LANDING.dna

/**
 * "DNA Estratégico" — a estação que responde por que não sai com cara de IA.
 *
 * NÃO É MAIS ESTAÇÃO desde 28/08/2026: perdeu a classe `estacao` quando o
 * dono pediu que estas seções parassem de vir de trás. Sem pin e sem
 * viagem — e junto foi embora a chegada por PROFUNDIDADE que era só desta
 * seção, com perspectiva e desfoque, registrada em styles/estacao.css no
 * lugar de onde saiu. Ver o mapa em app/page.tsx.
 *
 * Continua sem `Reveal` próprio, e agora sem revelação nenhuma.
 *
 * A COMPOSIÇÃO É ARGUMENTO À ESQUERDA, OBJETO À DIREITA, e isso é o que
 * conserta a versão anterior. Antes eram quatro blocos de peso parecido
 * empilhados — cabeçalho, cartão, três pilares em caixa e fecho — e o cartão
 * disputava atenção com os pilares em vez de ser sustentado por eles. Ficou
 * sem hierarquia e embolado.
 *
 * Agora existe UM só objeto visual, o cartão, e uma coluna de leitura ao
 * lado: título → frase → três linhas → fecho. Dois papéis distintos, e o
 * olho sabe para onde ir. Se alguém voltar a pôr caixa, borda ou fundo em
 * qualquer coisa da coluna esquerda, o problema volta.
 *
 * SOBRE OS CADEADOS: o método do produto é segredo comercial e a página não
 * pode descrevê-lo. Os travados carregam NOME DE CATEGORIA e nada mais, e
 * agora são uma LISTA, não linhas de tabela com barra mascarada — a barra
 * fingia um valor que não existe e era metade do ruído visual da seção. A
 * justificativa na tela é a confidencialidade da marca do cliente, que é
 * verdadeira e ecoa a promessa de privacidade da FAQ.
 *
 * SEM MARCA DE EXEMPLO. A ficha é a do visitante — "DNA · a sua marca".
 */
export function DnaEstrategico() {
  const { ficha } = D

  return (
    <section id="dna" aria-labelledby="dna-titulo">
      <div className="estacao-palco">
        <div className="dna">
          {/* Coluna de leitura: só texto, nenhuma caixa. */}
          <div className="dna-argumento">
            <header className="dna-head">
              <p className="tag">{D.eyebrow}</p>
              <h2 id="dna-titulo">{D.title}</h2>
              <p className="dna-head__sub">{D.description}</p>
            </header>

            <ul className="dna-pilares">
              {D.pilares.map((pilar) => (
                <li key={pilar}>{pilar}</li>
              ))}
            </ul>

            <p className="dna-fecho">{D.fecho}</p>
          </div>

          {/* O único objeto da seção. */}
          <div className="dna-ficha">
            <div className="dna-ficha__topo">
              <span className="dna-ficha__marca">DNA · {ficha.marca}</span>
              <ul className="dna-ficha__abas">
                {ficha.abas.map((aba, i) => (
                  <li key={aba} data-ativa={i === 0 || undefined}>
                    {aba}
                  </li>
                ))}
              </ul>
            </div>

            {/* Os dois abertos são o ponto do cartão e por isso ficam em
                rótulo sobre valor, com o valor grande. Em linha, como estavam,
                tinham o mesmo peso dos cinco travados e sumiam no meio. */}
            <dl className="dna-ficha__abertos">
              {ficha.abertos.map((campo) => (
                <div className="dna-campo" key={campo.rotulo}>
                  <dt>{campo.rotulo}</dt>
                  <dd>{campo.valor}</dd>
                </div>
              ))}
            </dl>

            <ul className="dna-ficha__travados">
              {ficha.travados.map((rotulo) => (
                <li key={rotulo}>
                  <span className="dna-cadeado" aria-hidden="true" />
                  {rotulo}
                </li>
              ))}
            </ul>

            <p className="dna-ficha__nota">{ficha.nota}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
