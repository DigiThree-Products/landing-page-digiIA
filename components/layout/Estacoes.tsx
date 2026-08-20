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
 * Caiu de 5,5 para 4,0 porque a viagem estava longa demais de rolar. É o
 * dial mais poderoso da seção: ele escala TUDO junto — a chegada, a
 * travada, a partida, as janelas dos quatro blocos e até o preto do começo,
 * porque aquele trecho também é uma fração deste pin (263px hoje, eram 327
 * em 5,5). Mexer aqui invalida qualquer número em telas escrito em
 * styles/estacao.css: as proporções entre os blocos sobrevivem, os valores
 * absolutos não. Estão remedidos para 4,0.
 */
const TRAVESSIA = 4

/* Marcos dentro do trecho preso. Entre CHEGOU e PARTIU ela fica parada
   em 1:1 — a composição inteira montada, imóvel e nítida.

   É O ÚNICO TRECHO VERDADEIRAMENTE IMÓVEL da estação, e isso é literal:
   em `p >= CHEGOU` o `viagem` satura em 1, então `tamanho` vale 1,
   `perto` vale 1 e `passagem` ainda vale 0 — o transform é identidade e a
   opacidade é 1. A página continua rolando e nada se mexe. É a travada
   que o usuário usa para de fato OLHAR a composição.

   Cuidado com uma leitura tentadora e errada: "os blocos terminaram a
   cascata" não é o mesmo que "a estação chegou". As janelas de
   styles/estacao.css correm em `--chegada`, e o palco inteiro ainda está
   crescendo enquanto elas terminam — em "+15 anos", cuja última janela
   fecha em 0,86, a composição está completa com o palco em 58% de escala,
   ainda vindo. Completo NA TELA é `p = CHEGOU`, igual para as cinco. Por
   isso a travada é a mesma para todas, e mexer nas janelas do CSS não a
   encurta nem a alonga.

   A janela foi 0,065 e virou 0,130 — 234px viraram 468px numa tela de
   900px, ~4 estalos de roda. O pedido foi "uma travadinha para o usuário
   visualizar, mas sem muito scroll para não cansar", e são duas exigências
   opostas: a segunda proíbe alongar TRAVESSIA. Então a travada saiu da
   CHEGADA, não do total — o pin continua com as mesmas 4,0 telas e o
   documento tem exatamente a mesma altura de antes. O que se paga é uma
   aproximação 8,6% mais rápida, que era justamente a parte longa demais.

   Longa demais, a travada deixa de ser o encontro dos blocos e vira uma
   seção parada esperando o usuário — e aí a sensação vira "travou" em vez
   de "trava para eu ler". Curta demais, os blocos não chegam a coexistir e
   a seção entra já saindo. 0,52 tela é o meio-termo medido.

   CHEGOU e TRAVESSIA são mexidos JUNTOS, e o produto dos dois é o que
   precisa ficar de pé: ele é o comprimento da chegada. Hoje 0,64 × 4,0 =
   2,56 telas. São dois eixos distintos, e vale não confundi-los: subir o
   PONTO DE ENCONTRO encolhe o que vem DEPOIS da chegada; encolher a
   TRAVESSIA encolhe tudo proporcionalmente, chegada inclusa.

   O orçamento atual do pin, em telas de 900px:
     chegada   0,640 × 4,0 = 2,56
     travada   0,130 × 4,0 = 0,52
     partida   0,230 × 4,0 = 0,92
   Com a hero (3,5) e o vão (0,1), são 7,6 telas até o fim deste pin — os
   mesmos de antes, porque só a divisão interna mudou.

   ATENÇÃO: os números acima e os de styles/estacao.css são MEDIDOS contra
   TRAVESSIA 4,0 e CHEGOU 0,64. Este bloco já carregou por muito tempo os
   valores de uma calibragem morta (0,87 × 9,89 = 8,60 telas, folgas de
   1,50, "quase dez telas") que sobreviveram a um encolhimento anterior sem
   ninguém remedir — e um comentário errado aqui custa caro, porque é ele
   que orienta quem for calibrar. Se mexer em TRAVESSIA ou CHEGOU, remeça.

   Se a separação entre os blocos não se ler, o problema pode não ser
   distância: é a AMPLITUDE do gesto de cada bloco em styles/estacao.css,
   hoje 32px (64 no vídeo) num palco ainda reduzido — sutil demais para um
   bloco "chegar" em vez de só "aparecer". */
const CHEGOU = 0.64
const PARTIU = 0.77

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
 * TRAVESSIA caiu de 5,5 para 4,0 e levou o resto junto, para 263px; e
 * CHEGOU de 0,7 para 0,64 encurtou a curva mais um tanto, para 250px
 * (medido: hero em opacidade 0 aos 3150, kicker visível aos 3400).
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
 * Dos 250px que sobram, 90 são este vão e 160 são a curva de perspectiva da
 * própria chegada, que parte devagar de propósito (`suave` no `onUpdate`,
 * tamanho = 1/distância). Esses 160 não têm dial PRÓPRIO, mas encolhem com
 * TRAVESSIA **e com CHEGOU**, por serem uma fração da chegada — era o que eu
 * não tinha percebido ao chamá-los de piso. Estes 90 têm dial e é
 * linear: cada 0,1 aqui vale
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
/**
 * Abaixo desta largura não existe estação, e a razão é de conteúdo, não
 * de gosto.
 *
 * A estação PRENDE a seção por quatro telas. Enquanto ela está presa a
 * página não rola, então tudo que não couber na janela naquele instante é
 * inalcançável — não "difícil de ver", inalcançável. No desktop o desenho
 * garante que cabe (é o que as regras de `max-height` em recursos.css
 * negociam). No celular não cabe nem de longe: medido num 390×844, o
 * palco de "O que ela faz" tem 1.543px, o de "Perguntas" 1.110 e o de
 * "Como funciona" 975 — respectivamente 699, 266 e 131 pixels de conteúdo
 * que o usuário nunca alcançaria.
 *
 * Empilhado, cada seção volta a ser um bloco que rola normalmente, e a
 * cascata não fica sem estado: o `initial-value` do `@property --chegada`
 * é 1 (styles/estacao.css), ou seja "tudo montado". Quem zerava era este
 * componente, e ele não roda mais aqui.
 *
 * 1024px porque é a fronteira que recursos.css e institutional.css já
 * usam (`max-width: 1023px`) para empilhar. Uma fronteira só, nos três
 * arquivos: se um mudar sozinho, aparece uma faixa de larguras que
 * empilha o conteúdo e mesmo assim o prende.
 *
 * Consultado UMA VEZ, na montagem, sem `gsap.matchMedia`. É o mesmo trato
 * que `vaoDaEstacao` já assume logo abaixo — os valores envelhecem numa
 * mudança de janela, até o próximo mount. Um celular nunca atravessa esta
 * fronteira; um desktop redimensionado até abaixo dela fica com os pins
 * de pé até recarregar, e é o preço aceito aqui. Se um dia isso importar,
 * o upgrade é `gsap.matchMedia(SO_DESKTOP, ...)`, que reverte sozinho.
 */
const SO_DESKTOP = '(min-width: 1024px)'

export function Estacoes() {
  useGSAP(() => {
    if (prefersReducedMotion()) return
    if (!window.matchMedia(SO_DESKTOP).matches) return

    const secoes = gsap.utils.toArray<HTMLElement>(document.querySelectorAll(PAINEIS))
    const paineis: HTMLElement[] = []
    const gatilhos = secoes.map((secao) => {
      /* A seção é medida e presa; o painel interno é que escala. Se a
         escala fosse na própria seção, o ScrollTrigger mediria o
         retângulo encolhido e ancoraria o pin no lugar errado. */
      const el = secao.querySelector<HTMLElement>('.estacao-palco') ?? secao
      paineis.push(el)

      /* Estado de repouso pelo JS, não pelo CSS: sem script a seção tem
         que continuar legível em tamanho normal. */
      el.style.transform = `translate3d(0, ${SOBE_CHEGADA}vh, 0) scale(${ESCALA_LONGE})`
      el.style.opacity = String(OPACIDADE_LONGE)
      el.dataset.escala = String(ESCALA_LONGE)
      /* Relógio da viagem para a coreografia interna do painel — ver
         styles/estacao.css. Zerado aqui junto com o resto do repouso:
         o valor inicial do `@property` é 1 (tudo pronto, para quem não
         tem script), então sem esta linha o conteúdo apareceria montado
         enquanto a estação ainda é um ponto, e saltaria para o começo da
         cascata no instante em que o pin engatasse. */
      el.style.setProperty('--chegada', '0')

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
        end: () => `+=${window.innerHeight * TRAVESSIA}`,
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
          const viagem = suave(limita(p / CHEGOU))

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
             canto. A rampa crua tem inclinação 1/(1-PARTIU) — hoje ≈ 4,3;
             era ≈ 17,9 quando isto foi medido, com um PARTIU bem mais
             tarde —, então
             o termo da partida saía de parado para 428vh por unidade de
             progresso no primeiro quadro — medido em 17,3px/quadro contra
             0,24 de aceleração máxima na volta, um salto 47× maior que
             qualquer outro ponto da seção. A estação estava imóvel na
             janela de leitura e disparava de uma vez.

             A chegada sempre teve esse freio (é o `suave` da distância);
             a partida ficou sem ele até alguém medir. Derivada zero nas
             duas pontas: sai da leitura sem tranco e encosta no fim do
             pin sem tranco. */
          const passagem = suave(limita((p - PARTIU) / (1 - PARTIU)))
          const escala = tamanho + (ESCALA_PASSA - 1) * passagem
          const opacidade = limita(OPACIDADE_LONGE + (1 - OPACIDADE_LONGE) * perto - passagem)
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

          el.style.transform = `translate3d(0, ${sobe.toFixed(3)}vh, 0) scale(${escala.toFixed(4)})`
          el.style.opacity = opacidade.toFixed(3)
          el.dataset.escala = String(escala)
          el.style.setProperty('--chegada', viagem.toFixed(4))
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
        delete el.dataset.escala
      })
    }
  })

  return null
}
