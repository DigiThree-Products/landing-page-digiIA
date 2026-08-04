import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="foot-top">
        <div>
          <Image
            className="logo-foot"
            src="/assets/logo.png"
            alt="Digi.IA"
            width={427}
            height={149}
            loading="lazy"
          />
          <p className="foot-sig">Onde as ideias ganham vida.</p>
        </div>
        <div className="foot-links">
          <a href="/privacidade">Política de privacidade</a>
          <a href="/termos">Termos de uso</a>
          <a href="mailto:contato.digi.ia@gmail.com">Contato</a>
          <a href="https://instagram.com/digi.ia" target="_blank" rel="noopener">
            Instagram
          </a>
        </div>
      </div>
      <div className="foot-bot">
        <span>© 2026 DigiThree</span>
        <span>Digi.IA · lançamento 14.09</span>
      </div>
    </footer>
  )
}
