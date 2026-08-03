import type { NextConfig } from 'next'

/**
 * Export estático.
 *
 * A landing não tem nada que precise de servidor: sem banco no servidor, sem
 * sessão, sem rota dinâmica. O cadastro vai direto do navegador para o Supabase
 * com a chave publicável (ver lib/config.ts).
 *
 * O que se ganha ao declarar isso explicitamente:
 *
 * 1. O build gera HTML de verdade em `out/`, e o verificar.mjs passa a conferir
 *    o que realmente vai ao ar — não o código-fonte. É mais garantia do que
 *    havia antes de existir build.
 * 2. Não há runtime para falhar em produção. Se o build passa, o site sobe.
 * 3. O deploy continua sendo entrega de arquivo estático, como era.
 *
 * Se um dia precisar de Server Action ou rota de API (por exemplo, mover o
 * cadastro para o servidor), basta remover a linha `output` — o resto do
 * projeto não muda.
 */
const nextConfig: NextConfig = {
  output: 'export',

  // Sem servidor não há otimizador de imagem em runtime. São dois PNGs de
  // ~5 KB já no tamanho certo, então não há o que otimizar de qualquer forma.
  images: { unoptimized: true },

  // Espelha o trailingSlash que estava no vercel.json.
  trailingSlash: false,
}

export default nextConfig
