'use client'

import { useEffect, useRef } from 'react'

/**
 * O RETRATO QUE OLHA PARA O CURSOR.
 *
 * UMA ESCADA SÓ, TIRADA DE UMA TOMADA SÓ. Esta é a decisão que governa o
 * arquivo inteiro, e ela veio de medição, não de gosto.
 *
 * O vídeo de origem (video-digiia.mp4, 1280×720, 24fps, 480 quadros) foi lido
 * inteiro, quadro a quadro. Para cada um estimou-se a pose por geometria — o
 * deslocamento horizontal entre o centro do cabelo e o centro da pele dá o
 * giro; a altura do centro da pele, limpa do termo em |giro|, mais a altura da
 * coroa, dá a inclinação. O mapa resultante das 480 poses não é um disco: é
 * uma CRUZ. Existe um braço horizontal cheio (406 quadros) e um braço vertical
 * curto no meio; as diagonais — girar E levantar ao mesmo tempo — estão
 * praticamente vazias.
 *
 * Pior: o braço vertical é inutilizável. Nas poses de olhar para baixo ela
 * está de OLHOS FECHADOS (a contagem de pixels de pupila cai de ~600 para ~0
 * entre os quadros 55 e 85) e nas de olhar para cima está semicerrando
 * (~270 contra ~650 no frontal). O material vertical não existe de fato.
 *
 * E as tomadas não se somam. Medida a distância visual entre quadros de
 * tomadas DIFERENTES no MESMO ângulo de giro: 4,2. Entre quadros vizinhos da
 * MESMA tomada: 0,8. Cinco vezes maior. Tentou-se normalizar — o peito muda 8%
 * de largura entre tomadas, então há mesmo uma diferença de escala — e um
 * registro imagem contra imagem, buscando escala e deslocamento, baixou o
 * resíduo de 6,4 para 4,6 e parou aí. O que sobra é pose e expressão, e isso
 * não se conserta com transformação. Emendar tomadas ERA a causa do movimento
 * picotado: cada emenda é um salto de 4 a 5 onde o passo normal é 0,8.
 *
 * Daí o desenho atual:
 *
 *   HORIZONTAL vem do sprite — 55 poses de uma virada contínua, quadros 84 a
 *   159 do vídeo, do frontal ao perfil fechado. Salto médio entre passos
 *   vizinhos 0,79, máximo 1,54, nenhuma fronteira. A versão anterior tinha 138
 *   quadros de cinco tomadas: salto 4,14 dentro das escadas e 25,26 nas
 *   emendas. Menos imagens, movimento dezesseis vezes mais liso no pior caso —
 *   porque fluidez vem de continuidade, não de quantidade.
 *
 *   VERTICAL vem do CSS. Não há pose de olhar para cima ou para baixo que
 *   preste, e mesmo que houvesse ela só serviria no eixo puro: um sprite não
 *   SOMA direções, e misturar "virada" com "erguida" dá dupla exposição, não
 *   uma terceira pose. Então a inclinação é contínua, com o ponto de giro
 *   embaixo do queixo para ler como aceno de cabeça e não como foto girando.
 *   Ver .olhar em styles/institutional.css.
 *
 * O QUE FARIA ISTO MELHORAR de verdade não é mais quadro na varredura que já
 * existe: é filmagem nova, uma volta completa do olhar cobrindo os ângulos
 * intermediários, e de olhos abertos.
 */

/** Grade do atlas — casada com o arquivo public/assets/digi-ia-olhar.webp. */
const COLUNAS = 10
const LINHAS = 5
const N_POSES = 50

/**
 * ELA SÓ VIRA PARA UM LADO no material: a varredura inteira gira para a
 * esquerda da imagem. O lado direito é a mesma escada espelhada.
 *
 * A TROCA DE ESPELHO É UM CORTE SECO, e isso foi decidido medindo.
 *
 * A primeira versão dissolvia entre os dois espelhos numa faixa em volta do
 * centro, pela mesma lógica que funciona entre degraus vizinhos. Deu fantasma
 * visível: no meio da tela apareciam dois rostos sobrepostos. A causa não era
 * a assimetria do rosto — era ENQUADRAMENTO. A cabeça estava 18px fora do eixo
 * do recorte, então o espelho a jogava 36px para o outro lado e a mistura
 * somava duas cabeças deslocadas. O recorte do atlas foi corrigido — buscando
 * o deslocamento que minimiza a distância do quadro frontal ao próprio
 * espelho, 18px, que baixou essa distância de 8,1 para 5,8 — e a dissolução
 * saiu.
 *
 * Com a cabeça centrada, o corte troca só detalhe fino — a mecha do cabelo
 * muda de lado —, e acontece exatamente onde a pose está mais frontal, que é
 * onde os dois lados mais se parecem. Uma dissolução ali seria pior: fantasma
 * permanente em vez de um pisca de um quadro.
 */
const ESPELHA_QUANDO_POSITIVO = true

/**
 * Zona morta em torno do centro, para o espelho não tremer.
 *
 * Sem ela, um cursor parado bem no meio com um tremor de um pixel viraria a
 * imagem do avesso várias vezes por segundo. Aqui o espelho só muda quando o
 * cursor passa do centro POR ESTA MARGEM, e mantém o lado anterior enquanto
 * não passar.
 */
const HISTERESE = 0.02

/**
 * Constante de tempo da perseguição, em segundos.
 *
 * É O ÚNICO NÚMERO A GIRAR se o movimento parecer mole ou seco. Ele é o
 * tempo que o retrato leva para cobrir ~63% da distância até onde o cursor
 * pediu; em cerca de 3× isto, chegou para todos os efeitos.
 *
 *   menor (0,05)  responde quase junto com o mouse, e o tranco do mouse
 *                 volta a aparecer
 *   maior (0,20)  fica muito liso e começa a parecer que a cabeça está
 *                 atrasada em relação à mão
 *
 * NÃO É UM FATOR POR QUADRO, e a diferença importa: a conta no laço é
 * `k = 1 - e^(-dt/SEGUE_S)`, então este valor significa a mesma coisa a 60Hz
 * e a 144Hz. Um `atual += (alvo - atual) * 0,2` escrito por quadro pareceria
 * equivalente e perseguiria duas vezes mais rápido numa tela de 144Hz.
 */
const SEGUE_S = 0.1

/**
 * Onde a perseguição é dada por chegada, e o laço para.
 *
 * Perseguição exponencial nunca alcança o alvo, só se aproxima — sem um
 * limiar o `requestAnimationFrame` correria para sempre por distâncias que
 * já não existem na tela. O corte é uma ordem de grandeza abaixo da precisão
 * com que os valores são escritos (três casas), então nada visível se perde.
 */
const PARADO = 0.0004

/** Quantas poses convivem na pilha: os dois degraus vizinhos. */
const N_CAMADAS = 2

/** Posição do quadro dentro da grade, em porcentagem de background. */
function posicao(indice: number): string {
  const coluna = indice % COLUNAS
  const linha = Math.floor(indice / COLUNAS)
  return `${(coluna / (COLUNAS - 1)) * 100}% ${(linha / (LINHAS - 1)) * 100}%`
}

type Camada = { indice: number; espelha: boolean; opacidade: number }

/**
 * A POSE DEPENDE SÓ DO EIXO HORIZONTAL, e é isso que garante continuidade.
 *
 * A versão anterior escolhia por SETOR e RAIO: o ângulo do cursor decidia qual
 * das cinco escadas usar, a distância decidia o degrau. Com cinco escadas e
 * oito setores havia oito fronteiras onde a pose trocava de escada, e era
 * exatamente nelas que o movimento quebrava. Aqui não há fronteira nenhuma: o
 * cursor anda de um lado ao outro e o índice anda junto, monotônico.
 *
 * O expoente 0,85 adianta um pouco a virada — com resposta linear o rosto só
 * chegava ao perfil na borda da tela, e a maior parte do movimento útil ficava
 * espremida no fim do percurso.
 */
function camadas(hx: number, paraPositivo: boolean): Camada[] {
  const mag = Math.min(1, Math.abs(hx))
  const passo = Math.pow(mag, 0.85) * (N_POSES - 1)
  const chao = Math.floor(passo)
  const fr = passo - chao
  const espelha = paraPositivo === ESPELHA_QUANDO_POSITIVO

  const cantos: Camada[] = [{ indice: chao, espelha, opacidade: 1 - fr }]
  if (fr > 0.001) {
    cantos.push({ indice: Math.min(N_POSES - 1, chao + 1), espelha, opacidade: fr })
  }
  return cantos
}

/**
 * Converte PESOS em OPACIDADES EMPILHADAS.
 *
 * Camadas sobrepostas não somam: pintar cada uma com a opacidade do seu peso
 * daria uma mistura errada, com a de cima dominando. Para a pilha resultar na
 * média ponderada, cada camada recebe a sua fatia do que já foi acumulado
 * abaixo dela — a primeira é opaca e as seguintes valem
 * peso / (acumulado + peso).
 */
function empilha(cantos: Camada[]): Camada[] {
  let acumulado = 0
  return cantos.map((c, i) => {
    acumulado += c.opacidade
    return { ...c, opacidade: i === 0 ? 1 : c.opacidade / acumulado }
  })
}

/**
 * NÃO HÁ ESTADO DE REACT AQUI: o efeito escreve direto nos elementos. Manter
 * estado provocaria uma re-renderização por movimento do mouse, e mousemove é
 * o evento mais frequente que existe numa página.
 *
 * QUATRO CAMADAS, sempre montadas, nunca criadas nem destruídas. As sobrando
 * ficam com opacidade zero. Criar e remover nós a cada movimento seria muito
 * mais caro que manter quatro elementos parados.
 *
 * O CENTRO DO ELEMENTO É MEDIDO FORA DO mousemove. getBoundingClientRect()
 * força cálculo de layout, e chamá-lo a cada movimento faz o navegador
 * remontar a página dezenas de vezes por segundo. A medida sai uma vez e é
 * refeita só quando pode ter mudado — rolagem e redimensionamento. Precisa da
 * rolagem porque esta seção é uma estação presa: o Estacoes.tsx escala e
 * translada o palco enquanto ela chega, então o retrato anda na tela mesmo com
 * a página parada.
 *
 * SEM CURSOR NÃO HÁ EFEITO: em tela de toque e com prefers-reduced-motion ele
 * fica na pose frontal, parado, sem ouvinte nenhum pendurado.
 */
export function RetratoQueOlha() {
  const caixa = useRef<HTMLDivElement>(null)
  const camadasRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const el = caixa.current
    const nos = camadasRef.current.filter(Boolean) as HTMLSpanElement[]
    if (!el || nos.length !== N_CAMADAS) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    /* Apelido já estreitado para não-nulo. As funções do laço abaixo são
       DECLARAÇÕES, e declaração é içada — o TypeScript não leva o
       estreitamento de `el` para dentro delas, porque em tese poderiam ser
       chamadas antes da guarda acima. Uma constante resolve sem espalhar
       `!` pelo arquivo. */
    const raiz: HTMLDivElement = el

    let centroX = 0
    let centroY = 0
    /* MEDE O PAI, NUNCA O PRÓPRIO ELEMENTO, e isto conserta um laço de
       realimentação que deixava tudo errado.

       O elemento carrega a inclinação em perspectiva. Um retângulo com
       rotateX/rotateY tem bounding rect DIFERENTE do sem — então medir o
       próprio elemento é medir uma caixa que a inclinação acabou de mexer, e a
       inclinação vem da medida. Medido com o Playwright: com o cursor na
       altura EXATA do centro, onde a inclinação vertical deveria ser 0, o
       componente lia -0,106 — o centro estava uns 51px fora, e o erro variava
       junto com a inclinação.

       O pai (a célula .cf-anim) não tem inclinação própria, mas herda o
       transform da estação — que é justamente o que deve entrar na conta,
       porque ele move o retrato na tela de verdade. */
    const referencia = el.parentElement ?? el
    let ultimaMedida = 0
    const medir = () => {
      const r = referencia.getBoundingClientRect()
      centroX = r.left + r.width / 2
      centroY = r.top + r.height / 2
    }
    medir()

    /* De que lado o espelho está agora. Guardado entre um movimento e outro
       porque a troca tem histerese — ver HISTERESE lá em cima. */
    let paraPositivo = false

    /* ---- O DESENHO SAIU DO EVENTO DE MOUSE, EM 28/08/2026 ----

       Pedido do dono: "preciso que o movimento fique o mais fluido possível".

       A versão anterior lia `clientX`, calculava a pose e escrevia no DOM
       DENTRO do `mousemove`. Isso amarra a fluidez do retrato à fluidez do
       mouse, e ela nunca é boa: o navegador entrega os eventos em intervalos
       irregulares, e um safanão de dedo vira um salto grande da cabeça.

       O `PASSO_MS = 16` que existia aqui parecia ajudar e ATRAPALHAVA. Ele
       não interpolava nada — DESCARTAVA eventos chegados antes de 16ms.
       Descartar por limiar de tempo deixa os sobreviventes irregularmente
       espaçados, e irregularidade é exatamente o que o olho lê como tranco.
       Um afogador só seria neutro se o intervalo resultante fosse constante,
       e ele não é.

       Agora há duas grandezas: o ALVO, que o cursor pede, e o ATUAL, onde o
       retrato está. O `mousemove` só anota onde o cursor está — duas
       atribuições, nada mais. Quem desenha é um laço de `requestAnimationFrame`,
       que corre na cadência da tela e persegue o alvo com amortecimento.

       O AMORTECIMENTO É INDEPENDENTE DA TAXA DE QUADROS, e isso não é
       preciosismo: `atual += (alvo - atual) * 0,2` a cada quadro produz uma
       perseguição DUAS VEZES mais rápida a 144Hz do que a 60Hz. Com
       `k = 1 - e^(-dt/TAU)` o tempo de resposta é o mesmo em qualquer tela,
       porque quem manda é o relógio e não a contagem de quadros.

       E ISTO CONSERTA, PELO LADO CERTO, O QUE A NOTA DO CSS RESOLVEU PELO
       LADO ERRADO. Lá em styles/institutional.css está escrito que a
       transição de 260ms da inclinação foi removida porque "o sprite trocava
       na hora e a inclinação chegava um quarto de segundo depois". A causa
       real não era a suavização — era que só UM dos dois eixos era suavizado.
       Agora o quadro do sprite, as opacidades e a inclinação saem todos do
       MESMO par de valores amortecidos, no mesmo quadro. Nada pode discordar
       de nada.

       O LAÇO PARA QUANDO CHEGA, e volta ao próximo movimento. Um rAF eterno
       numa página parada é custo por quadro sem nada na tela — e esta seção
       divide o relógio com o GSAP e o Lenis. */
    let cursorX = 0
    let cursorY = 0
    let temCursor = false
    let alvoX = 0
    let alvoY = 0
    let atualX = 0
    let atualY = 0
    let quadro = 0
    let ultimoQuadroMs = 0
    let precisaMedir = false
    let escritoX = ''
    let escritoY = ''

    const acorda = () => {
      if (quadro) return
      /* Zerado para o primeiro `dt` do laço não medir o tempo em que a
         página esteve parada — senão o primeiro passo salta o percurso
         inteiro e o amortecimento não teria servido para nada. */
      ultimoQuadroMs = 0
      quadro = requestAnimationFrame(passo)
    }

    const aoMover = (e: MouseEvent) => {
      cursorX = e.clientX
      cursorY = e.clientY
      temCursor = true
      acorda()
    }

    /* O ALVO É RECALCULADO NO LAÇO, e não aqui, porque ele depende de ONDE O
       RETRATO ESTÁ e não só de onde o cursor está. Com a página rolando sob
       um cursor imóvel, a estação move o retrato na tela e a pose tem de
       acompanhar. Guardar o alvo já resolvido no `mousemove` congelaria a
       pose até o próximo movimento do mouse. */
    function calculaAlvo() {
      const vx = cursorX - centroX
      const vy = cursorY - centroY

      /* O HORIZONTAL É NORMALIZADO PELA SUA PRÓPRIA BORDA, cada lado pela
         sua, e aqui isso é a conta certa — não o remendo que era antes.

         Na versão de setores havia um raio único, medido ao longo do raio até
         a borda, porque ângulo e distância eram duas grandezas do mesmo vetor.
         Aqui os dois eixos são INDEPENDENTES: o horizontal escolhe a pose, o
         vertical inclina. Um não interfere no outro.

         O horizontal PODE ter uma borda por lado sem estranheza porque o que
         ele controla é POSE, e pose satura: o fim do percurso é o perfil
         fechado dos dois lados, então chegar lá com velocidades diferentes
         não se percebe — o destino é o mesmo desenho. */
      const hx = Math.max(
        -1,
        Math.min(1, vx / (vx < 0 ? centroX || 1 : window.innerWidth - centroX || 1)),
      )

      /* O VERTICAL, NÃO — e essa diferença foi corrigida em 28/08/2026.

         Ele controla INCLINAÇÃO CONTÍNUA, e inclinação não satura em desenho
         nenhum: cada grau a mais é visível. Com uma borda por lado, o mesmo
         gesto de mouse produzia inclinações diferentes conforme a direção.

         Medido no repouso a 1536×692: o retrato fica em y=407, então há 407px
         de curso para cima e apenas 285px para baixo. Descer o mouse inclinava
         1,43× mais rápido que subir a mesma distância — o eixo tinha uma
         "marcha" a mais num sentido que no outro.

         O ALCANCE É METADE DA JANELA, FIXO — e não a distância até a borda
         mais próxima, que foi a primeira tentativa e estava errada.

         Usar `min(acima, abaixo)` iguala o ganho, mas amarra o ganho à
         POSIÇÃO do retrato na tela. E a posição muda: durante a chegada o
         palco sobe 36vh (SOBE_CHEGADA, em Estacoes.tsx), então o retrato
         passa perto da borda de baixo. Ali aquele mínimo colapsa para
         algumas dezenas de pixels e o eixo satura em ±1 ao primeiro
         movimento. Medido: com a estação a meio caminho, `--olha-y` ficava
         travado em -1 para QUALQUER posição do cursor — o eixo inteiro
         morria durante a chegada.

         Metade da janela é uma referência que não depende de onde o retrato
         está, então o ganho em graus por pixel é o mesmo nas duas direções E
         o mesmo em qualquer ponto da viagem. O preço é que, quando o retrato
         está descentrado, um dos lados satura antes de o cursor alcançar a
         borda — e isso é barato, porque ali ele já está no extremo da
         inclinação de qualquer forma.

         Ver também a nota do eixo vertical em styles/institutional.css: a
         amplitude em graus foi reduzida na mesma leva, pelo mesmo motivo de
         fundo — este eixo não tem fotografia por trás, ele é um disfarce, e
         disfarce só funciona enquanto não chama atenção para si. */
      const alcanceY = window.innerHeight / 2 || 1
      const hy = Math.max(-1, Math.min(1, vy / alcanceY))

      alvoX = hx
      alvoY = hy
    }

    /* O PASSO, na cadência da tela.

       A ORDEM DAS QUATRO ETAPAS NÃO É ARBITRÁRIA: primeiro a leitura de
       layout, depois o alvo, depois a perseguição, e só então as escritas.
       Ler no começo é barato — o navegador já resolveu o layout deste quadro
       e nada nosso o sujou ainda. Ler DEPOIS de escrever forçaria um
       recálculo de layout por quadro, que é justamente o custo que o resto
       deste arquivo evita com tanto cuidado. */
    function passo(agora: number) {
      quadro = 0

      /* Teto de 100ms para o `dt`: se a aba ficou em segundo plano ou o
         quadro demorou, o amortecimento não deve saltar o percurso inteiro
         de uma vez. É a mesma ideia do `lagSmoothing` do GSAP, e pelo mesmo
         motivo — só que aqui a animação é por TEMPO e não por posição de
         rolagem, então descartar o excesso é o comportamento certo. */
      const dt = ultimoQuadroMs ? Math.min(0.1, (agora - ultimoQuadroMs) / 1000) : 1 / 60
      ultimoQuadroMs = agora

      /* Remede de vez em quando: fonte que carrega, imagem que chega,
         estação que se move sem o cursor andar. `precisaMedir` vem da
         rolagem e do redimensionamento; os 250ms cobrem o resto.

         ISTO TAMBÉM TIROU UMA LEITURA DE LAYOUT POR QUADRO: antes o `medir`
         estava pendurado direto no evento de `scroll`, e desde que o Lenis
         entrou a rolagem dispara TODO quadro. Ninguém notou porque o custo
         chegou junto com um ganho maior. Aqui a bandeira só pede a medida, e
         quem decide quando lê é o laço. */
      if (precisaMedir || agora - ultimaMedida > 250) {
        precisaMedir = false
        ultimaMedida = agora
        medir()
      }

      if (temCursor) calculaAlvo()

      const k = 1 - Math.exp(-dt / SEGUE_S)
      atualX += (alvoX - atualX) * k
      atualY += (alvoY - atualY) * k

      /* Perseguição exponencial nunca CHEGA, só se aproxima. Sem um limiar o
         laço correria para sempre a distâncias que nem existem na tela — o
         corte está abaixo da precisão com que os valores são escritos. */
      const chegou = Math.abs(alvoX - atualX) < PARADO && Math.abs(alvoY - atualY) < PARADO
      if (chegou) {
        atualX = alvoX
        atualY = alvoY
      }

      desenha()

      if (!chegou) quadro = requestAnimationFrame(passo)
    }

    /* TUDO O QUE VAI PARA A TELA SAI DAQUI, e sai do mesmo par de valores
       amortecidos. É esta função única que garante que o quadro do sprite, a
       mistura das camadas e a inclinação não possam discordar entre si. */
    function desenha() {
      const sx = atualX.toFixed(3)
      const sy = atualY.toFixed(3)
      /* Reescrever a mesma string é trabalho de estilo por nada, e no fim de
         cada perseguição o valor arredondado se repete por vários quadros. */
      if (sx !== escritoX) {
        raiz.style.setProperty('--olha-x', sx)
        escritoX = sx
      }
      if (sy !== escritoY) {
        raiz.style.setProperty('--olha-y', sy)
        escritoY = sy
      }

      /* A HISTERESE LÊ O VALOR AMORTECIDO, não o do cursor. Quem não pode
         piscar é a imagem, e a imagem está no valor amortecido — decidir o
         espelho pelo cursor cru voltaria a trocar o lado antes de a cabeça
         ter passado do centro. */
      if (atualX > HISTERESE) paraPositivo = true
      else if (atualX < -HISTERESE) paraPositivo = false

      const pilha = empilha(camadas(atualX, paraPositivo))
      for (let i = 0; i < N_CAMADAS; i++) {
        const no = nos[i]
        const c = pilha[i]
        if (!c) {
          no.style.opacity = '0'
          continue
        }
        no.style.opacity = c.opacidade.toFixed(3)
        no.style.backgroundPosition = posicao(c.indice)
        no.style.transform = c.espelha ? 'scaleX(-1)' : 'none'
      }
    }

    /* Rolar e redimensionar mudam ONDE O RETRATO ESTÁ, então mudam o alvo
       mesmo com o cursor parado. Só acorda o laço se já houver cursor
       conhecido: sem ele não há pose a recalcular, e uma página rolando não
       deve ligar um laço de animação por nada. */
    const aoRolar = () => {
      precisaMedir = true
      if (temCursor) acorda()
    }

    window.addEventListener('mousemove', aoMover, { passive: true })
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)
    return () => {
      if (quadro) cancelAnimationFrame(quadro)
      window.removeEventListener('mousemove', aoMover)
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [])

  return (
    <div
      ref={caixa}
      className="olhar"
      role="img"
      aria-label="Rosto da Digi.IA acompanhando o cursor"
    >
      {Array.from({ length: N_CAMADAS }, (_, i) => (
        <span
          key={i}
          ref={(no) => {
            camadasRef.current[i] = no
          }}
          className="olhar__quadro"
          style={{ opacity: i === 0 ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
