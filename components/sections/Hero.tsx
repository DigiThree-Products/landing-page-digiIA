import { WaitlistForm } from '@/components/waitlist/WaitlistForm'
import { Countdown } from '@/components/waitlist/Countdown'
import { HeroObject } from '@/components/sections/HeroObject'
import { LANDING } from '@/content/landing'

export function Hero() {
  return (
    <header className="hero" id="cadastro">
      <div className="hero-grid">
        <div className="hero-col stagger">
          <p className="tag">{LANDING.hero.eyebrow}</p>

          <h1>
            {LANDING.hero.title} <span className="glow">{LANDING.hero.highlight}</span>
          </h1>

          <p className="sub">
            {LANDING.hero.description} <span className="offer">{LANDING.hero.offer}</span>
          </p>

          <WaitlistForm variante="completo" />

          <div className="meter">
            <div>
              <p className="tag" style={{ marginBottom: 14 }}>
                {LANDING.hero.countdownLabel}
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
