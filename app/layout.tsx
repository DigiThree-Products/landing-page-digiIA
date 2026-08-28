import type { Metadata, Viewport } from 'next'
import { SITE, dadosEstruturados } from '@/config/site'
import { AncoraSuave } from '@/components/layout/AncoraSuave'
import { RolagemSuave } from '@/components/layout/RolagemSuave'
import { Analytics } from '@/components/layout/Analytics'
import '@fontsource-variable/sora'
import '@fontsource-variable/instrument-sans'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import './globals.css'

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
    <html lang="pt-BR">
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
        {/* Antes da âncora de propósito: `AncoraSuave` procura a instância
            do Lenis para saltar, e quem a cria é este.

            MAS NÃO ANTES DE `{children}`, e isso não é ajustável pela
            ordem no JSX: os efeitos do React correm de dentro para fora,
            então tudo que está na página monta antes daqui. Hoje é
            inofensivo — ninguém lá dentro pede a rolagem, e o
            ScrollTrigger não precisa dela para nascer. No dia em que
            precisar, vai receber `null`, e o sintoma será silêncio e não
            erro. Quem precisar da instância dentro da página tem de
            esperá-la, não assumi-la. */}
        <RolagemSuave />
        <AncoraSuave />
        <Analytics />
      </body>
    </html>
  )
}
