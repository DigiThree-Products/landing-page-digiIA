'use client'

import Script from 'next/script'
import { CONFIG } from '@/lib/config'

/**
 * GA4 e pixel da Meta.
 *
 * Carregados só quando há ID configurado — sem ID, nenhum script de terceiro
 * entra na página. Isso não é só higiene: a política de privacidade afirma,
 * hoje, que a página não carrega script de publicidade ou análise. Ligar a
 * medição sem atualizar aquele texto tornaria a política falsa.
 *
 * O plano de lançamento marca esta como a tarefa de maior retorno e custo zero:
 * sete semanas de orgânico com o pixel rodando constroem a audiência que, no
 * dia 14, torna o anúncio barato.
 */
export function Analytics() {
  const { GA4_ID, META_PIXEL_ID } = CONFIG

  if (!GA4_ID && !META_PIXEL_ID) return null

  return (
    <>
      {GA4_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
              function gtag(){dataLayer.push(arguments)}
              window.gtag=gtag;
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(GA4_ID)});`}
          </Script>
        </>
      ) : null}

      {META_PIXEL_ID ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', ${JSON.stringify(META_PIXEL_ID)});
            fbq('track', 'PageView');`}
        </Script>
      ) : null}
    </>
  )
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

/** Dispara a conversão nos dois, se estiverem configurados. */
export function marcarConversao(): void {
  if (typeof window === 'undefined') return
  window.gtag?.('event', 'waitlist_signup', { value: 1 })
  window.fbq?.('track', 'Lead')
}
