/**
 * CONFIGURAÇÃO — o que muda sem mexer em componente.
 *
 * Todos os campos aceitam variável de ambiente. Os valores literais abaixo são
 * o padrão de produção, para o site não quebrar caso a variável não esteja
 * definida na Vercel.
 *
 * Sobre a chave do Supabase estar em texto no repositório público: ela é a
 * chave *publicável* (anon), feita para ficar exposta. O que protege os dados
 * é a política de RLS na tabela `leads`, que permite INSERT e nada mais — com
 * ela ninguém lê a lista. Sem essa política, esta chave leria tudo.
 *
 * Se um dia o cadastro migrar para o servidor (basta remover `output: 'export'`
 * do next.config.ts e criar uma rota), aí sim entra a service key, que é
 * secreta e nunca pode aparecer aqui.
 */

export type TipoVideo = 'youtube' | 'vimeo' | 'arquivo'

export type ConfigVideo = {
  tipo: TipoVideo
  /** ID do YouTube/Vimeo, ou caminho do .mp4 se tipo='arquivo'. */
  id: string
  /** Capa 1600×900. Vazio = capa provisória da marca. */
  poster: string
  /** Exibido no canto do player. */
  duracao: string
  legenda: string
}

const env = (chave: string, padrao = '') => process.env[chave]?.trim() || padrao

/**
 * Anotado como ConfigVideo, e não inferido: com `as const` o TypeScript
 * estreitaria `tipo` para o literal 'youtube' e passaria a apontar os ramos de
 * vimeo e arquivo como inalcançáveis — quando na verdade eles são exatamente o
 * ponto de o campo ser configurável.
 */
const VIDEO: ConfigVideo = {
  tipo: 'youtube',
  id: env('NEXT_PUBLIC_VIDEO_ID'),
  poster: '',
  duracao: '2 min',
  legenda: 'Gravado por quem construiu a ferramenta, na DigiThree.',
}

export const CONFIG = {
  /** Lançamento: 14 de setembro de 2026, conforme o plano das sete semanas. */
  DATA_LANCAMENTO: '2026-09-14T09:00:00-03:00',

  /** Destino dos cadastros: tabela `leads` no Supabase, via API REST. */
  SUPABASE_URL: env('NEXT_PUBLIC_SUPABASE_URL', 'https://serhbkigjqicuckjnudl.supabase.co'),
  SUPABASE_ANON_KEY: env(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'sb_publishable_p39g0lkc5xEZnTfbk6sz8Q_Do0onvfR',
  ),

  /**
   * Para onde a pessoa vai pagar. Vazio = o botão de checkout não aparece e a
   * página segue funcionando só como lista de espera.
   * ex.: 'https://pay.kiwify.com.br/xxxxxxx'
   */
  KIWIFY_CHECKOUT: env('NEXT_PUBLIC_KIWIFY_CHECKOUT'),

  /**
   * Medição. O plano de lançamento marca isto como a tarefa de maior retorno e
   * custo zero: sete semanas de orgânico com o pixel rodando entregam audiência
   * quente no dia 14. Vazio = nenhum script de terceiro é carregado.
   */
  GA4_ID: env('NEXT_PUBLIC_GA4_ID'), // ex.: 'G-XXXXXXXXXX'
  META_PIXEL_ID: env('NEXT_PUBLIC_META_PIXEL_ID'), // ex.: '1234567890123456'

  VIDEO,
} as const

/** O que a tabela `leads` recebe. */
export type Lead = {
  email: string
  nome: string | null
  whatsapp: string | null
  tipo_negocio: string | null
  origem: string
}

/** Há destino configurado para os cadastros? */
export function cadastroConfigurado(): boolean {
  return Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY)
}
