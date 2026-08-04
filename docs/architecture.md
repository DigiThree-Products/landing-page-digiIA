# Arquitetura

O site usa Next.js com exportação estática. O build gera arquivos em `out/`;
não existe runtime Next.js em produção. O cadastro vai direto à API pública do
Supabase.

## Responsabilidades

- `app/`: rotas, metadata e composição.
- `components/sections/`: apresentação das seções.
- `components/waitlist/`: interface e estados do cadastro.
- `content/`: copy e dados editoriais, sem JSX.
- `config/`: ambiente público, identidade e integrações.
- `lib/`: operações que não pertencem à interface.
- `styles/`: tokens, base e estilos por domínio visual.
- `public/`: arquivos entregues diretamente e cacheáveis.
- `supabase/migrations/`: contrato versionado da tabela e da RLS.

## Regras

1. Copy muda em `content/`; componente muda quando a apresentação muda.
2. Domínio, contato e lançamento têm uma fonte em `config/site.ts`.
3. Variável `NEXT_PUBLIC_*` nunca é segredo.
4. Mudança no payload de leads começa por uma migração do banco.
5. `npm run check` precisa passar antes de publicar.
