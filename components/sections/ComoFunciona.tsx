import { RetratoQueOlha } from '@/components/ui/RetratoQueOlha'
import { LANDING } from '@/content/landing'

const C = LANDING.comoFunciona

/**
 * Como funciona.
 *
 * A seção troca "o que a ferramenta faz" por "o que sai da sua semana", e a
 * marcação segue esse argumento: quatro blocos de texto em volta de um único
 * elemento gráfico ao centro. Sem ícone, sem ilustração e sem número
 * decorativo dentro dos blocos — o passo é dito no rótulo, em texto.
 *
 * A ORDEM DO DOM É A ORDEM DO CELULAR, e é ela que vale para leitor de tela:
 * cabeçalho → animação → 01 → 02 → 03 → 04 → convite. No desktop, quem
 * remonta em três colunas é o grid (`grid-column`/`grid-row` em
 * styles/institutional.css), não a marcação. Reordenar aqui para "arrumar" o
 * desktop quebraria a leitura no celular sem que nada avise.
 *
 * A CÉLULA CENTRAL OLHA PARA O CURSOR (RetratoQueOlha.tsx). Ela substituiu
 * o LiquidPortrait em 27/08/2026: o shader anterior ondulava o material de
 * UMA pose e não conseguia virar a cabeça, que era o que o pedido exigia.
 *
 * As poses vêm do atlas public/assets/digi-ia-olhar.webp: 55 quadros de uma
 * ÚNICA tomada contínua do vídeo de origem, do frontal ao perfil. O eixo
 * horizontal escolhe o quadro, o vertical inclina em CSS — por que assim, e
 * não com poses de cima e de baixo, está medido e documentado lá dentro.
 */
export function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo">
      <div className="estacao-palco">
        <div className="cf">
          <header className="cf-head">
            <p className="tag">{C.eyebrow}</p>
            <h2 id="como-funciona-titulo">{C.title}</h2>
            <p className="cf-head__sub">{C.subtitle}</p>
          </header>

          <div className="cf-miolo">
            {/* Primeiro no DOM porque no celular a animação vem logo depois
                do cabeçalho; no desktop o grid a joga para a coluna do meio. */}
            <div className="cf-anim">
              <RetratoQueOlha />
            </div>

            {C.blocos.map((bloco) => (
              <article className="cf-bloco" key={bloco.rotulo}>
                <p className="cf-bloco__rotulo">{bloco.rotulo}</p>
                {/* A aspa vem antes da dor: quem lê precisa se reconhecer
                    antes de aceitar o diagnóstico. */}
                <p className="cf-bloco__aspa">{bloco.aspa}</p>
                <p className="cf-bloco__dor">{bloco.dor}</p>
                <p className="cf-bloco__virada">{bloco.virada}</p>
              </article>
            ))}
          </div>

          <div className="cf-fecho">
            <a className="cf-cta" href={C.fecho.ctaHref}>
              {C.fecho.ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
