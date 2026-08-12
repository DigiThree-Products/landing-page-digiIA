'use client'

import { useEffect, useRef } from 'react'
import {
  alfaDoGrao,
  cintilacao,
  CONTAGEM_GRAOS,
  corComVies,
  fadeNascimento,
  fadeProximo,
  FAIXA_Z,
  ganhoAlfa,
  ganhoHalo,
  ganhoRaio,
  type Identidade,
  limita,
  paletaEmissao,
  progresso,
  raioDoGrao,
  type RGB,
  sortearIdentidade,
  suave,
  TETO_ALFA,
  viesBranco,
} from '@/lib/grao'
import { ESCALA_EM, mergulho, REVELA_EM, REVELA_FIM_EM } from '@/lib/mergulho'

const TEXTURA = '/assets/hero/cerebro.webp'

/* A contagem vem de lib/grao.ts, não escrita aqui: os dois campos
   coexistem durante a dissolução, e densidades diferentes seriam mais um
   eixo mudando junto com o resto. Dois números iguais em dois arquivos é
   um número que vai divergir. */
const { grande: N_GRANDE, toque: N_TOQUE } = CONTAGEM_GRAOS

/**
 * Faixa de profundidade de REPOUSO — a que governa a projeção do disco.
 *
 * Fica fixa, e é ela que mantém `perspectiva` e o ajuste de alcance
 * válidos: a profundidade VIVA (`g.z`, que voa) desce até 0,05, onde a
 * perspectiva valeria 8,6 e jogaria o grão para fora da tela. Por isso as
 * duas são coisas separadas — esta projeta o disco parado, aquela voa.
 *
 * `Z_PERTO` também é o pior caso usado no ajuste de alcance, mais abaixo —
 * uma constante só, não dois números que podem dessincronizar.
 */
const Z_PERTO = 0.62
const Z_LONGE = 1

/** Abertura do núcleo, em frações do raio aparente do cérebro. */
const NUCLEO = 0.38
const SILHUETA = 1.35
/* Em que ponto do mergulho a abertura termina de abrir. A seção inteira
   começa a apagar em 3,5/4,0 = 0,875 do trajeto (`REVELA_EM`, ver
   REVELA_POEIRA_INICIO em Hero.tsx) — o núcleo termina de abrir um pouco
   antes disso, para não estar visivelmente ainda se espalhando no
   instante em que tudo começa a escurecer.
   Era 0,88, calibrado contra a janela antiga que abria em 0,9. Com a
   janela nova esse valor passou a terminar DEPOIS do início da
   dissolução, invertendo a intenção original. */
const ABRE_ATE = 0.85

/** Folga fora da janela antes de considerar o grão perdido. */
const MARGEM = 90

/** Teto do salto de `v` num quadro — ver a nota em `quadro()`. */
const SALTO_MAX = 0.05

/**
 * Um grão, aqui, é a identidade compartilhada com o campo do site mais
 * duas profundidades e duas posições.
 *
 * As duas profundidades existem porque o grão é projetado de dois jeitos
 * ao mesmo tempo, misturados pela rampa do voo: `zRepouso` projeta o disco
 * parado do repouso, e `z` — a viva, que voa e recicla — projeta o modelo
 * do site. Uma só não serve: a viva desce até 0,05, onde a perspectiva do
 * disco valeria 8,6 e jogaria o grão para fora da tela.
 */
type Grao = Identidade & {
  /** Posição no disco unitário; o raio já sai com distribuição uniforme em área. */
  x: number
  y: number
  /** Profundidade do disco em repouso — só projeta, nunca voa. */
  zRepouso: number
  /**
   * Profundidade VIVA: desce com o voo e recicla ao passar pela câmera.
   * Nasce na faixa de repouso, então em `v = 0` o campo é exatamente o que
   * era antes; conforme voa, ela desce e recicla, e a distribuição se
   * espalha sozinha por `FAIXA_Z` — sem ninguém interpolar nada.
   */
  z: number
  /**
   * Coordenadas no modelo do campo do site, sorteadas proporcionais a `z`.
   * É esse truque que faz `x / z` cair uniforme na janela qualquer que
   * seja a profundidade — e é por isso que o grão escorre para FORA
   * conforme se aproxima, em vez de só ficar maior.
   */
  mx: number
  my: number
}

/**
 * O universo dentro do cérebro.
 *
 * Um núcleo estrelado no miolo do cérebro — pequeno e quase invisível em
 * repouso, abre e cresce conforme o mergulho avança — e VOA, com o campo
 * escorrendo para fora e reciclando, como o do site.
 *
 * O voo já foi removido daqui uma vez (commit `28b1802`) porque lia como
 * poluição, não como viagem. Essa leitura estava certa **para onde ele
 * rodava**: um disco pequeno e parado, com o campo em repouso. O que
 * mudou é que agora ele tem amplitude ZERO no repouso e entra junto com a
 * descida, quando o cérebro já cresceu e não existe mais disco pequeno.
 *
 * Ele voltou porque a travessia sem ele não tinha continuidade: o campo do
 * site chega voando, e um núcleo parado ao lado dele denuncia que são dois
 * campos diferentes por mais que tamanho, cor, alfa e densidade estejam
 * casados. Movimento era o sétimo eixo, e o único que faltava.
 *
 * **Este campo converge para o do site.** O look próprio dele — grão
 * maior, mais opaco, com halo, mais branco — não é um conjunto de
 * constantes: é um desvio do campo de fundo que decai a zero ao longo do
 * mergulho (as curvas moram em `lib/grao.ts`). Quando a dissolução
 * termina, não sobra nada para revelar, e a única coisa que muda ao
 * atravessar é o campo estar em movimento. Antes disso os dois eram
 * desenhados isoladamente e sete variáveis saltavam no mesmo quadro — a
 * travessia lia como corte, não como limiar.
 *
 * Quatro decisões que não são livres:
 *
 * 1. **O canvas não é filho de `.palco`.** O palco escala até 80× no
 *    mergulho, e um canvas escalado por CSS escala os pixels: as estrelas
 *    ficariam 80× maiores e borradas, o oposto do que se quer. Aqui ele
 *    fica em resolução 1:1 e a projeção usa o retângulo aparente do
 *    cérebro, lido a cada quadro. Assim o tamanho do grão é escolhido, não
 *    herdado.
 * 2. **O recorte é feito no canvas, não em `mask-image` do CSS.** Um
 *    `destination-in` com a própria textura do cérebro dá o alfa exato sem
 *    depender de `mask-composite`, e sem escrever estilo a cada quadro.
 * 3. **O brilho cresce com o mergulho.** Não é só gosto: `cerebro.webp`
 *    tem 1600px de largura num box de 720px, então perto do fim da escala
 *    a imagem está ampliada além do nativo e amolece. O campo ganhando
 *    presença move a atenção da superfície para o interior justamente
 *    onde a superfície tem menos a mostrar.
 * 4. **Composição normal, com halo, não mescla aditiva.** `screen` e
 *    `plus-lighter` pareciam a escolha óbvia (o campo deveria somar luz,
 *    não cobrir) — mas medido lado a lado contra a própria arte do
 *    cérebro, que já é uma imagem clara e carregada de pontos de brilho
 *    desenhados, as duas ficavam indistinguíveis do fundo. Aditivo só
 *    vence contra um fundo escuro; aqui o fundo raramente é. Grão opaco
 *    (`normal`) com um halo largo e fraco por trás garante a leitura de
 *    brilho sem depender do que está embaixo.
 *
 * Puro enfeite: sem JS, sem WebGL ou com movimento reduzido, a hero
 * continua branca, legível e completa — o cérebro é uma imagem, não um
 * canvas. Nada de conteúdo depende disto.
 */
export function HeroEstrelas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = cv.getContext('2d')
    if (!ctx) return

    /* Busca a partir da hero, não do pai direto: assim mover o canvas de
       lugar dentro da seção não quebra o acoplamento em silêncio. */
    const cerebro = cv.closest('.hero')?.querySelector<HTMLElement>('[data-camada="cerebro"]')
    if (!cerebro) return

    const raiz = getComputedStyle(document.documentElement)
    const PALETA: RGB[] = paletaEmissao((nome) => raiz.getPropertyValue(nome))
    /* O branco para onde o viés puxa é o próprio `--paper` da paleta. */
    const BRANCO = PALETA[2]

    const toque = window.matchMedia('(pointer: coarse)').matches
    const N = toque ? N_TOQUE : N_GRANDE

    let L = 0
    /** Altura em que os grãos se distribuem — ver `medir()`. */
    let spanY = 0
    let A = 0
    let dpr = 1
    let raf = 0
    let visivel = true
    let naTela = true
    /** Estado do voo: o quadro anterior, para tirar dt e a velocidade do mergulho. */
    let tAnterior = 0
    let vAnterior = 0
    /** Deriva vertical acumulada, em unidades normalizadas — o `camY` daqui. */
    let deriva = 0

    const textura = new Image()
    let prontaTextura = false
    textura.onload = () => {
      prontaTextura = true
    }
    textura.src = TEXTURA

    /**
     * Posição no modelo do site, para uma dada profundidade.
     *
     * `mx` sai proporcional a `z`, e é isso que cancela a divisão da
     * perspectiva: no instante do sorteio `mx / z` é uniforme em [-1, 1],
     * então o grão nasce espalhado por igual na largura. Depois, conforme
     * `z` desce e `mx` fica parado, `mx / z` cresce — e é exatamente esse
     * crescimento que faz o grão ESCORRER para fora ao se aproximar, em
     * vez de só ficar maior.
     *
     * Nada aqui depende de `L` nem de `spanY`. Não é economia: os grãos
     * são semeados antes de `medir()` rodar, então ler o tamanho da tela
     * daqui pegaria zero, e o campo inteiro seria projetado para fora da
     * janela assim que o voo entrasse. A escala entra só na projeção, no
     * laço, onde as medidas já valem.
     *
     * Separado de `sortear` porque a reciclagem precisa disto sozinho — um
     * grão que volta para o fundo troca de lugar, não de identidade.
     */
    function semearModelo(g: Grao, z: number) {
      g.z = z
      g.mx = (Math.random() * 2 - 1) * z
      /* Somar a deriva atual é o que faz o grão nascer onde deveria estar
         AGORA, e não onde estaria se a câmera nunca tivesse andado. Sem
         isso cada grão reciclado entraria deslocado por todo o caminho já
         percorrido — e o deslocamento cresce sem parar. */
      g.my = (Math.random() * 2 - 1) * z + deriva
    }

    function sortear(g: Grao) {
      const ang = Math.random() * Math.PI * 2
      // sqrt para o disco encher por igual; sem ele o centro fica denso demais
      const rho = Math.sqrt(Math.random())
      g.x = Math.cos(ang) * rho
      g.y = Math.sin(ang) * rho
      g.zRepouso = Z_PERTO + Math.random() * (Z_LONGE - Z_PERTO)
      /* A profundidade viva NASCE na faixa de repouso, não em FAIXA_Z: é o
         que faz o campo em `v = 0` ser exatamente o aprovado. Ela só se
         espalha por FAIXA_Z depois, voando e reciclando. */
      semearModelo(g, g.zRepouso)
      /* Identidade sorteada nas faixas do campo do site, não em faixas
         próprias. `brilho` é sorteado uma vez, no nascimento — faixas
         divergentes seriam uma diferença que nenhum multiplicador faz
         convergir depois. O brilho menor em repouso é compensado por
         `ganhoAlfa`.

         O viés para o branco também deixou de ser sorteio aqui. Ele
         existia porque lilás e violeta são próximos demais da paleta do
         cérebro pra se destacarem — um grão lilás sobre um filamento
         lilás não lê como grão nenhum. Mas um tom sorteado não converge:
         não dá para um grão "ficar menos branco" se o branco dele foi
         decidido no nascimento. Virou mistura contínua, ver `corComVies`
         no laço. */
      Object.assign(g, sortearIdentidade())
    }

    const graos: Grao[] = Array.from({ length: N }, () => {
      const g: Grao = {
        x: 0,
        y: 0,
        zRepouso: 1,
        z: 1,
        mx: 0,
        my: 0,
        tom: 0,
        brilho: 1,
        fase: 0,
        cintila: 1,
      }
      sortear(g)
      return g
    })

    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      L = cv!.clientWidth
      A = cv!.clientHeight
      if (!L || !A) return
      /* A altura em que os grãos se distribuem NÃO é a do canvas.
         Até 980px a hero perde o `min-height: 100svh` (hero.css) e passa a
         ter a altura do conteúdo — plausivelmente o dobro da janela. Como
         o modelo do site sorteia posição contra esse span, usar `A` ali espalharia os
         110 grãos por uma caixa da qual só metade está na tela, enquanto o
         campo do site põe os mesmos 110 dentro da janela. A densidade que
         a contagem igual existe para casar se desfaria justamente no
         breakpoint em que ela foi calibrada. */
      spanY = Math.min(A, window.innerHeight)
      cv!.width = Math.round(L * dpr)
      cv!.height = Math.round(A * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function quadro(t: number) {
      raf = requestAnimationFrame(quadro)

      /* O motor do voo é a velocidade do PRÓPRIO mergulho, não uma leitura
         de scroll paralela. `mergulho.v` já vem amortecido pelo `scrub` do
         GSAP, então herda de graça o deslize de câmera em vez do solavanco
         da roda — e significa literalmente "quão rápido você está
         entrando". Uma segunda leitura de scroll aqui seria um segundo
         número podendo divergir do primeiro.

         O relógio é lido ANTES de qualquer saída antecipada: um quadro que
         sai sem atualizar o anterior faz o seguinte enxergar um Δt e um Δv
         somados de toda a ausência — voltar de outra aba viraria um salto. */
      const v = limita(mergulho.v)
      const dt = Math.min((t - tAnterior) / 1000, 0.05)
      /* Δv limitado, e não é preciosismo: `dt` se cancela no termo de
         velocidade (`Δv/dt · dt`), então limitar só o `dt` não limita nada.
         Um reload com a rolagem restaurada no meio da hero faz o `scrub`
         reproduzir `v` de 0 até o alvo, e um refresh do ScrollTrigger
         (`invalidateOnRefresh`, inclusive quando a barra de URL do celular
         se recolhe) pode saltar `v` inteiro num quadro só. Sem o limite,
         isso viraria meia faixa de profundidade percorrida de uma vez. */
      const deltaV = Math.max(-SALTO_MAX, Math.min(SALTO_MAX, v - vAnterior))
      tAnterior = t
      vAnterior = v
      if (!visivel || !naTela) return
      if (!L || !A) return

      /* Duas leituras da mesma velocidade, como no campo do site: o avanço
         em profundidade usa o MÓDULO, porque rolar para cima muda para
         onde a câmera aponta e não o sentido do voo; a deriva vertical usa
         o valor COM SINAL, e é ela que inverte — a ida e vinda. */
      const dvAssinado = dt > 0 ? deltaV / dt : 0
      const dv = Math.abs(dvAssinado)

      /* LEITURAS primeiro, escritas depois. Os dois rects custam um
         recálculo de layout por quadro — o GSAP escreveu o transform do
         palco neste mesmo tick, então a primeira leitura o resolve. É um
         flush, não dois: nada abaixo escreve no DOM. */
      const rc = cv!.getBoundingClientRect()
      const rb = cerebro!.getBoundingClientRect()
      if (rb.width <= 0 || rb.height <= 0) return

      // Caixa do cérebro em coordenadas do canvas.
      const bx = rb.left - rc.left
      const by = rb.top - rc.top
      /* 54%/36% não é chute: é a `transform-origin` do palco em hero.css, o
         ponto que o autor escolheu como foco do cérebro. Na textura o
         desenho está longe do centro geométrico da caixa — a massa fica no
         terço superior e o tronco desce sozinho. Usar a mesma origem
         garante que o núcleo estrelado está exatamente no ponto para onde o
         mergulho aponta: você entra no que estava olhando. */
      const cx = bx + rb.width * 0.54
      const cy = by + rb.height * 0.36
      const R = Math.max(rb.width, rb.height) * 0.5

      const abertura = NUCLEO + (SILHUETA - NUCLEO) * suave(limita(v / ABRE_ATE))

      /* Ajuste de alcance — o que impede o campo de fugir da janela.
         `R` acompanha o cérebro, e o cérebro escala 80×. Sem correção o
         alcance máximo do campo (R × abertura × perspectiva) cresce sem
         limite junto com a escala, e o campo esvaziava no ponto exato em
         que devia estar mais denso. Em vez de limitar `R` (o que
         encolheria o núcleo em repouso), o campo INTEIRO é reescalado por
         um fator só quando seu alcance teórico passa do alvo. Perspectiva
         no pior caso usa `Z_PERTO`, o grão mais próximo que a faixa de
         repouso permite — sem voo não há grão mais perto que isso. */
      /* `spanY`, não `A`: o comentário acima fala em não deixar o campo
         fugir da JANELA, e abaixo de 980px a hero é mais alta que ela (ver
         `medir()`). Com `A` o alcance afrouxaria na mesma proporção e os
         grãos cairiam abaixo da dobra — o descarte logo adiante também
         mede contra a caixa, então nem seriam pulados. */
      const alvoAlcance = Math.hypot(L, spanY) * 0.62
      const alcanceBruto = R * abertura * (0.6 + 0.4 / Z_PERTO)
      const ajuste = alcanceBruto > alvoAlcance ? alvoAlcance / alcanceBruto : 1
      /* Geometria converge cedo e devagar: de `ESCALA_EM` até o instante
         em que a dissolução começa. São ~3 telas de rolagem — lento
         demais para ser percebido como mudança, e terminado antes de a
         seção começar a apagar. */
      const tGeo = progresso(v, ESCALA_EM, REVELA_EM)
      const ganho = ganhoRaio(tGeo)
      const vies = viesBranco(tGeo)
      /* A rampa do voo. ZERO em repouso — a reversão do commit 28b1802
         continua valendo onde ela foi tomada: voo num disco pequeno e
         parado lia como poluição, não como viagem. O que mudou é que aqui
         ele entra junto com a descida, quando o cérebro já está crescendo
         e não existe mais disco pequeno.

         `DERIVA_Z` é a mesma base do campo do site; o termo da velocidade
         é o que faz rolar mais rápido parecer entrar mais rápido. */
      const rampa = suave(tGeo)
      /* Avanço PROPORCIONAL à profundidade, não constante.
         Com `z -= taxa·dt` o grão andava sempre o mesmo tanto de
         profundidade por segundo, e com a taxa que dá a sensação certa de
         velocidade um grão nascido em 0,8 chegava a ~0,5 no fim da
         descida: nunca alcançava a faixa próxima. O campo chegava à
         travessia sem os grãos grandes e perto que o do site tem, e a
         diferença de tamanho denunciava a troca.
         Com `z -= z·taxa·dt` a queda é geométrica, e a parallaxe continua
         certa: a velocidade NA TELA vai como 1/z de qualquer jeito.

         Não é que agora ele atravesse a faixa inteira — medido, o grão
         percorre cerca de um terço dela e o reciclo por profundidade
         (`z < FAIXA_Z[0]`) nunca chega a disparar. O grão sai é pelos
         LADOS, porque nasce em `|mx/z| ≤ 1` e é descartado quando passa
         de 1. Quem define a distribuição, então, não é a lei de queda: é
         a caixa de nascimento e a projeção — e essas os dois campos têm
         idênticas. É por isso que um campo geométrico e um linear caem no
         mesmo histograma, e por isso mexer nesta taxa muda a sensação de
         velocidade sem mexer no tamanho dos grãos. */
      const avanco = 0.45 + dv * 3.2
      /* Deriva vertical, com sinal — a componente que faltava. O campo do
         site não só irradia: ele também flui, e inverte quando você rola
         para cima. Sem isto os dois campos escorrem em direções
         diferentes lado a lado, e é isso que denuncia a troca mesmo com
         tamanho e cor casados. */
      deriva += (0.065 + dvAssinado * 0.57) * dt * rampa
      /* Fotometria converge DENTRO da janela de dissolução, não com a
         geometria. Enquanto o cérebro cobre a tela o fundo do grão é uma
         imagem CLARA e MUITO carregada — a textura já tem os próprios
         pontos de brilho desenhados — e baixar o alfa ali não daria
         "discreto", daria invisível de verdade.

         Presa à dissolução, a opacidade cai junto com o cérebro que ela
         precisava vencer — contra ELE o contraste percebido fica estável.

         Contra o campo do site não fica, e quem for calibrar precisa
         saber: o site está noutra camada de opacidade, então o peso do
         grão do núcleo em relação a um grão de lá é `ganhoAlfa × opacidade
         da seção`, que decai bem mais rápido que qualquer uma das duas
         sozinha. O risco no meio da dissolução é o núcleo ceder DEMAIS, e
         não o adensamento que o spec previa. */
      const tFoto = progresso(v, REVELA_EM, REVELA_FIM_EM)
      const presenca = ganhoAlfa(tFoto)
      const halo = ganhoHalo(tFoto)
      /* Três cores por quadro, não uma por grão: o viés é o mesmo para
         todos e só o tom muda. Com 260 grãos isso eram 260 arrays por
         quadro para três resultados distintos. */
      const CORES = PALETA.map((c) => corComVies(c, BRANCO, vies))

      ctx!.clearRect(0, 0, L, A)
      ctx!.globalCompositeOperation = 'source-over'

      for (const g of graos) {
        /* O VOO. A profundidade viva desce e recicla ao passar pela
           câmera — é isto que faz o grão escorrer para fora em vez de só
           ficar maior, e é o que faltava para a travessia ter continuidade
           de movimento. Ao reciclar ele volta ao fundo e troca de lugar,
           não de identidade: o mesmo grão continua sendo o mesmo grão.

           E é o voo que dispensa três mecanismos que existiam aqui antes.
           A faixa de profundidade se espalha sozinha por `FAIXA_Z` porque
           os grãos descem e voltam; o tamanho ganha variação pelo mesmo
           motivo; e a distribuição na tela vira a do site de graça, porque
           `mx / z` cai uniforme na janela. Não há mais nada interpolando
           entre dois modelos — só um modelo, ganhando velocidade. */
        g.z -= g.z * avanco * dt * rampa
        if (g.z < FAIXA_Z[0]) semearModelo(g, FAIXA_Z[1])

        /* A profundidade viva projeta a posição, mas NÃO governa sozinha
           tamanho e alfa. Ela é uma catraca: só desce, e nada a devolve —
           com a rampa em zero ela congela onde parou. Lida direto, isso
           fazia o repouso mudar a cada visita: descer e subir duas vezes
           deixava o núcleo parado cheio de grãos grandes e quase opacos,
           que é exatamente a poluição que o commit 28b1802 reverteu. O
           argumento de "amplitude zero no repouso" só cobria a PRIMEIRA
           visita.

           Misturada de volta para `zRepouso` pela mesma rampa, a
           aparência em repouso é sempre a aprovada, não importa quanto o
           campo já voou. Em `rampa = 1` vale a viva, inteira. */
        const z = g.zRepouso + (g.z - g.zRepouso) * rampa

        /* A projeção do DISCO usa a profundidade de repouso, fixa: é ela
           que mantém `perspectiva` e `ajuste` válidos, porque a viva desce
           até 0,05 e ali a perspectiva valeria 8,6. */
        const perspectiva = 0.6 + 0.4 / g.zRepouso
        const espalha = R * abertura * perspectiva * ajuste
        const discoX = cx + g.x * espalha
        const discoY = cy + g.y * espalha

        /* Duas projeções do mesmo grão, misturadas pela rampa: o disco
           parado do repouso e o modelo do site em movimento. Em `v = 0` só
           existe o disco — o campo aprovado, intocado. Convergido, só
           existe o do site, escorrendo. */
        const modeloX = cx + (g.mx / g.z) * (L / 2 + MARGEM)
        const modeloY = cy + ((g.my - deriva) / g.z) * (spanY / 2 + MARGEM)
        const p = rampa
        const sx = discoX + (modeloX - discoX) * p
        const sy = discoY + (modeloY - discoY) * p

        /* Reciclagem julga a posição do MODELO, não a misturada.
           O disco de repouso é maior que a janela de propósito (ver
           `alvoAlcance`), então grão fora da tela por causa DELE não voou
           para lugar nenhum: reciclá-lo o devolve ao fundo, ele não se
           mexe porque a rampa ainda é baixa, e recicla de novo no quadro
           seguinte. Medido em ~15% do campo por quadro num trecho da
           descida — invisível, porque grão em thrash é justamente o que
           não se desenha, e caro à toa.
           Contra `spanY` e não `A`: quem define para onde o modelo sorteia
           é o span, e o canvas pode ser bem mais alto que a janela abaixo
           de 980px. */
        if (
          rampa > 0 &&
          (modeloX < -MARGEM ||
            modeloX > L + MARGEM ||
            modeloY < -MARGEM ||
            modeloY > spanY + MARGEM)
        ) {
          semearModelo(g, FAIXA_Z[1])
          continue
        }
        if (sx < -MARGEM || sx > L + MARGEM || sy < -MARGEM || sy > A + MARGEM) continue

        /* `fadeProximo` fecha a borda de perto, como no campo do site. Na
           prática ele quase não é acionado: medido, o grão sai pelos lados
           bem antes de chegar rente à câmera. Fica porque a alternativa é
           depender disso continuar verdade — e se um dia a taxa subir ou a
           caixa de saída afrouxar, sem ele o grão apareceria parado no
           tamanho máximo, que é coisa que o campo de destino nunca mostra. */
        /* Os dois fades do campo do site: um apaga o grão rente à câmera,
           o outro o traz do nada no fundo. O de nascimento entra pela
           rampa, não direto — em `z = 1` ele vale zero, e aplicado cru
           apagaria os grãos que descansam no fundo da faixa, que são parte
           do campo aprovado. Sem ele, grão reciclado aparecia do nada a
           quase 0,92 de alfa, e um pisco desses é uma descontinuidade
           própria bem no meio da travessia. */
        const nascendo = 1 - (1 - fadeNascimento(g.z)) * rampa
        let alfa = alfaDoGrao(z, g.brilho) * presenca * fadeProximo(z) * nascendo
        alfa *= cintilacao(t / 1000, g.fase, g.cintila)

        /* Enquanto o núcleo é menor que a silhueta, é ele quem define a
           borda — e ela precisa ser macia, senão o campo lê como um disco
           recortado em vez de um brilho. Depois de abrir, quem corta é a
           máscara do cérebro e este fade sai de cena.

           `rho` é a distância no DISCO, não na tela, e a posição do grão
           deixa de ser a do disco conforme converge para o alvo uniforme.
           Por isso a máscara perde força junto com `p`: a borda macia
           pertence ao disco, e o disco vai deixando de existir. Sem esse
           fator, o grão já espalhado continuaria sendo escurecido por uma
           distância de onde ele não está mais — escurecimento sem relação
           com o que se vê na tela. */
        if (p < 1) {
          const rho = Math.hypot(g.x, g.y)
          alfa *= 1 - suave(limita((rho - 0.72) / 0.28)) * (1 - p)
        }
        if (alfa <= 0.004) continue

        /* O tamanho agora é o do campo do site multiplicado por um ganho
           que decai a 1 em `REVELA_EM`. O grão típico termina MENOR que
           antes, mas os maiores terminam maiores — porque `z` também
           abriu — e é essa troca de "todos médios" por "muitos finos e
           alguns grandes" que faz o campo parecer o do site em vez de um
           lençol uniforme. */
        const raio = raioDoGrao(z) * ganho
        const [r, gg, b] = CORES[g.tom]
        const alfaCore = Math.min(TETO_ALFA, alfa)

        /* Halo largo e fraco por trás do núcleo opaco. Com
           `mix-blend-mode: normal` (ver hero.css) o grão sozinho lia como
           um adesivo colado — um círculo de borda dura, sem relação com a
           luz que o cérebro já emite ao redor. O halo (2,8× o raio, ~22%
           do alfa) devolve a leitura de brilho sem depender de o composto
           aditivo vencer o fundo.

           Ele existe para vencer um fundo CLARO. Contra o vazio, o campo
           do site não tem halo nenhum — então este sai junto com a
           dissolução. Abaixo de meio milésimo de alfa não há o que
           rasterizar, e a chamada é desperdício. */
        const alfaHalo = alfaCore * 0.22 * halo
        if (alfaHalo > 0.004) {
          ctx!.beginPath()
          ctx!.arc(sx, sy, raio * 2.8, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${r},${gg},${b},${alfaHalo.toFixed(3)})`
          ctx!.fill()
        }

        ctx!.beginPath()
        ctx!.arc(sx, sy, raio, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${gg},${b},${alfaCore})`
        ctx!.fill()
      }

      /* O recorte. Mantém só o que cai dentro do alfa do cérebro, então as
         estrelas existem exclusivamente dentro dele — inclusive enquanto
         ele cresce, porque o destino do draw é o rect medido agora. */
      if (prontaTextura) {
        ctx!.globalCompositeOperation = 'destination-in'
        ctx!.drawImage(textura, bx, by, rb.width, rb.height)
        ctx!.globalCompositeOperation = 'source-over'
      }
    }

    const aoRedimensionar = () => medir()
    const aoTrocarVisibilidade = () => {
      visivel = !document.hidden
    }

    medir()
    window.addEventListener('resize', aoRedimensionar)
    document.addEventListener('visibilitychange', aoTrocarVisibilidade)

    /* A hero é a primeira seção e fica presa por 4 telas; passado isso
       não há motivo para seguir desenhando atrás do conteúdo. */
    const observador = new IntersectionObserver(
      ([entrada]) => {
        naTela = entrada?.isIntersecting ?? true
      },
      { rootMargin: '10% 0px' },
    )
    observador.observe(cv)

    raf = requestAnimationFrame(quadro)

    return () => {
      cancelAnimationFrame(raf)
      observador.disconnect()
      window.removeEventListener('resize', aoRedimensionar)
      document.removeEventListener('visibilitychange', aoTrocarVisibilidade)
      textura.onload = null
    }
  }, [])

  return <canvas className="hero-estrelas" ref={ref} aria-hidden="true" />
}
