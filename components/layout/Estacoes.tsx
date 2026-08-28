'use client'

import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * Toda seção marcada como estação. Começou com "Veja funcionando" sozinha
 * e hoje são cinco: ela, "O que ela faz", "Como funciona", "+15 anos" e
 * "Perguntas".
 *
 * O contrato é de DUAS partes, e as duas são obrigatórias:
 *   1. a seção leva a classe `estacao` — é ela que o ScrollTrigger mede e
 *      prende, e por isso não pode ser a que escala;
 *   2. dentro dela existe um `.estacao-palco` — é ele que escala.
 * Sem o palco a escala cairia na própria seção, o ScrollTrigger mediria o
 * retângulo já encolhido e ancoraria o pin no lugar errado.
 *
 * Hero, oferta e rodapé NÃO são estações e não devem receber a classe:
 * a hero tem o mergulho próprio, e as outras duas são o destino do
 * argumento — prender e afastar o bloco de conversão seria trabalhar
 * contra ele.
 */
const PAINEIS = '.page .estacao'

/** Escala e opacidade de quando ela ainda é um ponto no fundo. */
const ESCALA_LONGE = 0.16
const OPACIDADE_LONGE = 0.1
/** Escala ao passar rente à câmera. */
const ESCALA_PASSA = 1.6

/**
 * A que distância ela começa, em múltiplos da distância de leitura.
 *
 * Tamanho aparente é 1/distância, então isto e ESCALA_LONGE são a mesma
 * informação dita de dois jeitos. Existe assim mesmo porque quem percorre
 * o caminho em linha reta é a DISTÂNCIA — o tamanho é consequência dela,
 * nunca o contrário, e é essa inversão que dá a sensação de percurso.
 */
const DISTANCIA_LONGE = 1 / ESCALA_LONGE

/**
 * Quanto ela sobe na tela, em vh: de baixo até o eixo enquanto chega, e
 * para além do topo enquanto passa.
 *
 * O sentido é o dos grãos da poeira (PoeiraFundo.tsx): eles sobem,
 * crescem e se abrem a partir do centro. Crescer e abrir a estação já
 * fazia de graça — escalar a partir do centro afasta tudo do centro.
 * Subir era o que faltava para ela ser mais um corpo no mesmo fluxo, em
 * vez de um cartaz que incha parado no meio da tela.
 */
const SOBE_CHEGADA = 36
const SOBE_PASSAGEM = 24

/**
 * Para onde ela vai, em vh, quando o scroll SOBE — para cima, não de
 * volta para baixo.
 *
 * Aqui a ida e a volta deixam de ser o mesmo caminho. Entrando, a
 * estação vem de SOBE_CHEGADA abaixo do eixo; saindo de ré, ela sobe e
 * some pelo topo em vez de refazer o trajeto de onde veio. É a única
 * coisa na seção que depende da DIREÇÃO do scroll, e não só da posição.
 *
 * O peso entre os dois caminhos é o `re.atual`, que guarda o SENTIDO da
 * última rolagem e permanece quando ela para. Em `perto = 1` os dois
 * caminhos valem zero, então não há degrau ao trocar de sentido com a
 * estação assentada: a bifurcação só se abre conforme ela se afasta.
 */
const SOBE_VOLTA = 30
/**
 * Variação mínima de `progress` que conta como movimento de verdade.
 *
 * Zona morta contra ruído de ponto flutuante: sem ela o sentido oscila
 * entre ida e volta com a página praticamente parada, e a estação
 * treme.
 */
const RE_MORTA = 0.00002

/**
 * Quão depressa a estação troca de um caminho para o outro, por quadro.
 *
 * Baixo de propósito. Os dois caminhos se afastam em
 * (SOBE_CHEGADA + SOBE_VOLTA) × (1 − perto) — até 66vh quando ela está
 * longe. Inverter o sentido lá no meio significa atravessar essa
 * distância, e a 0,25 (o valor anterior) isso era ~16vh no primeiro
 * quadro: um salto. A 0,06 a travessia leva ~45 quadros de rolagem e se
 * lê como um arco.
 */
const RE_TAXA = 0.06

/**
 * Quanta rolagem a travessia inteira consome, em telas.
 *
 * É esta constante que governa a VELOCIDADE — e ela só existe porque a
 * estação fica presa no lugar durante o trecho. Sem prender, o painel
 * atravessa a tela em uma rolagem fixa (o tempo de ele subir de baixo
 * até o topo) e não há como alongar a aproximação: mexer nos marcos
 * abaixo só redistribuiria esse mesmo pedaço. Presa, a chegada dura o
 * quanto a gente quiser.
 *
 * O caminho foi 5,5 → 4,0 → 2,2, sempre pelo mesmo motivo: a viagem estava
 * longa demais de rolar. É o dial mais poderoso da seção: ele escala TUDO
 * junto — a chegada, a travada, a partida, as janelas dos quatro blocos e
 * até o preto do começo, porque aquele trecho também é uma fração deste pin
 * (185px hoje, eram 263 em 4,0 e 327 em 5,5). Mexer aqui invalida qualquer
 * número em telas escrito em styles/estacao.css: as proporções entre os
 * blocos sobrevivem, os valores absolutos não. Estão remedidos para 2,2.
 *
 * A queda de 4,0 para 2,2 NÃO foi uniforme, e a diferença importa: ela saiu
 * inteira da chegada e da partida, e a janela de leitura não só sobreviveu
 * como cresceu (0,26 → 0,30 tela). Ver o orçamento em CHEGOU. O princípio
 * era que o cansaço não vinha de haver conteúdo demais, e sim de rolar
 * muito sem o conteúdo avançar — então o corte tinha que sair do transporte,
 * nunca do tempo em que se lê.
 */
const TRAVESSIA = 2.2

/* Marcos dentro do trecho preso. Entre CHEGOU e PARTIU ela fica parada
   em 1:1 — a composição inteira montada, imóvel e nítida.

   Essa janela NÃO encolheu quando a travessia caiu de 4,0 para 2,2 — pelo
   contrário, foi crescendo: 0,26 → 0,30 → 0,40 → 0,50 tela de rolagem,
   sempre tirando o acréscimo da PARTIDA e nunca da chegada, que já estava no
   ponto. É o instante em que os quatro blocos existem juntos, e ele se lê
   como uma travada leve: a página continua rolando e nada se mexe. Longa
   demais, ela deixa de ser o encontro dos blocos e vira uma seção parada
   esperando o usuário; curta demais, os blocos nunca chegam a coexistir e
   o vídeo entra já saindo.

   O ÚLTIMO PASSO (0,40 → 0,50) tem uma razão diferente dos anteriores, e ela
   é nova: desde que o texto do #recursos passou a nascer DENTRO da travada
   (ver `--pousado`, mais abaixo, e styles/estacao.css), esta janela deixou
   de ser só tempo de leitura e virou também o palco de uma coreografia. O
   pedido foi deixar aquela revelação mais lenta, e ela não tinha para onde
   crescer: espremida nas 0,40 telas antigas, alongar a cascata só comeria a
   folga imóvel do fim.

   Vale saber o que isso cobra e o que não cobra. As OUTRAS CINCO estações
   não animam nada aqui — para elas a travada é tempo parado, então esticá-la
   só dá mais tempo de leitura, que é ganho. Quem paga é a PARTIDA, comum às
   seis, que caiu de 0,45 para 0,35 tela: a saída ficou mais curta e mais
   seca. Se ela passar a ler como tranco, é este o número a devolver.

   Mover só PARTIU (e não CHEGOU) é o que isola o ganho na travada: CHEGOU
   continua marcando o mesmo ponto físico de sempre, então a chegada
   (1,35 tela) e tudo o que ela contém — as janelas de styles/estacao.css,
   calculadas a partir de `--chegada`, que satura em CHEGOU — não sentem
   nada. Só a fração de PARTIU muda, e ela só governa o quanto sobra para
   a partida.

   CHEGOU e TRAVESSIA são mexidos JUNTOS, e o produto dos dois é o que
   precisa ficar de pé: ele é o comprimento da chegada. Hoje 0,614 × 2,2 =
   1,35 telas. São dois eixos distintos, e vale não confundi-los: subir o
   PONTO DE ENCONTRO encolhe o que vem DEPOIS da chegada; encolher a
   TRAVESSIA encolhe tudo proporcionalmente, chegada inclusa.

   O orçamento atual do pin, em telas de 900px:
     chegada   0,614 × 2,2 = 1,35   (era 2,80)
     travada   0,227 × 2,2 = 0,50   (era 0,40, antes 0,30 e 0,26)
     partida   0,159 × 2,2 = 0,35   (era 0,45, antes 0,55 e 0,94)
   Com a hero (2,6) e o vão (0,1), são 4,9 telas até o fim deste pin — o
   total não mudou, porque travada e partida só trocaram de tamanho entre
   si.

   ATENÇÃO: os números acima e os de styles/estacao.css são MEDIDOS contra
   TRAVESSIA 2,2 e CHEGOU 0,614. Este bloco já carregou por muito tempo os
   valores de uma calibragem morta (0,87 × 9,89 = 8,60 telas, folgas de
   1,50, "quase dez telas") que sobreviveram a um encolhimento anterior sem
   ninguém remedir — e um comentário errado aqui custa caro, porque é ele
   que orienta quem for calibrar. Se mexer em TRAVESSIA ou CHEGOU, remeça
   (PARTIU sozinho não invalida a chegada, só o próprio orçamento acima).

   Se a separação entre os blocos não se ler, o problema pode não ser
   distância: é a AMPLITUDE do gesto de cada bloco em styles/estacao.css,
   hoje 32px (64 no vídeo) num palco ainda reduzido — sutil demais para um
   bloco "chegar" em vez de só "aparecer".

   A ESTAÇÃO MAIS FOLGADA JÁ ERA "+15 anos" (Credibility), e não por
   causa desta janela — ela é IGUAL para as cinco. O que difere é onde o
   último bloco de cada uma termina de nascer dentro da chegada, medido
   em `--de + --dur` de styles/estacao.css: quanto mais cedo ele termina,
   mais tempo o conteúdo já fica montado e imóvel ANTES de a travada
   sequer começar.

     Approach (mídia)      1,00 → 0,00 tela de folga antes da travada
     Recursos (repertório) 0,90 → 0,14 tela
     FAQ (6ª pergunta)     0,85 → 0,20 tela
     Demo (mockup)         0,78 → 0,30 tela
     Credibility (frase)   0,66 → 0,46 tela

   0,46 tela de folga PRÓPRIA, mais os 0,50 da travada partilhada: a frase
   de "+15 anos" já fica parada e legível por 0,96 tela antes de partir —
   mais que o dobro de qualquer outra estação. Ela não precisava de ajuda;
   já era a mais bem servida das cinco. Quem tem MENOS folga própria é o
   Approach (a mídia fecha exatamente junto com a chegada, por desenho:
   ver a nota em `.approach-media` em styles/estacao.css) — mas ali o
   corpo final é o vídeo em loop, não uma frase para ler, então zero de
   folga não é o mesmo problema. */
const CHEGOU = 0.614
const PARTIU = 0.841

/**
 * O RITMO DE UMA ESTAÇÃO — dois atos hoje, e o encaixe para um terceiro.
 *
 * As seis chegam e ficam paradas enquanto se lê: chegada, revelação, partida.
 * `expandiu` IGUAL a `chegou` é o que desliga o ato do meio — a janela da
 * expansão tem comprimento zero, `--expande` nasce saturada em 1 e a revelação
 * começa no mesmo instante em que a chegada termina.
 *
 * O CAMPO CONTINUA AQUI porque a Estação 02 já usou um, e pode voltar a usar.
 * Entre 26 e 27/08 ela teve três atos: chegava orbitando como um satélite
 * DOBRADO, implantava as asas até virar o console deitado, e só então revelava
 * o texto. O pedido de 27/08 foi tirar a dobra e deixar o satélite fixo, então
 * o ato do meio não tem mais o que fazer e ela voltou às 2,2 telas das outras.
 *
 * O molde daquele ritmo está guardado logo abaixo de `RITMO_PADRAO`, junto com
 * a regra de como resolver os marcos. Vale a pena ler antes de declarar um ato
 * novo: eles são FRAÇÕES do pin, e essa é a pegadinha da conta.
 */
type Ritmo = {
  travessia: number
  chegou: number
  expandiu: number
  /* Onde a REVELAÇÃO termina — que não é onde a estação parte.
     Igual a `partiu` significa "revela até o último instante e já vai embora",
     que é o comportamento das cinco. Menor que `partiu` abre uma PARADA: o
     texto acaba de nascer e a composição fica imóvel na tela até a partida. */
  revelou: number
  partiu: number
  /* UM OVERRIDE DO PALCO, e ele existe porque as constantes que governam a
     viagem são do MÓDULO e valem para as seis estações.

     Sem ele, atender um pedido feito sobre UMA estação custaria mudar as
     outras cinco de quebra — que é a mesma regressão silenciosa que a nota
     do RITMO_RECURSOS descreve para o caso da parada.

     Ausente, cai em OPACIDADE_LONGE. `??` e não `||` porque zero é valor
     legítimo aqui: uma estação que quisesse nascer invisível escreveria
     `opacidadeLonge: 0`, e `||` a devolveria para 0,1 por acaso. É o mesmo
     cuidado que a nota do `janela` da expansão documenta para `0/0`. */
  opacidadeLonge?: number
}

const RITMO_PADRAO: Ritmo = {
  travessia: TRAVESSIA,
  chegou: CHEGOU,
  expandiu: CHEGOU,
  revelou: PARTIU,
  partiu: PARTIU,
}

/* ---- A ESTAÇÃO 02 PARA, E É SÓ NISSO QUE ELA FOGE DO PADRÃO ----

   O pedido foi que o satélite completo, com os títulos, ficasse mais tempo na
   tela. Ele mal ficava: a última cascata fecha aos 0,78 do relógio da
   revelação, e com `revelou` colado em `partiu` sobravam 0,22 de uma travada
   de 0,50 tela — 0,11 tela, uns 96px de rolagem, e a estação já ia embora.

   Os marcos saem RESOLVIDOS AO CONTRÁRIO — diz-se quantas telas cada ato dura
   e divide-se pelo pin —, senão aumentar a travessia estica a chegada junto,
   que é justamente o que não se quer:

     chegada    1,90 tela → 1,90 / 3,60 = 0,5278   (as cinco seguem em 1,35)
     revelação  0,90 tela → acumulado 2,80 / 3,60 = 0,7778
     PARADA     0,80 tela → daí até o fim do pin
     partida    NENHUMA   → `partiu: 1`

   ---- ELA NÃO PARTE, E ISSO NÃO É "PARTIDA DE DURAÇÃO ZERO" ----

   As outras cinco saem de cena ANTES de o pin soltar: escalam além da tela e
   apagam, e é por isso que a cauda do pin delas pode ser descontada do vão da
   seguinte (ver `caudaAcima`). A Estação 02 não faz nada disso. Ela fica em
   tamanho e brilho de leitura até o pin soltar e depois rola para fora
   inteira, como uma seção comum.

   `partiu: 1` é o que diz isso, e o `onUpdate` trata o caso: janela de saída
   de comprimento zero vira `passagem = 0`, não `NaN`.

   O PREÇO ESTÁ EM `caudaAcima`, e é consciente: sem partida não há o que
   descontar, então volta a haver rolagem entre esta estação e a seguinte. A
   nota de lá explica por que descontar mesmo assim seria pior — a seção
   seguinte pinta fundo opaco, e seria ela cortando esta ao meio.

   ---- POR QUE A REVELAÇÃO NÃO ROUBOU DA PARADA ----

   O pedido de desacelerar o texto veio DEPOIS do de manter o satélite mais
   tempo na tela, e os dois valem ao mesmo tempo. A revelação foi de 0,50 para
   0,90 tela — 1,8× mais lenta — e a parada continua nas 0,80 que o pedido
   anterior comprou. Quem pagou foi o pin, que subiu de 3,0 para 3,4.

   Tirar da parada teria sido o caminho barato e teria desfeito o pedido
   anterior em silêncio, que é o pior tipo de regressão: a que atende o último
   pedido às custas do penúltimo, sem ninguém perceber.

   É `revelou` estar separado de `partiu` que torna isso possível — as duas
   janelas ficaram independentes. Antes da separação, alargar a revelação comia
   a folga imóvel obrigatoriamente, porque era a mesma janela.

   ---- O TAMANHO DO PIN JÁ TEVE TRÊS RAZÕES ----

   2,2 telas é o padrão. Ele foi a 3,0 duas vezes, por motivos diferentes: até
   27/08 as 0,80 extras pagavam o ATO DO MEIO (o satélite chegava dobrado e
   implantava as asas), o ato saiu e o pin voltou a 2,2, e depois as mesmas
   0,80 voltaram comprando PARADA. Foi a 3,4 quando a revelação comprou 0,40,
   e caiu para 3,05 no mesmo dia, quando a partida foi desligada e devolveu as
   0,35 dela. Agora vai a 3,60, e as 0,55 novas são da CHEGADA.

   (A prosa deste parágrafo ficou um commit atrás por um tempo: dizia "agora
   ele vai a 3,4" depois de a partida já ter sido desligada, enquanto a tabela
   logo acima já calculava com 3,05. Quando os dois discordarem de novo, a
   tabela é a que está certa — ela é derivada dos mesmos números que o código.)

   ---- POR QUE A CHEGADA FICOU 1,41× MAIS LENTA ----

   Pedido do dono, 28/08: "o ritmo da chegada está rápido demais". Ela foi de
   1,35 para 1,90 tela, e quem pagou foi o pin — de novo, e pelo mesmo motivo
   de sempre: tirar de outro ato desfaria um pedido anterior em silêncio.

   O GANHO REAL É MAIOR QUE 1,41×, e é a órbita que explica. O painel passa a
   primeira parte da viagem parado no fundo em tombo cheio, e só depois começa
   a se desenrolar (`--orbe` em styles/estacao.css). Medido em telas:

                          antes      depois
     espera torta         0,62       0,65
     A ÓRBITA ANDANDO     0,73       1,25
     chegada total        1,35       1,90

   Ou seja, a espera quase não cresceu e o movimento cresceu 1,72×. Se a
   desaceleração viesse só daqui, sem baixar o piso do `--orbe` junto, ela
   compraria mais tempo olhando um ponto imóvel no fundo — que não é o que
   "está rápido demais" quer dizer.

   NÃO É AQUI que se mexe na direção da órbita nem em quanto ela transborda
   da seção: isso é `--orbita` e `--raio`, em styles/estacao.css, e lá há
   medições de recorte que precisam ser refeitas a cada mudança.

   Se alguém for mexer aqui achando que mexe na implantação: ela não existe
   mais. Cada um destes quatro números tem um dono diferente. */
const RITMO_RECURSOS: Ritmo = {
  travessia: 3.6,
  chegou: 0.5278,
  expandiu: 0.5278,
  revelou: 0.7778,
  partiu: 1,
  opacidadeLonge: 1,
}

/**
 * CINCO ESTAÇÕES NO RITMO PADRÃO, e a 02 com parada própria.
 *
 * O que a distingue não é a chegada nem a partida — as duas têm exatamente o
 * mesmo tamanho das outras cinco, medidas em tela de rolagem. É a PARADA: 0,80
 * tela em que o satélite completo, com os dois pedaços do título, fica imóvel
 * antes de partir. Ver o bloco de `RITMO_RECURSOS` para a conta.
 *
 * NO CELULAR ELA NÃO PARA, e cobrar por isso seria cobrar por nada: lá a
 * camada do satélite inteira sai (styles/recursos.css esconde a `.rec-grade`)
 * e a fileira vira carrossel. O que ficaria parado é um cabeçalho e um slide —
 * o mesmo que as outras cinco têm, no ritmo delas.
 *
 * O breakpoint é o mesmo de recursos.css, onde a fileira vira carrossel.
 *
 * ENVELHECE NUMA MUDANÇA DE JANELA, até o próximo mount: o ritmo é lido uma
 * vez, na criação do gatilho. Mesmo preço que `vaoDaEstacao` já paga e pela
 * mesma razão — o caso real (girar o telefone) é raro o bastante para não
 * valer um observador só para isto.
 */
const ritmoDa = (secao: HTMLElement): Ritmo => {
  if (secao.id !== 'recursos') return RITMO_PADRAO
  return window.matchMedia('(max-width: 1023px)').matches ? RITMO_PADRAO : RITMO_RECURSOS
}

/**
 * Rolagem extra, em telas, antes de a estação começar a chegar — o vão em
 * branco depois que o mergulho da Hero termina. Sem isso a chegada começa
 * assim que o topo da seção toca o topo da tela, o que é ainda enquanto o
 * objeto da Hero está terminando de sumir.
 *
 * Medido a partir do FIM DO PIN da hero, que é onde o cérebro some — ver
 * `caudaDaHeroAcima`. Antes era medido a partir do fim do BOX dela no
 * documento, e a diferença entre as duas coisas era uma tela inteira; é por
 * isso que `vaoDaEstacao` desconta a cauda.
 *
 * Hoje é 0,1, e o caminho foi 0,3 → 0,45 → 0,1. O que mudou não foi o
 * gosto: foi descobrir que o vão era só METADE do problema. Entre o cérebro
 * sumir e o primeiro texto nascer havia 875px, e apenas 405 vinham daqui —
 * os outros ~400 eram o trecho mudo já DENTRO do pin, com a estação em cena
 * porém pequena e transparente demais para se ver. Os dois trechos são
 * pretos idênticos na tela e se ajustam por dials diferentes, e enquanto só
 * um deles se mexia a conta nunca fechava. Zerando o `--de` do kicker
 * (styles/estacao.css) e trazendo isto para 0,1, sobraram 327px; depois
 * TRAVESSIA caiu de 5,5 para 4,0 e levou o resto junto, para 263px.
 *
 * ZERO NÃO É UM VALOR VÁLIDO AQUI, e o motivo não é estético. Este
 * componente monta ANTES de a Hero criar o pin dela, então no instante em
 * que a margem é escrita a hero ainda ocupa só a própria altura no
 * documento. O topo inicial da estação vale, portanto, `ATRASO × 100vh`: em
 * 0,45 dava +405 e o pin engatava normalmente mais adiante; em 0 dá
 * exatamente 0, o pin engata no topo da página e a estação nasce presa,
 * com `--chegada` correndo desde a primeira rolagem. Medido: `position:
 * fixed` e `--chegada` já em 0,98 na altura em que o cérebro some.
 *
 * Dos 263px que sobram, 90 são este vão e 173 são a curva de perspectiva da
 * própria chegada, que parte devagar de propósito (`suave` no `onUpdate`,
 * tamanho = 1/distância). Esses 173 não têm dial PRÓPRIO, mas encolhem com
 * TRAVESSIA, por serem uma fração do pin — era o que eu não tinha percebido
 * ao chamá-los de piso. Estes 90 têm dial e é linear: cada 0,1 aqui vale
 * 90px numa janela de 900px. Descer abaixo de ~0,05 reaproxima o topo
 * inicial de zero e volta a flertar com a falha acima.
 *
 * A garantia pedida — nada aparece antes de o cérebro sumir — está medida:
 * em y=3150 (`REVELA_FIM_EM`, opacidade da hero em 0) `--chegada` vale 0 e
 * o kicker vale 0. A estação só parte 90px depois, e parte INVISÍVEL, em
 * ESCALA_LONGE e OPACIDADE_LONGE.
 */
const ATRASO = 0.1

/**
 * A cauda morta do vizinho preso logo acima: quanto ele ainda ocupa no
 * documento DEPOIS de o pin dele soltar, já fora de cena.
 *
 * `pinSpacing` reserva "duração do pin + altura do elemento". Quando o pin
 * solta, o elemento deixa de ser fixo e ainda tem de rolar a própria altura
 * para sair da tela — e faz isso invisível: a hero porque a dissolução
 * termina exatamente no fim do pin (`REVELA_FIM_EM`, lib/mergulho.ts), e
 * uma estação porque já partiu, escalada além da tela e com opacidade zero
 * (ver `passagem` no `onUpdate`). Nada acontece ali.
 *
 * O ATRASO é somado DEPOIS dessa cauda, então sem o desconto o vão real
 * vale `cauda + ATRASO`. Descontar faz o ATRASO significar o que ele diz.
 *
 * NÃO SE APLICA AO `.fecho`, e a tentação é grande — tentado e revertido.
 * Depois da última estação sobra ~1 tela de rolagem sem nada na frente, e
 * ela parece desperdício puro, no pior lugar possível: logo antes do CTA.
 * Não é. Entre duas estações o desconto funciona porque a que CHEGA é
 * invisível enquanto a caixa dela entra na tela — nasce em ESCALA_LONGE
 * (0,16) e OPACIDADE_LONGE (0,1). A oferta não tem chegada: ela é opaca no
 * instante em que a caixa encosta na tela. Descontar a cauda das perguntas
 * puxa a oferta para dentro da janela em que a estação ainda está em cena,
 * e as duas se sobrepõem — medido varrendo 121 posições de rolagem, 7
 * posições com a FAQ acima de 0,05 de opacidade e a oferta já visível, com
 * a pior delas em opacidade 1,0. Sem o desconto: zero.
 *
 * Ou seja, aquela tela é a PISTA que segura a oferta fora de cena enquanto
 * a última estação parte, e só parece vazia porque nada acontece nela.
 * Reclamá-la exigiria dar à oferta uma chegada própria — decisão de
 * desenho sobre o bloco de conversão, não ajuste de layout.
 *
 * VALIA SÓ PARA A HERO, e esse era o buraco: entre duas estações a função
 * devolvia 0 e a cauda inteira ficava no caminho. Medido com as cinco
 * estações no ar, numa janela de 900px: 990px de rolagem morta entre uma e
 * a seguinte, três vezes, mais 757px antes das perguntas — 3.727px em que
 * uma estação já partiu e a próxima ainda não começou.
 *
 * Devolve 0 quando não há vizinho preso logo acima — aí não há cauda para
 * descontar e o ATRASO vale sozinho.
 */
function caudaAcima(secao: HTMLElement): { px: number; ehHero: boolean } {
  /* Quando o GSAP prende, a seção passa a morar dentro do próprio
     `pin-spacer` e o vizinho de cima vira o vizinho do espaçador — e o
     vizinho, do mesmo jeito, fica dentro do dele. No primeiro mount nada
     disso existe ainda (este componente monta antes da Hero e é ele
     quem cria os pins das estações), mas num remount ou num HMR os
     espaçadores já estão de pé. Os dois estados precisam funcionar. */
  const meu = secao.parentElement
  const eu = meu?.classList.contains('pin-spacer') ? meu : secao
  const antes = eu.previousElementSibling
  if (!antes) return { px: 0, ehHero: false }
  const vizinho = antes.matches('.hero, .estacao')
    ? antes
    : antes.querySelector('.hero, .estacao')
  if (!(vizinho instanceof HTMLElement)) return { px: 0, ehHero: false }

  /* ---- SÓ SE DESCONTA A CAUDA DE QUEM PARTE ----
     O desconto inteiro se apoia numa premissa: naquele trecho o vizinho já
     saiu de cena, "escalado além da tela e com opacidade zero". É por isso que
     puxar a próxima seção para dentro dali não custa nada — não há nada ali.

     Uma estação SEM PARTIDA quebra a premissa. Ela fica em tamanho e brilho de
     leitura até o pin soltar e depois rola para fora inteira e opaca, o que
     significa que a cauda dela é tempo em que ela ESTÁ em cena. Descontar isso
     puxaria a seção seguinte para cima dela — e como a seguinte hoje pinta
     fundo opaco, o resultado seria a estação sendo cortada ao meio por um
     retângulo branco.

     Custo de não descontar: volta a haver rolagem entre as duas, na ordem de
     uma tela. É o preço de a estação sair por conta própria, e é o mesmo preço
     que o `.fecho` já paga pela mesma razão (ver a nota do `.fecho` acima —
     aquela tela "vazia" é pista, não desperdício). */
  if (vizinho.classList.contains('estacao') && ritmoDa(vizinho).partiu >= 1) {
    return { px: 0, ehHero: false }
  }

  return { px: vizinho.offsetHeight, ehHero: vizinho.classList.contains('hero') }
}

/**
 * A margem da estação, como FÓRMULA CSS — ver a nota longa no uso.
 *
 * Sai em `calc()` e não em px porque o GSAP fotografa este valor uma vez
 * e o reaplica em cada refresh: um número morre na primeira mudança de
 * janela, uma fórmula é reavaliada.
 *
 * Quando o vizinho é a HERO acima de 980px, o desconto sai como `100svh`:
 * hero.css garante que ela é exatamente isso, então a fórmula dispensa
 * medir e o navegador acompanha qualquer resize sozinho. Abaixo de 980px a
 * regra vira `min-height: auto` e a hero passa a ter altura de conteúdo,
 * que nenhuma unidade CSS sabe dizer. O breakpoint é o mesmo dos dois lados
 * de propósito: se um mudar sem o outro, o desconto descreve uma hero que
 * não existe.
 *
 * Quando o vizinho é outra ESTAÇÃO, o desconto é sempre medido, e não por
 * descuido: as estações NÃO têm altura uniforme. Medido numa janela de
 * 900px — "+15 anos" tem 667px (o conteúdo é curto) e "Perguntas" tem
 * 1376px (as seis perguntas passam de uma tela). Escrever `100svh` aqui
 * acertaria três e erraria duas, e o erro apareceria como sobreposição ou
 * como vão sobrando, dependendo do lado.
 *
 * O preço do valor medido é conhecido e assumido: ele envelhece numa
 * mudança de tamanho de janela, até o próximo mount. É o mesmo preço que o
 * ramo mobile da hero já pagava. Uniformizar as alturas das estações
 * tornaria a fórmula possível — mas exigiria fazer "Perguntas" caber em
 * uma tela, que é decisão de desenho e não de layout.
 */
function vaoDaEstacao(secao: HTMLElement): string {
  const folga = `${ATRASO * 100}vh`
  const { px, ehHero } = caudaAcima(secao)
  if (!px) return folga
  return ehHero && window.matchMedia('(min-width: 981px)').matches
    ? `calc(${folga} - 100svh)`
    : `calc(${folga} - ${px}px)`
}

const limita = (v: number) => Math.min(1, Math.max(0, v))
/** Desacelera ao encostar na vaga, em vez de parar de repente. */
const suave = (t: number) => t * t * (3 - 2 * t)

/**
 * Estações: a chegada e a passagem dos painéis claros.
 *
 * A estação é um corpo parado no espaço e nós é que viajamos até ela.
 * Ela sobe pequena e apagada lá do fundo; quando encosta no topo da
 * tela, trava no lugar e **sobe crescendo** até preencher tudo — é aqui
 * que a viagem se lê, e é por isso que o painel fica preso: solto, o
 * crescimento teria que caber no tempo em que ele cruza a tela, curto
 * demais para alguém perceber que veio de longe. Depois de uma janela
 * parada para leitura, cresce além da tela e se apaga, como um corpo que
 * ficou para trás.
 *
 * Já se tentou o contrário — encolher descendo, a saída como espelho da
 * chegada. Foi descartado vendo rodar. A diferença entre as duas
 * leituras é só o sinal de ESCALA_PASSA e o do termo da partida em
 * `sobe`, caso valha revisitar.
 *
 * O PALCO é função da posição, nunca da direção do scroll: subir a
 * página refaz a mesma curva ao contrário sozinha, sem estado.
 *
 * A única exceção é o EIXO VERTICAL, e ela é deliberada: indo, a
 * estação vem de baixo; voltando, ela sobe e some pelo topo em vez de
 * refazer o caminho. Ida e volta por trajetos diferentes é, por
 * definição, algo que a posição sozinha não sabe expressar.
 *
 * O sinal de direção (`re`) vem da variação de `progress`, e é isso que
 * o torna seguro. Duas versões anteriores usaram a velocidade da
 * rolagem e as duas pularam: o palco se move no relógio do `scrub` e o
 * gesto no relógio do dedo, então ao soltar um subia enquanto o outro
 * ainda descia. Medindo a progressão, existe um relógio só.
 *
 * A escala fica em `data-escala` porque o canvas da poeira precisa dela
 * para arredondar o retângulo branco no mesmo raio aparente do painel.
 */
export function Estacoes() {
  useGSAP(() => {
    if (prefersReducedMotion()) return

    const secoes = gsap.utils.toArray<HTMLElement>(document.querySelectorAll(PAINEIS))
    const paineis: HTMLElement[] = []
    const gatilhos = secoes.map((secao) => {
      /* A seção é medida e presa; o painel interno é que escala. Se a
         escala fosse na própria seção, o ScrollTrigger mediria o
         retângulo encolhido e ancoraria o pin no lugar errado. */
      const el = secao.querySelector<HTMLElement>('.estacao-palco') ?? secao
      paineis.push(el)

      const ritmo = ritmoDa(secao)

      /* Estado de repouso pelo JS, não pelo CSS: sem script a seção tem
         que continuar legível em tamanho normal. */
      /* O repouso tem de nascer no MESMO valor que o `onUpdate` produziria
         em p = 0, senão o primeiro quadro do pin pisca. Por isso o override
         é resolvido uma vez aqui e reusado lá dentro. */
      const opacidadeLonge = ritmo.opacidadeLonge ?? OPACIDADE_LONGE
      el.style.transform = `translate3d(0, ${SOBE_CHEGADA}vh, 0) scale(${ESCALA_LONGE})`
      el.style.opacity = String(opacidadeLonge)
      el.dataset.escala = String(ESCALA_LONGE)
      /* Relógio da viagem para a coreografia interna do painel — ver
         styles/estacao.css. Zerado aqui junto com o resto do repouso:
         o valor inicial do `@property` é 1 (tudo pronto, para quem não
         tem script), então sem esta linha o conteúdo apareceria montado
         enquanto a estação ainda é um ponto, e saltaria para o começo da
         cascata no instante em que o pin engatasse. */
      el.style.setProperty('--chegada', '0')
      /* Mesma razão do `--chegada` acima: o `@property` nasce em 1 para
         quem não tem script, então sem zerar aqui o texto do #recursos
         apareceria montado enquanto a estação ainda é um ponto no fundo —
         que é justamente o que esconder o texto pretende evitar. */
      el.style.setProperty('--pousado', '0')
      /* Terceiro relógio, o do ato do meio. Ver `--expande` no `onUpdate`.
         Nasce em 0 pelo mesmo motivo dos outros dois: `@property` o declara
         em 1 para quem não tem script. */
      el.style.setProperty('--expande', '0')

      /* O vão do ATRASO precisa ser espaço de verdade no documento, não
         um deslocamento na condição de início do pin: o GSAP prende o
         elemento exatamente onde ele estava na tela no instante em que o
         gatilho dispara, então "top+=X top" prendia a seção permanente-
         mente X pixels acima do topo — cortando esse tanto do conteúdo
         durante toda a leitura, não só na chegada. Com a margem, a seção
         já chega X pixels mais abaixo no fluxo normal, e o pin prende
         limpo em "top top".

         A margem é NEGATIVA no desktop, e é esse o conserto: ela sobe a
         estação por cima da cauda transparente da hero (ver
         `caudaDaHeroAcima`) em vez de esperar a cauda passar. O vão deixa
         de ser `cauda + ATRASO` e passa a ser só o ATRASO.

         Ela continua escrita em UNIDADES CSS, e isso não é preferência
         de estilo: é a única forma de sobreviver ao resize. O GSAP
         fotografa a margem no instante em que cria o pin, transfere o
         valor para o `pin-spacer` e zera a da seção — medido,
         `secao.style.marginTop` vira `'0px'`. Reescrevê-la depois não
         chega ao spacer, nem no `refreshInit`, porque o refresh reverte
         o pin para a foto original antes de medir. Em `vh`/`svh` o valor
         fotografado é uma FÓRMULA, e o navegador a resolve de novo a
         cada janela nova — que é como a versão anterior (`30vh`) se
         mantinha certa sem ninguém cuidar dela. */
      secao.style.marginTop = vaoDaEstacao(secao)

      /* Em qual dos dois caminhos a estação está, de 0 (ida) a 1 (volta).
         É ESTADO, não taxa — ver a nota no `onUpdate`.

         Não precisa de `gsap.ticker`, e a razão mudou. A versão anterior
         justificava a ausência dele dizendo que o sinal "zera junto com
         a progressão", contando com a cauda do scrub para terminar o
         decaimento. Isso não se sustentava: o `onUpdate` só dispara
         quando `progress` MUDA, e em rolagem lenta o scrub já está
         alcançado, então parar de rolar interrompia tudo no mesmo
         quadro e a mistura congelava.

         Agora não há ticker porque não há o que decair. Parado, o
         sentido é o que era, e é isso que se quer. */
      /* `anterior` começa negativo para o primeiro `onUpdate` se
         calibrar sozinho: com 0 fixo, uma seção alcançada já no meio
         (refresh, âncora, restauração de scroll) leria um recuo enorme
         no primeiro quadro. */
      const re = { atual: 0, sentido: 0, anterior: -1 }

      return ScrollTrigger.create({
        trigger: secao,
        start: 'top top',
        end: () => `+=${window.innerHeight * ritmo.travessia}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        /* Amortecido: ver a nota em Hero.tsx. A estação chega deslizando
           em vez de responder a cada estalo da roda. */
        scrub: 1,
        invalidateOnRefresh: true,
        /* Abaixo da hero de propósito: ela é presa antes desta no
           documento, e as posições daqui dependem do espaçador dela. Ver a
           nota em Hero.tsx.

           Era 1 dos dois lados — ou seja, a intenção estava escrita e não
           implementada, e a ordem caía no acaso da criação. Com o ATRASO
           grande isso não aparecia; encolhendo-o, a margem do vão passa a
           ser quase a altura inteira da hero e medir na ordem errada joga o
           início da estação para perto de zero. */
        refreshPriority: 0,
        onUpdate: (self) => {
          const p = self.progress

          /* SENTIDO COM MEMÓRIA, não velocidade — e a distinção é o que
             faz o retorno funcionar.

             Duas versões anteriores usaram velocidade: primeiro a do
             dedo (`self.getVelocity()`), depois a da estação (a variação
             de `progress`). As duas quebravam pelo mesmo motivo de
             fundo, que velocidade nenhuma resolve: parar de rolar zera a
             velocidade, então o caminho da volta se desfazia sozinho e a
             estação escorregava de volta para baixo SEM input nenhum.

             Pior, o valor só era atualizado aqui dentro, e o `onUpdate`
             só dispara quando `progress` muda. Em rolagem lenta o scrub
             já está alcançado, então parar de rolar interrompia este
             bloco no mesmo quadro e a mistura CONGELAVA no meio — a
             estação ficava presa entre os dois caminhos e saltava ao
             retomar.

             Sentido é estado, não taxa: uma vez indo de ré, ela fica no
             caminho da volta até retomar para frente, e parada mantém o
             que era. Nada se move sem input, e não há o que decair —
             razão pela qual isto pode viver no `onUpdate` sem ticker. */
          if (re.anterior < 0) re.anterior = p
          const recuo = re.anterior - p
          re.anterior = p
          if (recuo > RE_MORTA) re.sentido = 1
          else if (recuo < -RE_MORTA) re.sentido = 0
          re.atual += (re.sentido - re.atual) * RE_TAXA

          /* O progresso da VIAGEM, distribuído ao longo do caminho — é
             ele que a cascata dos blocos usa, via `--chegada`. Separado
             do tamanho de propósito: o tamanho é 1/distância e se
             concentra no fim, então uma cascata pendurada nele
             amontoaria os quatro blocos no último quarto do trajeto. */
          const viagem = suave(limita(p / ritmo.chegou))

          /* Quem percorre o caminho é a DISTÂNCIA; o tamanho é 1/dela.
             Interpolar o tamanho direto gasta metade do crescimento na
             primeira metade do trajeto, e a estação chega antes de a
             viagem começar a se ler. Pela distância acontece o que
             acontece de verdade quando a gente se aproxima de alguma
             coisa: fica quase parada enquanto está longe e cresce
             depressa no fim. O `suave` fica na distância, e não no
             tamanho, para frear a chegada sem desmanchar a perspectiva. */
          const distancia = DISTANCIA_LONGE + (1 - DISTANCIA_LONGE) * viagem
          const tamanho = 1 / distancia

          /* O quanto dela já chegou, de 0 a 1 — um relógio só para o
             tamanho, a subida e o brilho. Com uma curva para cada, a
             estação chegaria em três tempos diferentes. */
          const perto = (tamanho - ESCALA_LONGE) / (1 - ESCALA_LONGE)

          /* O `suave` aqui não é enfeite: sem ele a partida começa com um
             canto. A rampa crua tem inclinação 1/(1-PARTIU) ≈ 17,9, então
             o termo da partida saía de parado para 428vh por unidade de
             progresso no primeiro quadro — medido em 17,3px/quadro contra
             0,24 de aceleração máxima na volta, um salto 47× maior que
             qualquer outro ponto da seção. A estação estava imóvel na
             janela de leitura e disparava de uma vez.

             A chegada sempre teve esse freio (é o `suave` da distância);
             a partida ficou sem ele até alguém medir. Derivada zero nas
             duas pontas: sai da leitura sem tranco e encosta no fim do
             pin sem tranco. */
          /* `partiu` em 1 DESLIGA a partida, e o teste explícito é o mesmo
             padrão do `janela` da expansão logo acima: `0/0` é `NaN`, e `NaN`
             passando por `limita` e `suave` produziria lixo silencioso em vez
             de erro. Sem partida a estação fica em tamanho e brilho de leitura
             até o pin soltar, e depois rola para fora como qualquer seção. */
          const janelaSaida = 1 - ritmo.partiu
          const passagem =
            janelaSaida > 0 ? suave(limita((p - ritmo.partiu) / janelaSaida)) : 0
          const escala = tamanho + (ESCALA_PASSA - 1) * passagem
          /* SEM FADE NA VINDA para a Estação 02, e é override e não mudança
             da constante porque `OPACIDADE_LONGE` vale para as seis.

             Pedido do dono, 28/08: "sem a opacidade quando ela está vindo".
             Com `opacidadeLonge: 1` os dois termos se cancelam — a conta vira
             `1 - passagem` — e o satélite é sólido desde o fundo, quando
             ainda mede 16% do tamanho final. Ele deixa de se materializar no
             caminho e passa a só se aproximar.

             O termo da PASSAGEM sobrevive de propósito: ele é da partida, não
             da chegada, e nesta estação nem chega a rodar (`partiu: 1` zera
             `passagem`). Fica porque a conta é a mesma para as seis.

             ---- ARMADILHA AO MEDIR ISTO NO NAVEGADOR ----

             `--chegada` saturar em 1 NÃO significa que a estação está em
             repouso, e quem medir opacidade sozinha vai concluir errado. Nas
             cinco com partida, a viagem satura em 1 e a partida já começou a
             correr no relógio dela; medido na #video, a 1536×695:

               scrollY 3000   --chegada 1   opacidade 1       scale(1)
               scrollY 3200   --chegada 1   opacidade 0,934   scale(1,0396)
               scrollY 3400   --chegada 1   opacidade 0,001   scale(1,5992)

             Ou seja, o 1 delas é um PICO instantâneo, não um patamar — quem
             amostrar em 3200 lê 0,934 e reporta isso como teto. O que
             desmente é o transform ao lado, nunca a opacidade sozinha.

             No #recursos é diferente e o número é estável: com `partiu: 1`
             ela nunca entra nessa fase, então o 1 dela é patamar. Duas coisas
             diferentes lendo o mesmo número. */
          const opacidade = limita(opacidadeLonge + (1 - opacidadeLonge) * perto - passagem)
          /* Ida e volta por caminhos diferentes — a única coisa na seção
             que depende do sentido do scroll.

             Indo: ela vem de SOBE_CHEGADA abaixo do eixo, subindo no
             sentido dos grãos. Voltando: em vez de refazer o trajeto
             para baixo, sobe e some pelo topo.

             Os dois se anulam em `perto = 1`, então inverter o sentido
             com a estação assentada não produz degrau nenhum: a
             bifurcação só se abre conforme ela se afasta. */
          const ida = SOBE_CHEGADA * (1 - perto)
          const volta = -SOBE_VOLTA * (1 - perto)
          const sobe = ida + (volta - ida) * re.atual - SOBE_PASSAGEM * passagem

          /* O SEGUNDO RELÓGIO: a travada, de 0 quando a estação acaba de
             atracar a 1 quando ela começa a partir.

             `--chegada` satura em 1 no fim da viagem (é `p / CHEGOU`
             limitado), então ela não sabe dizer NADA sobre o que acontece
             depois da atracação — para ela, atracar e começar a partir são
             o mesmo instante. Uma coreografia que precise rodar com a
             estação já parada em 1:1 não tem como se pendurar nela.

             É o caso do texto do #recursos, que fica escondido durante a
             chegada inteira e só nasce com o painel parado (ver
             styles/estacao.css). Sem esta variável o único jeito seria
             espremer a revelação no finzinho de `--chegada`, ou seja, com
             o painel ainda orbitando — exatamente o que não se quer.

             LINEAR de propósito, e é a diferença dela para `--chegada`.
             Aquela leva um `suave` embutido, e é por isso que o arquivo de
             estilo precisa avisar em maiúsculas que `--dur` não é duração:
             o mesmo intervalo rende rolagens diferentes conforme onde cai
             na faixa. Aqui não há curva global, então `--de` e `--dur` são
             frações diretas da travada e cada bloco põe o próprio freio no
             `--t`. Um relógio a menos para calibrar às cegas.

             As OUTRAS estações também recebem a variável, porque o motor é
             um só — nenhuma delas a lê hoje, e publicar não custa nada. */
          /* O ATO DO MEIO: 0 no instante em que a estação atraca, 1 quando ela
             acaba de se abrir. É ele que leva o quadrado até o console
             deitado (ver `.rec-grade` em styles/recursos.css).

             A JANELA DE COMPRIMENTO ZERO é o caso das outras cinco estações,
             onde `expandiu === chegou`. Dividir por zero daria `Infinity` e,
             pior, `NaN` no ponto exato em que `p === chegou` — que é
             justamente o quadro em que elas atracam. O `||` não serve aqui
             porque `0/0` é `NaN` e `NaN || 1` devolve 1 por acaso, não por
             desenho; o teste explícito diz o que se quer: sem ato do meio, ele
             já nasceu terminado. */
          const janela = ritmo.expandiu - ritmo.chegou
          const expande = janela > 0 ? suave(limita((p - ritmo.chegou) / janela)) : 1

          /* A revelação começa onde a expansão termina e acaba em `revelou`,
             que NÃO é necessariamente a partida.

             É essa distinção que compra tempo parado. Antes o denominador era
             `partiu`, e a consequência é que o relógio da revelação só chegava
             a 1 no instante em que a estação começava a ir embora — a última
             cascata fecha aos 0,78 dele, então sobravam 0,22 de tela imóvel e
             nada mais. Com `revelou` separado, o relógio satura antes e FICA em
             1 até a partida; o intervalo entre os dois é tempo em que tudo está
             na tela e nada se move.

             Nas cinco estações sem parada própria os dois valores são iguais e
             a conta é idêntica à de antes. */
          const pousado = limita((p - ritmo.expandiu) / (ritmo.revelou - ritmo.expandiu))

          el.style.transform = `translate3d(0, ${sobe.toFixed(3)}vh, 0) scale(${escala.toFixed(4)})`
          el.style.opacity = opacidade.toFixed(3)
          el.dataset.escala = String(escala)
          el.style.setProperty('--chegada', viagem.toFixed(4))
          el.style.setProperty('--expande', expande.toFixed(4))
          el.style.setProperty('--pousado', pousado.toFixed(4))
        },
      })
    })

    return () => {
      gatilhos.forEach((g) => g.kill())
      secoes.forEach((secao) => {
        secao.style.marginTop = ''
      })
      paineis.forEach((el) => {
        el.style.transform = ''
        el.style.opacity = ''
        el.style.removeProperty('--chegada')
        el.style.removeProperty('--pousado')
        el.style.removeProperty('--expande')
        delete el.dataset.escala
      })
    }
  })

  return null
}
