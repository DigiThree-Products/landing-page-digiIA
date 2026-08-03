# Digi.IA — landing de lista de espera

Página de captação para o lançamento da **Digi.IA**, a plataforma de conteúdo e
marketing da DigiThree. Lançamento em **14 de setembro de 2026**.

**Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4.**

O `next.config.ts` declara `output: 'export'`: o build gera HTML estático em
`out/`, que a Vercel serve como arquivo. Não há runtime em produção — se o build
passa, o site sobe.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
```

Antes de subir qualquer alteração:

```bash
npm run check      # typecheck + build + verificação do HTML gerado
```

| Script | O que faz |
|---|---|
| `dev` | servidor de desenvolvimento |
| `build` | gera o site estático em `out/` |
| `typecheck` | `tsc --noEmit` |
| `verificar` | audita o HTML **gerado** (exige `build` antes) |
| `check` | os três acima, na ordem |

## Estrutura

```
app/
  layout.tsx          fontes, metadata, JSON-LD — vale para todas as rotas
  page.tsx            a landing: compõe as dez seções
  globals.css         @theme do Tailwind + a identidade visual
  privacidade/        /privacidade
  termos/             /termos
  robots.ts           gera o robots.txt no build
  sitemap.ts          gera o sitemap.xml no build
components/
  layout/             MetaballField (canvas), Analytics
  sections/           Nav, Hero, VideoSection, WhatItDoes, Demo,
                      Offer, Credibility, Faq, FinalCta, SiteFooter
  waitlist/           WaitlistForm, Countdown, confete
  ui/                 Reveal
lib/
  site.ts             domínio, metadata, JSON-LD — a fonte do domínio
  config.ts           Supabase, Kiwify, medição, vídeo
public/
  assets/             logo.png, simbolo.png
  og-image.png        imagem social 1200×630
verificar.mjs         a guarda
material/             ativos de marca e documentos internos — NÃO versionado
```

### Onde o Tailwind entra, e onde não entra

O bloco `@theme` do `globals.css` publica a paleta oficial e as famílias como
token: `bg-violet`, `text-lilac`, `border-rule`, `font-display`, `ease-brand`.
É a fonte única — nenhum componente escreve `#4500F9` na mão.

O que **não** virou utilitário continua em CSS, de propósito: gradientes de
texto, keyframes, o brilho do botão que segue o cursor, o campo de metaballs.
São coisas que Tailwind só expressa virando sopa de colchete, e reescrevê-las
arriscaria o visual de uma página que já está no ar sem ganho nenhum.

### Fontes

Sora, Instrument Sans e DM Mono vêm pelo `next/font/google`: baixadas no build,
servidas do próprio domínio. Antes eram um `<link>` para o Google, que custava
duas conexões antes da primeira pintura e trazia salto de layout.

## Configuração

Tudo por variável de ambiente — veja `.env.example`. Todas são opcionais; sem
nenhuma, o site sobe com os padrões de produção.

Sobre a chave do Supabase estar em texto: ela é a **publicável** (anon), feita
para ficar exposta. O que protege os cadastros é a política de RLS na tabela
`leads`, que permite INSERT e nada mais — com ela ninguém lê a lista.

### O que o formulário envia

`POST` para `/rest/v1/leads`, com `Prefer: return=minimal` (a RLS não permite ao
banco devolver a linha criada; sem esse cabeçalho o PostgREST responde 401):

```json
{
  "email": "pessoa@empresa.com.br",
  "nome": "Fulano",
  "whatsapp": "(24) 90000-0000",
  "tipo_negocio": "Restaurante ou bar",
  "origem": "https://exemplo.com.br/?utm_source=..."
}
```

Só `email` e o aceite de LGPD são obrigatórios. Resposta 409 (e-mail repetido) é
tratada como sucesso: para quem preencheu, deu certo.

## A guarda

`node verificar.mjs out` — sem dependência nenhuma. Confere o HTML **gerado**,
não o código-fonte: o que vai ao ar é a saída do build.

1. marcador `[EM MAIÚSCULAS]` não preenchido
2. link interno apontando para arquivo que não existe
3. JSON-LD que não parseia (o Google ignora em silêncio)
4. `og:image`/`twitter:image`/`canonical` relativa ou apontando para arquivo inexistente
5. domínio divergente entre arquivos
6. sitemap que não bate com as páginas geradas, nos dois sentidos
7. `robots.txt` apontando para sitemap inexistente

Existe porque em 03/08/2026 as páginas legais foram ao ar com `[RAZÃO SOCIAL]` e
`[CNPJ]` por preencher — numa página que, por lei, precisa identificar o
controlador dos dados.

## Trocar de domínio

Uma linha: `SITE.url` em `lib/site.ts` (ou a variável `NEXT_PUBLIC_SITE_URL`).
Metadata, canonical, Open Graph, robots, sitemap e JSON-LD leem dali. A checagem
nº 5 reprova se sobrar qualquer arquivo com o domínio antigo.

## Pendências antes de publicar

Estas travam a página, não são melhorias:

- [ ] **Dados do controlador nas páginas legais** — `[RAZÃO SOCIAL]`, `[CNPJ]`,
      `[E-MAIL DE CONTATO]` e `[CIDADE/UF]` estão **no ar** em `/privacidade` e
      `/termos`. Sem eles não se cumpre o art. 9º da LGPD. O `npm run check`
      reprova enquanto durar, e é para reprovar.
- [ ] **`NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID`** — quanto antes
      entrarem, maior a audiência já aquecida no dia do lançamento. Ligar exige
      atualizar a política de privacidade junto.
- [ ] **`og-image.png` pesa 464 KB** — acima do que o WhatsApp costuma buscar
      para montar preview (~300 KB). Recomprimir antes de começar a divulgação.
- [ ] **Números reais** de clientes atendidos e de pessoas no time. "Últimas
      vagas com desconto", no CTA final, também não tem número real por trás.
- [ ] **Vídeo de demonstração** — `NEXT_PUBLIC_VIDEO_ID` vazio; a seção mostra
      capa provisória.
- [ ] **Domínio próprio** — hoje o site vive em `landing-page-digi-ia.vercel.app`.

`material/` está no `.gitignore` de propósito: contém o plano de lançamento e o
manual de marca, que não podem ir para um repositório público.
