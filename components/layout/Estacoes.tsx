'use client'

import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * Uma estação por vez. Começa por "Veja funcionando"; as outras seções
 * claras seguem como faixa até serem convertidas.
 */
const PAINEIS = '.page .approach'

/** Escala e opacidade de quando ela ainda é um ponto no fundo. */
const ESCALA_LONGE = 0.34
const OPACIDADE_LONGE = 0.15
/** Escala ao passar rente à câmera. */
const ESCALA_PASSA = 1.6

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
const TRAVESSIA = 2.8

/* Marcos dentro do trecho preso. Entre CHEGOU e PARTIU ela fica parada
   em 1:1 — é a janela de leitura, com o texto imóvel e nítido. */
const CHEGOU = 0.55
const PARTIU = 0.76

/**
 * Rolagem extra, em telas, antes de a estação começar a chegar — o vão em
 * branco depois que o mergulho da Hero termina. Sem isso a chegada começa
 * assim que o topo da seção toca o topo da tela, o que é ainda enquanto o
 * objeto da Hero está terminando de sumir.
 */
const ATRASO = 0.6

const limita = (v: number) => Math.min(1, Math.max(0, v))
/** Desacelera ao encostar na vaga, em vez de parar de repente. */
const suave = (t: number) => t * t * (3 - 2 * t)

/**
 * Estações: a chegada e a passagem dos painéis claros.
 *
 * A estação é um corpo parado no espaço e nós é que viajamos até ela.
 * Ela sobe pequena e apagada lá do fundo; quando encosta no topo da
 * tela, trava no lugar e **cresce devagar** até preencher tudo —
 * é aqui que a viagem se lê, e é por isso que o painel fica preso: solto,
 * o crescimento teria que caber no tempo em que ele cruza a tela, curto
 * demais para alguém perceber que veio de longe. Depois de uma janela
 * parada para leitura, cresce além da tela e se apaga, como um corpo que
 * ficou para trás.
 *
 * Tudo é função da posição, nunca da direção do scroll: subir a página
 * refaz a mesma curva ao contrário sozinha.
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
      el.style.transform = `scale(${ESCALA_LONGE})`
      el.style.opacity = String(OPACIDADE_LONGE)
      el.dataset.escala = String(ESCALA_LONGE)

      return ScrollTrigger.create({
        trigger: secao,
        start: () => `top+=${window.innerHeight * ATRASO} top`,
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
           nota em Hero.tsx. */
        refreshPriority: 1,
        onUpdate: (self) => {
          const p = self.progress
          const chegada = suave(limita(p / CHEGOU))
          const passagem = limita((p - PARTIU) / (1 - PARTIU))
          const escala =
            ESCALA_LONGE + (1 - ESCALA_LONGE) * chegada + (ESCALA_PASSA - 1) * passagem
          const opacidade = limita(OPACIDADE_LONGE + (1 - OPACIDADE_LONGE) * chegada - passagem)
          el.style.transform = `scale(${escala.toFixed(4)})`
          el.style.opacity = opacidade.toFixed(3)
          el.dataset.escala = String(escala)
        },
      })
    })

    return () => {
      gatilhos.forEach((g) => g.kill())
      paineis.forEach((el) => {
        el.style.transform = ''
        el.style.opacity = ''
        delete el.dataset.escala
      })
    }
  })

  return null
}
