/** Pequena celebração nas cores da marca — curta, sem exagero. */
export function confete(alvo: HTMLElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const r = alvo.getBoundingClientRect()
  const cv = document.createElement('canvas')
  Object.assign(cv.style, {
    position: 'fixed',
    left: `${r.left}px`,
    top: `${r.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    pointerEvents: 'none',
    zIndex: '60',
  })
  cv.width = r.width
  cv.height = r.height
  document.body.appendChild(cv)

  const c = cv.getContext('2d')
  if (!c) {
    cv.remove()
    return
  }

  const cores = ['#4500F9', '#CD82FF', '#F8F0FF', '#8E47FB']
  const ps = Array.from({ length: 46 }, () => ({
    x: r.width / 2 + (Math.random() - 0.5) * 160,
    y: r.height * 0.35,
    vx: (Math.random() - 0.5) * 5,
    vy: -(2 + Math.random() * 6),
    s: 3 + Math.random() * 4,
    cor: cores[Math.floor(Math.random() * cores.length)],
    a: 1,
  }))

  const anima = () => {
    c.clearRect(0, 0, cv.width, cv.height)
    let vivos = 0
    for (const p of ps) {
      p.vy += 0.18
      p.x += p.vx
      p.y += p.vy
      p.a -= 0.012
      if (p.a <= 0) continue
      vivos++
      c.globalAlpha = Math.max(0, p.a)
      c.fillStyle = p.cor
      c.fillRect(p.x, p.y, p.s, p.s)
    }
    if (vivos) requestAnimationFrame(anima)
    else cv.remove()
  }

  anima()
}
