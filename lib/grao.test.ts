import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ESCALA_EM, REVELA_EM, REVELA_FIM_EM } from './mergulho.ts'
import {
  alfaDoGrao,
  cintilacao,
  CONTAGEM_GRAOS,
  corComVies,
  fadeProximo,
  corDoToken,
  FAIXA_Z,
  ganhoAlfa,
  ganhoHalo,
  ganhoRaio,
  limita,
  paletaEmissao,
  progresso,
  raioDoGrao,
  sortearIdentidade,
  suave,
  TETO_ALFA,
  viesBranco,
  zConvergente,
} from './grao.ts'

const perto = (a: number, b: number) => assert.equal(Number(a.toFixed(6)), Number(b.toFixed(6)))

test('raioDoGrao reproduz a fórmula do ramo vertical', () => {
  perto(raioDoGrao(1), 0.672)
  perto(raioDoGrao(0.5), 1.344)
  perto(raioDoGrao(0.05), 5) // teto
  perto(raioDoGrao(2), 0.5) // piso, fora da faixa viva
})

test('alfaDoGrao reproduz a base do ramo vertical', () => {
  perto(alfaDoGrao(1, 1), 0.26)
  perto(alfaDoGrao(1, 0.5), 0.13)
  perto(alfaDoGrao(0.05, 1), 0.754)
})

test('cintilacao oscila 30% em torno de 1', () => {
  perto(cintilacao(0, 0, 1), 1)
  perto(cintilacao(Math.PI / 2, 0, 1), 1.3)
  perto(cintilacao(0, Math.PI / 2, 1), 1.3)
})

test('corDoToken lê hex e cai no alternativo quando não é hex', () => {
  assert.deepEqual(corDoToken('#cd82ff', [0, 0, 0]), [205, 130, 255])
  assert.deepEqual(corDoToken('  #8e47fb  ', [0, 0, 0]), [142, 71, 251])
  assert.deepEqual(corDoToken('oklch(0.7 0.2 300)', [1, 2, 3]), [1, 2, 3])
  assert.deepEqual(corDoToken('', [1, 2, 3]), [1, 2, 3])
})

test('paletaEmissao usa lilac, mid e paper nessa ordem', () => {
  const falso: Record<string, string> = {
    '--lilac': '#cd82ff',
    '--mid': '#8e47fb',
    '--paper': '#f8f0ff',
  }
  assert.deepEqual(paletaEmissao((n) => falso[n] ?? ''), [
    [205, 130, 255],
    [142, 71, 251],
    [248, 240, 255],
  ])
})

test('sortearIdentidade respeita as faixas do campo do site', () => {
  for (let i = 0; i < 500; i++) {
    const g = sortearIdentidade()
    assert.ok(Number.isInteger(g.tom) && g.tom >= 0 && g.tom <= 2)
    assert.ok(g.brilho >= 0.5 && g.brilho < 1)
    assert.ok(g.fase >= 0 && g.fase < Math.PI * 2)
    assert.ok(g.cintila >= 0.6 && g.cintila < 2.1)
  }
})

test('limita e suave', () => {
  perto(limita(-1), 0)
  perto(limita(2), 1)
  perto(limita(0.5), 0.5)
  perto(suave(0), 0)
  perto(suave(0.5), 0.5)
  perto(suave(1), 1)
})

test('constantes do campo', () => {
  assert.deepEqual(FAIXA_Z, [0.05, 1])
  perto(TETO_ALFA, 0.92)
})

/* ------------------------------------------------------------------
   Convergência do núcleo da hero para este campo.
   ------------------------------------------------------------------ */

test('progresso normaliza e limita a janela', () => {
  perto(progresso(0.136, 0.136, 0.875), 0)
  perto(progresso(0.875, 0.136, 0.875), 1)
  perto(progresso(0, 0.136, 0.875), 0)
  perto(progresso(1, 0.136, 0.875), 1)
  perto(progresso(0.5055, 0.136, 0.875), 0.5)
})

test('ganhoRaio sai do repouso e chega em 1', () => {
  perto(ganhoRaio(0), 0.397)
  perto(ganhoRaio(1), 1)
  perto(ganhoRaio(0.5), 0.6985)
})

test('ganhoAlfa decai de 4 para 1', () => {
  perto(ganhoAlfa(0), 4)
  perto(ganhoAlfa(1), 1)
  perto(ganhoAlfa(0.5), 2.5)
})

test('ganhoHalo decai de 1 para 0', () => {
  perto(ganhoHalo(0), 1)
  perto(ganhoHalo(1), 0)
  perto(ganhoHalo(0.5), 0.5)
})

test('viesBranco decai de 0,33 para 0', () => {
  perto(viesBranco(0), 0.33)
  perto(viesBranco(1), 0)
  perto(viesBranco(0.5), 0.165)
})

test('corComVies caminha da cor até o branco', () => {
  assert.deepEqual(corComVies([200, 100, 250], [248, 240, 255], 0), [200, 100, 250])
  assert.deepEqual(corComVies([200, 100, 250], [248, 240, 255], 1), [248, 240, 255])
  assert.deepEqual(corComVies([200, 100, 250], [248, 240, 255], 0.5), [224, 170, 253])
})

test('zConvergente vai do repouso ao alvo', () => {
  perto(zConvergente(0.62, 0.05, 0), 0.62)
  perto(zConvergente(0.62, 0.05, 1), 0.05)
  perto(zConvergente(0.62, 0.05, 0.5), 0.335)
})

/* As duas agendas têm que se encontrar exatamente onde a dissolução
   começa: a geometria termina em REVELA_EM e a fotometria parte de lá.
   Um vão entre elas seria um instante com o grão em estado indefinido. */
test('as duas agendas se encontram em REVELA_EM sem vao', () => {
  /* Importados, não copiados. Escrever 0,875 aqui faria o teste passar
     para sempre, inclusive depois de alguém mudar a janela — ele
     afirmaria a própria cópia em vez do que o código usa. */
  perto(progresso(REVELA_EM, ESCALA_EM, REVELA_EM), 1)
  perto(progresso(REVELA_EM, REVELA_EM, REVELA_FIM_EM), 0)
  perto(ganhoRaio(progresso(REVELA_EM, ESCALA_EM, REVELA_EM)), 1)
  perto(viesBranco(progresso(REVELA_EM, ESCALA_EM, REVELA_EM)), 0)
  perto(ganhoHalo(progresso(REVELA_FIM_EM, REVELA_EM, REVELA_FIM_EM)), 0)
  perto(ganhoAlfa(progresso(REVELA_FIM_EM, REVELA_EM, REVELA_FIM_EM)), 1)
})

test('a janela de dissolucao vem depois da geometria e nao se sobrepoe', () => {
  assert.ok(ESCALA_EM < REVELA_EM, 'geometria comeca antes de terminar')
  assert.ok(REVELA_EM < REVELA_FIM_EM, 'a dissolucao tem duracao')
})

test('fadeProximo apaga o grao rente a camera', () => {
  perto(fadeProximo(FAIXA_Z[0]), 0)
  perto(fadeProximo(FAIXA_Z[0] + 0.06), 1)
  perto(fadeProximo(1), 1)
  perto(fadeProximo(FAIXA_Z[0] + 0.03), 0.5)
})

test('contagem dos dois campos e a mesma fonte', () => {
  assert.equal(CONTAGEM_GRAOS.grande, 260)
  assert.equal(CONTAGEM_GRAOS.toque, 110)
})
