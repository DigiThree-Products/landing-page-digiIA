'use client'

import Script from 'next/script'
import { PRODUCT_CONFIG } from '@/config/product'

export function Analytics() {
  const { ga4Id, metaPixelId } = PRODUCT_CONFIG.analytics
  if (!ga4Id && !metaPixelId) return null
  return <>
    {ga4Id ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`} strategy="afterInteractive" /><Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(ga4Id)});`}</Script></> : null}
    {metaPixelId ? <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(metaPixelId)});fbq('track','PageView');`}</Script> : null}
  </>
}

declare global { interface Window { gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void } }
export function marcarConversao(): void { if (typeof window !== 'undefined') { window.gtag?.('event', 'waitlist_signup', { value: 1 }); window.fbq?.('track', 'Lead') } }
