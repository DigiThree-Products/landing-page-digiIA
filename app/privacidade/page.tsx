import type { Metadata } from 'next'
import { PRODUCT_CONFIG } from '@/config/product'
import { SITE } from '@/config/site'
import { LEGAL } from '@/content/legal'

/*
  ATENÇÃO ANTES DE PUBLICAR: os campos [RAZÃO SOCIAL], [CNPJ] e
  [E-MAIL DE CONTATO] abaixo são marcadores. Uma política de privacidade sem a
  identificação do controlador não cumpre o art. 9º da LGPD.

  O `npm run check` reprova enquanto eles estiverem aqui — é para reprovar.
*/

export const metadata: Metadata = {
  title: 'Política de Privacidade — Digi.IA',
  description: 'Como a Digi.IA coleta, usa e protege os dados de quem entra na lista de espera.',
  alternates: { canonical: '/privacidade' },
}

export default function Privacidade() {
  const { controller } = LEGAL
  const measurementEnabled = Boolean(
    PRODUCT_CONFIG.analytics.ga4Id || PRODUCT_CONFIG.analytics.metaPixelId,
  )

  return (
    <div className="doc">
      <div className="doc-wrap">
        <header>
          <a className="marca" href="/">
            Digi.IA
          </a>
        </header>

        <h1>Política de Privacidade</h1>
        <p className="atualizado">Última atualização: {LEGAL.updatedLabel}</p>

        <p>
          Esta página explica o que acontece com os dados que você informa ao entrar na lista de
          espera da Digi.IA. Ela descreve apenas o que o site realmente faz hoje — sem cláusulas
          genéricas sobre coisas que não coletamos.
        </p>

        <h2>1. Quem é responsável pelos seus dados</h2>
        <p>
          O controlador dos dados é <strong>{controller.legalName}</strong>, inscrita no CNPJ{' '}
          <strong>{controller.cnpj}</strong>. Para qualquer assunto relacionado a esta política ou
          aos seus dados, o contato é <strong>{controller.email}</strong>.
        </p>

        <h2>2. Quais dados coletamos</h2>
        <p>Somente o que o formulário da lista de espera envia:</p>
        <dl className="campo">
          <dt>E-mail</dt>
          <dd>Obrigatório. É por onde avisamos sobre o lançamento.</dd>

          <dt>Nome</dt>
          <dd>Opcional. Usado para personalizar a comunicação.</dd>

          <dt>WhatsApp</dt>
          <dd>Opcional. Usado apenas se você preencher, como canal alternativo de aviso.</dd>

          <dt>Tipo de negócio</dt>
          <dd>Opcional. Serve para entendermos o público e preparar o produto.</dd>

          <dt>Origem</dt>
          <dd>
            O endereço completo da página no momento do cadastro. Ele pode conter parâmetros de
            campanha (por exemplo <code>utm_source</code>), o que nos permite saber por qual anúncio
            ou link você chegou.
          </dd>

          <dt>Registro do consentimento</dt>
          <dd>
            Data, hora e versão desta política aceitas no envio. Esses dados permitem comprovar
            qual autorização acompanhou cada cadastro.
          </dd>
        </dl>
        <p>
          Não pedimos CPF, endereço, dados de pagamento nem qualquer dado sensível (art. 5º, II da
          LGPD). Não criamos perfis comportamentais nem compramos listas de terceiros.
        </p>

        <h2>3. Para que usamos</h2>
        <ul>
          <li>Avisar você sobre o lançamento, previsto para {SITE.lancamento.porExtenso}.</li>
          <li>Enviar a condição de fundador oferecida a quem entrou na lista.</li>
          <li>Responder quando você entra em contato.</li>
          <li>Entender, de forma agregada, de onde vêm os cadastros.</li>
        </ul>
        <p>
          Não vendemos, alugamos nem cedemos seus dados para terceiros fazerem marketing próprio.
        </p>

        <h2>4. Com que base legal</h2>
        <p>
          Com o seu <strong>consentimento</strong> (art. 7º, I da LGPD), dado ao marcar a caixa de
          autorização antes de enviar o formulário. Você pode retirá-lo a qualquer momento, e isso
          não invalida o tratamento feito antes da retirada.
        </p>

        <h2>5. Onde os dados ficam e quem mais tem acesso</h2>
        <p>Usamos prestadores de serviço que atuam como operadores, sob nossa instrução:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — banco de dados onde os cadastros são gravados.
          </li>
          <li>
            <strong>Vercel</strong> — hospedagem da página. Registra logs técnicos de acesso, como
            endereço IP, próprios do funcionamento de qualquer site.
          </li>
          <li>
            <strong>Kiwify</strong> — plataforma de pagamento. Só entra em cena se e quando você
            decidir comprar; nesse caso, os dados de pagamento são tratados por ela, e não passam
            por esta página.
          </li>
        </ul>
        <p>
          Esses serviços podem processar dados fora do Brasil. Quando isso ocorre, a transferência
          se dá nos termos dos arts. 33 e seguintes da LGPD.
        </p>

        <h2>6. Cookies e medição</h2>
        {measurementEnabled ? (
          <p>
            Esta página carrega as ferramentas configuradas para o ambiente — Google Analytics
            e/ou Meta Pixel — para acompanhar visitas e conversões da divulgação.
          </p>
        ) : (
          <p>
            Esta página <strong>não usa cookies de rastreamento</strong> e não carrega scripts de
            terceiros para publicidade ou análise de audiência no ambiente atual.
          </p>
        )}

        <h2>7. Por quanto tempo guardamos</h2>
        <p>
          Mantemos seu cadastro enquanto a lista de espera fizer sentido — ou seja, até o lançamento
          e o período de comunicação que o segue — ou até você pedir a exclusão, o que vier
          primeiro. Pedidos de exclusão são atendidos mesmo antes desse prazo.
        </p>

        <h2>8. Seus direitos</h2>
        <p>A LGPD (art. 18) garante a você, a qualquer momento:</p>
        <ul>
          <li>confirmar se tratamos seus dados e acessá-los;</li>
          <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
          <li>pedir anonimização, bloqueio ou eliminação;</li>
          <li>pedir a portabilidade a outro fornecedor;</li>
          <li>saber com quem compartilhamos seus dados;</li>
          <li>revogar o consentimento e ser removido da lista.</li>
        </ul>
        <p>
          Basta escrever para <strong>{controller.email}</strong>. Respondemos em até 15 dias. Todo
          e-mail que enviarmos também terá um link de descadastro.
        </p>

        <h2>9. Como protegemos</h2>
        <p>
          O formulário grava diretamente no banco por uma chave pública de inserção, protegida por
          uma política de segurança em nível de linha que permite <strong>apenas inclusão</strong>.
          Na prática: essa chave, mesmo exposta no código da página, não consegue ler, alterar ou
          apagar a lista de cadastros. Todo o tráfego usa HTTPS.
        </p>
        <p>
          Nenhum sistema é imune a incidentes. Se ocorrer algum que traga risco relevante a você,
          comunicaremos você e a ANPD, como manda o art. 48 da LGPD.
        </p>

        <h2>10. Mudanças nesta política</h2>
        <p>
          Se algo mudar, atualizamos esta página e a data no topo. Mudanças que ampliem o uso dos
          seus dados serão comunicadas por e-mail, e pediremos novo consentimento quando for o caso.
        </p>

        <footer>
          <a href="/">Voltar para a página inicial</a>
          <a href="/termos">Termos de uso</a>
        </footer>
      </div>
    </div>
  )
}
