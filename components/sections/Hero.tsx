'use client'

import { useEffect, useRef } from 'react'
import { Countdown } from '@/components/waitlist/Countdown'
import { HeroObject } from '@/components/sections/HeroObject'
import { HeroEstrelas } from '@/components/sections/HeroEstrelas'
import { LANDING } from '@/content/landing'
/* `mergulho` já é o nome da timeline aqui embaixo; o estado compartilhado
   com o canvas das estrelas entra com nome próprio para não sombrear. */
import { ESCALA_EM, mergulho as estadoMergulho } from '@/lib/mergulho'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  /**
   * A sangria do véu e das estrelas, medida — não estimada.
   *
   * `hero-clara.css` sangrava `.hero-veu`/`.hero-estrelas` até a borda da
   * janela com `calc(50% - 50vw - 48px)`. Essa conta supõe que `.hero` está
   * centralizada no viewport por herança normal de layout — verdade em
   * repouso, mas `.hero` passa a maior parte do tempo PRESA (`position:
   * fixed`, largura e padding recalculados pelo próprio GSAP para imitar o
   * lugar de origem — ver a nota do pin em Hero.tsx). `vw` inclui a barra
   * de rolagem; a largura que o `.hero` preso usa, não. A mesma conta que
   * fecha em um navegador sobra alguns pixels de fundo escuro no outro,
   * dependendo só da largura exata da barra — foi assim que a faixa de
   * ~24px na borda direita apareceu, confirmada em navegador real depois
   * de não se reproduzir em captura headless.
   *
   * Em vez de adivinhar essa largura, mede-se o retângulo real de `.hero`
   * contra `document.documentElement.clientWidth` (a largura de fato
   * disponível, sem a barra) e publica-se `--sangria-esq` (deslocamento à
   * esquerda) e `--sangria-largura` (largura final) — LARGURA em vez de um
   * segundo deslocamento à direita de propósito: `<canvas>` é elemento
   * substituído, e `left`+`right` sem `width` explícito não o estica —
   * ele usa o tamanho intrínseco (300×150 por padrão) e ignora `right`. As
   * estrelas nunca chegaram a se sobrepor ao cérebro por causa disso; só
   * não dava pra notar porque a própria textura do cérebro já tem pontos
   * brilhantes desenhados. `width` explícito tira as duas camadas dessa
   * regra especial e faz o `<canvas>` esticar igual a um `<div>` faria.
   *
   * Reage a duas coisas: redimensionar a janela, e o próprio GSAP mudando
   * o estilo de `.hero` ao prender/soltar — um `MutationObserver` no
   * atributo `style` pega isso sem depender de escutar rolagem.
   *
   * Roda incondicional (fora do `useGSAP` de cima, que sai cedo com
   * `prefers-reduced-motion`): com movimento reduzido `.hero` nunca é
   * presa, então é sempre o caso "estimado" que precisa da medição real.
   * A conta antiga continua como valor inicial das variáveis CSS — sem JS
   * (ou antes da hidratação terminar), ela é o que se tem.
   */
  useEffect(() => {
    const secao = root.current
    if (!secao) return

    function medir() {
      const r = secao!.getBoundingClientRect()
      const largura = document.documentElement.clientWidth
      secao!.style.setProperty('--sangria-esq', `${-r.left}px`)
      secao!.style.setProperty('--sangria-largura', `${largura}px`)
    }

    medir()
    window.addEventListener('resize', medir)
    const observador = new MutationObserver(medir)
    observador.observe(secao, { attributes: true, attributeFilter: ['style'] })

    return () => {
      window.removeEventListener('resize', medir)
      observador.disconnect()
    }
  }, [])

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

          /* O tween da escala, em constantes, porque o ponto em que o
             branco cede é DERIVADO dele. */
          const ESCALA_FINAL = grande ? 18 : 12
          const ESCALA_DUR = 0.7

          /**
           * Em que ponto da travessia o cérebro passa a cobrir a tela.
           *
           * É quando o branco pode ceder: até ali ainda se está do lado de
           * fora e a poeira do site entregaria o destino antes da viagem;
           * dali em diante não há mais superfície para atravessar, e o véu
           * já está atrás de um desenho que ocupa tudo.
           *
           * Derivado em vez de cravado. Um número fixo dessincroniza em
           * silêncio na primeira vez que alguém mexer na escala final ou na
           * janela do tween — e foi exatamente isso que aconteceu antes,
           * quando 0,54 valia para 10× e deixou de valer para 18×.
           *
           * As fracoes sao do DESENHO dentro da caixa do palco, medidas na
           * textura: o cérebro ocupa ~55% da largura e ~63% da altura, o
           * resto é transparência e o tronco. `offsetWidth` e não
           * `getBoundingClientRect` porque este é o tamanho de layout, imune
           * ao transform que o próprio mergulho aplica.
           *
           * O expoente 3 é o `power2.in` do tween: no GSAP, power2 é cúbico.
           * Se a ease mudar, este expoente muda com ela.
           */
          const cedeEm = (() => {
            const palco = section.querySelector<HTMLElement>('.palco')
            if (!palco?.offsetWidth) return 0.6
            const precisa = Math.max(
              window.innerWidth / (palco.offsetWidth * 0.55),
              window.innerHeight / (palco.offsetHeight * 0.63),
            )
            const t = Math.cbrt(Math.max(0, precisa - 1) / (ESCALA_FINAL - 1))
            return ESCALA_EM + ESCALA_DUR * Math.min(1, t)
          })()

          /* Nos dois sentidos. O progresso segue a rolagem igual em
             qualquer direção — subir reproduz o mergulho ao contrário, no
             mesmo ritmo amortecido de `scrub`, em vez de congelar no
             lugar e só voltar ao início quando a hero é reconquistada
             por inteiro. */
          const mergulho = gsap.timeline({ paused: true })

          /* O progresso não vem do gatilho, e sim deste valor animado com
             `scrub`. Motivo: o `onUpdate` do próprio ScrollTrigger não
             chega a rodar quando a rolagem volta ao zero — e como a hero
             é a primeira seção, o `start` cai justamente no zero e
             `onLeaveBack` também nunca dispara. Resultado: a hero voltava
             presa no fim do mergulho, sem o texto. O callback do tween,
             ao contrário, roda em todo passo do scrub, inclusive no
             último. */
          const passo = { v: 0 }
          gsap.to(passo, {
            v: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              /* 3 telas. O cérebro precisa passar DA tela antes de o
                 conteúdo começar, e isso são duas coisas: escala final
                 maior (ver o tween do palco) e rolagem para chegar lá sem
                 atropelo. */
              end: () => `+=${window.innerHeight * 3}`,
              /* Ordem de medição, não enfeite.
                 Há duas seções presas em sequência: esta e a estação de
                 "Veja funcionando" (Estacoes.tsx). O ScrollTrigger calcula
                 as posições de todos os gatilhos num refresh, e os de baixo
                 dependem do tamanho final do espaçador desta trava. Sem
                 prioridade declarada a ordem é a de criação, e a segunda
                 seção acabava medida contra uma hero que ainda não sabia
                 seu próprio tamanho — a revelação dela disparava no lugar
                 errado. Maior refresca primeiro, então isto vem em ordem de
                 documento: hero 2, estação 1. */
              refreshPriority: 2,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              /* Amortecido, não colado. Com `true` a animação segue a
                 roda do mouse quadro a quadro e herda cada solavanco do
                 gesto; com um valor em segundos o GSAP persegue a
                 posição, e é isso que dá o deslize de câmera. */
              scrub: 1.1,
              invalidateOnRefresh: true,
            },
            onUpdate: () => {
              mergulho.progress(passo.v)
              /* Publica no mesmo passo em que a timeline anda. O canvas das
                 estrelas e a interatividade do objeto (HeroObject.tsx) leem
                 isto para abrir/fechar o núcleo e ligar/desligar a mão —
                 uma fonte só para os três, e sem round-trip pelo DOM. */
              estadoMergulho.v = passo.v
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
            .to('.hero-col', { xPercent: -22, autoAlpha: 0, ease: 'power2.in', duration: 0.14 }, 0)
            .to('.hero-obj', { x: desloca('x'), y: desloca('y'), ease: 'power2.inOut', duration: 0.18 }, 0)
            /* Segundo tempo: centrado e sozinho, ele cresce — e cresce até
               passar DA tela, não até encostar nela. 18× no desktop leva a
               silhueta muito além da borda, que é o que faz a leitura ser
               "estou dentro" em vez de "está perto".
               Isto ocupa 70% da travessia. A imagem amolece nessa escala
               (1600px de textura num box de 720px), e é de propósito que o
               campo de estrelas ganhe brilho no mesmo trecho: quando a
               superfície tem menos a mostrar, o interior tem mais. */
            .to('.palco', { scale: ESCALA_FINAL, ease: 'power2.in', duration: ESCALA_DUR }, ESCALA_EM)
            /* Terceiro tempo: o branco cede no instante em que o cérebro
               passa a cobrir a tela — ver `cedeEm`. Nem antes, que
               entregaria o destino com você ainda do lado de fora, nem
               depois, que seria segurar um branco que ninguém mais vê. */
            .to(
              '.hero-veu',
              { autoAlpha: 0, ease: 'power1.inOut', duration: Math.max(0.14, 0.86 - cedeEm) },
              cedeEm,
            )
            // Dissolve no fim: passar do ponto só mostraria pixel esticado.
            .to('.hero-obj', { autoAlpha: 0, ease: 'none', duration: 0.1 }, 0.9)
        },
      )

      return () => media.revert()
    },
    { scope: root },
  )

  return (
    <header ref={root} className="hero" id="cadastro">
      {/* O lado de fora da mente. Branco por CSS, não por script: sem JS a
          hero nasce clara e legível, e o mergulho é que o remove. */}
      <div className="hero-veu" aria-hidden="true" />
      <HeroEstrelas />

      <div className="hero-grid">
        <div className="hero-col">
          <p className="tag hero-reveal">{LANDING.hero.eyebrow}</p>

          <h1 className="hero-reveal">
            <span className="hero-title-line">{LANDING.hero.title}</span>
            <span className="glow hero-title-line">{LANDING.hero.highlight}</span>
          </h1>

          <p className="sub hero-reveal">
            {LANDING.hero.description} <span className="offer">{LANDING.hero.offer}</span>
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
