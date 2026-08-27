import { RetratoQueOlha } from '@/components/ui/RetratoQueOlha'

/**
 * PÁGINA TEMPORÁRIA — APAGAR ANTES DO PR.
 *
 * Existe por um motivo prático: na landing o retrato vive a 200×256 dentro de
 * uma estação PRESA, lá pelo meio da página. Para julgar se o olhar acompanha
 * bem o cursor é preciso vê-lo grande, parado e sozinho — rolar até a seção,
 * esperar a estação chegar e mirar num quadrado pequeno atrapalha o
 * julgamento do efeito em vez de ajudar.
 *
 * Aqui ele fica isolado em `/olhar`. A marcação repete a da seção real
 * (`.page` → `#como-funciona` → `.cf-anim`) de propósito: assim o componente
 * roda com o CSS DE PRODUÇÃO, e não com um estilo paralelo que poderia
 * esconder um defeito ou inventar um que não existe. O único desvio é o
 * tamanho da célula, ampliado para o rosto ficar legível.
 *
 * Nada na landing importa este arquivo. Apagar a pasta `app/olhar/` remove a
 * rota inteira e não deixa rastro.
 */
export default function Olhar() {
  return (
    <div className="page">
      <section id="como-funciona">
        <div className="estacao-palco">
          <div className="cf">
            <div className="cf-head">
              <p className="tag">Teste</p>
              <h2>Mexa o mouse pela tela.</h2>
              <p className="cf-head__sub">
                Ela acompanha o cursor nas oito direções. Leve o ponteiro aos
                cantos para ver as diagonais e às bordas para os extremos —
                perfil fechado nos lados, queixo alto em cima, olhar baixo
                embaixo.
              </p>
            </div>

            <div className="cf-miolo cf-miolo--teste">
              <div className="cf-anim cf-anim--teste">
                <RetratoQueOlha />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
