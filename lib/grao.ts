/**
 * Fonte única do que é um grão.
 *
 * O campo de fundo (PoeiraFundo) e o núcleo estrelado da hero
 * (HeroEstrelas) precisam concordar sobre tamanho, cor e brilho de um
 * grão a uma dada profundidade — senão a travessia entre os dois, no fim
 * do mergulho, lê como corte. Guardar as fórmulas em dois arquivos
 * deixaria fácil um mudar sem o outro perceber.
 *
 * É o terceiro módulo desta família, pelo mesmo motivo dos anteriores:
 * `lib/poeira.ts` para o eixo da revelação, `lib/mergulho.ts` para o
 * progresso do mergulho.
 *
 * Os números vêm do ramo VERTICAL do PoeiraFundo, que é o vivo
 * (`MODO_POEIRA`). O ramo radial tem constantes próprias e está morto;
 * não é fonte de nada.
 *
 * Puro de propósito: sem DOM, sem React, sem estado. É o que permite
 * fixar as fórmulas em `grao.test.ts` — e esse teste é o que prova que a
 * extração não mudou o campo que já está no ar.
 */

export type RGB = [number, number, number]

/** O que um grão é, independente de onde ele está. */
export type Identidade = {
  /** Índice na paleta de emissão. */
  tom: number
  brilho: number
  /** Fase da cintilação, para as estrelas não piscarem em coro. */
  fase: number
  cintila: number
}

/** Faixa de profundidade do campo. */
export const FAIXA_Z: [number, number] = [0.05, 1]

/** Teto de alfa. Vale para os dois campos: um teto mais alto em um deles
    deixaria diferença residual justamente nos grãos mais visíveis. */
export const TETO_ALFA = 0.92

export const limita = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const suave = (t: number) => t * t * (3 - 2 * t)

/**
 * Leitura de token com piso.
 *
 * O `parseInt` cego em hexadecimal é o jeito curto, mas devolve NaN sem
 * reclamar se o token virar `oklch()` ou `rgb()` — e cor NaN no canvas é
 * ignorada em silêncio, deixando o grão com a última cor do contexto. Um
 * alternativo declarado transforma isso em degradação visível.
 *
 * Recebe a string bruta, não um `CSSStyleDeclaration`, para ser
 * exercitável fora do navegador.
 */
export function corDoToken(bruto: string, alternativo: RGB): RGB {
  const hex = /^#?([0-9a-f]{6})$/i.exec(bruto.trim())
  if (!hex) return alternativo
  const n = parseInt(hex[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Emissão: o grão brilhando contra o vazio. */
export function paletaEmissao(ler: (nome: string) => string): RGB[] {
  return [
    corDoToken(ler('--lilac'), [205, 130, 255]),
    corDoToken(ler('--mid'), [142, 71, 251]),
    corDoToken(ler('--paper'), [248, 240, 255]),
  ]
}

export function sortearIdentidade(): Identidade {
  return {
    tom: (Math.random() * 3) | 0,
    brilho: 0.5 + Math.random() * 0.5,
    fase: Math.random() * Math.PI * 2,
    cintila: 0.6 + Math.random() * 1.5,
  }
}

/** Teto e piso são rede de segurança: dentro de FAIXA_Z a fórmula nua
    rende 0,67–13,4 e só o teto chega a valer. */
export function raioDoGrao(z: number): number {
  return Math.min(5, Math.max(0.5, (1.6 / z) * 0.42))
}

/** Base do alfa — sem os fatores que são de cada campo (força do scroll,
    entrada/saída de reciclagem, silhueta). */
export function alfaDoGrao(z: number, brilho: number): number {
  return (0.26 + 0.52 * (1 - z)) * brilho
}

export function cintilacao(segundos: number, fase: number, ciclo: number): number {
  return 1 + Math.sin(segundos * ciclo + fase) * 0.3
}
