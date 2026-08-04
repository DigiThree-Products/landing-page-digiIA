import Image from 'next/image'
import { LANDING } from '@/content/landing'

export function Nav() {
  return (
    <nav className="nav">
      <a className="brand" href="#cadastro" aria-label="Digi.IA — ir para o cadastro">
        {/* `priority` porque é o elemento mais visível acima da dobra: entra na
            fila de carregamento junto com o documento, sem esperar o parser. */}
        <Image
          className="logo"
          src="/assets/logo.png"
          alt="Digi.IA"
          width={427}
          height={149}
          priority
        />
      </a>
      <span className="by">{LANDING.nav.byline}</span>
    </nav>
  )
}
