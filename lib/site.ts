/**
 * Identidade do site — um lugar só.
 *
 * Antes o domínio aparecia cravado em 13 pontos de 3 arquivos (index.html,
 * robots.txt, sitemap.xml). Trocar de domínio significava caçar ocorrência,
 * e esquecer uma deixava canonical ou sitemap apontando para fora do site.
 *
 * Agora sai daqui: metadata, robots, sitemap e JSON-LD leem esta constante.
 * Trocar de domínio é editar UMA linha — e é o principal ganho concreto de
 * ter passado a ter build.
 *
 * Pode vir de variável de ambiente para o preview da Vercel usar a própria
 * URL; sem variável, cai no domínio de produção.
 */
export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://landing-page-digi-ia.vercel.app').replace(
    /\/+$/,
    '',
  ),

  nome: 'Digi.IA',
  organizacaoMae: 'DigiThree',

  titulo: 'Digi.IA — pré-cadastro com desconto de lançamento | DigiThree',
  descricao:
    'A IA de conteúdo e marketing da DigiThree chega em 14 de setembro. Planejamento, campanhas, roteiros, custos e ROI com o método de mais de 15 anos da casa. Entre na lista e receba o preço antes de todo mundo.',

  og: {
    titulo: 'Digi.IA — onde as ideias ganham vida',
    descricao:
      'Conteúdo e campanhas prontos antes do café esfriar. Lançamento 14 de setembro. Entre na lista de espera.',
    imagem: '/og-image.png',
    imagemAlt:
      'Digi.IA — conteúdo e campanhas prontos antes do café esfriar. Lançamento em 14 de setembro.',
    largura: 1200,
    altura: 630,
  },

  /** Data do lançamento, por extenso — usada nos textos e no JSON-LD. */
  lancamento: '14 de setembro de 2026',
} as const

/** Monta URL absoluta a partir de um caminho da raiz. */
export function absoluta(caminho: string): string {
  return `${SITE.url}${caminho.startsWith('/') ? caminho : `/${caminho}`}`
}

/**
 * Dados estruturados.
 *
 * Declaram só o que é verificável hoje: nome, site e idioma. NÃO afirmam razão
 * social nem CNPJ — esses ainda são marcadores nas páginas legais, e schema.org
 * com dado inventado é pior que schema nenhum, porque o Google cruza com outras
 * fontes. Quando os dados legais entrarem, vale acrescentar `legalName` e
 * `taxID` aqui.
 */
export function dadosEstruturados() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': absoluta('/#site'),
        url: absoluta('/'),
        name: SITE.nome,
        inLanguage: 'pt-BR',
        description: `Plataforma de criação de conteúdo e marketing com IA. Lançamento em ${SITE.lancamento}.`,
      },
      {
        '@type': 'Organization',
        '@id': absoluta('/#organizacao'),
        name: SITE.nome,
        url: absoluta('/'),
        logo: absoluta('/assets/logo.png'),
        parentOrganization: { '@type': 'Organization', name: SITE.organizacaoMae },
      },
    ],
  }
}
