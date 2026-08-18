/**
 * Fonte única da geometria do fecho.
 *
 * O CTA e o rodapé são pintados por um campo só (ver `styles/fecho.css`), e
 * esse campo precisa cobrir os dois SEM mudar o CTA. Com a parada do violeta
 * em porcentagem isso é impossível: porcentagem é relativa ao comprimento da
 * linha do degradê, que cresce junto com a caixa, então toda cor escorrega.
 * Em pixel absoluto não escorrega — e é esta a razão de este módulo existir.
 *
 * É o quarto da família, pelo mesmo motivo dos anteriores: `lib/poeira.ts`
 * para o eixo da revelação, `lib/mergulho.ts` para o progresso do mergulho,
 * `lib/grao.ts` para o que é um grão.
 *
 * Puro de propósito: sem DOM, sem React, sem estado. É o que permite fixar a
 * geometria em `fecho.test.ts`.
 */

/** Ângulo do degradê, em graus, como o CSS mede: 0 = para cima, horário. */
export const ANGULO = 125

/** Onde o violeta satura, como fração do comprimento da linha do CTA. */
export const PARADA_VIOLETA = 0.76

/**
 * Direção do degradê em coordenadas de tela — x para a direita, y para baixo.
 * Em 125° as duas componentes são positivas: o degradê desce para a direita.
 */
export function direcao(anguloGraus: number = ANGULO): [number, number] {
  const a = (anguloGraus * Math.PI) / 180
  return [Math.sin(a), -Math.cos(a)]
}

/** Comprimento da linha do degradê numa caixa de `largura` × `altura`. */
export function comprimentoDaLinha(
  largura: number,
  altura: number,
  anguloGraus: number = ANGULO,
): number {
  const [dx, dy] = direcao(anguloGraus)
  return Math.abs(largura * dx) + Math.abs(altura * dy)
}

/**
 * Distância de um ponto ao início do degradê, em pixels.
 *
 * Não recebe a caixa porque não depende dela. A conta longa é
 * `L/2 + (x − W/2)·dx + (y − H/2)·dy`; substituindo `L = W·dx + H·dy` os
 * termos de W e H se cancelam e sobra a projeção pura. Vale enquanto as duas
 * componentes da direção forem positivas (ângulo entre 90° e 180°), que é o
 * caso do canto inicial ser o superior esquerdo.
 */
export function distanciaNoPonto(x: number, y: number, anguloGraus: number = ANGULO): number {
  const [dx, dy] = direcao(anguloGraus)
  return x * dx + y * dy
}

/** Onde fixar o violeta, em pixels, para o CTA renderizar como hoje. */
export function paradaDoVioleta(largura: number, altura: number): number {
  return comprimentoDaLinha(largura, altura) * PARADA_VIOLETA
}
