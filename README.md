# Digi.IA — landing de lista de espera

Página única de captação para o lançamento da **Digi.IA**, a plataforma de
conteúdo e marketing da DigiThree. Lançamento em **14 de setembro de 2026**.

Sem build e sem dependências — arquivos estáticos servidos direto pela Vercel.
Isso é uma escolha, não uma etapa que faltou: não há build para quebrar na
semana do lançamento, e o deploy é imediato.

## Como rodar e conferir

Os caminhos são relativos à raiz (`/assets/...`), então abrir o `index.html`
com duplo clique **não** funciona — o navegador procuraria os arquivos na raiz
do disco. Suba um servidor estático qualquer na pasta do projeto e acesse
`http://localhost:PORTA`.

Antes de subir qualquer alteração:

```bash
node verificar.mjs
```

Sem argumento e sem instalar nada. Ele confere marcador não preenchido, link
quebrado, JSON-LD inválido, `og:image` relativa ou apontando para arquivo
inexistente, divergência de domínio, e se o sitemap e o robots.txt batem com os
arquivos que existem de fato. Sai com código 1 se achar problema, e é o mesmo
comando que o GitHub Actions roda em cada push.

Ele existe porque em 03/08/2026 as páginas legais foram ao ar com
`[RAZÃO SOCIAL]` e `[CNPJ]` por preencher.

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

- [ ] **Dados do controlador nas páginas legais** — `[RAZÃO SOCIAL]`, `[CNPJ]`,
      `[E-MAIL DE CONTATO]` e `[CIDADE/UF]` estão **no ar** em `/privacidade` e
      `/termos`. Uma política de privacidade sem identificar o controlador não
      cumpre o art. 9º da LGPD. O `verificar.mjs` reprova enquanto isso durar,
      e é para reprovar mesmo.
- [ ] **`GA4_ID` e `META_PIXEL_ID`** — quanto antes entrarem, maior a audiência
      já aquecida no dia do lançamento.
- [ ] **`og-image.png` pesa 464 KB** — acima do que o WhatsApp costuma buscar
      para montar preview (~300 KB). Vale recomprimir antes de começar a
      divulgação, que é o canal principal desse público.
- [ ] **Números reais** de clientes atendidos e de pessoas no time, na seção de
      credibilidade. O texto "últimas vagas com desconto" também não tem número
      real por trás.
- [ ] **Vídeo de demonstração** — `CONFIG.VIDEO.id` está vazio; a seção mostra
      capa provisória.
- [ ] **Domínio próprio** — hoje o site vive em `landing-page-digi-ia.vercel.app`.
      Ver "Trocar de domínio" abaixo.

## Trocar de domínio

O domínio aparece cravado em `index.html`, `robots.txt`, `sitemap.xml` e na
constante `DOMINIO` do `verificar.mjs`. Isso é deliberado: resolver com variável
exigiria um passo de build permanente para uma troca que acontece uma vez.

Para trocar, basta substituir em todos e rodar a verificação — ela reprova se
sobrar qualquer arquivo com o domínio antigo:

```bash
grep -rl 'landing-page-digi-ia.vercel.app' . --exclude-dir=.git
# troque em cada um, depois:
node verificar.mjs
```

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
index.html          a landing (HTML + CSS + JS embutidos)
privacidade.html    /privacidade
termos.html         /termos
assets/
  base.css          estilo comum das duas páginas legais
  logo.png          lettering "Digi.IA"
  simbolo.png       o "D" — favicon e marca d'água do pôster
og-image.html       fonte da imagem social (não é página; Disallow no robots)
og-image.png        a imagem social gerada a partir dela
robots.txt
sitemap.xml
vercel.json         cleanUrls e cabeçalhos de segurança
verificar.mjs       a guarda
material/           ativos de marca e documentos internos — NÃO versionado
```

Duas decisões que parecem incoerentes e não são:

**O `index.html` mantém CSS e JS embutidos, as páginas legais não.** A landing é
onde a velocidade converte, e um arquivo externo custaria uma ida ao servidor
antes da primeira pintura. As páginas legais são secundárias, cruzadas entre si
pelo rodapé, e compartilham `base.css` — a segunda vem do cache. Além disso, o
CSS delas era quase idêntico e duplicado, que é o problema que some aqui.

**As imagens saíram do base64.** Eram duas imagens distintas codificadas duas
vezes cada, 27 KB de HTML para 10 KB de imagem única. Pior: as duas cópias de
baixo estão marcadas `loading="lazy"`, e base64 anula o lazy loading — os bytes
desciam junto com o HTML de qualquer jeito. Como arquivo, o navegador baixa uma
vez só, guarda em cache e adia o que está fora da tela. O `index.html` caiu de
99,9 KB para 73,1 KB. O logo do topo ganhou um `preload` para não perder a
largada.

`material/` está no `.gitignore` de propósito: contém o plano de lançamento e o
manual de marca, que não podem ir para um repositório público.
