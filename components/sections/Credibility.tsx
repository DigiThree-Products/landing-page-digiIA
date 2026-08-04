import { Reveal } from '@/components/ui/Reveal'

export function Credibility() {
  return (
    <section style={{ paddingBlock: 'clamp(40px,6vh,70px)' }}>
      <Reveal className="cred">
        <div className="stat">
          <b>15+</b>
          <i>anos de mercado</i>
        </div>
        {/* PENDENTE antes de publicar: dois números reais — clientes atendidos e
            pessoas no time. Ficaram de fora em vez de ir ao ar como "[000]". */}
        <p>
          A Digi.IA nasce dentro da DigiThree — construída em cima de campanhas reais, não de
          teoria.
        </p>
      </Reveal>
    </section>
  )
}
