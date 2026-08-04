# Publicação

## Primeira configuração

1. Copie `.env.example` para `.env.local`.
2. Execute a migração mais recente de `supabase/migrations/`.
3. Preencha os quatro dados legais; o build bloqueia marcadores.
4. Rode `npm run check`.

## Ordem segura

Quando o payload mudar, publique primeiro a migração do Supabase e depois o
frontend. A ordem inversa pode enviar colunas que a tabela ainda não conhece.

## Checklist

- Formulário grava um novo e-mail e aceita repetidos como sucesso.
- `/privacidade` e `/termos` não têm marcadores.
- Vídeo, analytics e checkout correspondem ao ambiente.
- A política descreve as ferramentas de medição realmente ligadas.
