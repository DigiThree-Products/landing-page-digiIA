import { LANDING } from '@/content/landing'

const R = LANDING.repertorio

/**
 * Repertório — as dez aulas.
 *
 * Nasceu em 21/08 de uma faixa que vivia no rodapé do bento de "O que ela
 * faz". Saiu de lá porque aquela seção passou a mostrar só o que a IA cria, e
 * aula gravada por gente não é criação da IA.
 *
 * NÃO É ESTAÇÃO, e isso é escolha. As estações são opt-in pela classe
 * `estacao` (ver PAINEIS em components/layout/Estacoes.tsx) e cada uma prende
 * a rolagem por ~2,2 telas. A página já tem quatro. Esta seção tem um
 * argumento só e não sustentaria a chegada — viraria peso de rolagem sem
 * pagar por ele. Ela rola normal, como a credibilidade que vem antes.
 *
 * Os códigos das aulas são salteados de propósito (R01, R04, R06, R09): são
 * as quatro que existem escritas, não as quatro primeiras. A sequência
 * completa apareceria como R01–R04 e sugeriria que as dez estão prontas.
 */
export function Repertorio() {
  return (
    <section id="repertorio" aria-labelledby="repertorio-titulo">
      <div className="rep-wrap">
        <div className="rep-head">
          <p className="tag">{R.eyebrow}</p>
          <h2 id="repertorio-titulo">{R.title}</h2>
          <p className="rep-lede">{R.description}</p>
          <p className="rep-selo">{R.selo}</p>
        </div>

        <ol className="rep-aulas">
          {R.aulas.map((aula) => (
            <li key={aula.codigo}>
              <em>{aula.codigo}</em>
              <span>{aula.titulo}</span>
            </li>
          ))}
          {/* A última não é aula: é a admissão de que só quatro têm título.
              Fica na mesma lista, e não numa nota solta embaixo, porque é ali
              que a pergunta "e as outras?" nasce. */}
          <li className="rep-aulas__resto">{R.nota}</li>
        </ol>
      </div>
    </section>
  )
}
