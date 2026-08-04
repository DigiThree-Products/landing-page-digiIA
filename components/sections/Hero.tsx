import { WaitlistForm } from '@/components/waitlist/WaitlistForm'
import { Countdown } from '@/components/waitlist/Countdown'
import { HeroObject } from '@/components/sections/HeroObject'

export function Hero() {
  return (
    <header className="hero" id="cadastro">
      <div className="hero-grid">
        <div className="hero-col stagger">
          <p className="tag">Lançamento &nbsp;•&nbsp; 14 de setembro</p>

          <h1>
            Conteúdo e campanhas prontos <span className="glow">antes do café esfriar.</span>
          </h1>

          <p className="sub">
            A Digi.IA escreve posts, monta calendário editorial e gera campanhas inteiras já
            falando com a voz da sua marca. Entre na lista antes do lançamento e{' '}
            <span className="offer">você recebe o preço antes de todo mundo</span>.
          </p>

          <WaitlistForm variante="completo" />

          <div className="meter">
            <div>
              <p className="tag" style={{ marginBottom: 14 }}>
                Faltam
              </p>
              <Countdown />
            </div>
            {/* Aqui havia "1.247 de 2.000 vagas" com barra de progresso. O número
                era fixo no código e não vinha de base nenhuma. O próprio plano de
                lançamento manda o contrário: "escassez real, a turma é limitada
                pela capacidade de onboarding — não é escassez inventada". Quando
                houver contagem verdadeira, ela entra aqui. */}
          </div>
        </div>

        <HeroObject />
      </div>
    </header>
  )
}
