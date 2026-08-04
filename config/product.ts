import { PUBLIC_ENV, urlPublica } from './env'
import { SITE } from './site'

export type TipoVideo = 'youtube' | 'vimeo' | 'arquivo'

function tipoVideo(valor: string): TipoVideo {
  if (!valor) return 'youtube'
  if (valor === 'youtube' || valor === 'vimeo' || valor === 'arquivo') return valor
  throw new Error('NEXT_PUBLIC_VIDEO_TYPE deve ser youtube, vimeo ou arquivo.')
}

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
  video: {
    type: tipoVideo(PUBLIC_ENV.videoType),
    id: PUBLIC_ENV.videoId,
    poster: PUBLIC_ENV.videoPoster,
    duration: '2 min',
  },
} as const

export function cadastroConfigurado(): boolean {
  return Boolean(PRODUCT_CONFIG.supabase.url && PRODUCT_CONFIG.supabase.anonKey)
}
