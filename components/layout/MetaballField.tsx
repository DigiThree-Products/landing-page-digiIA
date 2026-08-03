'use client'

import { useEffect, useRef } from 'react'

type Blob = {
  x: number
  y: number
  r: number
  /** fase */
  a: number
  /** velocidade */
  v: number
  /** amplitude x */
  ax: number
  /** amplitude y */
  ay: number
  ox: number
  oy: number
}

/**
 * Campo de metaballs — elemento-assinatura.
 *
 * A mesma geometria do símbolo Digi.IA: círculos que se fundem por pontes
 * bezier. Reage ao cursor.
 *
 * O que mudou ao virar componente: antes era uma IIFE que registrava listeners
 * no window e um requestAnimationFrame sem ninguém para cancelar — aceitável
 * numa página que nunca desmonta, vazamento certo em SPA. Agora tudo é desfeito
 * no retorno do useEffect.
 */
export function MetaballField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = cv.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    let blobs: Blob[] = []
    let grad: CanvasGradient
    let raf = 0
    let t = 0
    let tempoRedimensionar: ReturnType<typeof setTimeout>

    const toque = window.matchMedia('(pointer: coarse)').matches
    const N = toque ? 6 : 9
    const mouse = { x: -9999, y: -9999, ativo: false }

    function dimensionar() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = cv!.clientWidth
      H = cv!.clientHeight
      cv!.width = W * dpr
      cv!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      grad = ctx!.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0, '#4500F9')
      grad.addColorStop(0.55, '#8E47FB')
      grad.addColorStop(1, '#CD82FF')
    }

    function semear() {
      blobs = []
      const base = Math.min(W, H)
      // Em telas largas o texto ocupa a esquerda: as bolhas se concentram
      // do meio para a direita, onde há espaço livre.
      const largo = W > 900
      const x0 = largo ? W * 0.4 : 0
      const faixa = largo ? W * 0.62 : W
      for (let i = 0; i < N; i++) {
        const x = x0 + Math.random() * faixa
        const y = Math.random() * H
        blobs.push({
          x,
          y,
          r: base * (0.06 + Math.random() * 0.09),
          a: Math.random() * Math.PI * 2,
          v: 0.1 + Math.random() * 0.22,
          ax: 60 + Math.random() * 130,
          ay: 50 + Math.random() * 120,
          ox: x,
          oy: y,
        })
      }
    }

    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(b.x - a.x, b.y - a.y)
    const vetor = (p: { x: number; y: number }, ang: number, r: number) => ({
      x: p.x + r * Math.cos(ang),
      y: p.y + r * Math.sin(ang),
    })

    /** Ponte metaball entre dois círculos (bezier de tangentes). */
    function ponte(c1: Blob, c2: Blob, handle = 2.4) {
      const HALF = Math.PI / 2
      const r1 = c1.r
      const r2 = c2.r
      const d = dist(c1, c2)
      const maxD = (r1 + r2) * 2.35
      if (d > maxD || d <= Math.abs(r1 - r2) || d === 0) return

      let v = (maxD - d) / (maxD - (r1 + r2))
      v = Math.max(0, Math.min(1, v))
      v = Math.pow(v, 0.6) * 0.55

      let u1 = 0
      let u2 = 0
      if (d < r1 + r2) {
        u1 = Math.acos(Math.max(-1, Math.min(1, (r1 * r1 + d * d - r2 * r2) / (2 * r1 * d))))
        u2 = Math.acos(Math.max(-1, Math.min(1, (r2 * r2 + d * d - r1 * r1) / (2 * r2 * d))))
      }

      const base = Math.atan2(c2.y - c1.y, c2.x - c1.x)
      const spread = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / d)))

      const a1 = base + u1 + (spread - u1) * v
      const a2 = base - u1 - (spread - u1) * v
      const a3 = base + Math.PI - u2 - (Math.PI - u2 - spread) * v
      const a4 = base - Math.PI + u2 + (Math.PI - u2 - spread) * v

      const p1 = vetor(c1, a1, r1)
      const p2 = vetor(c1, a2, r1)
      const p3 = vetor(c2, a3, r2)
      const p4 = vetor(c2, a4, r2)

      const total = r1 + r2
      let d2 = Math.min(v * handle, dist(p1, p3) / total)
      d2 *= Math.min(1, (d * 2) / total)

      const h1 = vetor(p1, a1 - HALF, r1 * d2)
      const h2 = vetor(p2, a2 + HALF, r1 * d2)
      const h3 = vetor(p3, a3 + HALF, r2 * d2)
      const h4 = vetor(p4, a4 - HALF, r2 * d2)

      ctx!.beginPath()
      ctx!.moveTo(p1.x, p1.y)
      ctx!.bezierCurveTo(h1.x, h1.y, h3.x, h3.y, p3.x, p3.y)
      ctx!.lineTo(p4.x, p4.y)
      ctx!.bezierCurveTo(h4.x, h4.y, h2.x, h2.y, p2.x, p2.y)
      ctx!.closePath()
      ctx!.fill()
    }

    function quadro() {
      t += 0.0042
      ctx!.clearRect(0, 0, W, H)
      ctx!.fillStyle = grad

      // deriva
      for (const b of blobs) {
        b.x = b.ox + Math.cos(t * b.v * 6 + b.a) * b.ax
        b.y = b.oy + Math.sin(t * b.v * 5 + b.a * 1.7) * b.ay
      }

      // a primeira bolha é atraída pelo cursor
      if (mouse.ativo && blobs[0]) {
        const g = blobs[0]
        g.ox += (mouse.x - g.ox) * 0.055
        g.oy += (mouse.y - g.oy) * 0.055
      }

      // pontes primeiro, depois os círculos por cima
      for (let i = 0; i < blobs.length; i++) {
        for (let j = i + 1; j < blobs.length; j++) ponte(blobs[i], blobs[j])
      }
      for (const b of blobs) {
        ctx!.beginPath()
        ctx!.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx!.fill()
      }

      raf = requestAnimationFrame(quadro)
    }

    function iniciar() {
      dimensionar()
      semear()
      cancelAnimationFrame(raf)
      quadro()
    }

    function aoRedimensionar() {
      clearTimeout(tempoRedimensionar)
      tempoRedimensionar = setTimeout(iniciar, 200)
    }

    function aoMover(e: PointerEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.ativo = true
    }

    // pausa quando a aba não está visível — economia de bateria
    function aoTrocarVisibilidade() {
      if (document.hidden) cancelAnimationFrame(raf)
      else quadro()
    }

    window.addEventListener('resize', aoRedimensionar)
    if (!toque) window.addEventListener('pointermove', aoMover, { passive: true })
    document.addEventListener('visibilitychange', aoTrocarVisibilidade)

    iniciar()

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(tempoRedimensionar)
      window.removeEventListener('resize', aoRedimensionar)
      window.removeEventListener('pointermove', aoMover)
      document.removeEventListener('visibilitychange', aoTrocarVisibilidade)
    }
  }, [])

  return <canvas id="field" ref={ref} aria-hidden="true" />
}
