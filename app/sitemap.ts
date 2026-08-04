import type { MetadataRoute } from 'next'
import { absoluta } from '@/config/site'
import { LEGAL } from '@/content/legal'

/**
 * Três páginas: a landing e os dois documentos legais.
 *
 * `lastModified` é fixo de propósito. Usar a data do build faria toda página
 * parecer atualizada a cada deploy, mesmo sem uma palavra ter mudado — data
 * mentida não ajuda ranqueamento e atrapalha o diagnóstico depois. Atualizar à
 * mão quando o conteúdo mudar de verdade.
 */
/** Exigido pelo `output: 'export'`: sem isto o Next trata a rota como dinâmica. */
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluta('/'),
      lastModified: LEGAL.updatedAt,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluta('/privacidade'),
      lastModified: LEGAL.updatedAt,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluta('/termos'),
      lastModified: LEGAL.updatedAt,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
