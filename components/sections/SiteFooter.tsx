import Image from 'next/image'
import { LANDING } from '@/content/landing'
import { SITE } from '@/config/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="foot-top">
        <div><Image className="logo-foot" src="/assets/logo.png" alt="Digi.IA" width={427} height={149} loading="lazy" /><p className="foot-sig">{LANDING.footer.signature}</p></div>
        <div className="foot-links">
          <a href="/privacidade">Política de privacidade</a><a href="/termos">Termos de uso</a>
          <a href={`mailto:${SITE.contato.email}`}>Contato</a><a href={SITE.contato.instagram} target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <div className="foot-bot"><span>{LANDING.footer.copyright}</span><span>{LANDING.footer.launch}</span></div>
    </footer>
  )
}
