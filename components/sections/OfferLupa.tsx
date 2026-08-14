'use client'

import { useEffect, useRef } from 'react'

/**
 * A lupa do CTA, valendo a seção inteira.
 *
 * Ela já existia, mas presa à caixa do título (`OfferCursorReveal`): fora
 * daqueles ~600px não existia. Aqui o disco percorre a seção toda.
 *
 * CHEGOU A TER UM CAMPO DE ESCRITAS ATRÁS — 60 cópias de "garanta sua
 * vaga" espalhadas, invisíveis até o disco passar por cima. Foi retirado a
 * pedido: a repetição da frase no fundo não agradou. O que sobrou é o
 * vidro sozinho, e ele não fica sem função: sobre o título continua
 * revelando o texto alternativo, que é a revelação original e independe
 * deste componente.
 *
 * Se um dia voltar a existir algo para revelar, o lugar é aqui dentro, e a
 * exigência é que as posições sejam DETERMINÍSTICAS — servidor e cliente
 * precisam gerar a mesma marcação, e um `Math.random` quebraria a
 * hidratação de um jeito que só aparece em produção.
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
