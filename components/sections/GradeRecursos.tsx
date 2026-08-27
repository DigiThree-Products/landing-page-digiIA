'use client'

import { useEffect, useRef } from 'react'

/**
 * O SATÉLITE DA ESTAÇÃO 02 — a grade do console, mais a ferragem que a faz ler
 * como satélite.
 *
 * O console já É um satélite visto de frente: quatro colunas por duas fileiras
 * são OITO CÉLULAS, e oito células são dois arranjos de painel de quatro cada.
 * Entre eles corre o barramento, na baia; em cima dele, a antena.
 *
 * ---- ELE NÃO DOBRA MAIS, E ISSO É DE 27/08 ----
 *
 * Por um dia esta camada teve um ATO DO MEIO: chegava com os dois arranjos
 * dobrados um sobre o outro, o corpo largo entre eles, e implantava as asas até
 * coincidir com o console — 0,80 tela de rolagem, três movimentos simultâneos,
 * e uma boa quantidade de álgebra para os cinco conduítes pousarem a 0,00px.
 *
 * O pedido foi tirar a dobra e deixar o satélite FIXO: ele chega inteiro, no
 * tamanho final, e o que continua animado é só a revelação — ele aparece
 * durante a viagem e o texto nasce depois que a estação atraca.
 *
 * O QUE ISSO CUSTOU E O QUE PAGOU. Saíram as três razões de escala que esta
 * camada publicava (`--g-min`, `--g-min-y`, `--asa-min`), as duas asas como
 * grupos escaláveis, todas as contra-escalas que devolviam espessura às linhas,
 * e as 0,80 tela do pin (ver `ritmoDa` em components/layout/Estacoes.tsx).
 *
 * Pagou o que a dobra impedia: sem escala em cima do desenho, a ferragem pode
 * ter CURVA e ÂNGULO de verdade. É por isso que a antena virou um `<svg>` — sob
 * a dobra, um arco viraria elipse e um ângulo viraria outro ângulo, e era essa
 * limitação que mantinha a parabólica facetada em três retas. Facetada e no
 * tamanho que cabia, ela lia como um X riscado ao lado de uma caixinha, não
 * como antena. O diagnóstico do dono foi direto: "não tem imagem nessa seção".
 *
 * ---- O QUE ESTA CAMADA AINDA FAZ, JÁ QUE NÃO DOBRA ----
 *
 * Ela desenha a grade ANTES do console. As linhas de verdade (os conduítes de
 * cada card, o trilho, os filetes) nascem no relógio da atracação, que só anda
 * aos 0,78 da chegada; o satélite tem relógio próprio e mais cedo, 0,30 a 0,55,
 * porque ele precisa estar no ar durante a órbita. Entre 0,30 e 0,78 é só esta
 * camada que pinta a grade. Depois as duas coincidem — e como coincidem exatas,
 * esta sai sem que a troca se veja.
 *
 * A FERRAGEM NÃO SAI. Corpo, hastes e antena não têm substituto embaixo: eles
 * são o que sobra sendo satélite depois que o console assume a grade.
 *
 * ---- POR QUE ISTO É UM COMPONENTE DE CLIENTE E NÃO SÓ CSS ----
 *
 * As posições HORIZONTAIS saem de graça em CSS: a fileira é `repeat(4, 1fr)`
 * com `gap: var(--vao)` e a baia no meio, então a coluna vale
 * `(100% − baia − 4 × --vao) / 4` e o conduíte k mora em `k × (coluna + vão)`.
 * Nada a medir.
 *
 * As VERTICAIS não. O filete cai no fim do bloco de texto e o piso no fim do
 * slot do artefato, e as duas alturas são de CONTEÚDO: `--cabeca` e `--slot`
 * são pisos mínimos, não as alturas reais (medido: `--cabeca` 108px contra
 * 120px de texto real). Nenhuma expressão CSS sabe dizer onde eles caem.
 *
 * Daí as medidas publicadas aqui, e só elas:
 *   --g-y           (em cada segmento) y do filete e do piso daquele instrumento
 *   --g-piso        y do piso mais baixo dos quatro, que fecha a caixa da grade
 *   --g-topo        onde a caixa começa dentro do `.rec-layout`
 *   --g-base        quanto sobra dela até o fim do layout
 *   --g-junta       o filete mais alto dos quatro, onde as hastes cruzam
 *   --g-ceu         o vão livre acima do trilho, que dimensiona a antena
 *   --g-parede      x da parede esquerda do barramento, onde o trilho para
 *   --g-parede-fim  x da parede direita, onde ele recomeça
 */

/* Os dois arranjos, e quais verticais e colunas cada um leva.
 *
 * SÃO SEIS VERTICAIS PARA QUATRO COLUNAS, e a conta fecha porque as duas do
 * meio não são a mesma linha: são as duas PAREDES DA BAIA, separadas pela
 * largura dela. O arranjo da direita carrega esse deslocamento em bloco
 * (`--g-off`), então o k dele conta a partir da parede de lá.
 *
 * Eles não são mais grupos que escalam — viraram o agrupamento semântico do
 * arranjo esquerdo e do direito, que é o que mantém o JSX legível. */
const ARRANJOS = [
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
         for a copy — senão a troca no fim da chegada vira um salto. */

      /* ---- `offset*` E NUNCA `getBoundingClientRect` AQUI ----
         O palco desta seção é escalado pelo GSAP a viagem inteira, de 0,16 até
         1 (ver Estacoes.tsx). `getBoundingClientRect` devolve o retângulo já
         PINTADO, ou seja, multiplicado por essa escala — e como o
         ResizeObserver dispara durante a chegada, as medidas saíam do tamanho
         que a estação tinha no instante em que ele coube observar. Medido com
         uma versão anterior: `--g-piso` em 158px onde o valor de layout é 337.

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
         de documento — os dois do arranjo esquerdo e depois os dois do
         direito — que é a mesma ordem dos quadrados, porque o arranjo esquerdo
         leva as colunas 0 e 1 e o direito as 2 e 3. */
      const filetes = grade.querySelectorAll<HTMLElement>('.rec-grade__seg--filete')
      const pisos = grade.querySelectorAll<HTMLElement>('.rec-grade__seg--piso')
      medidas.forEach((m, i) => {
        filetes[i]?.style.setProperty('--g-y', `${m.filete.toFixed(2)}px`)
        pisos[i]?.style.setProperty('--g-y', `${m.piso.toFixed(2)}px`)
      })

      /* A CAIXA DA GRADE VAI ATÉ O PISO MAIS BAIXO. Com os quatro
         desalinhados, usar o do primeiro quadrado deixaria o de baixo para
         fora. */
      const piso = Math.max(...medidas.map((m) => m.piso))

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

      /* Onde a grade começa e termina dentro do `.rec-layout`. O topo dela é o
         trilho, meio vão acima da fileira; a base é o piso. As cantoneiras
         usam os dois. */
      layout.style.setProperty('--g-piso', `${piso.toFixed(2)}px`)
      layout.style.setProperty('--g-topo', `${(fileira.offsetTop - folga).toFixed(2)}px`)
      layout.style.setProperty(
        '--g-base',
        `${(layout.offsetHeight - fileira.offsetTop - piso).toFixed(2)}px`,
      )

      /* A ALTURA DO FILETE MAIS ALTO governa onde as hastes cruzam. Elas vão do
         barramento ao arranjo, e chegam nele na altura em que ele já tem uma
         junta — o filete — em vez de no meio de uma célula. Os quatro filetes
         não caem juntos (ver a nota acima), então vale o de cima: é o único que
         existe em todas as quatro colunas ao mesmo tempo. */
      layout.style.setProperty(
        '--g-junta',
        `${Math.min(...medidas.map((m) => m.filete)).toFixed(2)}px`,
      )

      /* ---- O CÉU DA ANTENA ----
         Quanto espaço livre existe acima do trilho, dele até o braço de cima
         da moldura. É o teto da antena, e precisa ser MEDIDO porque o
         cabeçalho tem altura de conteúdo: o H2 quebra em duas linhas numa
         janela estreita e o céu encolhe junto.

         A conta se reduz a um número só. O trilho fica uma folga acima da
         fileira e a moldura uma folga acima do topo do layout, então o vão
         entre os dois é `(fileira.offsetTop − folga) + folga` — as folgas se
         cancelam e sobra o `offsetTop` da fileira, limpo.

         SÓ EXISTE PORQUE O TÍTULO SE PARTIU. Enquanto a frase corria inteira, a
         antena batia na base do H2 e o teto era uma `--folga`; com o vão aberto
         no meio da frase, a coluna central ficou livre de ponta a ponta e o
         teto subiu para cá. Medido a 1536px: 177px contra os 52 de antes. */
      layout.style.setProperty('--g-ceu', `${fileira.offsetTop.toFixed(2)}px`)

      /* ---- ONDE O TRILHO TEM DE PARAR ----
         O trilho atravessava o barramento por dentro. Não se via enquanto o
         corpo estava colado nele: a borda de topo do corpo cobria a linha. Ao
         abrir a base do triângulo, o corpo subiu 14px e a linha ficou exposta,
         cortando a peça central ao meio.

         São DOIS trilhos a cortar, e eles têm de continuar idênticos: o desta
         camada e o `.quads::before`, que é o do console. Se um ganhar o corte e
         o outro não, a troca no fim da chegada — hoje invisível porque as duas
         grades coincidem — vira um piscar.

         E O CORTE NÃO SAI EM PORCENTAGEM. Os dois trilhos partem da MESMA borda
         esquerda (ambos a meio vão para fora do `.rec-layout`, medido: x = 200
         para os dois), mas não têm a mesma largura — o do console desconta uma
         `--espessura` à direita, para terminar rente à última marca. Uma parada
         escrita em % resolveria contra larguras diferentes e os dois cortes
         cairiam a ~1px um do outro; ancorada à esquerda em px, é exata nos dois.

         `offsetLeft` de novo, e não `getBoundingClientRect`: o palco leva
         `zoom: 0.92` no repouso, e zoom entra no retângulo pintado. */
      const corpo = grade.querySelector<HTMLElement>('.rec-grade__corpo')
      if (corpo) {
        layout.style.setProperty('--g-parede', `${corpo.offsetLeft}px`)
        layout.style.setProperty(
          '--g-parede-fim',
          `${corpo.offsetLeft + corpo.offsetWidth}px`,
        )
      }
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(layout)
    observador.observe(fileira)
    return () => observador.disconnect()
  }, [])

  return (
    <div className="rec-grade" ref={ref} aria-hidden="true">
      {/* O TRILHO É A VIGA: a horizontal que atravessa a fileira inteira, de
          conduíte a conduíte. Fica fora dos dois arranjos porque é de ambos — é
          ele que os liga.

          E DESDE 27/08 ELE PARA NO BARRAMENTO em vez de atravessá-lo. Antes
          dizia-se aqui que ele passava POR CIMA do corpo; na verdade passava POR
          DENTRO, e só não se via porque a borda de topo do corpo cobria a linha.
          Aberta a base do triângulo da antena, o corpo subiu 14px e o corte
          apareceu. O corte de verdade agora é no trilho, entre `--g-parede` e
          `--g-parede-fim` (ver a nota delas no efeito, e o gradiente
          `--trilho-fio` em recursos.css, que os dois trilhos dividem). */}
      <i className="rec-grade__h rec-grade__h--trilho" />

      {ARRANJOS.map(({ lado, verticais, colunas }) => (
        <div key={lado} className={`rec-grade__asa rec-grade__asa--${lado}`}>
          {verticais.map((k) => (
            <i
              key={`v${k}`}
              className="rec-grade__v"
              style={{ '--k': k } as React.CSSProperties}
            />
          ))}
          {/* Filetes e pisos são SEGMENTADOS, um por instrumento, e não uma
              linha contínua — é assim que o console os desenha (cada um vai do
              seu conduíte à borda direita da própria coluna, deixando a calha
              aberta). Uma linha contínua aqui viraria quatro segmentos no
              instante da troca, e a troca deixaria de ser invisível. */}
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

      {/* ---- AS DUAS HASTES ----
          O que separa um satélite de uma grade é o VÃO entre o barramento e os
          arranjos: painel de satélite não encosta no corpo, ele fica na ponta
          de uma haste. Até 27/08 as paredes do corpo ERAM as arestas internas
          dos arranjos — economia de duas linhas que custava justamente esta
          leitura, porque sem vão a peça inteira lê como uma grade só. */}
      <i className="rec-grade__haste rec-grade__haste--esq" />
      <i className="rec-grade__haste rec-grade__haste--dir" />

      {/* ---- O BARRAMENTO ----
          Uma caixa só, do topo acima do trilho até a base abaixo do piso. Foram
          três peças (cabeça, base e cinturão) enquanto o corpo dobrava e
          precisava de módulos que sobrevivessem ao obturador; fixo, ele é o que
          a referência mostra — um retângulo contínuo com os arranjos pendurados
          nele.

          COM UMA DIFERENÇA PARA A REFERÊNCIA, DE 27/08: o topo é ABERTO. A
          referência traz um retângulo fechado, mas ali a antena não pousa nele.
          Aqui pousa, e a borda de cima era exatamente a base do triângulo dos
          pés — fechada, a peça lia como telhado sobre muro. Ver `border-top` em
          recursos.css, que explica por que tirar essa borda sozinha não bastava. */}
      <div className="rec-grade__corpo">
        {/* ---- A ANTENA ----
            `<svg>` e não pseudo-elementos, e isso só passou a ser possível
            quando a dobra saiu: o prato tem UM ARCO e os pés têm ângulo, e os
            dois viviam sob duas escalas que os teriam distorcido. Facetada em
            três retas, que era a solução sob dobra, a parabólica lia como um X
            riscado.

            `vector-effect: non-scaling-stroke` mantém o traço na espessura das
            linhas da grade mesmo com o palco escalando de 0,16 a 1 durante a
            viagem. Sem ele a antena seria a única peça da seção cuja espessura
            muda com a chegada. */}
        {/* ---- O PRATO É MAIS RASO QUE O DA REFERÊNCIA, DE PROPÓSITO ----
            A referência tem `viewBox` de 400×260 com o aro em rx 46 — razão
            1,23 entre a peça inteira e a altura dela. Aqui é 1,67, e a
            diferença toda foi para a LARGURA DO ARO (rx 45 → 62); o mastro, a
            ponta e os pés não mudaram de proporção.

            O motivo é o teto vertical. A antena é dimensionada pela faixa entre
            o trilho e a base do H2, que vale uma `--folga` e não estica: a
            largura sai da altura pela razão daqui. Alargar o `viewBox` é a
            única forma de dar presença ao prato sem pedir altura que não
            existe — e é fiel ao objeto, porque parabólica vista de viés é rasa
            mesmo. A primeira versão desta peça errou para o outro lado: com a
            profundidade quase igual à abertura, as retas fechavam um triângulo
            e a coisa lia como botão de play.

            E A RAZÃO É O QUE CASA COM O BARRAMENTO. Na referência o prato é
            2,1× o corpo, e é esse contraste que o faz ler como antena em vez de
            tampa: prato mais estreito que o próprio corpo não lê. Com a baia em
            3,2 vãos e esta razão, a conta bate nos mesmos 2,1×. Mexer num dos
            dois sem o outro desmancha a proporção. */}
        {/* ---- O `viewBox` É UM DIAL DE DUAS PONTAS ----
            A peça é dimensionada pela ALTURA disponível e a largura sai da
            razão daqui. Isso faz do `viewBox` o lugar onde se escolhe QUAL das
            duas cresce, e as duas mudanças de hoje usaram as duas pontas:

            ALTURA 78 → 118, com a largura parada em 130. Os 40 pontos novos
            foram todos para o mastro e os pés; nada do prato mudou de tamanho
            aqui dentro. Foi assim que a antena subiu sem engordar — com a razão
            antiga (1,67), esticar a altura teria levado a largura junto e o
            prato passaria do vão que o título abriu.

            LARGURA 130 → 170, com a altura parada em 118. Aqui é o inverso, e
            atende ao "aumenta a largura dele também": o aro cresce de rx 62
            para 82 e a peça alarga sem subir mais — que é bom, porque a altura
            já está a 7% da moldura e não tem para onde ir.

            A razão foi de 1,67 a 1,10 e voltou a 1,44. Quem for mexer: escolha
            qual eixo quer e mexa SÓ no outro número. Mexer nos dois ao mesmo
            tempo é o jeito de não entender o que mudou.

            E o par tem de bater com o `width` em recursos.css, senão o
            `preserveAspectRatio` padrão encaixota o desenho. */}
        <svg
          className="rec-grade__antena"
          viewBox="0 0 190 118"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        >
          {/* A ponta, CHEIA: é o único elemento sólido do desenho inteiro, e é
              ele que fecha o alto da peça. Vazada, some contra o fundo preto. */}
          <ellipse cx="95" cy="6" rx="4" ry="5.5" fill="currentColor" stroke="none" />
          {/* ---- O PINO CENTRAL ----
              Uma peça só, do alto até dentro do barramento. Desenhá-lo em
              pedaços (acima e abaixo do prato) deixaria uma junta visível bem no
              vértice da concha.

              ELE PASSA DE 118, QUE É A ALTURA DO `viewBox`, E ISSO É DE
              PROPÓSITO. A caixa do SVG termina no topo do barramento
              (`bottom: 100%`), então tudo que se desenha além de 118 cai DENTRO
              do corpo — é `overflow: visible` que deixa, o mesmo que já existia
              para o aro não ser cortado nas laterais.

              É assim que a antena se prende desde 27/08. Antes ela se apoiava em
              dois pés que pousavam nas paredes do corpo, e aquilo não tinha
              conserto por número: a largura da antena sai do CÉU MEDIDO e a
              largura do corpo sai da LARGURA DO CONTAINER — duas entradas
              independentes, então qualquer x fixo acerta em uma janela só.
              Medido: os pés fechavam a 0,14px em 1536×695 e a 7,16px em
              1536×639, sem uma linha de código mudar entre as duas. O pino não
              tem esse problema porque não precisa encontrar nada: ele desce pelo
              eixo, que é o mesmo do corpo por construção.

              A PROFUNDIDADE ACOMPANHA A ANTENA, não o corpo: 62 unidades de
              `viewBox` valem 62 × (altura da antena ÷ 118) em pixels, então o
              pino encolhe junto com o prato quando a janela baixa. É o que se
              quer — pino e prato são a mesma peça. */}
          <line x1="95" y1="180" x2="95" y2="11" />
          {/* ---- O ARO E A CONCHA PRECISAM DE DISTÂNCIA ----
              O aro é o prato visto de viés; a concha é o que o faz ler como
              parábola em vez de anel. Mas os dois começam no MESMO par de
              pontos, e o arco de baixo do aro corre junto com a concha — se
              ficarem perto, a concha vira só um engrossamento do aro.

              Na primeira versão deste `viewBox` mais largo eles ficaram a 6
              unidades um do outro e foi exatamente o que aconteceu: sumiu a
              parábola. O desenho ficou mais raso que a referência (razão 1,67
              contra 1,23), e nessa proporção a separação também precisa crescer.

              Agora o aro fecha em 44 e a concha desce até 60 — 16 unidades. O
              vértice sai da conta da quadrática, não do olho:
                B(½) = ¼·34 + ½·86 + ¼·34 = 60 */}
          <ellipse cx="95" cy="34" rx="92" ry="10" />
          <path d="M3 34 Q95 86 187 34" />
          {/* ---- E NÃO HÁ PÉS. O QUE ESTAVA AQUI, E POR QUE NÃO VOLTA ----
              Dois `<line>` saindo do pé do mastro e pousando nas paredes do
              barramento. Eles funcionavam, e não eram feios; o que não dava era
              MANTÊ-LOS POUSADOS.

              Para um pé encontrar uma parede, a largura da antena e a largura do
              corpo têm de guardar uma razão fixa. Elas não guardam: a da antena
              sai da altura, que sai do CÉU MEDIDO; a do corpo sai da LARGURA DO
              CONTAINER. São duas entradas independentes, então qualquer x escrito
              no `viewBox` está certo em exatamente uma janela.

              Isso ficou medido, e é a razão de a nota ser longa: os pés fechavam
              a 0,14px em 1536×695 e, sem uma linha de código mudar entre as duas
              medições, a 7,16px em 1536×639 — pendurados no ar sobre o topo
              aberto do corpo. Uma versão anterior desta nota já tinha apodrecido
              do mesmo jeito, citando antena 231px, corpo 57 e `viewBox` 170,
              nenhum dos três ainda válido.

              A saída não foi um número melhor nem uma fórmula: foi tirar a
              dependência. O pino desce pelo EIXO, que coincide com o do corpo por
              construção, e não precisa encontrar coisa nenhuma. */}
        </svg>

        {/* ---- OS QUATRO ESTAIS ----
            Dois grupos, um de cada lado da CINTURA: as pontas abertas do topo
            descem até ela, e dela saem os outros dois até as pontas da base. A
            cintura mora na BASE DO PINO, e onde ela cai é dial de desenho, não
            de geometria — está em `--pino-cintura`, em recursos.css.

            ELES NÃO PODEM MORAR NO `viewBox` DA ANTENA, e essa é a lição que
            acabou de custar os pés. A antena tem escala própria, tirada da
            altura dela; a base do corpo está a uma distância que vem do
            CONTEÚDO da fileira (`--g-piso`). Escrever estas linhas em unidades
            da antena seria refazer exatamente a dependência que a saída dos pés
            desfez, e ela voltaria a errar quando a janela mudasse de altura.

            DAÍ A CAIXA COMEÇAR NO FIM DO PINO. O `<svg>` vai de `--pino-fundo`
            até a base do corpo e ocupa a largura dele, então o ápice é o topo do
            meio (50,0) e as duas pontas são os cantos de baixo (0,100) e
            (100,100) — números que não dependem de janela nenhuma, porque a
            CAIXA é que carrega a geometria.

            `preserveAspectRatio="none"` é o que permite isso: a caixa é alta e
            estreita e o `viewBox` é quadrado, então o desenho estica. Reta
            esticada continua reta — só o ângulo muda, que é justamente o que se
            quer. O que NÃO pode esticar é o traço, e é `vector-effect` que
            segura, aplicado por CSS aos filhos (ver recursos.css: no `<svg>` ele
            não vale, porque a propriedade não é herdada). */}
        {/* De cima: as duas pontas abertas do barramento descem até a cintura.
            É o espelho do de baixo, e os dois juntos é que a fazem — o corpo
            estreita ali e volta a abrir. */}
        <svg
          className="rec-grade__estais rec-grade__estais--cima"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="0" y1="0" x2="50" y2="100" />
          <line x1="100" y1="0" x2="50" y2="100" />
        </svg>

        {/* De baixo: da cintura às duas pontas da base. */}
        <svg
          className="rec-grade__estais rec-grade__estais--baixo"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="50" y1="0" x2="0" y2="100" />
          <line x1="50" y1="0" x2="100" y2="100" />
        </svg>
      </div>
    </div>
  )
}
