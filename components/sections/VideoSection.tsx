'use client'

import Image from 'next/image'
import { useState } from 'react'
import { PRODUCT_CONFIG } from '@/config/product'
import { LANDING } from '@/content/landing'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Vídeo em fachada.
 *
 * O iframe do YouTube custa centenas de KB e vários pedidos a terceiros. Ele só
 * entra depois do clique — até lá a seção é uma capa e um botão.
 */
export function VideoSection() {
  const V = PRODUCT_CONFIG.video
  const [tocando, setTocando] = useState(false)
  const [aviso, setAviso] = useState('')

  const temCapa = Boolean(V.poster)

  function tocar() {
    if (!V.id) {
      setAviso('Vídeo indisponível no momento.')
      console.warn('[Digi.IA] NEXT_PUBLIC_VIDEO_ID está vazio.')
      return
    }
    setTocando(true)
  }

  const src =
    V.type === 'vimeo'
      ? `https://player.vimeo.com/video/${V.id}?autoplay=1`
      : `https://www.youtube-nocookie.com/embed/${V.id}?autoplay=1&rel=0&modestbranding=1`

  return (
    <section id="video">
      <Reveal>
        <div className="sec-head">
          <p className="tag">{LANDING.video.eyebrow}</p>
          <h2>{LANDING.video.title}</h2>
          <p>{LANDING.video.description}</p>
        </div>
      </Reveal>

      <Reveal className="player">
        {tocando ? (
          V.type === 'arquivo' ? (
            <video className="frame" src={V.id} controls autoPlay playsInline poster={V.poster} />
          ) : (
            <iframe
              className="frame"
              src={src}
              title="Demonstração da Digi.IA"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          )
        ) : (
          <button
            className="facade"
            type="button"
            onClick={tocar}
            aria-label="Reproduzir o vídeo de demonstração da Digi.IA"
          >
            <span
              className={`poster${temCapa ? '' : ' marca'}`}
              style={temCapa ? { backgroundImage: `url("${V.poster}")` } : undefined}
              aria-hidden="true"
            />
            {/* Símbolo da marca na capa provisória — sai quando houver capa real */}
            {temCapa ? null : (
              <Image
                className="poster-mark"
                src="/assets/simbolo.png"
                alt=""
                aria-hidden="true"
                width={320}
                height={228}
                loading="lazy"
              />
            )}
            <span className="play" aria-hidden="true">
              <svg
                width="26"
                height="28"
                viewBox="0 0 26 28"
                fill="#F8F0FF"
                style={{ marginLeft: 4 }}
              >
                <path d="M25 12.27a2 2 0 0 1 0 3.46L3 27.5A2 2 0 0 1 0 25.77V2.23A2 2 0 0 1 3 .5l22 11.77Z" />
              </svg>
            </span>
            <span className="dur">{V.duration}</span>
            <span className="hint">{aviso}</span>
          </button>
        )}
      </Reveal>

      <Reveal>
        <p className="vcap">
          <span>{LANDING.video.caption}</span>
          <a className="ghost" href="#cadastro">
            {LANDING.video.cta}
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
            </svg>
          </a>
        </p>
      </Reveal>
    </section>
  )
}
