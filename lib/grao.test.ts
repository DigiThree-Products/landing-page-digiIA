import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  alfaDoGrao,
  cintilacao,
  corDoToken,
  FAIXA_Z,
  limita,
  paletaEmissao,
  raioDoGrao,
  sortearIdentidade,
  suave,
  TETO_ALFA,
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
