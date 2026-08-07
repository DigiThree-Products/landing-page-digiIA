/**
 * Fonte única do eixo da poeira de fundo.
 *
 * O canvas (PoeiraFundo) e a revelação no scroll (Reveal) precisam
 * concordar sobre a direção de onde tudo "vem" — um lê MODO_POEIRA
 * para decidir a deriva das partículas, o outro chama esta função
 * para decidir de onde cada bloco entra. Guardar os dois em arquivos
 * separados deixaria fácil um mudar sem o outro perceber.
 */

export type ModoPoeira = 'vertical' | 'radial'

export const MODO_POEIRA: ModoPoeira = 'vertical'

/** Deslocamento curto de propósito: viagem longa borra o texto ao ler. */
const DIST = 26

export function eixoDaRevelacao(el: Element): [number, number] {
  if (MODO_POEIRA === 'vertical') return [0, DIST + 8]

  const r = el.getBoundingClientRect()
  const dx = r.left + r.width / 2 - window.innerWidth / 2
  const dy = r.top + r.height / 2 - window.innerHeight / 2
  const c = Math.hypot(dx, dy) || 1
  return [(-dx / c) * DIST, (-dy / c) * DIST - 10]
}
