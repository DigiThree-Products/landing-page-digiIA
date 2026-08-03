#!/usr/bin/env node
/**
 * DIGI.IA — VERIFICAÇÃO DA LANDING
 *
 * Roda com `node verificar.mjs`. Sem dependência nenhuma, de propósito: o site
 * não tem build, e a guarda não pode ser o motivo de passar a ter.
 *
 * Por que isto existe: em 03/08/2026 as páginas /privacidade e /termos foram ao
 * ar com os marcadores [RAZÃO SOCIAL], [CNPJ], [E-MAIL DE CONTATO] e [CIDADE/UF]
 * ainda por preencher — numa página que, por lei, precisa identificar o
 * controlador dos dados. Nenhuma das checagens abaixo é hipotética; a primeira
 * delas nasceu desse erro.
 *
 * Sai com código 1 se achar qualquer problema, para travar o CI.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'

const DOMINIO = 'https://landing-page-digi-ia.vercel.app'

/** Fonte da imagem social, não é página: fica fora do sitemap e do robots. */
const NAO_E_PAGINA = new Set(['og-image.html'])

const problemas = []
const anotar = (arquivo, texto) => problemas.push({ arquivo, texto })

const paginas = readdirSync('.').filter((n) => n.endsWith('.html')).sort()
if (paginas.length === 0) {
  console.error('Nenhum .html na raiz — está rodando na pasta certa?')
  process.exit(1)
}

const ler = (arquivo) => readFileSync(arquivo, 'utf8')

/* ------------------------------------------------------------------ *
 * 1. Marcadores não preenchidos
 *
 * Pega [ALGO EM MAIÚSCULAS]. Não confunde com array de JSON-LD porque
 * exige letra maiúscula logo após o colchete, e `[{` ou `[\n` não casam.
 * ------------------------------------------------------------------ */
const MARCADOR = /\[[A-ZÀ-Ú][A-ZÀ-Ú0-9 ./_-]{2,60}\]/g

for (const pagina of paginas) {
  const html = ler(pagina)
  // Comentários HTML são avisos para quem edita, não conteúdo publicado.
  const publicado = html.replace(/<!--[\s\S]*?-->/g, '')
  const achados = [...new Set(publicado.match(MARCADOR) ?? [])]
  for (const marcador of achados) {
    anotar(pagina, `marcador ${marcador} não preenchido — isso vai ao ar como está`)
  }
}

/* ------------------------------------------------------------------ *
 * 2. Links e arquivos referenciados existem
 *
 * cleanUrls do Vercel serve /privacidade a partir de privacidade.html,
 * então a resolução precisa tentar as duas formas.
 * ------------------------------------------------------------------ */
function resolveRota(caminho) {
  const limpo = caminho.split(/[?#]/)[0]
  if (limpo === '/') return 'index.html'
  const relativo = limpo.replace(/^\//, '')
  if (existsSync(relativo)) return relativo
  if (existsSync(`${relativo}.html`)) return `${relativo}.html`
  return null
}

for (const pagina of paginas) {
  const html = ler(pagina).replace(/<!--[\s\S]*?-->/g, '')
  const refs = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1])
  for (const ref of [...new Set(refs)]) {
    if (resolveRota(ref) === null) anotar(pagina, `link quebrado: ${ref}`)
  }
}

/* ------------------------------------------------------------------ *
 * 3. JSON-LD válido
 *
 * Dado estruturado que não parseia é ignorado pelo Google em silêncio —
 * some sem erro nenhum, que é o pior tipo de falha.
 * ------------------------------------------------------------------ */
for (const pagina of paginas) {
  const blocos = [...ler(pagina).matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )]
  for (const [, corpo] of blocos) {
    try {
      JSON.parse(corpo)
    } catch (erro) {
      anotar(pagina, `JSON-LD inválido: ${erro.message}`)
    }
  }
}

/* ------------------------------------------------------------------ *
 * 4. URLs que os robôs exigem absolutas
 *
 * Facebook, WhatsApp e Twitter não resolvem caminho relativo em og:image.
 * Relativo aqui = card sem imagem, e o erro só aparece ao compartilhar.
 * ------------------------------------------------------------------ */
const PRECISA_ABSOLUTO = ['og:image', 'og:url', 'twitter:image']

for (const pagina of paginas) {
  const html = ler(pagina)
  for (const propriedade of PRECISA_ABSOLUTO) {
    const meta = html.match(
      new RegExp(`<meta[^>]+(?:property|name)="${propriedade}"[^>]+content="([^"]*)"`),
    )
    if (!meta) continue
    const valor = meta[1]
    if (!valor.startsWith('https://')) {
      anotar(pagina, `${propriedade} precisa ser URL absoluta, está "${valor}"`)
      continue
    }
    // Ser absoluta não basta: apontar para arquivo que não existe dá card sem
    // imagem, e isso só aparece quando alguém compartilha o link.
    if (valor.startsWith(DOMINIO) && resolveRota(valor.slice(DOMINIO.length)) === null) {
      anotar(pagina, `${propriedade} aponta para arquivo inexistente: ${valor}`)
    }
  }
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/)
  if (canonical && !canonical[1].startsWith('https://')) {
    anotar(pagina, `canonical precisa ser URL absoluta, está "${canonical[1]}"`)
  }
}

/* ------------------------------------------------------------------ *
 * 5. Um domínio só
 *
 * O domínio está cravado em vários arquivos. Se um dia trocar e alguém
 * esquecer um, canonical e sitemap passam a apontar para fora do site.
 * ------------------------------------------------------------------ */
const arquivosComDominio = [...paginas, 'robots.txt', 'sitemap.xml'].filter(existsSync)

for (const arquivo of arquivosComDominio) {
  const outros = [...new Set(
    [...ler(arquivo).matchAll(/https:\/\/[a-z0-9-]+\.vercel\.app/g)].map((m) => m[0]),
  )].filter((d) => d !== DOMINIO)
  for (const dominio of outros) {
    anotar(arquivo, `domínio divergente: ${dominio} (esperado ${DOMINIO})`)
  }
}

/* ------------------------------------------------------------------ *
 * 6. Sitemap bate com os arquivos que existem
 * ------------------------------------------------------------------ */
if (existsSync('sitemap.xml')) {
  const locs = [...ler('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const listadas = new Set()

  for (const loc of locs) {
    if (!loc.startsWith(DOMINIO)) {
      anotar('sitemap.xml', `URL fora do domínio: ${loc}`)
      continue
    }
    const alvo = resolveRota(loc.slice(DOMINIO.length) || '/')
    if (alvo === null) anotar('sitemap.xml', `URL sem arquivo correspondente: ${loc}`)
    else listadas.add(alvo)
  }

  for (const pagina of paginas) {
    if (NAO_E_PAGINA.has(pagina)) {
      if (listadas.has(pagina)) anotar('sitemap.xml', `${pagina} não é página e não deveria estar listada`)
      continue
    }
    const indexavel = !/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(ler(pagina))
    if (indexavel && !listadas.has(pagina)) {
      anotar('sitemap.xml', `${pagina} é indexável mas não está no sitemap`)
    }
  }
}

/* ------------------------------------------------------------------ *
 * 7. robots.txt aponta para um sitemap que existe
 * ------------------------------------------------------------------ */
if (existsSync('robots.txt')) {
  const robots = ler('robots.txt')
  const linha = robots.match(/^Sitemap:\s*(\S+)/m)
  if (!linha) {
    anotar('robots.txt', 'sem linha Sitemap:')
  } else if (resolveRota(linha[1].replace(DOMINIO, '')) === null) {
    anotar('robots.txt', `Sitemap: aponta para arquivo inexistente (${linha[1]})`)
  }
  for (const pagina of paginas) {
    if (NAO_E_PAGINA.has(pagina) && !robots.includes(`Disallow: /${pagina}`)) {
      anotar('robots.txt', `${pagina} não é página e deveria estar em Disallow`)
    }
  }
}

/* ------------------------------------------------------------------ *
 * Relatório
 * ------------------------------------------------------------------ */
if (problemas.length === 0) {
  console.log(`OK — ${paginas.length} páginas verificadas, nenhum problema.`)
  process.exit(0)
}

console.error(`\n${problemas.length} problema(s):\n`)
for (const arquivo of [...new Set(problemas.map((p) => p.arquivo))]) {
  console.error(`  ${arquivo}`)
  for (const problema of problemas.filter((p) => p.arquivo === arquivo)) {
    console.error(`    - ${problema.texto}`)
  }
}
console.error('')
process.exit(1)
