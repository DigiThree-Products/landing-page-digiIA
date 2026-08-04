# Digi.IA — landing de lista de espera

Landing estática da Digi.IA, construída com Next.js 16, React 19, TypeScript e
Tailwind CSS 4. O `output: 'export'` gera arquivos em `out/`; não há runtime
Next.js em produção.

## Rodar localmente

```bash
npm install
npm run dev
```

Antes de publicar:

```bash
npm run check
```

O comando executa typecheck, build e a auditoria do HTML gerado.

## Estrutura

```text
app/                    rotas, metadata e composição
components/
  layout/               efeitos globais e analytics
  sections/             seções da landing
  waitlist/             formulário e contagem regressiva
  ui/                   componentes visuais compartilhados
config/                 ambiente, site e integrações
content/                copy da landing e dados legais
lib/                    envio e contrato dos leads
styles/                 tokens e CSS separado por domínio
public/                  imagens públicas e cacheáveis
supabase/migrations/     tabela, índices, permissões e RLS
docs/                    arquitetura e publicação
verificar.mjs            auditoria do resultado do build
```

Copy muda em `content/landing.ts`. Domínio, contato e lançamento ficam em
`config/site.ts`. Integrações públicas ficam em `config/product.ts`, alimentadas
pelas variáveis declaradas em `.env.example`.

## Cadastro

O navegador insere diretamente na tabela `public.leads` usando a chave
publicável do Supabase. Essa chave não é segredo; a proteção está na RLS, que
permite apenas `INSERT` aos papéis públicos.

O payload contém:

```json
{
  "email": "pessoa@empresa.com.br",
  "nome": "Fulano",
  "whatsapp": "(24) 90000-0000",
  "tipo_negocio": "Restaurante ou bar",
  "origem": "https://exemplo.com.br/?utm_source=...",
  "consentimento_em": "2026-08-04T12:00:00.000Z",
  "politica_privacidade_versao": "2026-08-04"
}
```

Execute a migração em `supabase/migrations/` antes de publicar este frontend.
E-mail repetido é tratado como sucesso porque a pessoa já está na lista.

## Variáveis de ambiente

Copie `.env.example` para `.env.local`. Toda variável `NEXT_PUBLIC_*` é enviada
ao navegador e não pode guardar segredo.

Os quatro dados legais são obrigatórios para publicação. Enquanto continuarem
como marcadores, `npm run verificar` reprova de propósito.

## Material interno

`material/` continua ignorado porque contém estratégia, preços, nomes de
clientes e arquivos de marca internos. Os arquivos necessários à página ficam
em `public/`.

Veja também [docs/architecture.md](docs/architecture.md) e
[docs/publishing.md](docs/publishing.md).
