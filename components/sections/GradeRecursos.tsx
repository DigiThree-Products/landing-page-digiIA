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
 *   --g-y     (em cada segmento) y do filete e do piso daquele instrumento
 *   --g-piso  y do piso mais baixo dos quatro, que fecha a caixa da grade
 *   --g-topo  onde a caixa começa dentro do `.rec-layout`
 *   --g-base  quanto sobra dela até o fim do layout
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
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(layout)
    observador.observe(fileira)
    return () => observador.disconnect()
  }, [])

  return (
    <div className="rec-grade" ref={ref} aria-hidden="true">
      {/* O TRILHO É A VIGA: a única horizontal contínua do console, atravessando
          a fileira inteira de conduíte a conduíte. Fica fora dos dois arranjos
          porque é de ambos — é ele que os liga por cima do barramento. */}
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
          Uma caixa só, fechada nos quatro lados, do topo acima do trilho até a
          base abaixo do piso. Foram três peças (cabeça, base e cinturão)
          enquanto o corpo dobrava e precisava de módulos que sobrevivessem ao
          obturador; fixo, ele é o que a referência mostra — um retângulo
          contínuo com os arranjos pendurados nele. */}
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
          viewBox="0 0 170 118"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        >
          {/* A ponta, CHEIA: é o único elemento sólido do desenho inteiro, e é
              ele que fecha o alto da peça. Vazada, some contra o fundo preto. */}
          <ellipse cx="85" cy="6" rx="4" ry="5.5" fill="currentColor" stroke="none" />
          {/* O mastro ATRAVESSA a tigela, do alto até o pé — é uma peça só, e
              desenhá-lo em dois pedaços (acima e abaixo do prato) deixaria uma
              junta visível bem no vértice da concha. */}
          <line x1="85" y1="100" x2="85" y2="11" />
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
          <ellipse cx="85" cy="34" rx="82" ry="10" />
          <path d="M3 34 Q85 86 167 34" />
          {/* Os dois pés saem do PÉ DO MASTRO, e não do vértice da concha como
              antes: com o mastro longo, sair da concha os faria abrir num
              ângulo raso e a peça leria como tripé, não como antena sobre um
              barramento.

              ELES POUSAM NAS PAREDES DO CORPO, e os números saem de conta, não
              do olho: com a antena em 231px e o corpo em 57, o corpo ocupa de
              37,7% a 62,3% da largura da peça — o que em unidades do `viewBox`
              (170 de largura) cai em 64 e 106. Alargar o `viewBox` sem refazer
              esta conta deixaria os pés pendurados fora do barramento. */}
          <line x1="81" y1="100" x2="64" y2="118" />
          <line x1="89" y1="100" x2="106" y2="118" />
        </svg>
      </div>
    </div>
  )
}
