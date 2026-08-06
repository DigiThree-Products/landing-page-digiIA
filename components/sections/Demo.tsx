'use client'

import { useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/ui/Reveal'
import { LANDING, type DemoScene } from '@/content/landing'

const espera = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const CENAS = LANDING.demo.scenes
const PRIMEIRA = CENAS[0]

/**
 * Como funciona.
 *
 * Duas colunas: todo o conteúdo — cabeçalho e janela da demonstração — à
 * direita, e a coluna da esquerda vazia, reservada. Ela existe no layout para
 * que o componente que vai morar ali entre sem remexer no grid; enquanto não
 * chega, a seção fica com a metade esquerda em branco de propósito.
 *
 * A janela nasce com a primeira cena JÁ na tela, não vazia. Antes o estado
 * inicial era vazio e a animação dependia de um IntersectionObserver sobre o
 * `.out` com threshold 0.3 — que não disparava em produção, deixando 500px de
 * caixa preta no ar. Agora, se o gatilho falhar, o pior caso é uma cena
 * estática: feia, mas com conteúdo. Nunca um buraco.
 *
 * O gatilho também ficou mais robusto: observa a seção inteira (alvo grande,
 * sempre presente no layout) em vez de um filho que começa sem conteúdo, e há
 * um temporizador de reserva caso o observer não dispare.
 */
export function Demo() {
  const [digitado, setDigitado] = useState(PRIMEIRA.prompt)
  const [cena, setCena] = useState<DemoScene | null>(PRIMEIRA)
  const secao = useRef<HTMLElement>(null)

  useEffect(() => {
    // Com movimento reduzido a demo fica na primeira cena, parada.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let vivo = true
    let comecou = false

    const ciclo = async () => {
      let indice = 0
      // A primeira cena já está na tela: segura antes de trocar.
      await espera(4600)

      while (vivo) {
        const atual = CENAS[indice]

        for (let c = atual.prompt.length; c > 0 && vivo; c--) {
          setDigitado(atual.prompt.slice(0, c - 1))
          await espera(11)
        }
        if (!vivo) return
        setCena(null)

        indice = (indice + 1) % CENAS.length
        const proxima = CENAS[indice]

        for (let c = 0; c < proxima.prompt.length && vivo; c++) {
          setDigitado(proxima.prompt.slice(0, c + 1))
          await espera(26 + Math.random() * 34)
        }
        if (!vivo) return
        await espera(420)
        setCena(proxima)
        await espera(4600)
      }
    }

    const comecar = () => {
      if (comecou) return
      comecou = true
      void ciclo()
    }

    const alvo = secao.current
    let observer: IntersectionObserver | undefined
    if (alvo && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return
        observer?.disconnect()
        comecar()
      })
      observer.observe(alvo)
    }

    // Rede de segurança: se o observer não disparar, a demo anima assim mesmo.
    const reserva = window.setTimeout(comecar, 6000)

    return () => {
      vivo = false
      observer?.disconnect()
      window.clearTimeout(reserva)
    }
  }, [])

  return (
    <section id="demo" ref={secao} aria-labelledby="demo-titulo">
      <Reveal className="demo-layout">
        {/* Espaço reservado: o componente da esquerda entra aqui. */}
        <div className="demo-lado" />

        <div className="demo-coluna">
          <div className="demo-head">
            <p className="tag">{LANDING.demo.eyebrow}</p>
            <h2 id="demo-titulo">
              <span>{LANDING.demo.title}</span>{' '}
              <span className="demo-head__accent">{LANDING.demo.titleAccent}</span>
            </h2>
            <p className="demo-head__sub">{LANDING.demo.subtitle}</p>
          </div>

          <div className="demo">
            <div className="demo-bar">
              <span className="dot live" aria-hidden="true" />
              <span>{LANDING.demo.windowLabel}</span>
            </div>
            <div className="demo-body">
              <div className="prompt-line">
                <span className="chev" aria-hidden="true">&rsaquo;</span>
                <span>
                  <span>{digitado}</span>
                  <span className="caret" aria-hidden="true" />
                </span>
              </div>
              <div className="out" aria-live="off">
                {cena ? (
                  <>
                    <p className="tag">{cena.label}</p>
                    {cena.items.map(([marca, texto], indice) => (
                      <div
                        className="out-item"
                        key={marca + texto}
                        style={{ animationDelay: `${0.22 + indice * 0.13}s` }}
                      >
                        <em>{marca}</em>
                        <span>{texto}</span>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
