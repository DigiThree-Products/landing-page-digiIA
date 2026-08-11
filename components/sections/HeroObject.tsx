'use client'

import { useEffect, useRef } from 'react'

/**
 * O objeto da hero — um cérebro sustentado por uma mão robótica, em duas
 * camadas empilhadas. Segurar fecha a mão e ergue o cérebro; o cursor
 * inclina a cena de leve. Congela por inteiro durante a rolagem — ver
 * `rolando` — porque a mesma imagem também responde ao mergulho da hero
 * (Hero.tsx), e um flutuar de 7s por cima de um scale de scroll lia como
 * tremedeira, não como vida própria. É deleite: nenhuma informação da
 * página depende disso, por isso o conjunto inteiro é um único role="img"
 * com um rótulo só, não um controle focável. Com prefers-reduced-motion
 * nada disso roda.
 */
export function HeroObject() {
  const palcoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const palco = palcoRef.current
    if (!palco) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cerebro = palco.querySelector<HTMLElement>('[data-camada="cerebro"]')
    const mao = palco.querySelector<HTMLElement>('[data-camada="mao"]')
    if (!cerebro || !mao) return

    const ABRE = 1000 // quanto a mão leva para relaxar de volta
    /* Quanto esperar depois do último evento de rolagem para considerar
       "parado" de novo. Curto de propósito: é o intervalo em que o
       usuário já soltou a roda/o dedo, não uma pausa de leitura. */
    const ROLAGEM_FOLGA = 160
    let preso = false
    let rolando = false
    let timer: ReturnType<typeof setTimeout>
    let timerRolagem: ReturnType<typeof setTimeout>
    let par = { x: 0, y: 0 } // paralaxe: -1 a 1 em cada eixo

    function aplicar() {
      const alto = palco!.classList.contains('segurando')
      /* A subida do cérebro é modesta de propósito: alto o bastante para
         ler como "erguido", raso o bastante para não abrir um vão entre
         ele e a mão — sem isso a leitura vira "o cérebro escapa", não
         "a mão segura e levanta". A mão sobe junto, por menos, para
         acompanhar em vez de ficar para trás. */
      cerebro!.style.transform =
        `translate3d(${par.x * 16}px, ${par.y * 12 + (alto ? -20 : 0)}px, 0) scale(${alto ? 1.04 : 1})`
      mao!.style.transform =
        `translate3d(${par.x * -6}px, ${par.y * -4 + (alto ? -14 : 0)}px, 0)` +
        ` rotate(${alto ? -3.2 : 0}deg) scaleX(${alto ? 0.84 : 1})`
    }

    function marcar(fase: 'segurando' | 'soltando' | null) {
      palco!.classList.remove('segurando', 'soltando')
      if (fase) palco!.classList.add(fase)
      aplicar()
    }

    /* Para tudo no lugar em que está: cancela um hold em andamento sem a
       transição de soltar (`.rolando` zera `transition` em CSS) e pausa o
       flutuar. Não existe estado "parcial" congelado — o hold só chega a
       existir por um gesto que a rolagem já impede de começar, então
       parar nunca precisa lidar com uma pose no meio do caminho. */
    function congelar() {
      if (preso) {
        preso = false
        clearTimeout(timer)
        marcar(null)
      }
      palco!.classList.add('rolando')
    }

    function aoRolar() {
      if (!rolando) {
        rolando = true
        congelar()
      }
      clearTimeout(timerRolagem)
      timerRolagem = setTimeout(() => {
        rolando = false
        palco!.classList.remove('rolando')
      }, ROLAGEM_FOLGA)
    }

    function segurar(ev: PointerEvent) {
      if (preso || rolando) return
      preso = true
      clearTimeout(timer)

      // a onda sai de onde o dedo tocou
      const r = palco!.getBoundingClientRect()
      const o = document.createElement('span')
      o.className = 'onda'
      o.style.left = ((ev.clientX - r.left) / r.width) * 100 + '%'
      o.style.top = ((ev.clientY - r.top) / r.height) * 100 + '%'
      palco!.appendChild(o)
      setTimeout(() => o.remove(), 800)

      marcar('segurando')
    }

    function soltar() {
      if (!preso) return
      preso = false
      marcar('soltando')
      clearTimeout(timer)
      timer = setTimeout(() => marcar(null), ABRE)
    }

    function aoPressionar(ev: PointerEvent) {
      try {
        palco!.setPointerCapture(ev.pointerId)
      } catch {
        // sem captura, os ouvintes de window seguram
      }
      segurar(ev)
    }

    // A inclinação é só do mouse: no toque ela brigaria com o scroll.
    function aoMover(ev: PointerEvent) {
      if (ev.pointerType !== 'mouse' || rolando) return
      const r = palco!.getBoundingClientRect()
      par = {
        x: ((ev.clientX - r.left) / r.width - 0.5) * 2,
        y: ((ev.clientY - r.top) / r.height - 0.5) * 2,
      }
      aplicar()
    }

    function aoSair() {
      par = { x: 0, y: 0 }
      aplicar()
    }

    // A captura do ponteiro garante que soltar chegue mesmo se o cursor sair
    // da janela antes de largar o botão. Sem ela um pointerup perdido deixava
    // o cérebro preso no ar e todo clique seguinte era engolido pelo guarda
    // "if (preso) return": a interação morria até um pointerup aparecer por
    // acaso.
    palco.addEventListener('pointerdown', aoPressionar)
    palco.addEventListener('lostpointercapture', soltar)
    // Redundância proposital: soltar é idempotente (if (!preso) return),
    // então não há risco em ouvir de vários lugares — só em ouvir de menos.
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', soltar)
    window.addEventListener('blur', soltar)
    palco.addEventListener('pointermove', aoMover)
    palco.addEventListener('pointerleave', aoSair)
    // No documento, não no palco: a rolagem não nasce dele.
    window.addEventListener('scroll', aoRolar, { passive: true })

    aplicar()

    return () => {
      clearTimeout(timer)
      clearTimeout(timerRolagem)
      palco.removeEventListener('pointerdown', aoPressionar)
      palco.removeEventListener('lostpointercapture', soltar)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
      window.removeEventListener('blur', soltar)
      palco.removeEventListener('pointermove', aoMover)
      palco.removeEventListener('pointerleave', aoSair)
      window.removeEventListener('scroll', aoRolar)
    }
  }, [])

  return (
    <div className="hero-obj">
      <div
        ref={palcoRef}
        className="palco"
        role="img"
        aria-label="Uma mão robótica sustenta um cérebro luminoso, atravessado por trilhas de circuito."
      >
        <img
          className="camada camada--fundo"
          data-camada="fundo"
          src="/assets/hero/fundo.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          width={1600}
          height={1195}
          decoding="async"
        />
        <img
          className="camada camada--mao"
          data-camada="mao"
          src="/assets/hero/mao.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          width={1600}
          height={1195}
          decoding="async"
        />
        <img
          className="camada camada--cerebro"
          data-camada="cerebro"
          src="/assets/hero/cerebro.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          width={1600}
          height={1195}
          decoding="async"
        />
      </div>
    </div>
  )
}
