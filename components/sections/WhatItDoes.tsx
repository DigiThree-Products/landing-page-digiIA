import { CalculoRoi } from '@/components/sections/CalculoRoi'
import { PostGerado } from '@/components/sections/PostGerado'
import { Reveal } from '@/components/ui/Reveal'
import { LANDING } from '@/content/landing'

const F = LANDING.features

/**
 * O que ela faz.
 *
 * Cinco células em bento, dimensionadas por peso: CRIA domina porque é a dor
 * imediata de quem compra; DNA Estratégico e Repertório existem porque são o
 * que separa a Digi.IA de uma IA genérica.
 *
 * Cada célula termina em uma superfície de saída — um post escrito, um
 * calendário preenchido, números em real, campos preenchidos. É de propósito:
 * a seção mostra o produto em vez de descrevê-lo.
 *
 * A composição cabe em uma tela no desktop (ver styles/recursos.css). Em telas
 * baixas ou no celular ela cresce em vez de cortar — conteúdo escondido por
 * `overflow` seria bug, não design.
 */
export function WhatItDoes() {
  return (
    <section id="recursos" aria-labelledby="recursos-titulo">
      <Reveal className="rec-head">
        <div>
          <p className="tag">{F.eyebrow}</p>
          <h2 id="recursos-titulo">
            {F.title} <em>{F.titleHighlight}</em>
          </h2>
        </div>

        <div className="rec-head__side">
          <p>{F.description}</p>
        </div>
      </Reveal>

      <Reveal className="bento">
        <article className="rec-cell rec-cell--cria">
          <span className="verb">{F.cria.verb}</span>
          <h3>{F.cria.title}</h3>
          <p className="rec-cell__lede">{F.cria.description}</p>

          <div className="rec-out">
            <PostGerado />
          </div>
        </article>

        <article className="rec-cell rec-cell--planeja">
          <span className="verb">{F.planeja.verb}</span>
          <h3>{F.planeja.title}</h3>

          <div className="rec-out">
            <ul className="calendario">
              {F.planeja.dias.map((dia) => (
                <li key={dia.dia} data-leve={dia.leve || undefined}>
                  <b>{dia.dia}</b>
                  <span>{dia.formato}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="rec-cell rec-cell--calcula">
          <span className="verb">{F.calcula.verb}</span>
          <h3>{F.calcula.title}</h3>

          <CalculoRoi />
        </article>

        <article className="rec-cell rec-cell--dna">
          <span className="verb">{F.dna.verb}</span>
          <h3>{F.dna.title}</h3>

          <div className="rec-out">
            <dl className="campos">
              {F.dna.campos.map((campo) => (
                <div key={campo.rotulo}>
                  <dt>{campo.rotulo}</dt>
                  <dd>{campo.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>

        <article className="rec-cell rec-cell--repertorio">
          <div className="repertorio__head">
            <h3>{F.repertorio.title}</h3>
            <p>{F.repertorio.selo}</p>
          </div>
          <ul className="aulas">
            {F.repertorio.aulas.map((aula) => (
              <li key={aula.codigo}>
                <em>{aula.codigo}</em>
                {aula.titulo}
              </li>
            ))}
          </ul>
        </article>
      </Reveal>
    </section>
  )
}
