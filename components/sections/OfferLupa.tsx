'use client'

import { useEffect, useRef } from 'react'

/**
 * A lupa do CTA, valendo a seção inteira.
 *
 * Ela já existia, mas presa à caixa do título (`OfferCursorReveal`): fora
 * daqueles ~600px não existia. Aqui o disco percorre a seção toda.
 *
 * CHEGOU A TER UM CAMPO DE ESCRITAS ATRÁS — 60 cópias de "garanta sua
 * vaga" espalhadas pelo fundo da seção, invisíveis até o disco passar por
 * cima. Foi retirado a pedido: a repetição da frase no fundo não agradou.
 *
 * O campo voltou depois, e NÃO É AQUI. Ele vive dentro da máscara do
 * título (`ECOS`, em OfferCursorReveal.tsx), em volta da frase revelada,
 * onde o `clip-path` circular garante que nenhum eco exista fora do
 * vidro. Este componente continua sendo só o anel: o que ele faz é a
 * lupa não morrer nos limites da caixa do título.
 *
 * ANEXA-SE AO PAI EM VEZ DE ENVOLVÊ-LO, e isso é deliberado. Envolver a
 * seção num wrapper mudaria o box model de um bloco que não pode quebrar —
 * é o destino do argumento da página inteira. Como camada `absolute` com
 * `inset: 0`, este componente não entra no fluxo: a seção continua sendo o
 * mesmo grid de antes, e `.page section` já é `position: relative`
 * (institutional.css), então não é preciso nem tocar nela.
 */
export function OfferLupa() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const camada = ref.current
    const secao = camada?.parentElement
    if (!camada || !secao) return

    const seguir = (evento: PointerEvent) => {
      /* Coordenadas relativas à SEÇÃO, não à camada — são a mesma caixa,
         mas ler da seção mantém a conta certa se a camada um dia ganhar
         recuo próprio. */
      const caixa = secao.getBoundingClientRect()
      secao.style.setProperty('--lupa-x', `${evento.clientX - caixa.left}px`)
      secao.style.setProperty('--lupa-y', `${evento.clientY - caixa.top}px`)
      secao.dataset.lupa = 'true'
    }
    const sair = () => {
      secao.dataset.lupa = 'false'
    }

    secao.addEventListener('pointerenter', seguir)
    secao.addEventListener('pointermove', seguir)
    secao.addEventListener('pointerleave', sair)
    secao.addEventListener('pointercancel', sair)

    return () => {
      secao.removeEventListener('pointerenter', seguir)
      secao.removeEventListener('pointermove', seguir)
      secao.removeEventListener('pointerleave', sair)
      secao.removeEventListener('pointercancel', sair)
      delete secao.dataset.lupa
      secao.style.removeProperty('--lupa-x')
      secao.style.removeProperty('--lupa-y')
    }
  }, [])

  return (
    <div className="offer-lupa" ref={ref} aria-hidden="true">
      <span className="offer-lupa__vidro" />
    </div>
  )
}
