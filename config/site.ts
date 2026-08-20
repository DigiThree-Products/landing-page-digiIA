import { PUBLIC_ENV, urlPublica } from './env'

const SITE_URL_PADRAO = 'https://landing-page-digi-ia.vercel.app'

/** Identidade, endereço e datas compartilhados por todas as rotas. */
export const SITE = {
  url: urlPublica('NEXT_PUBLIC_SITE_URL', PUBLIC_ENV.siteUrl || SITE_URL_PADRAO),
  nome: 'Digi.IA',
  organizacaoMae: 'DigiThree',
  idioma: 'pt-BR',
  contato: {
    email: 'contato.digi.ia@gmail.com',
    instagram: 'https://instagram.com/digi.ia',
  },
  lancamento: {
    iso: '2026-09-14T09:00:00-03:00',
    diaMes: '14 de setembro',
    porExtenso: '14 de setembro de 2026',
    curto: '14.09',
  },
  /**
   * O tamanho da primeira turma.
   *
   * NÚMEROS PROVISÓRIOS, combinados com o dono do produto: existem para a copy
   * de escassez ficar de pé antes do painel de admin, e PRECISAM virar os reais
   * antes do lançamento. Não é preciosismo — escassez que o visitante desconfia
   * ser inventada derruba a confiança mais do que a escassez levanta a
   * conversão, e o resto do site é honesto demais para pagar esse preço.
   *
   * Fonte única: nenhum componente conhece esses valores, todos leem daqui.
   * Quando o painel existir, é este objeto que ele passa a preencher — a forma
   * abaixo já é a que ele vai escrever.
   *
   * `vagas` é redondo de propósito e `restantes` não: capacidade se decide em
   * número redondo ("vamos atender 120"), saldo não. O contrário — 127 vagas,
   * restam 30 — lê como número inventado.
   *
   * `mostrarRestantes` nasce DESLIGADO, e isso é deliberado. Contador estático
   * é pior que contador nenhum: quem volta ao site dias depois vê o mesmo
   * "restam 31" e aprende que o número é enfeite. Ligar só quando o painel
   * puder movê-lo de verdade.
   */
  turma: {
    vagas: 120,
    restantes: 31,
    mostrarRestantes: false,
  },
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
} as const

export function absoluta(caminho: string): string {
  return `${SITE.url}${caminho.startsWith('/') ? caminho : `/${caminho}`}`
}

export function dadosEstruturados() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': absoluta('/#site'),
        url: absoluta('/'),
        name: SITE.nome,
        inLanguage: SITE.idioma,
        description: `Plataforma de criação de conteúdo e marketing com IA. Lançamento em ${SITE.lancamento.porExtenso}.`,
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
