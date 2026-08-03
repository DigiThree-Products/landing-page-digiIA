import type { Metadata, Viewport } from 'next'
import { Sora, Instrument_Sans, DM_Mono } from 'next/font/google'
import { SITE, dadosEstruturados } from '@/lib/site'
import { Analytics } from '@/components/layout/Analytics'
import './globals.css'

/**
 * Fontes auto-hospedadas.
 *
 * Antes vinham de um <link> para fonts.googleapis.com, o que custava duas
 * conexões extras antes da primeira pintura e trazia salto de layout quando a
 * fonte trocava. O next/font baixa no build, serve do próprio domínio e injeta
 * o @font-face com `display: swap` e métricas de fallback ajustadas.
 *
 * As variáveis abaixo são consumidas pelo @theme do globals.css, que as
 * transforma em `font-display`, `font-body` e `font-mono`.
 */
const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
})

const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-instrument',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

/**
 * As URLs sociais precisam ser absolutas: os crawlers do WhatsApp, da Meta e do
 * LinkedIn não resolvem caminho relativo — com caminho relativo o preview sai
 * sem imagem mesmo que o arquivo exista. O `metadataBase` faz o Next resolver
 * isso sozinho para todas as rotas.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.titulo,
  description: SITE.descricao,
  alternates: { canonical: '/' },
  icons: { icon: '/assets/simbolo.png' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    title: SITE.og.titulo,
    description: SITE.og.descricao,
    images: [
      {
        url: SITE.og.imagem,
        width: SITE.og.largura,
        height: SITE.og.altura,
        alt: SITE.og.imagemAlt,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [SITE.og.imagem],
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${instrument.variable} ${dmMono.variable}`}>
      <head>
        {/* O logo do topo é a primeira coisa visível. O preload faz o download
            começar junto com a leitura do <head>, e não só quando o parser
            chegar na linha do <img>. */}
        <link rel="preload" as="image" href="/assets/logo.png" />
        <script
          type="application/ld+json"
          // Conteúdo gerado por nós a partir de constantes — não há entrada de
          // usuário neste JSON.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados()) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
