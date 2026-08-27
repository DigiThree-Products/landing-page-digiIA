'use client'

import { useEffect, useRef } from 'react'

/**
 * O SATÉLITE DA ESTAÇÃO 02 — o que orbita, atraca e se implanta no console.
 *
 * O console já É um satélite visto de frente: quatro colunas por duas
 * fileiras são OITO CÉLULAS, e oito células são duas asas de painel de
 * quatro cada. O que esta camada faz não é inventar um desenho novo — é
 * desenhar ESSA MESMA grade podendo dobrá-la ao meio, coisa que as linhas
 * do console não conseguem fazer porque cada uma é um pseudo-elemento preso
 * ao seu quadrado no fluxo.
 *
 * A coreografia é: as quatro colunas chegam dobradas DUAS DE CADA LADO, com
 * o corpo do satélite entre elas; as asas se implantam; o corpo é fechado
 * por elas como um obturador; e no fim esta camada coincide exatamente com
 * o console e some. Como as duas grades são a mesma nos últimos quadros, a
 * troca não se vê.
 *
 * ---- A DOBRA SÃO DOIS GRUPOS, E NÃO DOZE DESLOCAMENTOS ----
 *
 * A primeira ideia era dar a cada linha um deslocamento próprio que se
 * anulasse na abertura. Doze contas independentes, doze lugares para errar
 * um sinal, e nenhuma garantia estrutural de que todas terminassem no mesmo
 * lugar. A conta certa é outra: dobrar 2+2 é escalar cada METADE em torno
 * da própria borda de fora.
 *
 *   asa esquerda   escala em torno de x = 0   (a borda esquerda da grade)
 *   asa direita    escala em torno de x = G   (a borda direita)
 *
 * Com `a` indo da dobra (ver `CORPO_DOBRADO`) a 1, o conduíte k da asa
 * esquerda cai em `k·passo·a` e o da direita em `G − (G − k·passo − baia)·a`.
 * Em `a = 1` os dois viram a posição do console — IDÊNTICA, por álgebra e não
 * por calibragem. É isso que preserva o trabalho de medida do PR anterior: as
 * verticais batendo a 0px e as horizontais a 0,4px.
 *
 * De quebra, escalar o GRUPO encurta as horizontais junto, que é
 * exatamente o que se quer (as células dobradas são mais estreitas), sem
 * uma segunda conta para a largura de cada segmento.
 *
 * ---- O CONDUÍTE DO MEIO APARECE DUAS VEZES ----
 *
 * Quatro colunas em 2+2 pedem SEIS arestas verticais — três por asa — e o
 * console tem cinco conduítes. A do meio é a mesma linha fazendo dois
 * trabalhos: aresta interna da asa esquerda e da direita. Enquanto dobrado
 * são dois lugares diferentes, então são dois elementos; na implantação os
 * dois convergem para o mesmo x e se empilham.
 *
 * ISSO DOBRA O ALFA daquela linha no fim, e é um preço consciente: a
 * sobreposição só existe nos últimos quadros, quando a camada inteira já
 * está saindo (`--g-sai`) e as linhas de verdade já estão acesas por baixo.
 * Se aparecer como um conduíte central mais claro na troca, o conserto é
 * uma linha — afinar o gêmeo com `calc(1 - var(--expande))`. Não foi feito
 * às cegas porque um crossfade a mais custa mais do que resolve.
 *
 * ---- POR QUE ISTO É UM COMPONENTE DE CLIENTE E NÃO SÓ CSS ----
 *
 * As posições HORIZONTAIS saem de graça em CSS: a fileira é
 * `repeat(4, 1fr)` com `gap: var(--vao)`, então a coluna vale
 * `(100% - 3 × --vao) / 4` e o conduíte k mora em `k × (coluna + vão) −
 * vão/2`. Nada a medir.
 *
 * As VERTICAIS não. O filete cai no fim do bloco de texto e o piso no fim
 * do slot do artefato, e as duas alturas são de CONTEÚDO: `--cabeca` e
 * `--slot` são pisos mínimos, não as alturas reais (medido: `--cabeca`
 * 108px contra 120px de texto real). Nenhuma expressão CSS sabe dizer onde
 * eles caem.
 *
 * Daí as medidas publicadas aqui, e só elas:
 *   --g-y       (em cada segmento) y do filete e do piso daquele instrumento
 *   --g-piso    y do piso mais baixo dos quatro, que fecha a caixa da grade
 *   --g-topo    onde a caixa começa dentro do `.rec-layout`
 *   --g-base    quanto sobra dela até o fim do layout
 *   --g-min     razão entre a largura dobrada e a da grade implantada
 *   --g-min-y   a mesma razão na altura
 *   --asa-min   quanto cada asa recolhe, que também dita a largura do corpo
 *
 * As três últimas não são medidas — são constantes daqui. Passam pelo mesmo
 * canal porque saturam JUNTAS quando não há dobra a fazer (celular), e essa
 * decisão depende de uma medida.
 *
 * ---- POR QUE `scaleX` E NÃO LARGURA ----
 *
 * Animar a largura de verdade recalcularia o layout a cada quadro de
 * rolagem. Pior: em ~130px por coluna os títulos quebram em muito mais
 * linhas, a altura do bloco de texto cresce, e a geometria do satélite
 * passaria a depender do texto que ele deveria estar escondendo.
 *
 * Com `scaleX` nada disso acontece: a caixa não muda, só a pintura. O preço
 * é que a escala achataria a espessura das linhas verticais junto. Por isso
 * cada vertical leva a escala INVERSA das DUAS que a afetam (a da camada e
 * a da própria asa) em torno do próprio centro: a posição dobra, a
 * espessura não. As horizontais não precisam de nada, porque `scaleX` mexe
 * no comprimento delas, que é justamente o que se quer.
 */

/* Quanto o satélite dobrado é mais largo que alto — e o número sai de uma
   conta, não do olho.

   O corpo ocupa os 40% do meio (ver `--asa-s` em styles/recursos.css), então
   cada asa fica com 30% da envergadura e, tendo duas colunas, cada coluna
   vale 15% dela. Com envergadura 1 — o quadrado da versão anterior — a
   coluna cairia para `0,15 × 379 ≈ 57px` numa janela de 1920, contra os
   ≈95px que as quatro colunas tinham naquele mesmo quadrado. Ripas, não
   painéis: o corpo teria saído do bolso das asas.

   1,6 é a envergadura que devolve a coluna ao tamanho que ela já tinha
   (≈91px) e paga o corpo com largura NOVA. Em 1920 isso dá ~606px dobrado
   contra 1165 implantado. */
const ENVERGADURA = 1.6

/* QUANTO DO SATÉLITE DOBRADO É CORPO. É este o número que se escolhe a olho;
   a dobra das asas sai dele, e não o contrário.

   0,28 põe o corpo mais ESTREITO que cada asa (36%), que é a proporção da
   referência: arranjos longos, barramento compacto. A 0,40, que foi a
   primeira tentativa, a peça lia como um painel com uma caixa em cima.

   POR QUE DERIVAR A DOBRA EM VEZ DE ESCREVÊ-LA: o corpo não fecha mais até
   sumir — ele para na baia, que é uma medida de LAYOUT (`--corpo-larg`, em
   styles/recursos.css) e muda de tamanho com a janela. Uma dobra fixa daria
   uma proporção dobrada diferente a cada largura de tela. Fixando a
   proporção e resolvendo a dobra, a silhueta é a mesma em todas elas. */
const CORPO_DOBRADO = 0.28

/* As duas asas, e quais conduítes e colunas cada uma leva. O conduíte 2
   aparece nas duas de propósito — ver a nota do gêmeo no docblock. */
const ASAS = [
  { lado: 'esq', verticais: [0, 1, 2], colunas: [0, 1] },
  { lado: 'dir', verticais: [2, 3, 4], colunas: [2, 3] },
] as const

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

      /* Cada segmento recebe o seu próprio y. Os quatro filetes vêm em ordem
         de documento — os dois da asa esquerda e depois os dois da direita —
         que é a mesma ordem dos quadrados, porque a asa esquerda leva as
         colunas 0 e 1 e a direita as 2 e 3. */
      const filetes = grade.querySelectorAll<HTMLElement>('.rec-grade__seg--filete')
      const pisos = grade.querySelectorAll<HTMLElement>('.rec-grade__seg--piso')
      medidas.forEach((m, i) => {
        filetes[i]?.style.setProperty('--g-y', `${m.filete.toFixed(2)}px`)
        pisos[i]?.style.setProperty('--g-y', `${m.piso.toFixed(2)}px`)
      })

      /* A CAIXA DA GRADE VAI ATÉ O PISO MAIS BAIXO. Com os quatro
         desalinhados, usar o do primeiro quadrado deixaria o de baixo para
         fora — e é essa altura que define a envergadura do satélite. */
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
         usam os dois para abraçar o satélite enquanto ele está dobrado. */
      const topo = fileira.offsetTop - folga
      const rodape = layout.offsetHeight - fileira.offsetTop - piso

      layout.style.setProperty('--g-piso', `${piso.toFixed(2)}px`)
      layout.style.setProperty('--g-topo', `${topo.toFixed(2)}px`)
      layout.style.setProperty('--g-base', `${rodape.toFixed(2)}px`)
      /* Preso a 1 no teto porque uma estação mais alta que larga (celular)
         não deve ESTICAR a grade além do console; ali ela já nasce
         implantada e não há dobra para ver. */
      const dobraX = Math.min(1, (altura * ENVERGADURA) / largura)
      layout.style.setProperty('--g-min', dobraX.toFixed(4))

      /* SATURAR É O QUE DESLIGA O SATÉLITE, e as três dobras saturam juntas.
         No celular a estação é mais alta que larga, `dobraX` bate no teto de
         1 e não há nada a dobrar; deixar as outras duas dobrarem ali daria um
         console achatado que nunca foi satélite. */
      const dobrou = dobraX < 1

      /* ---- A BAIA, MEDIDA E NÃO LIDA ----
         `--corpo-larg` é `var(--vao)`, que é um `clamp` — e custom property
         comum não resolve em `getComputedStyle` (a nota da `--folga` acima
         conta essa história). A baia sai da geometria: o vão entre CRIA e
         ROTEIRIZA vale dois vãos mais a pista vazia, e a baia entre paredes é
         isso menos um vão. */
      const entreAsas =
        quadrados[2].offsetLeft - (quadrados[1].offsetLeft + quadrados[1].offsetWidth)
      const baia = Math.max(0, entreAsas - vao)

      /* ---- A DOBRA DAS ASAS SAI DA PROPORÇÃO PEDIDA ----
         Dobrado, o corpo mede `G − 4·passo·a` e as duas asas o resto, com
         `4·passo = G − baia`. Pondo a fração do corpo em CORPO_DOBRADO:

             1 − (1 − baia/G) × a = CORPO_DOBRADO
             a = (1 − CORPO_DOBRADO) / (1 − baia/G)

         Com a baia em 44px numa grade de 1165, isso dá 0,748. O teto de 1 é
         o caso em que a baia já é mais larga que a proporção pedida: aí não
         há asa a recolher, e recolher assim mesmo abriria um corpo maior do
         que se pediu. */
      const semBaia = 1 - baia / largura
      const dobraAsa = semBaia > 0 ? Math.min(1, (1 - CORPO_DOBRADO) / semBaia) : 1
      layout.style.setProperty('--asa-min', (dobrou ? dobraAsa : 1).toFixed(4))

      /* ---- A DOBRA VERTICAL, com a célula dobrada QUADRADA como alvo ----
         Cada asa mede `2·passo·a` e tem duas colunas, então a célula dobrada
         tem `passo·a` de largura. Na vertical são duas fileiras dentro de
         `dobra × altura`. Igualando, com `passo = (G − baia)/4` e a largura
         dobrada valendo `altura × ENVERGADURA`:

             dobra = 0,5 × a × ENVERGADURA × (1 − baia/G)

         E o produto `a × (1 − baia/G)` é, por construção, `1 −
         CORPO_DOBRADO` — a baia se cancela. Sobra uma constante:

             dobra = ENVERGADURA × (1 − CORPO_DOBRADO) / 2 = 0,576

         Ou seja: mexer na baia muda a dobra das asas e NÃO muda esta. É a
         confirmação de que as duas contas falam da mesma silhueta. */
      layout.style.setProperty(
        '--g-min-y',
        (dobrou ? Math.min(1, (ENVERGADURA * (1 - CORPO_DOBRADO)) / 2) : 1).toFixed(4),
      )
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(layout)
    observador.observe(fileira)
    return () => observador.disconnect()
  }, [])

  return (
    <div className="rec-grade" ref={ref} aria-hidden="true">
      {/* O TRILHO É A VIGA e fica FORA das asas: ele é a única horizontal
          contínua do console (atravessa a fileira inteira, de conduíte a
          conduíte), então não pode ser dobrado em duas sem virar dois
          segmentos no instante da troca. Deixá-lo inteiro por cima das duas
          asas transforma a limitação na peça certa: enquanto dobrado, é ele
          que atravessa o satélite de ponta a ponta e sustenta as asas. */}
      <i className="rec-grade__h rec-grade__h--trilho" />

      {ASAS.map(({ lado, verticais, colunas }) => (
        <div key={lado} className={`rec-grade__asa rec-grade__asa--${lado}`}>
          {verticais.map((k) => (
            <i
              key={`v${k}`}
              className="rec-grade__v"
              style={{ '--k': k } as React.CSSProperties}
            />
          ))}
          {/* Filetes e pisos são SEGMENTADOS, um por instrumento, e não uma
              linha contínua — é assim que o console os desenha (cada um vai
              do seu conduíte à borda direita da própria coluna, deixando a
              calha aberta). Uma linha contínua aqui viraria quatro segmentos
              no instante da troca, e a troca deixaria de ser invisível. */}
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
      ))}

      {/* O CORPO, entre as duas asas. Ele não desenha as próprias paredes
          laterais: as arestas internas das asas já são elas, e desenhá-las
          de novo dobraria o alfa das duas linhas mais visíveis do satélite.
          O que é dele é só o que as asas não dão — a cabeça acima do trilho,
          a base abaixo do piso, o cinturão, o mastro e a parabólica. */}
      <div className="rec-grade__corpo">
        {/* O MASTRO E A PARABÓLICA SÃO FILHOS DA CABEÇA, e não do corpo, por
            duas razões que só apareceram quando o corpo virou permanente.

            A primeira é de ancoragem: implantado, o corpo tem a largura da
            baia (44px), e a cabeça é MAIS LARGA que ele — ela mora na faixa
            acima do trilho, que está livre. Pendurados no corpo, os dois
            ficavam dentro daqueles 44px, ou seja, por baixo da cabeça.

            A segunda é de altura: presos ao corpo eles subiam a partir do topo
            dele e entravam no título da seção. Presos à cabeça, a pilha
            inteira — cabeça, mastro, prato — cabe dentro de uma `--folga`, que
            é a metade do vão entre o cabeçalho e a fileira. */}
        <i className="rec-grade__cabeca">
          <i className="rec-grade__mastro" />
          <i className="rec-grade__prato">
            <i className="rec-grade__prato-borda" />
            <i className="rec-grade__prato-foco" />
            <i className="rec-grade__prato-haste" />
          </i>
        </i>
        <i className="rec-grade__base" />
        <i className="rec-grade__cinturao" />
      </div>
    </div>
  )
}
