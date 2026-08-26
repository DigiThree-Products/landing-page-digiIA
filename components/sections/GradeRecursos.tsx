'use client'

import { useEffect, useRef } from 'react'

/**
 * A GRADE DA ESTAÇÃO 02 — o quadrado que chega e se abre no console.
 *
 * O console já É uma grade de oito células fechadas: cinco conduítes
 * verticais, o trilho em cima, o filete no meio de cada instrumento e o piso
 * embaixo. Cada célula tem as quatro arestas. O que esta camada faz não é
 * inventar um desenho novo — é desenhar ESSA MESMA grade podendo comprimi-la
 * na horizontal, coisa que as linhas do console não conseguem fazer porque
 * cada uma é um pseudo-elemento preso ao seu quadrado no fluxo.
 *
 * A coreografia, então, é: esta camada chega como um QUADRADO (as mesmas oito
 * células, espremidas), abre até coincidir exatamente com o console, e no fim
 * troca de lugar com ele. Como as duas grades são a mesma nos últimos quadros,
 * a troca não se vê — some só esta camada, e as linhas de verdade ficam.
 *
 * ---- POR QUE ISTO É UM COMPONENTE DE CLIENTE E NÃO SÓ CSS ----
 *
 * As posições HORIZONTAIS saem de graça em CSS: a fileira é
 * `repeat(4, 1fr)` com `gap: var(--vao)`, então a coluna vale
 * `(100% - 3 × --vao) / 4` e o conduíte k mora em `k × (coluna + vão) −
 * vão/2`. Nada a medir.
 *
 * As VERTICAIS não. O filete cai no fim do bloco de texto e o piso no fim do
 * slot do artefato, e as duas alturas são de CONTEÚDO: `--cabeca` e `--slot`
 * são pisos mínimos, não as alturas reais (medido: `--cabeca` 108px contra
 * 120px de texto real). Nenhuma expressão CSS sabe dizer onde eles caem.
 *
 * Daí as três medidas publicadas aqui, e só elas:
 *   --g-y       (em cada segmento) y do filete e do piso daquele instrumento
 *   --g-piso    y do piso mais baixo dos quatro, que fecha a caixa da grade
 *   --g-min     razão entre a largura do quadrado e a da grade aberta
 *
 * `--g-min` é o que fecha a conta do quadrado: a grade é quadrada quando a
 * largura iguala a altura, e a altura só se conhece depois de medir. Como
 * escala e não como pixels porque quem faz a compressão é um `scaleX`.
 *
 * ---- POR QUE `scaleX` E NÃO LARGURA ----
 *
 * Animar a largura de verdade recalcularia o layout a cada quadro de rolagem,
 * com os quatro quadrados e o conteúdo deles dentro. Pior: em ~130px por
 * coluna os títulos quebram em muito mais linhas, a altura do bloco de texto
 * cresce, e o "quadrado" deixaria de ser quadrado no meio do caminho — a
 * geometria dependeria do texto que ela deveria estar escondendo.
 *
 * Com `scaleX` nada disso acontece: a caixa não muda, só a pintura. O preço é
 * que a escala achataria a espessura das linhas verticais junto — 2px viram
 * 0,6px no começo da abertura. Por isso cada vertical leva a escala INVERSA
 * (`1 / --g-s`) em torno do próprio centro: a posição comprime, a espessura
 * não. As horizontais não precisam de nada, porque `scaleX` mexe no
 * comprimento delas, que é justamente o que se quer, e não na altura.
 */
export function GradeRecursos() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grade = ref.current
    if (!grade) return
    const layout = grade.closest<HTMLElement>('.rec-layout')
    const fileira = layout?.querySelector<HTMLElement>('.quads')
    if (!layout || !fileira) return

    const medir = () => {
      const quadrados = [...fileira.querySelectorAll<HTMLElement>('.quad')]
      if (!quadrados.length) return

      /* ---- CADA INSTRUMENTO TEM O SEU FILETE, e não um valor para os quatro ----
         A primeira versão media só o primeiro quadrado e repetia o número nos
         outros três. Medido a 1920px, aquilo errava por 20px no CRIA: o título
         dele ("Saia com a campanha pronta") quebra em duas linhas, o bloco de
         texto cresce e o filete e o piso daquele quadrado descem junto.

         Isso não é defeito da grade — é o console que se desalinha quando um
         título passa do `--cabeca` (ver a nota dele em `.rec-layout`, que já
         avisa que o desalinhamento aparecendo é sinal de o número precisar
         subir). Corrigir aquele piso mínimo é outra conversa, de composição.
         O que a grade tem de fazer é copiar o console COMO ELE É, seja qual
         for a copy — senão a troca no fim da abertura vira um salto.

         Daí a medição por quadrado, escrita direto no elemento de cada
         segmento. */

      /* ---- `offset*` E NUNCA `getBoundingClientRect` AQUI ----
         O palco desta seção é escalado pelo GSAP a viagem inteira, de 0,16 até
         1 (ver Estacoes.tsx). `getBoundingClientRect` devolve o retângulo já
         PINTADO, ou seja, multiplicado por essa escala — e como o
         ResizeObserver dispara durante a chegada, as medidas saíam do tamanho
         que a estação tinha no instante em que ele coube observar. Medido com
         a versão anterior: `--g-piso` em 158px onde o valor de layout é 337.

         As famílias `offsetTop`/`offsetHeight` ignoram transformações e
         devolvem o layout, que é o que a grade precisa — ela vive DENTRO do
         palco e é escalada junto, então tem de ser escrita em coordenadas não
         escaladas.

         `offsetTop` da fileira já é relativo ao `.rec-layout`, que é
         `position: relative` e portanto o `offsetParent` dela. */
      const medidas = quadrados.map((quad) => {
        const texto = quad.querySelector<HTMLElement>('.quad__texto')
        const saida = quad.querySelector<HTMLElement>('.quad__saida')
        const filete = texto ? texto.offsetHeight : 0
        return { filete, piso: filete + (saida ? saida.offsetHeight : 0) }
      })

      /* Cada segmento recebe o seu próprio y. Os do filete vêm primeiro no
         DOM, os do piso depois, na mesma ordem dos quadrados. */
      const filetes = grade.querySelectorAll<HTMLElement>('.rec-grade__seg--filete')
      const pisos = grade.querySelectorAll<HTMLElement>('.rec-grade__seg--piso')
      medidas.forEach((m, i) => {
        filetes[i]?.style.setProperty('--g-y', `${m.filete.toFixed(2)}px`)
        pisos[i]?.style.setProperty('--g-y', `${m.piso.toFixed(2)}px`)
      })

      /* A CAIXA DA GRADE VAI ATÉ O PISO MAIS BAIXO. Com os quatro
         desalinhados, usar o do primeiro quadrado deixaria o de baixo para
         fora — e é essa altura que define o lado do quadrado. */
      const piso = Math.max(...medidas.map((m) => m.piso))

      /* A grade aberta é mais larga que a fileira: ela vai do primeiro
         conduíte ao quinto, e os dois moram meio vão para fora. O `--vao`
         precisa ser lido do CSS porque é um `clamp` responsivo. */
      const vao = parseFloat(getComputedStyle(fileira).columnGap) || 0

      /* ---- A FOLGA VEM DO TRILHO, NÃO DO TOKEN ----
         `getComputedStyle().getPropertyValue('--folga')` NÃO resolve: custom
         property comum devolve o texto como está escrito, e aqui isso é
         `clamp(32px, 3.4vw, 56px)`. `parseFloat` daquilo é `NaN`, que o `|| 0`
         transformava em zero — silenciosamente, porque zero é um número
         plausível. Medido: `--g-topo` saía 184px onde o certo era 128.

         O trilho é `top: calc(-1 * var(--folga))`, e `top` é propriedade de
         verdade: o navegador entrega o px já resolvido. Ler a folga de lá
         significa lê-la exatamente como a moldura a usa, inclusive quando o
         `clamp` muda de faixa numa janela diferente. */
      const folga = -parseFloat(getComputedStyle(fileira, '::before').top) || 0

      const largura = fileira.offsetWidth + vao
      /* Do trilho (meio vão acima da fileira) até o piso. */
      const altura = folga + piso

      /* Onde a grade começa e termina dentro do `.rec-layout`. O topo dela é
         o trilho, meio vão acima da fileira; a base é o piso. As cantoneiras
         usam os dois para abraçar o quadrado enquanto ele está fechado. */
      const topo = fileira.offsetTop - folga
      const rodape = layout.offsetHeight - fileira.offsetTop - piso

      layout.style.setProperty('--g-piso', `${piso.toFixed(2)}px`)
      layout.style.setProperty('--g-topo', `${topo.toFixed(2)}px`)
      layout.style.setProperty('--g-base', `${rodape.toFixed(2)}px`)
      /* Quadrado = largura igual à altura. Preso a 1 no teto porque uma
         estação mais alta que larga (celular) não deve ESTICAR a grade além
         do console; ali ela já nasce aberta. */
      layout.style.setProperty('--g-min', Math.min(1, altura / largura).toFixed(4))
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(layout)
    observador.observe(fileira)
    return () => observador.disconnect()
  }, [])

  const colunas = [0, 1, 2, 3]

  return (
    <div className="rec-grade" ref={ref} aria-hidden="true">
      {/* Cinco conduítes fecham as oito células nas laterais. */}
      {[0, 1, 2, 3, 4].map((k) => (
        <i key={`v${k}`} className="rec-grade__v" style={{ '--k': k } as React.CSSProperties} />
      ))}

      {/* O trilho é contínuo; filetes e pisos são um por instrumento, como no
          console. Ver a nota de `.rec-grade__seg` em styles/recursos.css. */}
      <i className="rec-grade__h rec-grade__h--trilho" />
      {colunas.map((k) => (
        <i
          key={`f${k}`}
          className={`rec-grade__seg rec-grade__seg--filete${k === 3 ? ' rec-grade__seg--fim' : ''}`}
          style={{ '--k': k } as React.CSSProperties}
        />
      ))}
      {colunas.map((k) => (
        <i
          key={`p${k}`}
          className={`rec-grade__seg rec-grade__seg--piso${k === 3 ? ' rec-grade__seg--fim' : ''}`}
          style={{ '--k': k } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
