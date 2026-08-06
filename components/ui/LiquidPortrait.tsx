'use client'

import { useEffect, useRef, useState } from 'react'

const TEXTURE_SRC = '/assets/digi-ia-liquid.webp'
const N_ONDAS = 3

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float uTime, uAspect, uAgora, uPerto;
uniform vec3  uOndas[3];
uniform vec2  uCursor;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // respiração do material, sempre ligada
  uv.x += sin(uv.y * 21.0 + uTime * 0.7) * 0.0016;
  uv.y += cos(uv.x * 17.0 + uTime * 0.5) * 0.0016;

  // o líquido cede de leve sob o cursor, mesmo sem clique
  vec2 dc = (uv - uCursor) * vec2(uAspect, 1.0);
  float perto = exp(-dot(dc, dc) * 90.0) * uPerto;
  uv += normalize(dc + vec2(1e-6)) * perto * 0.007;

  // ondas circulares dos toques
  for (int i = 0; i < 3; i++) {
    float t = uAgora - uOndas[i].z;
    if (uOndas[i].z > 0.0 && t < 3.5) {
      vec2 d = (uv - uOndas[i].xy) * vec2(uAspect, 1.0);
      float dist = length(d);
      float wave = sin(dist * 34.0 - t * 6.5);
      float env  = exp(-dist * 4.0) * exp(-t * 1.5);
      uv += normalize(d + vec2(1e-6)) * wave * env * 0.026;
    }
  }

  // textura vem pré-multiplicada: sai direto, sem franja branca na silhueta
  gl_FragColor = texture2D(uTex, clamp(uv, 0.0, 1.0));
}`

/**
 * O retrato líquido.
 *
 * Um shader WebGL: o rosto ondula sob o cursor e ganha ondas circulares a
 * cada toque. A textura carrega como arquivo separado (`TEXTURE_SRC`), não
 * embutida em base64 no bundle — o navegador baixa e cacheia como qualquer
 * imagem, em vez de inflar o JavaScript da página inteira.
 *
 * Sem WebGL (navegador antigo, contexto bloqueado), cai para a mesma
 * textura como `<img>` estática — nunca um buraco em branco.
 */
export function LiquidPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [suportado, setSuportado] = useState(true)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return

    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
    if (!gl) {
      setSuportado(false)
      return
    }

    let vivo = true
    let quadroId = 0

    const compilar = (tipo: number, fonte: string) => {
      const sh = gl.createShader(tipo)
      if (!sh) return sh
      gl.shaderSource(sh, fonte)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh))
      }
      return sh
    }

    const prog = gl.createProgram()
    const vs = compilar(gl.VERTEX_SHADER, VERT)
    const fs = compilar(gl.FRAGMENT_SHADER, FRAG)
    if (!prog || !vs || !fs) {
      setSuportado(false)
      return
    }
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = (n: string) => gl.getUniformLocation(prog, n)
    const uTime = u('uTime')
    const uAspect = u('uAspect')
    const uAgora = u('uAgora')
    const uOndas = u('uOndas[0]')
    const uCursor = u('uCursor')
    const uPerto = u('uPerto')

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    let pronto = false

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const l = cv.clientWidth
      const a = cv.clientHeight
      if (!l || !a) return
      cv.width = Math.round(l * dpr)
      cv.height = Math.round(a * dpr)
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform1f(uAspect, cv.width / cv.height)
    }

    const img = new Image()
    img.onload = () => {
      if (!vivo) return
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      pronto = true
      ajustar()
    }
    img.src = TEXTURE_SRC

    const ro = new ResizeObserver(ajustar)
    ro.observe(cv)

    const ondas = new Float32Array(N_ONDAS * 3)
    let prox = 0
    let cursor: [number, number] = [0.5, 0.5]
    let alvoPerto = 0
    let perto = 0
    const lento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    gl.clearColor(0, 0, 0, 0)

    const quadro = (agora: number) => {
      quadroId = requestAnimationFrame(quadro)
      if (!pronto) return
      const t = (agora - t0) / 1000
      perto += (alvoPerto - perto) * 0.12
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTime, lento ? 0 : t)
      gl.uniform1f(uAgora, lento ? -99 : t)
      gl.uniform3fv(uOndas, ondas)
      gl.uniform2f(uCursor, cursor[0], cursor[1])
      gl.uniform1f(uPerto, lento ? 0 : perto)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    quadroId = requestAnimationFrame(quadro)

    const uv = (ev: PointerEvent): [number, number] => {
      const r = cv.getBoundingClientRect()
      return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height]
    }
    const onda = (x: number, y: number) => {
      const i = prox % N_ONDAS
      ondas[i * 3] = x
      ondas[i * 3 + 1] = y
      ondas[i * 3 + 2] = (performance.now() - t0) / 1000
      prox++
    }

    const aoDescer = (ev: PointerEvent) => {
      const p = uv(ev)
      cursor = p
      onda(p[0], p[1])
    }
    const aoMover = (ev: PointerEvent) => {
      cursor = uv(ev)
      alvoPerto = 1
    }
    const aoSair = () => {
      alvoPerto = 0
    }
    const aoTeclar = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault()
        onda(0.5, 0.5)
      }
    }

    cv.addEventListener('pointerdown', aoDescer)
    cv.addEventListener('pointermove', aoMover)
    cv.addEventListener('pointerleave', aoSair)
    cv.addEventListener('keydown', aoTeclar)

    return () => {
      vivo = false
      cancelAnimationFrame(quadroId)
      ro.disconnect()
      cv.removeEventListener('pointerdown', aoDescer)
      cv.removeEventListener('pointermove', aoMover)
      cv.removeEventListener('pointerleave', aoSair)
      cv.removeEventListener('keydown', aoTeclar)
    }
  }, [])

  if (!suportado) {
    return <img className="liquid-portrait__fallback" src={TEXTURE_SRC} alt="" />
  }

  return (
    <canvas
      ref={canvasRef}
      className="liquid-portrait"
      role="img"
      aria-label="Rosto da Digi.IA em material líquido: toque para ondular a superfície"
      tabIndex={0}
    />
  )
}
