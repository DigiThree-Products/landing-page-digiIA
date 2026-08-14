'use client'

import { useRef } from 'react'
import { Countdown } from '@/components/waitlist/Countdown'
import { HeroObject } from '@/components/sections/HeroObject'
import { HeroEstrelas } from '@/components/sections/HeroEstrelas'
import { LANDING } from '@/content/landing'
/* `mergulho` já é o nome da timeline aqui embaixo; o estado compartilhado
   com o canvas das estrelas entra com nome próprio para não sombrear. */
import {
  ESCALA_EM,
  FATOR,
  mergulho as estadoMergulho,
  REVELA_EM,
  REVELA_FIM_EM,
  TOTAL,
} from '@/lib/mergulho'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = root.current
      if (!section || prefersReducedMotion()) return

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro.from('.hero-reveal', { autoAlpha: 0, y: 22, filter: 'blur(7px)', duration: 0.78, stagger: 0.1 })
      intro.from('.hero-obj', { autoAlpha: 0, x: 38, scale: 0.96, duration: 1, ease: 'power4.out' }, 0.18)

      /**
       * Mergulho no cérebro — a passagem da primeira seção para a segunda.
       *
       * A hero prende e o objeto cresce até engolir a tela. Quem escala é
       * o `.palco`, nunca as camadas: o `transform` do cérebro e da mão
       * pertence ao HeroObject (paralaxe do cursor e o gesto de segurar),
       * e disputar a mesma propriedade quebraria as duas coisas.
       *
       * A origem da escala fica no cérebro, não no centro do palco (ver
       * hero.css). É esse detalhe que faz a leitura ser "entrar nele": a
       * mão e o resto se abrem para fora da tela enquanto o cérebro
       * permanece no eixo, crescendo em cima de você. Com origem no
       * centro, o conjunto só ficaria maior — passaria perto, não através.
       */
      const media = gsap.matchMedia()
      media.add(
        { grande: '(min-width: 981px)', pequena: '(max-width: 980px)' },
        (contexto) => {
          const { grande } = contexto.conditions as { grande: boolean }

          const mergulho = gsap.timeline({ paused: true })
          const cerebro = section.querySelector<HTMLElement>('[data-camada="cerebro"]')

          /* `SEGURA`, `TOTAL` e `FATOR` moram em lib/mergulho.ts, ao lado
             de `ESCALA_EM` — que vale `0,34 * FATOR` e por isso PRECISA
             mudar junto com eles. Enquanto os três eram locais daqui e o
             `ESCALA_EM` era um literal lá, encurtar o pin dessincronizava
             os dois em silêncio: o objeto continuaria interativo depois do
             ponto em que o mergulho já teria começado. */

          /* A janela de revelação — o trecho em que o cérebro some e
             revela o fundo preto com a poeira cósmica de verdade atrás
             dele, mesmo mecanismo que as estações usam
             (`el.style.opacity`, lido por PoeiraFundo.tsx para apagar
             junto o retângulo claro que o canvas pinta).

             Ela mora em `REVELA_EM`/`REVELA_FIM_EM` (lib/mergulho.ts), não
             aqui: o último oitavo do pin, e o núcleo estrelado precisa
             exatamente dos mesmos dois pontos. Havia constantes locais com
             esses números, e eram armadilha — quem editasse um deles aqui,
             ao lado desta explicação, não mudaria nada, porque a timeline
             lê as frações importadas.

             Era 0,1 tela, foi para 0,3 e agora ocupa a folga inteira até o
             fim do pin. Não sobra mais trecho com o cérebro transparente
             parado esperando: ele apaga exatamente quando o pin acaba.

             O que mudou aqui: a escala NÃO termina mais junto com ela —
             termina no começo dela, em `REVELA_EM`. Esta janela deixou de
             ser só dissolução e virou também a pista onde o `scrub`
             alcança o tamanho final. E `TOTAL` deixou de ser imutável:
             caiu de 4,0 para 3,5 telas para encurtar o movimento. As
             seções seguintes não sentem, porque a margem da estação é
             medida em unidades de VIEWPORT e não a partir deste pin (ver
             `vaoDaEstacao` em Estacoes.tsx) — o vão de 0,45 tela sobrevive
             sozinho. */

          /* O progresso não vem do gatilho, e sim deste valor animado com
             `scrub`, espelhado 1:1 no timeline a cada atualização — sobe
             com a rolagem para baixo e desce (reverte o mergulho) com a
             rolagem para cima. O `<= 0.002` trava em zero exato perto do
             topo, para não sobrar um resíduo de arredondamento do pin. */
          const passo = { v: 0 }
          gsap.to(passo, {
            v: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${window.innerHeight * TOTAL}`,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              /* Amortecido, não colado. Com `true` a animação segue a
                 roda do mouse quadro a quadro e herda cada solavanco do
                 gesto; com um valor em segundos o GSAP persegue a
                 posição, e é isso que dá o deslize de câmera. */
              scrub: 1.1,
              invalidateOnRefresh: true,
              /* A estação (Estacoes.tsx) mede o próprio início a partir
                 do fim deste pin — se o dela for recalculado antes deste,
                 ela usa uma altura de pin desatualizada e chega cedo
                 demais, com o cérebro ainda na tela. Prioridade mais alta
                 garante que este pin esteja com o tamanho certo primeiro. */
              refreshPriority: 1,
              /* A opacidade da seção é a ÚNICA coisa aqui que não passa
                 pelo `scrub`, e não é inconsistência: é o que conserta a
                 quebra no fim do mergulho.

                 O `scrub` persegue a posição ao longo de ~1,1s. A soltura
                 do pin, não — ela acontece na rolagem crua, no instante
                 exato em que se chega ao fim. Com a opacidade suavizada, a
                 rolagem chega ao fim, o ScrollTrigger trava o progresso em
                 1, o pin solta, e a seção AINDA está terminando de apagar
                 enquanto já sobe: via-se o cérebro semitransparente
                 deslizando junto com a seção seguinte.

                 E nenhuma folga resolvia. O atraso do `scrub` não é uma
                 distância fixa que dê para reservar; rolando rápido, a
                 cauda é consumida na mesma velocidade. Só tirando a
                 opacidade do valor perseguido e prendendo-a ao progresso
                 cru é que ela passa a terminar exatamente onde o pin
                 termina, sempre.

                 A escala e a posição continuam suavizadas — o deslize de
                 câmera é o motivo de o `scrub` existir, e nenhuma das duas
                 precisa estar sincronizada com a soltura do pin. */
              onUpdate: (self) => {
                const apagando = (self.progress - REVELA_EM) / (REVELA_FIM_EM - REVELA_EM)
                const t = apagando < 0 ? 0 : apagando > 1 ? 1 : apagando
                // Mesma curva do `power1.in` que a timeline usava aqui.
                section.style.opacity = String(1 - t * t)
                /* Transparente não é ausente: opacidade 0 continua
                   recebendo clique e hover. Isso não custava nada
                   enquanto a hero era a última coisa no seu trecho do
                   documento, mas a estação agora sobe por cima da cauda
                   dela (ver `caudaDaHeroAcima` em Estacoes.tsx) — e sem
                   isto o CTA e o link da oferta, invisíveis, ficariam
                   sobre o começo da chegada, roubando o clique e trocando
                   o cursor numa região onde não há nada à vista. Volta a
                   receber assim que a hero reaparece. */
                section.style.pointerEvents = t >= 1 ? 'none' : ''
              },
            },
            onUpdate: () => {
              const v = passo.v <= 0.002 ? 0 : passo.v
              mergulho.progress(v)
              // A flutuação da .flutua (hero.css) é local ao cérebro; dentro
              // do .palco escalado (até 80x/54x) esses poucos pixels viram
              // um tremor enorme na tela. Suspende-a durante o mergulho,
              // sem tocar no `transform` do HeroObject (paralaxe/segurar).
              if (cerebro) cerebro.style.animation = v > 0 ? 'none' : ''
              /* Publica no mesmo passo em que a timeline anda. O canvas das
                 estrelas e a interatividade do objeto (HeroObject.tsx) leem
                 isto para abrir/fechar o núcleo e ligar/desligar a mão —
                 uma fonte só para os três, e sem round-trip pelo DOM. */
              estadoMergulho.v = v
            },
          })

          /* Leva o CÉREBRO ao centro da tela, não o palco. Os fatores são
             os mesmos da `transform-origin` em hero.css: é o ponto que
             vai crescer, então é ele que precisa estar no eixo antes de
             o mergulho começar. Somar o deslocamento atual mantém a
             conta certa quando o GSAP reavalia em resize. */
          const desloca = (eixo: 'x' | 'y') => () => {
            const palco = section.querySelector<HTMLElement>('.palco')
            const obj = section.querySelector<HTMLElement>('.hero-obj')
            if (!palco || !obj) return 0
            const r = palco.getBoundingClientRect()
            const atual = Number(gsap.getProperty(obj, eixo)) || 0
            return eixo === 'x'
              ? atual + (window.innerWidth / 2 - (r.left + r.width * 0.54))
              : atual + (window.innerHeight / 2 - (r.top + r.height * 0.36))
          }

          mergulho
            /* Primeiro tempo: o texto sai pela esquerda e o objeto vem
               para o centro. Só depois o mergulho — aproximar com a
               manchete ainda na tela e o cérebro fora do eixo faria a
               passagem parecer um zoom torto, não uma entrada. */
            .to('.hero-col', { xPercent: -22, autoAlpha: 0, ease: 'power2.in', duration: 0.3 * FATOR }, 0)
            .to('.hero-obj', { x: desloca('x'), y: desloca('y'), ease: 'power2.inOut', duration: ESCALA_EM }, 0)
            // Segundo tempo: centrado e sozinho, agora sim ele cresce.
            .to(
              '.palco',
              /* 150×, e o crescimento acaba em `REVELA_EM` — onde a
                 dissolução começa —, não mais no fim do pin.

                 Os dois terminavam juntos no fim, e por isso o tamanho
                 cheio nunca era visto: a escala anda no relógio atrasado do
                 `scrub` e a opacidade no relógio cru (ver o `onUpdate`
                 acima). A opacidade zerava primeiro e os últimos múltiplos
                 rodavam invisíveis — medido no desenho antigo: quando a
                 dissolução começava, a escala valia ~57× de 90, e os 33×
                 que faltavam corriam com o cérebro já apagando.

                 Fechando aqui, a janela de dissolução inteira vira pista de
                 pouso: o `scrub` gasta o atraso dele nela e o cérebro chega
                 aos 150× ainda com opacidade na tela. Quanto mais rápido se
                 rola, mais da pista ele consome — e é por isso que ela não
                 pode encurtar (ver `REVELA_FIM_EM` em lib/mergulho.ts). */
              { scale: grande ? 150 : 100, ease: 'power2.in', duration: REVELA_EM - ESCALA_EM },
              ESCALA_EM,
            )
            /* A cauda existe só para a timeline MEDIR 1. Sem ela a duração
               seria `REVELA_EM`, e `mergulho.progress(v)` normaliza sobre a
               duração real — o crescimento voltaria a terminar no fim do
               pin, exatamente o que esta mudança desfaz. O alvo é um objeto
               descartável porque não há o que animar aqui: neste trecho o
               cérebro está parado em 150× e só a opacidade da seção cai. */
            .to({ pousando: 0 }, { pousando: 1, ease: 'none', duration: REVELA_FIM_EM - REVELA_EM }, REVELA_EM)
          /* A opacidade da seção NÃO está nesta timeline de propósito —
             ela é escrita direto no `onUpdate` do ScrollTrigger, a partir
             do progresso cru. Ver a nota lá em cima: aqui dentro ela
             herdaria o `scrub` e terminaria de apagar depois de o pin já
             ter soltado, com a seção subindo à vista. */

          return () => {
            section.style.opacity = ''
            section.style.pointerEvents = ''
          }
        },
      )

      return () => media.revert()
    },
    { scope: root },
  )

  return (
    <header ref={root} className="hero" id="cadastro">
      {/* As estrelas moram dentro do cérebro (recorte pelo alfa da própria
          textura, ver HeroEstrelas.tsx) — não dependem de a hero ter fundo
          branco, então continuam existindo aqui mesmo sem um véu dedicado:
          quem revela o que vem depois é a seção inteira (ver `mergulho`
          acima), estrelas inclusas. */}
      <HeroEstrelas />

      <div className="hero-grid">
        <div className="hero-col">
          <p className="tag hero-reveal">{LANDING.hero.eyebrow}</p>

          <h1 className="hero-reveal">
            <span className="hero-title-line">{LANDING.hero.title}</span>
            <span className="glow hero-title-line">{LANDING.hero.highlight}</span>
          </h1>

          <p className="sub hero-reveal">
            {LANDING.hero.description} <a className="offer" href="#oferta">{LANDING.hero.offer}</a>
          </p>

          <div className="meter hero-countdown hero-reveal">
            <div>
              <p className="tag">{LANDING.hero.countdownLabel}</p>
              <Countdown />
            </div>
          </div>
          <div className="hero-actions hero-reveal">
            <a className="hero-cta" href="#oferta">
              <span>{LANDING.hero.cta}</span>
              <span className="hero-cta__arrow" aria-hidden="true">↓</span>
            </a>
          </div>



        </div>

        <div className="hero-visual">
          <HeroObject />
        </div>
      </div>


    </header>
  )
}
