/**
 * O salto de âncora — quanto tempo ele dura e com que curva.
 *
 * Existe porque `scroll-behavior: smooth` (styles/base.css) não tem noção de
 * prazo: ele deriva a duração da DISTÂNCIA, e numa página longa isso vira
 * espera. Medido no Chrome com a landing em 26,5 telas, clicar "Garanta sua
 * vaga" deixava a página 2,34s parada sem mover um pixel e levava 4,34s até
 * assentar na oferta. O botão principal do site lia como quebrado — acima de
 * ~1s sem resposta o usuário perde o fio, e 2,3s é tempo de sobra para
 * concluir que o clique não pegou.
 *
 * Encurtar a página ajudou mas não resolve: mesmo em ~12.800px o smooth
 * nativo continua longo demais. O conserto é tirar a duração das mãos da
 * distância e prendê-la num teto.
 */

/** Piso e teto do salto, em ms. */
export const MINIMO = 320
export const MAXIMO = 720

/**
 * Pixels de rolagem por milissegundo de animação — a taxa que vale ENTRE o
 * piso e o teto.
 *
 * 20px/ms coloca a travessia da landing inteira (~12.800px) em ~640ms, logo
 * abaixo do teto, e mantém os saltos curtos do menu no piso. Não é uma
 * velocidade escolhida por si: é a que faz os dois casos reais caírem onde
 * se quer sem que nenhum encoste no limite errado.
 */
export const TAXA = 20

/**
 * Quanto dura o salto, em ms, para uma distância em pixels.
 *
 * O TETO é o ponto de tudo isto. Sem ele a duração volta a crescer com a
 * página e o problema reaparece na próxima seção que alguém acrescentar. O
 * PISO existe pelo motivo oposto: um salto de 200px resolvido em 10ms é um
 * corte seco, e corte seco num link de menu apaga a noção de para onde a
 * página foi.
 *
 * O que NÃO é negociável aqui é o primeiro quadro: qualquer valor neste
 * intervalo começa a mover a página em ~16ms. É essa a diferença entre um
 * botão que responde e um que parece morto, e ela não depende da duração
 * total ser 320 ou 720.
 */
export function duracaoDoSalto(distanciaPx: number): number {
  const bruta = Math.abs(distanciaPx) / TAXA
  return Math.min(MAXIMO, Math.max(MINIMO, bruta))
}

/**
 * A curva do salto: acelera saindo, desacelera chegando (cúbica, nas duas
 * pontas).
 *
 * Linear leria como teletransporte com o freio de mão puxado — a página
 * parte na velocidade final e para na velocidade final, e a distância some
 * do gesto. Com as duas pontas suaves sobra a leitura que interessa numa
 * página desta altura: a de ter VIAJADO até a oferta, não a de ter piscado
 * para ela. É o mesmo papel que `suave` cumpre na chegada da estação.
 *
 * Fora de [0,1] devolve as pontas, porque o relógio do `requestAnimationFrame`
 * pode entregar um quadro atrasado e passar de 1.
 */
export function suavizaSalto(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
