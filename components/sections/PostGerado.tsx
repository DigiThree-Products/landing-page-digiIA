'use client'

import { useState } from 'react'
import { LANDING } from '@/content/landing'

const E = LANDING.features.cria.exemplo

/**
 * O post gerado, com as variações trocáveis.
 *
 * Os chips existiam antes como rótulos inertes: pareciam controle e não
 * eram. Elemento com cara de clicável que não responde não custa só o
 * próprio clique — ensina a pessoa a desconfiar do resto da página.
 *
 * A escolha vive aqui e não sobe para a seção porque nada mais depende
 * dela. Menos estado atravessando a árvore, menos o que quebrar.
 */
export function PostGerado() {
  const [escolhida, setEscolhida] = useState(0)
  const variacao = E.variacoes[escolhida]

  return (
    <figure className="post">
      <figcaption className="post__bar">
        <span className="post__dot" aria-hidden="true" />
        <b>{E.marca}</b>
        <span>{E.contexto}</span>
      </figcaption>

      <div className="post__body">
        {/* aria-live: quem usa leitor de tela ouve a legenda nova sem ter
            de sair caçando o que mudou depois de acionar o chip. */}
        <p className="post__caption" aria-live="polite">
          {variacao.legenda} <i>{variacao.marcadores}</i>
        </p>

        <ul className="chips">
          {E.variacoes.map((v, i) => (
            <li key={v.rotulo}>
              <button
                type="button"
                aria-pressed={i === escolhida}
                data-ativa={i === escolhida || undefined}
                onClick={() => setEscolhida(i)}
              >
                {v.rotulo}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
