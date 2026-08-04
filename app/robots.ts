import type { MetadataRoute } from 'next'
import { absoluta } from '@/config/site'

/**
 * Gerado no build — antes era um robots.txt escrito à mão, com o domínio
 * cravado. Tudo é público e deve ser indexado: a página existe para ser
 * encontrada, e privacidade/termos indexados dão credibilidade a quem confere
 * antes de entregar o e-mail.
 *
 * O Disallow de og-image.html sumiu junto com o arquivo: a imagem social agora
 * é só o PNG em /og-image.png, e não existe mais uma página-fonte para indexar.
 */
/** Exigido pelo `output: 'export'`: sem isto o Next trata a rota como dinâmica. */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluta('/sitemap.xml'),
  }
}
