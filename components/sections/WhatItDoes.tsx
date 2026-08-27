import { CalculoRoi } from '@/components/sections/CalculoRoi'
import { GradeRecursos } from '@/components/sections/GradeRecursos'
import { PecaPronta } from '@/components/sections/PecaPronta'
import { LANDING } from '@/content/landing'

const F = LANDING.features
const R = F.roteiriza.roteiro

/**
 * O que ela faz.
 *
 * Quatro quadrados lado a lado, SEM FUNDO E SEM BORDA — reestruturação de
 * 21/08. Antes era um bento de superfícies coloridas com células de tamanhos
 * diferentes, onde a área comunicava peso. A composição nova não hierarquiza
 * por área: os quatro passos têm o mesmo tamanho porque são a mesma promessa
 * repetida quatro vezes — tempo que volta para quem lê.
 *
 * Sem caixa, quem separa um quadrado do outro é o espaço e o traço que abre
 * cada verbo. É por isso que o `gap` deste grid não é ajuste fino de respiro:
 * ele é a única fronteira que existe (ver styles/recursos.css).
 *
 * A ORDEM é o dia do empresário, não a arquitetura do produto: primeiro ele
 * decide o que postar (Planeja), depois escreve (Cria), depois grava
 * (Roteiriza), e só então olha o dinheiro (Calcula). Trocar a ordem quebra a
 * narrativa; o produto não se importa, a leitura sim.
 *
 * ERAM CINCO CÉLULAS, e as duas que saíram viraram seção própria: o DNA
 * Estratégico (DnaEstrategico.tsx) e o Repertório (Repertorio.tsx). Nenhuma
 * das duas era criação da IA, que é o que esta seção passou a mostrar.
 *
 * TEXTO EM CIMA, ARTEFATO EMBAIXO — nome do card, título, subtítulo, e só
 * então o que a IA produz. A ordem já foi a inversa e voltou, e as duas
 * viradas têm o mesmo motivo de fundo: onde a sobra pode morar.
 *
 * Calendário, ficha, roteiro e calculadora têm alturas bem diferentes (72,
 * 118, 87 e 149px, medidos), então sempre vai sobrar espaço em três dos
 * quatro cards. A pergunta é só onde ele cai.
 *
 * Na primeira versão o texto ficava em cima e o artefato colava na base: a
 * sobra caía ENTRE os dois, virava um vão de ~10 a ~90px que variava de card
 * para card, e a fileira lia como peças soltas. Foi por isso que em 21/08 o
 * artefato subiu para um slot de altura travada.
 *
 * Agora a sobra pode voltar para baixo porque ela deixou de ser um vão solto:
 * o console (conduíte na lateral, piso fechando embaixo — ver styles/
 * recursos.css) dá contorno a ela. O que era buraco entre dois blocos virou
 * o interior do painel, e o slot travado continua garantindo que os quatro
 * artefatos comecem na mesma linha.
 *
 * Para isso valer, o bloco de texto TAMBÉM tem altura mínima (`--cabeca`):
 * sem ela, um subtítulo que quebre em três linhas empurra o artefato daquele
 * card para baixo e desalinha a fileira inteira. Mesmo raciocínio do slot, e
 * o mesmo sintoma se o teto ficar curto.
 *
 * Nenhum artefato inventa negócio: a regra e o porquê estão em
 * content/landing.ts, no bloco de features.
 *
 * A composição cabe em uma tela no desktop (ver styles/recursos.css). Em telas
 * baixas ou no celular ela vira carrossel em vez de cortar — conteúdo escondido
 * por `overflow` seria bug, não design.
 */
export function WhatItDoes() {
  return (
    <section id="recursos" className="estacao" aria-labelledby="recursos-titulo">
      <div className="estacao-palco">
        {/* Duas colunas: o cabeçalho ancora a esquerda, os quadrados ocupam
            a direita em 2×2. Mesmo esqueleto de `.approach-layout`. */}
        <div className="rec-layout">
        {/* A grade que chega como quadrado e se abre no console. Fica ANTES do
            conteúdo por ser puramente decorativa e ir atrás dele; o que a
            posiciona é o `.rec-layout`, que já é `position: relative`. */}
        <GradeRecursos />
        <div className="rec-head">
          <div>
            {/* O número vem ANTES do nome, como placa de plataforma: primeiro
                onde você está, depois o que tem aqui. */}
            <p className="tag">
              <b className="rec-estacao">Estação {F.estacao}</b>
              <span>{F.eyebrow}</span>
            </p>
            {/* DUAS METADES COM O MASTRO NO MEIO. O `<span>` não é gancho de
                estilo solto: cada um é uma célula do grid que abre o vão
                central (ver `.rec-head h2` em styles/recursos.css). O espaço
                entre eles é EXPLÍCITO porque o grid come o espaço em branco do
                JSX, e no celular — onde a regra do grid não vale e as duas
                voltam a correr na mesma linha — ele é o que separa as
                palavras. */}
            <h2 id="recursos-titulo">
              <span>{F.title}</span>{' '}
              <span>
                {F.titleDepois} <em>{F.titleHighlight}</em>
              </span>
            </h2>
          </div>
        </div>

        <div className="quads">
          <article className="quad quad--planeja">
            <div className="quad__texto">
              <span className="verb">{F.planeja.verb}</span>
              <h3>{F.planeja.title}</h3>
              <p className="quad__lede">{F.planeja.beneficio}</p>
            </div>
            <div className="quad__saida">
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

          <article className="quad quad--cria">
            <div className="quad__texto">
              <span className="verb">{F.cria.verb}</span>
              <h3>{F.cria.title}</h3>
              <p className="quad__lede">{F.cria.beneficio}</p>
            </div>
            <div className="quad__saida">
              <PecaPronta />
            </div>
          </article>

          <article className="quad quad--roteiriza">
            <div className="quad__texto">
              <span className="verb">{F.roteiriza.verb}</span>
              <h3>{F.roteiriza.title}</h3>
              <p className="quad__lede">{F.roteiriza.beneficio}</p>
            </div>
            <div className="quad__saida">
              {/* <ol> porque a ordem É a informação: o gancho vem antes da
                  fala porque perder os primeiros segundos perde o vídeo. */}
              <ol className="roteiro">
                {R.passos.map((passo) => (
                  <li key={passo.rotulo}>
                    <em>{passo.ordem}</em>
                    <b>{passo.rotulo}</b>
                    <span>{passo.valor}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>

          <article className="quad quad--calcula">
            <div className="quad__texto">
              <span className="verb">{F.calcula.verb}</span>
              <h3>{F.calcula.title}</h3>
              <p className="quad__lede">{F.calcula.beneficio}</p>
            </div>
            <div className="quad__saida">
              <CalculoRoi />
            </div>
          </article>
        </div>
        </div>
      </div>
    </section>
  )
}
