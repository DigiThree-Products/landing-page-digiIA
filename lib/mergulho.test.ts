import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ESCALA_EM, FATOR, PISTA, REVELA_EM, REVELA_FIM_EM, SEGURA, TOTAL } from './mergulho.ts'

const perto = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`)

/* Fracao do pin convertida para TELAS de rolagem, que e a unidade em que o
   mergulho precisa ser pensado: o `scrub` gasta o atraso dele percorrendo
   rolagem, nao percorrendo fracoes de um pin cujo tamanho muda. */
const telas = (fracao: number) => fracao * TOTAL

test('o pin da hero mede 1,6 tela de mergulho mais o que SEGURA segura', () => {
  assert.equal(SEGURA, 1)
  perto(TOTAL, 2.6)
})

/* A promessa escrita no comentario de SEGURA: encurtar o pin nao desloca o
   comeco do mergulho. `FATOR` existe para isso, e o teste e o mesmo calculo
   que o comentario faz — a centralizacao mede `0,34 * 1,6` telas de rolagem
   qualquer que seja TOTAL, porque o TOTAL se cancela. */
test('a centralizacao ocupa a mesma rolagem em qualquer tamanho de pin', () => {
  perto(telas(ESCALA_EM), 0.34 * 1.6)
  perto(telas(ESCALA_EM), 0.544)
  perto(FATOR, 1.6 / TOTAL)
})

/* A pista de pouso e onde o cerebro e VISTO nos 150x — o `scrub` alcanca a
   escala aqui dentro. Enquanto REVELA_EM foi o literal 0,875 esta janela
   encolhia junto com o pin, calada: em 2,6 telas ela teria caido para 0,33 e
   escondido de volta o tamanho final. Se este teste cair, a pista voltou a
   ser refem do comprimento do pin. */
test('a pista de pouso tem comprimento fisico fixo, nao fracao do pin', () => {
  perto(telas(REVELA_FIM_EM - REVELA_EM), PISTA)
  perto(telas(1 - REVELA_EM), 0.4375)
})

/* O corte de 3,5 para 2,6 telas saiu INTEIRO do crescimento, que e
   transporte. As duas pontas — a centralizacao e a pista — estao defendidas
   pelos dois testes acima, entao o crescimento e o que sobra. */
test('o crescimento e a unica fase que absorve o encurtamento', () => {
  perto(telas(REVELA_EM - ESCALA_EM), 2.6 - 0.544 - 0.4375)
  perto(telas(ESCALA_EM) + telas(REVELA_EM - ESCALA_EM) + telas(1 - REVELA_EM), TOTAL)
})

/* A garantia dura do fim do pin: a opacidade e escrita a partir do progresso
   cru, entao ela precisa chegar a zero no mesmo quadro em que o pin solta.
   Qualquer valor diferente de 1 devolve o cerebro semitransparente
   deslizando junto com a secao seguinte. */
test('a dissolucao termina exatamente no fim do pin', () => {
  assert.equal(REVELA_FIM_EM, 1)
})

/* As fases sao ordenadas e nenhuma tem comprimento negativo. Um SEGURA baixo
   demais inverteria ESCALA_EM e REVELA_EM sem erro de tipo nenhum — o
   crescimento passaria a rodar de tras para frente. */
test('as fases do mergulho estao em ordem e nenhuma e negativa', () => {
  assert.ok(ESCALA_EM > 0, `ESCALA_EM ${ESCALA_EM} <= 0`)
  assert.ok(REVELA_EM > ESCALA_EM, `REVELA_EM ${REVELA_EM} <= ESCALA_EM ${ESCALA_EM}`)
  assert.ok(REVELA_FIM_EM > REVELA_EM, `REVELA_FIM_EM <= REVELA_EM ${REVELA_EM}`)
})
