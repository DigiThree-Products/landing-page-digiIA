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
 *   HORIZONTAL vem do sprite — 50 poses de uma virada contínua, do frontal ao
 *   perfil fechado. Salto médio entre passos vizinhos 0,79, máximo 1,54,
 *   nenhuma fronteira. A versão anterior tinha 138 quadros de cinco tomadas:
 *   salto 4,14 dentro das escadas e 25,26 nas emendas. Menos imagens,
 *   movimento dezesseis vezes mais liso no pior caso — porque fluidez vem de
 *   continuidade, não de quantidade.
 *
 *   (Este parágrafo dizia 55 poses até 28/08/2026. O atlas tem 3600×2305 numa
 *   grade de 10×5, ou seja 50 células de 360×461 — conferido no arquivo, e é
 *   o que COLUNAS × LINHAS abaixo sempre disse.)
 *
 *   E dizia também, até 01/09, que os cinco últimos quadros eram "quase
 *   idênticos", 10% de atlas desperdiçado num trecho onde nada acontece.
 *   MEDIDO, É O CONTRÁRIO: os passos de #44 a #49 valem 6,3 · 7,0 · 7,4 ·
 *   8,1 · 8,1, contra 4,67 de mediana do percurso — estão entre os MAIORES
 *   do atlas. Quem quase não muda é o começo: os onze primeiros quadros
 *   somam 10% da mudança visual do percurso inteiro. Cortar as poses finais
 *   teria tirado justamente onde há mais movimento por byte. Ver PERCURSO.
 *
 *   VERTICAL vem do CSS, porque nesta tomada não há pose de olhar para cima ou
 *   para baixo que preste. Mesmo que houvesse, ela só serviria no eixo puro:
 *   um sprite não SOMA direções, e misturar "virada" com "erguida" dá dupla
 *   exposição, não uma terceira pose. Então a inclinação é contínua, com o
 *   ponto de giro NA LINHA DOS OLHOS. Ver .olhar em styles/institutional.css,
 *   onde está medido por que ali e não na base do quadro.
 *
 * ---- ATENÇÃO: OS PARÁGRAFOS ACIMA SÃO SOBRE A TOMADA DE JULHO ----
 *
 * Tudo o que este cabeçalho afirma sobre "não existe material vertical" é
 * verdade sobre o vídeo de julho e FALSO sobre o de 27/08/2026, que está em
 * `componentes/0827 (1).mp4` e foi medido em 28/08. Aquele tem um trecho
 * inteiro dela olhando para CIMA de olhos ABERTOS, e vira para OS DOIS lados
 * — a pele vai de +0,85 concentrada à direita a −0,38 à esquerda.
 *
 * São fatos sobre UMA GRAVAÇÃO, não sobre a atriz. Quem ler isto como fato
 * sobre ela vai descartar o eixo vertical de novo sem abrir a pasta, que foi
 * exatamente o que quase aconteceu.
 *
 * O QUE AQUELE MATERIAL AINDA NÃO DÁ, e é por isso que ele não entrou: o giro
 * chega só a três-quartos de cada lado, não ao perfil, e vem ACOPLADO à
 * inclinação — é um circuito contínuo pelo espaço de poses, não uma grade. A
 * única varredura contígua que atravessa o giro inteiro acontece com ela
 * olhando para cima. E as duas tomadas não se emendam: distância 4,2 entre
 * tomadas contra 0,8 entre quadros vizinhas da mesma.
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
 * O ESPELHO SAIU EM 01/09/2026, e com ele a histerese, o véu e a dissolução
 * da troca. Queixa do dono: "a inversão de um lado para o outro está
 * completamente desnatural".
 *
 * Ele estava certo, e não era caso de ajustar parâmetro. Esta tomada só vira
 * para um lado, então o outro lado era a mesma escada espelhada — e espelhar
 * troca o cabelo de lado de uma vez só. Medido no atlas, com a mesma métrica
 * de distância visual que o resto do arquivo usa:
 *
 *   passo mediano entre poses vizinhas ..........  4,67
 *   custo de espelhar, no quadro frontal ........ 28,98
 *   custo de espelhar, quadros #1 a #11 ......... 27,6 a 31,1
 *
 * Seis vezes um passo normal, e PLANO ao longo dos quadros: não existe pose
 * barata onde virar, então adiantar ou atrasar a troca não ajudava. Sob a
 * máscara fica PIOR (36,1), porque a assimetria não mora nas bordas —
 * varrendo o quadro em seis faixas verticais, a diferença é 4,4 no fundo
 * vazio e 37 a 46 na faixa do rosto. E não é enquadramento: varrendo o
 * recorte de -72 a +72px, o mínimo cai em zero (43,42 contra 43,47 em zero),
 * ou seja o corte já estava no ótimo, como o comentário antigo dizia.
 *
 * As três tentativas anteriores — dissolver por posição, cortar seco,
 * dissolver por tempo — eram todas maneiras de VESTIR esses 29. Nenhuma
 * podia funcionar, porque o defeito é a troca existir.
 *
 * O QUE ENTROU NO LUGAR: o repouso deixa de ser o frontal. A varredura
 * inteira é esticada pela largura da tela, então a cabeça sempre gira na
 * direção do cursor e não há troca nenhuma a disfarçar. O preço, escolhido
 * pelo dono entre as alternativas: com o cursor na altura do retrato ela
 * fica em três-quartos, e só chega ao frontal num dos extremos.
 *
 * O CONSERTO DE VERDADE continua sendo filmagem nova — uma tomada contínua
 * cobrindo o giro dos DOIS lados, de olhos abertos, com ~460px por pose.
 * Com ela o espelho não precisa existir e o vertical pode virar fotografia
 * também, em vez do disfarce em CSS que é hoje.
 */
const REPOUSO_VISUAL = 0.3

/**
 * O PERCURSO NÃO É UNIFORME, e é só por isso que esta tabela existe.
 *
 * Quadro de atlas não é ângulo. Medida a distância visual entre poses
 * vizinhas, o passo vai de 1,13 perto do frontal a 9,12 lá pelo #33: os ONZE
 * PRIMEIROS QUADROS valem 10% da mudança visual do percurso inteiro, e a
 * faixa do #30 ao #40 vale quase o triplo disso por passo.
 *
 * Com um mapa linear, então, o primeiro quinto do curso do cursor quase não
 * mexe a cabeça e depois ela dispara. Era isso que o `Math.pow(mag, 0.85)`
 * compensava às cegas — e compensava mal, porque a derivada dele é infinita
 * em zero: os primeiros pixels em volta do centro eram duas vezes mais
 * sensíveis que os das bordas, justamente onde o espelho virava.
 *
 * Cada entrada aqui é a fração do COMPRIMENTO VISUAL do percurso já andada
 * ao chegar naquele quadro. Invertida em `quadroEm`, ela faz movimento igual
 * do cursor dar mudança igual na tela.
 *
 * COMO REFAZER, se o atlas mudar: para cada par de quadros vizinhos, a média
 * da diferença absoluta por canal numa redução para 64x82; soma acumulada,
 * dividida pelo total. A tabela é medida DESTE arquivo de imagem — trocar o
 * atlas sem refazê-la transforma ela numa mentira silenciosa, porque nada
 * quebra, o movimento só volta a ser irregular.
 */
const PERCURSO = [
  0.0000, 0.0051, 0.0094, 0.0147, 0.0216, 0.0284, 0.0372, 0.0475, 0.0593, 0.0730,
  0.0879, 0.1037, 0.1199, 0.1373, 0.1541, 0.1714, 0.1877, 0.2052, 0.2225, 0.2409,
  0.2614, 0.2851, 0.3020, 0.3287, 0.3467, 0.3736, 0.3905, 0.4180, 0.4341, 0.4632,
  0.4774, 0.5091, 0.5436, 0.5781, 0.6131, 0.6473, 0.6811, 0.7140, 0.7447, 0.7725,
  0.7964, 0.8143, 0.8220, 0.8373, 0.8588, 0.8828, 0.9095, 0.9381, 0.9690, 1.0000,
]

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

/**
 * Quantas camadas convivem: os dois degraus vizinhos da pose, e mais nada.
 *
 * Foram três entre 28/08 e 01/09/2026. A terceira era um véu que congelava a
 * imagem anterior para dissolver a troca do espelho — saiu junto com o
 * espelho, porque sem troca não há o que dissolver. Ver o cabeçalho de
 * REPOUSO_VISUAL, que também explica por que aquela dissolução, e as duas
 * tentadas antes dela, não podiam ter funcionado.
 */
const N_CAMADAS = 2

/**
 * Piso do alcance vertical, em fração da altura da janela.
 *
 * O alcance normal é a distância do retrato até a borda mais próxima da
 * janela, para que a inclinação chegue ao extremo tanto subindo quanto
 * descendo — ver a conta em `calculaAlvo`. Este número só existe para o
 * caso em que o retrato está a caminho de sair da tela: ali a distância
 * até a borda tende a zero e, sem piso, o eixo saturaria ao primeiro pixel
 * de movimento do mouse.
 *
 * Medido a 1920×1080: a posição de leitura pede 430px de alcance e este
 * piso vale 302px, então ele não morde enquanto a seção está sendo lida.
 * Ele só entra quando o retrato já está entrando ou saindo da tela.
 */
const PISO_ALCANCE_Y = 0.28

/** Posição do quadro dentro da grade, em porcentagem de background. */
function posicao(indice: number): string {
  const coluna = indice % COLUNAS
  const linha = Math.floor(indice / COLUNAS)
  return `${(coluna / (COLUNAS - 1)) * 100}% ${(linha / (LINHAS - 1)) * 100}%`
}

type Camada = { indice: number; opacidade: number }

/**
 * Inverte a tabela PERCURSO: dado quanto do percurso VISUAL já se andou,
 * devolve o quadro fracionário correspondente.
 *
 * Fracionário de propósito — a parte quebrada vira a mistura entre os dois
 * degraus vizinhos, que é o que tira a escada do movimento. Devolver inteiro
 * aqui jogaria fora metade do trabalho da tabela.
 */
function quadroEm(visual: number): number {
  const v = Math.max(0, Math.min(1, visual))
  /* Busca linear em 50 entradas, uma vez por quadro de tela. Uma binária
     economizaria 45 comparações num laço que já faz leitura de layout e
     escrita de estilo — não vale a ilegibilidade. */
  let k = 1
  while (k < N_POSES - 1 && PERCURSO[k] < v) k++
  const de = PERCURSO[k - 1]
  const ate = PERCURSO[k]
  const fatia = ate - de
  return k - 1 + (fatia > 0 ? (v - de) / fatia : 0)
}

/**
 * A POSE DEPENDE SÓ DO EIXO HORIZONTAL, e é isso que garante continuidade.
 *
 * A versão de julho escolhia por SETOR e RAIO: o ângulo do cursor decidia qual
 * das cinco escadas usar, a distância decidia o degrau. Com cinco escadas e
 * oito setores havia oito fronteiras onde a pose trocava de escada, e era
 * exatamente nelas que o movimento quebrava.
 *
 * A de agosto tirou as fronteiras mas criou uma: o espelho, no centro. Esta
 * não tem nenhuma — o cursor anda de um lado ao outro e a pose anda junto,
 * monotônica, do frontal num extremo ao perfil no outro.
 *
 * A CONVENÇÃO DE SENTIDO VEM DA VERSÃO ANTERIOR e não foi redescoberta: lá,
 * cursor à esquerda dava quadro alto SEM espelhar, e a direção lia certo. Ela
 * é preservada aqui — `hx` negativo continua puxando para o fim do percurso.
 *
 * O REPOUSO NÃO É O ZERO DO PERCURSO, e é isso que dá os dois lados: com o
 * cursor na altura do retrato ela fica em REPOUSO_VISUAL, e daí vai para o
 * frontal de um lado e para o perfil do outro. Os dois trechos são esticados
 * cada um pela sua metade da tela, então o ganho é diferente entre eles — e
 * pode ser, porque não há emenda no meio: a função é contínua em hx = 0 por
 * construção, já que os dois ramos valem REPOUSO_VISUAL ali.
 */
function camadas(hx: number): Camada[] {
  const x = Math.max(-1, Math.min(1, hx))
  const visual =
    x <= 0
      ? REPOUSO_VISUAL + -x * (1 - REPOUSO_VISUAL)
      : REPOUSO_VISUAL * (1 - x)
  const passo = quadroEm(visual)
  const chao = Math.floor(passo)
  const fr = passo - chao

  const cantos: Camada[] = [{ indice: chao, opacidade: 1 - fr }]
  if (fr > 0.001) {
    cantos.push({ indice: Math.min(N_POSES - 1, chao + 1), opacidade: fr })
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
 * AS CAMADAS DE MISTURA, sempre montadas, nunca criadas nem destruídas. As
 * sobrando ficam com opacidade zero. Criar e remover nós a cada movimento
 * seria muito mais caro que manter elementos parados.
 *
 * (Este parágrafo já disse "quatro camadas" com o código montando duas, e
 * depois falou de um véu que hoje não existe. O número por extenso envelheceu
 * três vezes — quem manda é N_CAMADAS, e só ele.)
 *
 * O CENTRO DO ELEMENTO É MEDIDO FORA DO mousemove. getBoundingClientRect()
 * força cálculo de layout, e chamá-lo a cada movimento faz o navegador
 * remontar a página dezenas de vezes por segundo. A medida sai uma vez e é
 * refeita só quando pode ter mudado — rolagem e redimensionamento. Precisa da
 * rolagem porque o alvo depende de ONDE O RETRATO ESTÁ NA JANELA, e rolar
 * muda isso com o cursor parado.
 *
 * (Dizia que a rolagem importava por esta seção ser "uma estação presa", que
 * escalava e transladava o palco. Ela deixou de ser estação em 28/08/2026 —
 * perdeu a classe `estacao`, ver app/page.tsx. A medida na rolagem continua
 * necessária, só que pela razão comum: a página rola e o retrato sobe.)
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

       O pai (a célula .cf-anim) não carrega inclinação nenhuma, então o
       retângulo dele é o lugar de verdade do retrato na tela — que é
       justamente o que deve entrar na conta.

       Ele carrega, sim, o que os ANCESTRAIS aplicam: o `.estacao-palco`
       leva `zoom` nas telas baixas (0,84 a 1536×760, 1 a 1920×1080), e
       `getBoundingClientRect` já vem com o zoom dentro. Como `clientX` e
       `clientY` também são pixels de tela, os dois lados da subtração
       falam a mesma unidade e não há nada a corrigir. */
    const referencia = el.parentElement ?? el
    let ultimaMedida = 0
    const medir = () => {
      const r = referencia.getBoundingClientRect()
      centroX = r.left + r.width / 2
      centroY = r.top + r.height / 2
    }
    medir()

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
       um cursor imóvel, o retrato anda na tela e a pose tem de acompanhar —
       e desde 01/09 isso vale em dobro, porque o ALCANCE vertical também sai
       da posição dele. Guardar o alvo já resolvido no `mousemove` congelaria
       a pose até o próximo movimento do mouse. */
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

         O ALCANCE É A BORDA MAIS PRÓXIMA, COM PISO — e isto mudou em
         01/09/2026, a pedido do dono: "tanto quando o cursor for movimentado
         acima da altura do componente como embaixo preciso que o componente
         acompanhe".

         O QUE ESTAVA ERRADO. O alcance era metade da janela, fixo. Só que o
         retrato NÃO mora no meio da janela: mora cerca de 110px abaixo dela,
         e isso não depende do tamanho da tela — medido 111px a 1536×760 e
         110px a 1920×1080. Meia janela cabe inteira para cima e não cabe
         para baixo:

           1536×760 ..... para cima satura em -1,00 · para baixo só +0,71
           1920×1080 .... para cima satura em -1,00 · para baixo só +0,80

         Ou seja: ela inclinava os 9 graus cheios para cima antes de o cursor
         chegar ao topo, e NUNCA completava para baixo — parava em 6,4 graus.
         Era exatamente esse o "não acompanha embaixo".

         A BORDA MAIS PRÓXIMA CONSERTA OS DOIS LADOS DE UMA VEZ. O ganho em
         graus por pixel continua igual nas duas direções, que era o que a
         versão de meia janela protegia, e agora ±1 é alcançável nas duas.
         Medido em repouso a 1920×1080: o alcance vira 430px, então -1 cai em
         y=220 e +1 exatamente na borda de baixo.

         O PISO É O QUE FALTAVA NA PRIMEIRA TENTATIVA, e é por não ter piso
         que ela foi descartada. Sem ele, `min(acima, abaixo)` colapsa quando
         o retrato se aproxima de uma borda e o eixo satura ao primeiro
         movimento. O comentário antigo culpava a viagem da estação — mas a
         estação morreu em 28/08 e o problema não morreu junto: varrendo a
         rolagem da seção inteira a 1920×1080, o centro do retrato passeia de
         -110 a 1170, então o mínimo cru chega a ser NEGATIVO. É a rolagem
         normal que faz isso, não a estação.

         Ver também a nota do eixo vertical em styles/institutional.css: a
         amplitude em graus foi reduzida na mesma leva, pelo mesmo motivo de
         fundo — este eixo não tem fotografia por trás, ele é um disfarce, e
         disfarce só funciona enquanto não chama atenção para si. */
      const alcanceY =
        Math.max(
          window.innerHeight * PISO_ALCANCE_Y,
          Math.min(centroY, window.innerHeight - centroY),
        ) || 1
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

      /* A CONDIÇÃO É SÓ A CHEGADA. Até 01/09 havia um `|| trocaMs` aqui, que
         segurava o laço aceso enquanto o véu da troca do espelho apagava —
         sem ele a camada de cima congelava no meio do caminho e ficava um
         rosto fantasma parado na tela. Sem espelho não há véu, e sem véu não
         há nada a esperar depois de a pose chegar. */
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

      /* Nenhuma camada escreve `transform`: até 01/09 era aqui que o espelho
         virava, com `scaleX(-1)`, e o segundo degrau tinha de espelhar junto
         com o primeiro. Hoje as duas camadas são o mesmo desenho em dois
         degraus vizinhos, e a única coisa que as separa é a opacidade. */
      const pilha = empilha(camadas(atualX))
      for (let i = 0; i < N_CAMADAS; i++) {
        const no = nos[i]
        const c = pilha[i]
        if (!c) {
          no.style.opacity = '0'
          continue
        }
        no.style.opacity = c.opacidade.toFixed(3)
        no.style.backgroundPosition = posicao(c.indice)
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
