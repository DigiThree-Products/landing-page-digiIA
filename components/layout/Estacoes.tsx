'use client'

import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * Uma estação por vez. Começa por "Veja funcionando"; as outras seções
 * claras seguem como faixa até serem convertidas.
 */
const PAINEIS = '.page .approach'

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
 */
const TRAVESSIA = 5.5

/* Marcos dentro do trecho preso. Entre CHEGOU e PARTIU ela fica parada
   em 1:1 — a composição inteira montada, imóvel e nítida.

   Essa janela é curta de propósito: ~0,73 tela de rolagem. É o instante
   em que os quatro blocos existem juntos, e ele se lê como uma travada
   leve — a página continua rolando e nada se mexe. Longa demais, ela
   deixa de ser o encontro dos blocos e vira uma seção parada esperando
   o usuário; curta demais, os blocos nunca chegam a coexistir e o vídeo
   entra já saindo.

   CHEGOU e TRAVESSIA são mexidos JUNTOS, e o produto dos dois é o que
   precisa ficar de pé: ele é o comprimento da chegada, e é dele que
   saem as durações calibradas da cascata em styles/estacao.css.
   0,87 × 9,89 = 8,60 telas. São dois eixos distintos, e vale não
   confundi-los: subir o PONTO DE ENCONTRO encolhe o que vem depois da
   chegada (foi assim de 72% para 82% e para 87%); afastar as chegadas
   umas das outras alonga a CHEGADA em si, e é o que move este número.

   O comprimento sai somando o que precisa caber: 1,26 tela de trecho
   mudo, os quatro blocos (0,90 + 0,75 + 1,04 + 1,65 = 4,34) e as duas
   folgas de 1,50 entre os blocos de texto. Total 8,60. As janelas em
   styles/estacao.css são reconvertidas a cada mudança daqui, então as
   durações (0,6 / 0,5 / 0,7 / 1,1s) seguem valendo.

   Cada 0,1 tela somado às folgas custa 0,23 tela de seção, porque a
   chegada é só 87% do trecho. As folgas somadas (3,00) já valem mais
   que os quatro blocos juntos menos o vídeo, e esta seção sozinha
   consome quase dez telas — com a hero e o vão, são ~14 até a terceira
   seção começar. Se a separação ainda não se lê depois disso, o
   problema não é distância: é a AMPLITUDE do gesto de cada bloco em
   styles/estacao.css, que hoje é de 54px num palco reduzido — sutil
   demais para um bloco "chegar" em vez de só "aparecer".

   O orçamento depois da chegada continua sendo os 13%: 0,73 tela de
   travada e 0,55 de partida. A partida segue sendo o trecho mais
   apertado e o primeiro a ceder se o encontro subir de 87%. */
const CHEGOU = 0.7
const PARTIU = 0.765

/**
 * Rolagem extra, em telas, antes de a estação começar a chegar — o vão em
 * branco depois que o mergulho da Hero termina. Sem isso a chegada começa
 * assim que o topo da seção toca o topo da tela, o que é ainda enquanto o
 * objeto da Hero está terminando de sumir.
 *
 * Encolheu junto com a mudança da curva: agora ela nasce longe de verdade
 * e passa muito tempo pequena, então o vão não precisa mais comprar
 * sozinho a impressão de distância.
 */
const ATRASO = 0.3

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
      const el = secao.querySelector<HTMLElement>('.approach-stage') ?? secao
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
         limpo em "top top". */
      secao.style.marginTop = `${ATRASO * 100}vh`

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
