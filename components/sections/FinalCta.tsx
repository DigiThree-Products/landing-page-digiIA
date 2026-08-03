import { Reveal } from '@/components/ui/Reveal'
import { WaitlistForm } from '@/components/waitlist/WaitlistForm'

export function FinalCta() {
  return (
    <section>
      <Reveal className="final">
        {/* PENDENTE: "últimas vagas com desconto" não tem número real por trás.
            O plano de lançamento pede escassez verdadeira — a turma é limitada
            pela capacidade de onboarding. Trocar por esse número quando existir. */}
        <p className="tag">Últimas vagas com desconto</p>
        <h2>Entre agora e o preço fica travado.</h2>
        <p className="assin">Onde as ideias ganham vida.</p>

        <WaitlistForm variante="curto" />
      </Reveal>
    </section>
  )
}
