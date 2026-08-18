import { test } from 'node:test'
import assert from 'node:assert/strict'
import { duracaoDoSalto, MAXIMO, MINIMO, suavizaSalto, TAXA } from './ancora.ts'

const perto = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`)

/* A razao de existir do modulo. Se o teto cair, a duracao volta a crescer
   com a pagina e o CTA volta a parecer morto na proxima secao que alguem
   acrescentar — que e exatamente como o problema original nasceu. */
test('a duracao tem teto, por maior que seja a pagina', () => {
  assert.equal(duracaoDoSalto(12_800 * 100), MAXIMO)
  assert.equal(duracaoDoSalto(Number.MAX_SAFE_INTEGER), MAXIMO)
})

test('a duracao tem piso, por menor que seja o salto', () => {
  assert.equal(duracaoDoSalto(0), MINIMO)
  assert.equal(duracaoDoSalto(1), MINIMO)
  assert.equal(duracaoDoSalto(200), MINIMO)
})

/* Os dois casos reais da landing. Nenhum dos dois pode encostar no limite
   errado: a travessia inteira nao pode saturar no teto (perderia a relacao
   com a distancia) e o link de menu nao pode escapar do piso. */
test('a travessia da landing inteira cabe abaixo do teto', () => {
  const duracao = duracaoDoSalto(12_800)
  perto(duracao, 640)
  assert.ok(duracao < MAXIMO, `${duracao} saturou no teto`)
  assert.ok(duracao > MINIMO, `${duracao} caiu no piso`)
})

test('a distancia negativa vale o mesmo que a positiva', () => {
  assert.equal(duracaoDoSalto(-12_800), duracaoDoSalto(12_800))
})

test('entre o piso e o teto a duracao segue a taxa', () => {
  perto(duracaoDoSalto(MINIMO * TAXA + 1), (MINIMO * TAXA + 1) / TAXA)
  assert.ok(MINIMO < MAXIMO, 'piso acima do teto')
})

test('a curva sai de 0 e chega em 1', () => {
  perto(suavizaSalto(0), 0)
  perto(suavizaSalto(1), 1)
  perto(suavizaSalto(0.5), 0.5)
})

/* O requestAnimationFrame pode entregar um quadro atrasado e mandar t > 1.
   Sem as pontas presas, a pagina passaria do destino e voltaria. */
test('a curva prende as pontas fora de [0,1]', () => {
  assert.equal(suavizaSalto(-3), 0)
  assert.equal(suavizaSalto(1.4), 1)
})

test('a curva e monotona — a pagina nunca volta no meio do salto', () => {
  let anterior = -1
  for (let i = 0; i <= 100; i++) {
    const v = suavizaSalto(i / 100)
    assert.ok(v >= anterior, `caiu de ${anterior} para ${v} em t=${i / 100}`)
    anterior = v
  }
})

/* Simetrica: acelera saindo tanto quanto desacelera chegando. Uma curva
   torta aqui daria a impressao de a pagina ser jogada ou de frear cedo
   demais, que e o tipo de coisa que se sente sem saber nomear. */
test('a curva e simetrica nas duas pontas', () => {
  for (const t of [0.1, 0.25, 0.4, 0.49]) {
    perto(suavizaSalto(t), 1 - suavizaSalto(1 - t))
  }
})
