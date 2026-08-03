#!/usr/bin/env node
/**
 * DIGI.IA — VERIFICAÇÃO DA LANDING
 *
 * Uso: `node verificar.mjs out` (ou `npm run verificar`, depois do build).
 * Sem dependência nenhuma, de propósito.
 *
 * Confere o HTML **gerado**, não o código-fonte. Isso importa: o que vai ao ar
 * é a saída do build, e é ela que precisa estar certa. Marcador que sobrevive
 * ao build é marcador que o visitante lê.
 *
 * Por que existe: em 03/08/2026 as páginas /privacidade e /termos foram ao ar
 * com [RAZÃO SOCIAL], [CNPJ], [E-MAIL DE CONTATO] e [CIDADE/UF] por preencher —
 * numa página que, por lei, precisa identificar o controlador dos dados.
 * Nenhuma das checagens abaixo é hipotética; a primeira nasceu desse erro.
 *
 * Sai com código 1 se achar qualquer problema, para travar o CI.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const RAIZ = process.argv[2] ?? '.'

const DOMINIO = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://landing-page-digi-ia.vercel.app')
  .replace(/\/+$/, '')

const problemas = []
const anotar = (arquivo, texto) => problemas.push({ arquivo, texto })

if (!existsSync(RAIZ)) {
  console.error(`Diretório "${RAIZ}" não existe. Rode o build antes: npm run build`)
  process.exit(1)
}

/** Todos os .html gerados, em qualquer profundidade, menos os internos do Next. */
function paginasEm(dir, prefixo = '') {
  const achadas = []
  for (const nome of readdirSync(dir)) {
    if (nome === '_next' || nome.startsWith('.')) continue
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) {
      achadas.push(...paginasEm(caminho, `${prefixo}${nome}/`))
    } else if (nome.endsWith('.html')) {
      achadas.push(`${prefixo}${nome}`)
    }
  }
  return achadas
}

const paginas = paginasEm(RAIZ).sort()
if (paginas.length === 0) {
  console.error(`Nenhum .html em "${RAIZ}". O build rodou?`)
  process.exit(1)
}

const ler = (relativo) => readFileSync(join(RAIZ, relativo), 'utf8')

/**
 * Existe COMO ARQUIVO.
 *
 * O `isFile()` não é detalhe: o export gera tanto `privacidade.html` quanto uma
 * pasta `privacidade/`. Sem essa checagem, /privacidade casaria com o diretório
 * e o sitemap pareceria não listar a página que ele lista.
 */
const existe = (relativo) => {
  const caminho = join(RAIZ, relativo)
  return existsSync(caminho) && statSync(caminho).isFile()
}

/* ------------------------------------------------------------------ *
 * 1. Marcadores não preenchidos
 *
 * Pega [ALGO EM MAIÚSCULAS]. Não confunde com array de JSON-LD porque
 * exige letra maiúscula logo após o colchete, e `[{` ou `["` não casam.
 * ------------------------------------------------------------------ */
const MARCADOR = /\[[A-ZÀ-Ú][A-ZÀ-Ú0-9 ./_-]{2,60}\]/g

for (const pagina of paginas) {
  const publicado = ler(pagina).replace(/<!--[\s\S]*?-->/g, '')
  for (const marcador of [...new Set(publicado.match(MARCADOR) ?? [])]) {
    anotar(pagina, `marcador ${marcador} não preenchido — isso vai ao ar como está`)
  }
}

/* ------------------------------------------------------------------ *
 * 2. Links e arquivos referenciados existem
 *
 * O Vercel serve /privacidade a partir de privacidade.html, então a
 * resolução precisa tentar as duas formas.
 * ------------------------------------------------------------------ */
function resolveRota(caminho) {
  const limpo = caminho.split(/[?#]/)[0]
  if (limpo === '/' || limpo === '') return 'index.html'
  const relativo = limpo.replace(/^\//, '')
  if (existe(relativo)) return relativo
  if (existe(`${relativo}.html`)) return `${relativo}.html`
  if (existe(join(relativo, 'index.html'))) return join(relativo, 'index.html')
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
  const blocos = [
    ...ler(pagina).matchAll(
      /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ]
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
 * Com lib/site.ts isso passou a ser improvável, mas a checagem fica: URL
 * colada à mão num componente novo é exatamente o tipo de coisa que
 * ninguém percebe no code review.
 * ------------------------------------------------------------------ */
const comDominio = [...paginas, 'robots.txt', 'sitemap.xml'].filter(existe)

for (const arquivo of comDominio) {
  const outros = [
    ...new Set([...ler(arquivo).matchAll(/https:\/\/[a-z0-9-]+\.vercel\.app/g)].map((m) => m[0])),
  ].filter((d) => d !== DOMINIO)
  for (const dominio of outros) {
    anotar(arquivo, `domínio divergente: ${dominio} (esperado ${DOMINIO})`)
  }
}

/* ------------------------------------------------------------------ *
 * 6. Sitemap bate com os arquivos que existem
 * ------------------------------------------------------------------ */
if (existe('sitemap.xml')) {
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
    const indexavel = !/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(ler(pagina))
    if (indexavel && !listadas.has(pagina)) {
      anotar('sitemap.xml', `${pagina} é indexável mas não está no sitemap`)
    }
  }
} else {
  anotar('sitemap.xml', 'não foi gerado — app/sitemap.ts sumiu?')
}

/* ------------------------------------------------------------------ *
 * 7. robots.txt aponta para um sitemap que existe
 * ------------------------------------------------------------------ */
if (existe('robots.txt')) {
  const linha = ler('robots.txt').match(/^Sitemap:\s*(\S+)/m)
  if (!linha) anotar('robots.txt', 'sem linha Sitemap:')
  else if (resolveRota(linha[1].replace(DOMINIO, '')) === null) {
    anotar('robots.txt', `Sitemap: aponta para arquivo inexistente (${linha[1]})`)
  }
} else {
  anotar('robots.txt', 'não foi gerado — app/robots.ts sumiu?')
}

/* ------------------------------------------------------------------ *
 * Relatório
 * ------------------------------------------------------------------ */
if (problemas.length === 0) {
  console.log(`OK — ${paginas.length} páginas verificadas em "${RAIZ}", nenhum problema.`)
  process.exit(0)
}

console.error(`\n${problemas.length} problema(s) em "${RAIZ}":\n`)
for (const arquivo of [...new Set(problemas.map((p) => p.arquivo))]) {
  console.error(`  ${arquivo}`)
  for (const problema of problemas.filter((p) => p.arquivo === arquivo)) {
    console.error(`    - ${problema.texto}`)
  }
}
console.error('')
process.exit(1)
