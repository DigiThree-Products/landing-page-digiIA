# Digi.IA — landing de lista de espera

Página única de captação para o lançamento da **Digi.IA**, a plataforma de
conteúdo e marketing da DigiThree. Lançamento em **14 de setembro de 2026**.

Sem build e sem dependências: é um arquivo HTML autocontido. Para ver, basta
abrir o `index.html` no navegador.

## Configuração

Tudo que muda fica no objeto `CONFIG`, no topo do `<script>` ao final do arquivo:

| Chave | O que faz |
|---|---|
| `DATA_LANCAMENTO` | Data e hora da abertura. Alimenta a contagem regressiva. |
| `SUPABASE_URL` | URL do projeto Supabase que guarda os cadastros. |
| `SUPABASE_ANON_KEY` | Chave publicável. **Segura no repositório público porque a RLS da tabela `leads` só permite INSERT** — ninguém lê a lista com ela. |
| `KIWIFY_CHECKOUT` | Link de pagamento. Vazio = o botão de checkout não aparece e a página segue só como lista de espera. |
| `GA4_ID` | ID do Google Analytics 4. Vazio = nenhum script do Google é carregado. |
| `META_PIXEL_ID` | ID do pixel da Meta. Vazio = nenhum script da Meta é carregado. |
| `VIDEO` | Tipo, ID, capa, duração e legenda do vídeo de demonstração. |

### O que o formulário envia

`POST` com `Content-Type: application/json`:

```json
{
  "email": "pessoa@empresa.com.br",
  "nome": "Fulano",
  "whatsapp": "(24) 90000-0000",
  "tipo_negocio": "Restaurante ou bar",
  "lgpd": "on",
  "origem": "https://exemplo.com.br/",
  "momento": "2026-07-31T18:04:04.000Z"
}
```

Só `email` e o aceite de LGPD são obrigatórios. `momento` é ISO 8601 em UTC.

## Pendências antes de publicar

Estas travam a página, não são melhorias:

- [ ] **`FORM_ENDPOINT`** — sem ele nenhum cadastro é salvo. A página é honesta
      a respeito (avisa quem tenta), mas não capta ninguém.
- [ ] **Política de privacidade em `/privacidade` e termos em `/termos`** — o
      aceite de LGPD referencia esses documentos. Coletar e-mail declarando que
      a pessoa leu uma política inexistente é frágil como base legal
      (LGPD, art. 8º e 9º).
- [ ] **`GA4_ID` e `META_PIXEL_ID`** — quanto antes entrarem, maior a audiência
      já aquecida no dia do lançamento.
- [ ] **`og-image.jpg`** (1200×630) — sem ela, todo compartilhamento em WhatsApp
      e LinkedIn sai sem imagem.
- [ ] **Números reais** de clientes atendidos e de pessoas no time, na seção de
      credibilidade.
- [ ] **Vídeo de demonstração** — `CONFIG.VIDEO.id` está vazio; a seção mostra
      capa provisória.
- [ ] **Domínio** — `digi.ia.com.br` não resolve hoje.
- [ ] **Imagens do objeto do hero** — as três camadas do cérebro (fundo, mão e
      cérebro) ainda são um SVG vazio que só reserva a proporção. Salve o HTML
      de origem em `material/cerebro.html` e rode:
      `powershell -ExecutionPolicy Bypass -File tools\injetar-cerebro.ps1`

## O objeto do hero

A coluna direita do hero é uma ilustração de três camadas empilhadas —
`fundo`, `mao` e `cerebro` — identificadas pelo atributo `data-camada`.
Pressionar levanta o cérebro e afrouxa a mão; o cursor inclina a cena. É
deleite: nenhuma informação da página depende dele, e por isso o conjunto é um
único `role="img"` com um rótulo só, não um controle focável. Com
`prefers-reduced-motion` nada disso roda.

As imagens são WebP em base64 (~190 KB somados) e entram pelo
`tools/injetar-cerebro.ps1`, que as copia de um HTML de origem. Rodar o script
de novo é seguro: ele sempre substitui o `src` atual.

## O que foi corrigido nesta versão

A versão anterior tinha problemas que iam além de estética:

- O formulário gravava o cadastro no **`localStorage` do próprio visitante** e
  exibia "desconto reservado". O lead se perdia e a pessoa achava que estava na
  lista. Agora, sem `FORM_ENDPOINT`, a página avisa e não finge.
- Um contador de "1.247 de 2.000 vagas" com barra de progresso, **fixo no
  código**, sem vir de base nenhuma. Removido.
- Uma posição na fila **sorteada** com `Math.random()`.
- Um programa de indicação prometendo "sobe 40 posições" com link para
  `https://digi.ia/`, domínio que não existe — e que expunha parte do e-mail de
  quem indicava. Removido.
- Data de lançamento em **fevereiro**; o correto é 14 de setembro.
- Texto de rascunho visível ao público: `[000] clientes`, `[00] especialistas`,
  `[SUBSTITUIR os números entre colchetes]`, `[CNPJ / endereço]`,
  `[CONFIRMAR redação com o jurídico]`, `[substituir: capa do vídeo]`.
- Cinco links de rodapé apontando para âncoras inexistentes — incluindo a
  política de privacidade referenciada no aceite de LGPD.
- Contraste de 3,1:1 nos rótulos e legendas, abaixo do mínimo de 4,5:1 da
  WCAG AA. Agora em 5,9:1.
- Campo **"que tipo de negócio você tem"**, que qualifica a lista, agora visível
  em vez de ausente.

## Estrutura

```
index.html    a página inteira (HTML + CSS + JS + imagens em base64)
tools/        scripts de manutenção, rodados à mão
material/     ativos de marca e documentos internos — NÃO versionado
```

`material/` está no `.gitignore` de propósito: contém o plano de lançamento e o
manual de marca, que não podem ir para um repositório público.
