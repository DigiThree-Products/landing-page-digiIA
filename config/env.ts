/**
 * Variáveis públicas lidas em um único lugar.
 *
 * As referências são estáticas de propósito. O Next.js só embute variáveis
 * `NEXT_PUBLIC_*` no bundle do navegador quando consegue enxergar o nome
 * completo durante o build; `process.env[chave]` deixaria a configuração vazia.
 */
const limpar = (valor: string | undefined): string => valor?.trim() ?? ''

export const PUBLIC_ENV = {
  siteUrl: limpar(process.env.NEXT_PUBLIC_SITE_URL),
  supabaseUrl: limpar(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: limpar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  kiwifyCheckout: limpar(process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT),
  ga4Id: limpar(process.env.NEXT_PUBLIC_GA4_ID),
  metaPixelId: limpar(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  videoType: limpar(process.env.NEXT_PUBLIC_VIDEO_TYPE),
  videoId: limpar(process.env.NEXT_PUBLIC_VIDEO_ID),
  videoPoster: limpar(process.env.NEXT_PUBLIC_VIDEO_POSTER),
  legalName: limpar(process.env.NEXT_PUBLIC_LEGAL_NAME),
  legalCnpj: limpar(process.env.NEXT_PUBLIC_LEGAL_CNPJ),
  legalEmail: limpar(process.env.NEXT_PUBLIC_LEGAL_EMAIL),
  legalCityState: limpar(process.env.NEXT_PUBLIC_LEGAL_CITY_STATE),
} as const

/** Valida e normaliza uma URL pública durante o build. */
export function urlPublica(nome: string, valor: string): string {
  let url: URL
  try {
    url = new URL(valor)
  } catch {
    throw new Error(`${nome} precisa ser uma URL absoluta válida.`)
  }

  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (url.protocol !== 'https:' && !local) {
    throw new Error(`${nome} precisa usar HTTPS fora do ambiente local.`)
  }

  return url.toString().replace(/\/+$/, '')
}
