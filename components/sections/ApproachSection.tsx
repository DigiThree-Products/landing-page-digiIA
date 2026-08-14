import { LANDING } from '@/content/landing'

/**
 * "Veja funcionando".
 *
 * Sem animação de entrada própria: quem revela esta seção é a chegada
 * dela. Ela é uma estação, e components/layout/Estacoes.tsx a traz de
 * longe subindo e crescendo — no mesmo sentido em que os grãos da poeira
 * atravessam a tela.
 *
 * O que havia aqui — stagger do texto em `top 70%`, mídia subindo em
 * `top 78%` — era medido pelo topo da seção contra a viewport, e esse
 * topo cruza os dois marcos cerca de 0,7 tela ANTES de o pin da estação
 * engatar. As animações rodavam inteiras enquanto o painel ainda era um
 * ponto a 24% de tamanho e 10% de opacidade: terminavam sem que ninguém
 * as visse, e o conteúdo chegava à janela de leitura já parado.
 *
 * Somar uma segunda revelação por cima da chegada também briga com ela
 * por natureza — são dois relógios para o mesmo conteúdo. A viagem é uma
 * só, e é ela que revela.
 */
export function ApproachSection() {
  return (
    <section id="video" className="approach estacao" aria-labelledby="approach-title">
      <div className="approach-stage estacao-palco">
        <div className="approach-layout">
          <div className="approach-media" role="img" aria-label="Espaço reservado para o vídeo de demonstração da Digi.IA">
            <div className="approach-media__surface">
              <div className="approach-media__chrome" aria-hidden="true">
                <span className="approach-media__dots"><i /><i /><i /></span>
                <span className="approach-media__time">00:00</span>
                <span className="approach-media__play">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M9 7.6v8.8L16 12 9 7.6Z" />
                  </svg>
                </span>
                <span className="approach-media__progress"><i /></span>
              </div>
            </div>
          </div>

          <div className="approach-copy">
            <p className="tag approach-kicker">{LANDING.video.eyebrow}</p>
            <h2 className="approach-title" id="approach-title">
              <span className="approach-title__line">{LANDING.video.title}</span>
              <span className="approach-title__line">{LANDING.video.titleLineTwo}</span>
              <span className="approach-title__line">
                <em className="approach-title__accent">{LANDING.video.titleAccent}</em>
              </span>
            </h2>
            <p className="approach-description">{LANDING.video.description}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
