import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ANGULO,
  comprimentoDaLinha,
  direcao,
  distanciaNoPonto,
  PARADA_VIOLETA,
  paradaDoVioleta,
} from './fecho.ts'

const perto = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`)

test('direcao aponta para a direita e para baixo em 125 graus', () => {
  const [dx, dy] = direcao()
  perto(dx, 0.819152)
  perto(dy, 0.573576)
  assert.equal(ANGULO, 125)
})

test('comprimentoDaLinha soma as projecoes da largura e da altura', () => {
  const [dx, dy] = direcao()
  perto(comprimentoDaLinha(1425, 1633), 1425 * dx + 1633 * dy)
  perto(comprimentoDaLinha(1425, 1633), 2103.941984)
})

test('distanciaNoPonto e a projecao do ponto na direcao do degrade', () => {
  const [dx, dy] = direcao()
  perto(distanciaNoPonto(0, 0), 0)
  perto(distanciaNoPonto(0, 1633), 1633 * dy)
  perto(distanciaNoPonto(1425, 0), 1425 * dx)
  perto(distanciaNoPonto(712, 800), 712 * dx + 800 * dy)
})

/* A propriedade que sustenta o desenho inteiro. Crescer a caixa para baixo
   desloca o ponto inicial do degrade PERPENDICULARMENTE a sua direcao, e
   translacao perpendicular nao altera projecao nenhuma. Por isso a distancia
   nao recebe largura nem altura: ela nao depende delas. Se este teste cair,
   o CTA deixou de renderizar igual e o desenho perdeu a base. */
test('a distancia nao depende da caixa — CTA e fecho dao o mesmo valor', () => {
  const alturaCta = 1633
  const alturaFecho = 1979
  const largura = 1425
  const [dx, dy] = direcao()
  for (const [x, y] of [[0, 0], [0, alturaCta], [largura, 0], [712, 800], [largura, alturaCta]]) {
    const naCaixaDoCta = 0.5 * comprimentoDaLinha(largura, alturaCta)
      + (x - largura / 2) * dx + (y - alturaCta / 2) * dy
    const naCaixaDoFecho = 0.5 * comprimentoDaLinha(largura, alturaFecho)
      + (x - largura / 2) * dx + (y - alturaFecho / 2) * dy
    perto(naCaixaDoCta, naCaixaDoFecho)
    perto(naCaixaDoCta, distanciaNoPonto(x, y))
  }
})

test('paradaDoVioleta e a fracao do comprimento da linha do CTA', () => {
  assert.equal(PARADA_VIOLETA, 0.76)
  perto(paradaDoVioleta(1425, 1633), comprimentoDaLinha(1425, 1633) * 0.76)
  perto(paradaDoVioleta(1425, 1633), 1598.995908)
})
