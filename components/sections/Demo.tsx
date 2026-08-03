'use client'

import { useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/ui/Reveal'

type Cena = {
  prompt: string
  rotulo: string
  itens: [string, string][]
}

const CENAS: Cena[] = [
  {
    prompt: 'campanha de dia das mães para uma joalheria de bairro',
    rotulo: 'Campanha gerada — 3 variações',
    itens: [
      ['01', 'Headline: “Ela guardou tudo. Guarde isso para ela.”'],
      ['02', 'Headline: “Presente que não vai para a gaveta.”'],
      ['03', 'Headline: “Dez anos de loja. Milhares de mães.”'],
      ['→', 'Legenda, criativo 1080×1350 e versão para stories inclusos.'],
    ],
  },
  {
    prompt: 'calendário editorial de 30 dias para uma clínica odontológica',
    rotulo: 'Calendário gerado — abril',
    itens: [
      ['01', 'Seg — Carrossel: o que ninguém conta sobre clareamento'],
      ['02', 'Qua — Reels: bastidor de um dia na clínica'],
      ['03', 'Sex — Post: antes e depois com consentimento do paciente'],
      ['→', 'Mais 27 pautas com formato, legenda e melhor horário.'],
    ],
  },
  {
    prompt: 'qual o ROI de investir R$ 3.000 em tráfego neste lançamento?',
    rotulo: 'Projeção calculada',
    itens: [
      ['R$', 'Custo por lead estimado: R$ 4,80 — 625 leads no período'],
      ['%', 'Conversão histórica do setor: 3,2% → 20 vendas'],
      ['→', 'ROI projetado: 2,4× sobre o investimento em mídia'],
      ['→', 'Cenário conservador e cenário otimista no detalhamento.'],
    ],
  },
]

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Demonstração: o prompt é digitado, o resultado aparece, apaga e passa para a
 * próxima cena. Só começa quando a seção entra na tela — animar fora de vista
 * gasta bateria sem ninguém ver.
 */
export function Demo() {
  const [digitado, setDigitado] = useState('')
  const [cena, setCena] = useState<Cena | null>(null)
  const alvo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = alvo.current
    if (!el) return

    // Com movimento reduzido, mostra a primeira cena parada.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDigitado(CENAS[0].prompt)
      setCena(CENAS[0])
      return
    }

    let vivo = true

    const ciclo = async () => {
      let i = 0
      while (vivo) {
        const atual = CENAS[i]

        for (let c = 0; c < atual.prompt.length && vivo; c++) {
          setDigitado(atual.prompt.slice(0, c + 1))
          await espera(26 + Math.random() * 34)
        }
        if (!vivo) return

        await espera(420)
        setCena(atual)
        await espera(4600)
        if (!vivo) return

        for (let c = atual.prompt.length; c > 0 && vivo; c--) {
          setDigitado(atual.prompt.slice(0, c - 1))
          await espera(11)
        }
        setCena(null)
        i = (i + 1) % CENAS.length
      }
    }

    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          io.unobserve(entrada.target)
          void ciclo()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)

    return () => {
      vivo = false
      io.disconnect()
    }
  }, [])

  return (
    <section>
      <Reveal>
        <div className="sec-head">
          <p className="tag">Como funciona</p>
          <h2>Você pede em português. Ela entrega em minutos.</h2>
        </div>
      </Reveal>

      <Reveal className="demo">
        <div className="demo-bar">
          <span className="dot live" aria-hidden="true" />
          <span>Digi.IA — demonstração</span>
        </div>
        <div className="demo-body">
          <div className="prompt-line">
            <span className="chev" aria-hidden="true">
              &rsaquo;
            </span>
            <span>
              <span>{digitado}</span>
              <span className="caret" aria-hidden="true" />
            </span>
          </div>
          <div className="out" ref={alvo} aria-live="off">
            {cena ? (
              <>
                <p className="tag">{cena.rotulo}</p>
                {cena.itens.map(([marca, texto], i) => (
                  <div
                    className="out-item"
                    key={marca + texto}
                    style={{ animationDelay: `${0.22 + i * 0.13}s` }}
                  >
                    <em>{marca}</em>
                    <span>{texto}</span>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
