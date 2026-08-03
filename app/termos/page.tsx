import type { Metadata } from 'next'

/*
  ATENÇÃO ANTES DE PUBLICAR: [RAZÃO SOCIAL], [CNPJ], [E-MAIL DE CONTATO] e
  [CIDADE/UF] são marcadores e precisam ser preenchidos.
*/

export const metadata: Metadata = {
  title: 'Termos de Uso — Digi.IA',
  description: 'As regras da lista de espera da Digi.IA e da condição de lançamento.',
  alternates: { canonical: '/termos' },
}

export default function Termos() {
  return (
    <div className="doc">
      <div className="doc-wrap">
        <header>
          <a className="marca" href="/">
            Digi.IA
          </a>
        </header>

        <h1>Termos de Uso</h1>
        <p className="atualizado">Última atualização: 3 de agosto de 2026</p>

        <p>
          Estes termos valem para o site da Digi.IA e para a lista de espera do lançamento. Ao
          entrar na lista, você concorda com o que está aqui.
        </p>

        <h2>1. Quem oferece este site</h2>
        <p>
          O site é mantido por <strong>[RAZÃO SOCIAL]</strong>, CNPJ <strong>[CNPJ]</strong>.
          Contato: <strong>[E-MAIL DE CONTATO]</strong>.
        </p>

        <h2>2. O que é a lista de espera</h2>
        <p>
          A Digi.IA é uma plataforma de criação de conteúdo que ainda não está disponível. Este site
          serve para avisar você quando ela abrir.
        </p>
        <div className="destaque">
          <p style={{ margin: 0 }}>
            <strong>Entrar na lista não é uma compra.</strong> Não gera cobrança, não exige cartão e
            não cria obrigação de comprar depois. Você só informa um e-mail para ser avisado.
          </p>
        </div>

        <h2>3. A condição de lançamento</h2>
        <p>Quem entra na lista tem direito ao desconto de lançamento, nas seguintes condições:</p>
        <ul>
          <li>
            O desconto fica <strong>vinculado ao e-mail cadastrado</strong> e não é transferível.
          </li>
          <li>
            Vale por <strong>12 meses a partir da ativação</strong> da assinatura.
          </li>
          <li>
            Vale <strong>enquanto houver vagas</strong> na primeira turma. Se ela lotar antes de 14
            de setembro de 2026, avisaremos por e-mail.
          </li>
          <li>
            Os planos e valores serão anunciados no lançamento. Quem está na lista recebe a tabela
            antes, já com o desconto aplicado, e decide depois de ver o preço.
          </li>
        </ul>
        <p>
          O percentual do desconto e os valores finais são comunicados junto com o anúncio dos
          planos. Até lá, nenhum preço está prometido nem reservado.
        </p>

        <h2>4. A data de lançamento</h2>
        <p>
          O lançamento está previsto para <strong>14 de setembro de 2026</strong>. É uma previsão:
          se mudar, avisaremos por e-mail quem estiver na lista. Uma mudança de data não elimina a
          condição descrita no item 3.
        </p>

        <h2>5. Quando houver compra</h2>
        <p>
          Quando a venda abrir, o pagamento será processado pela <strong>Kiwify</strong>, sujeito
          aos termos e à política de privacidade dela. A relação de pagamento se dá naquele
          ambiente; este site apenas encaminha.
        </p>
        <p>
          Como a contratação ocorre fora do estabelecimento comercial, você tem{' '}
          <strong>7 dias corridos</strong> para desistir, contados da contratação ou do primeiro
          acesso, conforme o art. 49 do Código de Defesa do Consumidor. Nesse prazo, o valor pago é
          devolvido integralmente.
        </p>

        <h2>6. Uso do site</h2>
        <p>Ao usar este site, você concorda em não:</p>
        <ul>
          <li>enviar dados falsos ou de terceiros sem autorização;</li>
          <li>cadastrar e-mails em massa ou de forma automatizada;</li>
          <li>tentar burlar, sobrecarregar ou obter acesso indevido à infraestrutura;</li>
          <li>copiar o conteúdo do site para uso comercial próprio.</li>
        </ul>
        <p>Cadastros que descumprirem isso podem ser removidos da lista sem aviso.</p>

        <h2>7. Conteúdo e marca</h2>
        <p>
          O nome Digi.IA, a identidade visual, os textos e as imagens deste site são de titularidade
          de <strong>[RAZÃO SOCIAL]</strong>. Entrar na lista não concede nenhuma licença sobre esse
          material.
        </p>

        <h2>8. Limites de responsabilidade</h2>
        <p>
          O site é oferecido como está, para o fim de divulgar o lançamento. Fazemos o possível para
          mantê-lo disponível e correto, mas não garantimos ausência de interrupções ou de erros de
          digitação, e não respondemos por indisponibilidade de serviços de terceiros dos quais o
          site depende (hospedagem, banco de dados e plataforma de pagamento).
        </p>
        <p>Nada aqui afasta os direitos que a legislação consumerista garante a você.</p>

        <h2>9. Seus dados</h2>
        <p>
          O tratamento dos dados informados está descrito na{' '}
          <a href="/privacidade">política de privacidade</a>, que faz parte destes termos.
        </p>

        <h2>10. Mudanças</h2>
        <p>
          Podemos alterar estes termos. A data no topo indica a última versão. Alterações que
          reduzam direitos de quem já está na lista serão comunicadas por e-mail antes de valerem.
        </p>

        <h2>11. Lei aplicável</h2>
        <p>
          Aplica-se a lei brasileira. Fica eleito o foro da comarca de <strong>[CIDADE/UF]</strong>,
          sem prejuízo do direito do consumidor de demandar no foro do seu domicílio.
        </p>

        <footer>
          <a href="/">Voltar para a página inicial</a>
          <a href="/privacidade">Política de privacidade</a>
        </footer>
      </div>
    </div>
  )
}
