'use client'

import { useState } from 'react'
import { LANDING } from '@/content/landing'

const C = LANDING.features.calcula
const { investimento: I, retorno: R } = C

/**
 * R$ 1.840.
 *
 * Separador escrito à mão de propósito. `Intl.NumberFormat` depende do
 * ICU do ambiente, e quem monta o HTML da exportação estática não é o
 * mesmo motor que hidrata no navegador: basta divergirem para o React
 * acusar diferença de marcação na carga.
 */
function reais(valor: number) {
  const inteiro = Math.round(valor).toString()
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

/** 3,29 vira "3,3×". */
function multiplo(valor: number) {
  return `${valor.toFixed(1).replace('.', ',')}×`
}

/**
 * Custo e retorno, com o investimento nas mãos de quem lê.
 *
 * O card dizia "saiba o custo antes" mostrando um custo que não era de
 * ninguém. Com o controle, o número que aparece é o do próprio visitante
 * — é a única parte da página onde isso acontece.
 *
 * O retorno cai conforme o investimento sobe: reta simples entre os dois
 * extremos declarados no conteúdo. Não é modelo, é ilustração honesta de
 * que o primeiro real rende mais que o último — e a nota embaixo do
 * controle diz isso com todas as letras.
 */
export function CalculoRoi() {
  const [valor, setValor] = useState<number>(I.inicial)

  const fracao = (valor - I.min) / (I.max - I.min)
  const roi = R.maior - fracao * (R.maior - R.menor)

  return (
    <div className="rec-out calc">
      <dl className="numeros">
        <div>
          <dt>
            <label htmlFor="calc-investimento">{I.rotulo}</label>
          </dt>
          <dd>{reais(valor)}</dd>
        </div>
        <div>
          <dt>{R.rotulo}</dt>
          <dd data-destaque>{multiplo(roi)}</dd>
        </div>
      </dl>

      <input
        id="calc-investimento"
        className="calc__controle"
        type="range"
        min={I.min}
        max={I.max}
        step={I.passo}
        value={valor}
        /* O leitor de tela anunciaria "1840" sem isto. */
        aria-valuetext={reais(valor)}
        aria-label={I.etiqueta}
        onChange={(e) => setValor(Number(e.target.value))}
      />

      <p className="calc__nota">{R.nota}</p>
    </div>
  )
}
