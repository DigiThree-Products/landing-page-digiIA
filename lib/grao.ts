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

/* ------------------------------------------------------------------
   Convergência do núcleo da hero para este campo.

   O núcleo estrelado (HeroEstrelas) tem um look próprio — grão maior,
   mais opaco, com halo, mais branco — e isso está certo: o fundo dele é
   a textura do cérebro, uma imagem clara e cheia de pontos de luz
   desenhados. Um grão fraco ali seria grão invisível.

   Só que essa justificativa se dissolve conforme o mergulho avança. Em
   80× a textura vira um banho de luz suave, e no fim ela apaga de vez.
   Então o look do núcleo não é um conjunto de constantes: é um DESVIO
   deste campo que decai a zero. Quando a dissolução termina, não sobra
   nada para revelar — o corte não tem o que cortar, e a única coisa que
   muda ao atravessar é o campo estar em movimento.

   As curvas usam `suave`, não o `t³` que o `crescimento` original usava
   para casar com o `power2.in` do palco. O `t³` concentra a mudança no
   fim, que era o que se queria quando o crescimento do grão ERA o
   efeito. Aqui o objetivo é o oposto: a convergência precisa ser lenta e
   espalhada o bastante para não ser percebida como mudança.
   ------------------------------------------------------------------ */

/** Progresso normalizado de `v` dentro da janela `[de, ate]`. */
export function progresso(v: number, de: number, ate: number): number {
  return limita((v - de) / (ate - de))
}

/**
 * Multiplicador do raio sobre `raioDoGrao`.
 *
 * O valor de repouso 0,397 é `(1 / 0,42) × (1/6)` arredondado (o exato é
 * 0,396825…): reproduz o tamanho que o núcleo tinha em repouso antes
 * desta mudança, com o `FATOR_MINIMO` antigo e a razão entre as duas
 * fórmulas de raio já embutidos. Quem cresce de verdade durante o mergulho não é só este
 * ganho — é ele junto com `zConvergente`, e é a soma dos dois que faz o
 * campo ganhar VARIAÇÃO em vez de só ficar maior.
 */
const RAIO_REPOUSO = 0.397
export function ganhoRaio(t: number): number {
  return RAIO_REPOUSO + (1 - RAIO_REPOUSO) * suave(t)
}

/**
 * Multiplicador do alfa sobre `alfaDoGrao`.
 *
 * Não é a `presenca` antiga (1,3–1,75): as duas fórmulas de base diferem
 * — o núcleo usava `0,65 + 0,5·(1-z)` e este campo usa
 * `0,26 + 0,52·(1-z)` — e o ganho que reproduz o look anterior fica entre
 * ~2,9 e ~4,9 conforme a profundidade. Nenhum escalar casa com todos;
 * 4,0 é calibragem no olho, não número derivado.
 */
const ALFA_REPOUSO = 4
export function ganhoAlfa(t: number): number {
  return 1 + (ALFA_REPOUSO - 1) * (1 - suave(t))
}

/** O halo existe para dar leitura de brilho contra fundo claro. Contra o
    vazio este campo não tem halo nenhum, então ele sai inteiro. */
export function ganhoHalo(t: number): number {
  return 1 - suave(t)
}

/** Quanto o grão puxa para o branco. Era sorteio no núcleo (55% dos
    grãos brancos); virou mistura porque um tom sorteado não converge
    continuamente — não dá para um grão "ficar menos branco" se o branco
    dele foi decidido no nascimento. */
const VIES_REPOUSO = 0.33
export function viesBranco(t: number): number {
  return VIES_REPOUSO * (1 - suave(t))
}

export function corComVies(cor: RGB, branco: RGB, vies: number): RGB {
  return [
    Math.round(cor[0] + (branco[0] - cor[0]) * vies),
    Math.round(cor[1] + (branco[1] - cor[1]) * vies),
    Math.round(cor[2] + (branco[2] - cor[2]) * vies),
  ]
}

/**
 * A profundidade do grão caminha da faixa de repouso do núcleo até um
 * alvo sorteado em `FAIXA_Z`.
 *
 * Governa SÓ raio e alfa. A posição converge por outro caminho (ver
 * HeroEstrelas), porque abrir `z` até 0,05 na projeção do disco faria a
 * perspectiva valer 8,6 e jogaria os grãos para fora da tela.
 */
export function zConvergente(zRepouso: number, zFundo: number, t: number): number {
  return zRepouso + (zFundo - zRepouso) * suave(t)
}
