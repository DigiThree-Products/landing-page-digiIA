import { PUBLIC_ENV, urlPublica } from './env'
import { SITE } from './site'

const supabaseUrl = urlPublica(
  'NEXT_PUBLIC_SUPABASE_URL',
  PUBLIC_ENV.supabaseUrl || 'https://serhbkigjqicuckjnudl.supabase.co',
)

/** Integrações operacionais que podem mudar sem editar componentes. */
export const PRODUCT_CONFIG = {
  launchAt: SITE.lancamento.iso,
  supabase: {
    url: supabaseUrl,
    anonKey:
      PUBLIC_ENV.supabaseAnonKey || 'sb_publishable_p39g0lkc5xEZnTfbk6sz8Q_Do0onvfR',
  },
  checkoutUrl: PUBLIC_ENV.kiwifyCheckout,
  analytics: {
    ga4Id: PUBLIC_ENV.ga4Id,
    metaPixelId: PUBLIC_ENV.metaPixelId,
  },
} as const

export function cadastroConfigurado(): boolean {
  return Boolean(PRODUCT_CONFIG.supabase.url && PRODUCT_CONFIG.supabase.anonKey)
}
