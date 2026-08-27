import { SITE } from '@/config/site'

export type DemoScene = {
  prompt: string
  label: string
  items: readonly (readonly [string, string])[]
}

/** Toda a copy da landing. Componentes cuidam de apresentação e interação. */
export const LANDING = {
  skipLink: 'Pular para a oferta e cadastro',
  nav: { byline: `por ${SITE.organizacaoMae}` },
  hero: {
    eyebrow: `Lançamento • ${SITE.lancamento.diaMes}`,
    title: 'Seu mês, na palma',
    highlight: 'da sua mão.',
    description:
      'Você explica uma vez. Ela planeja o mês, escreve na voz da sua marca e calcula o retorno. Você aprova.',
    offer: 'Primeira turma, com a condição de lançamento. Nenhuma cobrança agora.',
    cta: 'Garanta sua vaga',
    countdownLabel: 'Faltam',
  },
  video: {
    eyebrow: 'Veja funcionando',
    title: 'A gente usando',
    titleLineTwo: 'sem corte e sem',
    titleAccent: 'mágica.',
    /* A descrição não explica o que o vídeo mostra — a tela já mostra. Ela diz
       por que assistir, e a aposta é a honestidade da gravação: "no tempo que
       leva de verdade" é uma promessa que quase ninguém no mercado de IA faz.
       Só manter enquanto o vídeo for realmente sem corte. */
    description:
      'Sem corte, sem aceleração, sem tela regravada. Do pedido em português até a peça pronta — no tempo que leva de verdade.',
  },
  /**
   * O que ela faz.
   *
   * Cada célula mostra o que SAI do produto, não o que ele promete — a tela é o
   * argumento.
   *
   * SEM EXEMPLO FICTÍCIO, em nenhuma célula. Havia aqui uma "Pizzaria Bella"
   * com legendas inventadas, e ela era o último negócio de mentira da página:
   * a seção Demo sempre usou descritor de segmento ("uma joalheria de bairro")
   * e o DNA Estratégico perdeu a marca de exemplo em 20/08. O bento estava
   * sozinho na exceção.
   *
   * A saída disso não é abstrair a copy — texto abstrato não demonstra nada. É
   * mostrar a ANATOMIA do que a ferramenta produz: os campos que cada peça
   * carrega. Concreto, verificável, e sobre nenhum negócio em particular.
   *
   * Cliente real continua possível, e seria mais forte que tudo isto — mas só
   * com autorização por escrito, e nunca inventado.
   *
   * QUEM LÊ ESTA SEÇÃO é um empresário que não tem tempo — não é um social
   * media procurando ferramenta. Ele não senta no domingo para montar
   * calendário e não tem ideia pronta de post na segunda. Por isso cada
   * quadrado abre com o que DESAPARECE da rotina dele, no mesmo ritmo
   * ("Você não..."), e só depois mostra o artefato. O paralelismo é
   * proposital: quatro vezes a mesma construção lê como lista de tempo
   * devolvido, não como lista de funcionalidade.
   *
   * Antes de anunciar um módulo aqui, confirme que ele roda no dia do
   * lançamento. Módulo prometido e não entregue queima o posicionamento.
   */
  features: {
    /**
     * O número da parada na rota.
     *
     * A página tem SEIS estações, nesta ordem: Veja funcionando (01), O que
     * ela faz (02), Como funciona (03), DNA Estratégico (04), Quem está por
     * trás (05) e Perguntas (06). Numerar é o que transforma "seções que
     * rolam" em paradas de um trajeto — a metáfora da estação hoje vive
     * inteira no movimento e some no instante em que ele acaba.
     *
     * PILOTO: por enquanto só esta seção tem número, para validar o
     * tratamento. Ou as seis passam a ter, ou nenhuma — uma estação
     * numerada no meio de cinco sem número lê como erro, não como sistema.
     */
    estacao: '02',
    eyebrow: 'O que ela faz',
    /* DUAS METADES, E O SATÉLITE PASSA ENTRE ELAS.
       O corte é o MESMO de sempre — "O método da DigiThree," / "agora na sua
       mão." —, mas é a terceira vez que ele muda de razão, e vale registrar as
       três para ninguém desfazer a de agora achando que desfaz uma das outras:

       1. Partido, porque não cabia. O cabeçalho dividia a tela com um 2×2 de
          cards à direita e tinha ~435px; a frase inteira não entrava.
       2. Rejuntado, porque passou a caber. Com os cards de volta em fileira o
          cabeçalho recuperou a largura cheia — medido, 793px de texto com a
          fonte no teto de 40px contra 1121px de cabeçalho.
       3. Partido de novo, por composição. A Estação 02 ganhou um satélite no
          meio da fileira, e o mastro dele sobe bem no eixo central. Com a
          frase inteira, o texto passa por cima: medido, ela cruza o centro do
          layout (793px de texto contra 609px de meio). As duas metades abrem
          o vão por onde o mastro sobe.

       O TEXTO NÃO MUDOU uma letra em nenhuma das três vezes. O que muda é onde
       ele pode quebrar. E "agora" trocou de lado no corte 3: ela pertence à
       retomada depois do mastro, não ao fecho da primeira metade.

       NO CELULAR AS DUAS VOLTAM A CORRER JUNTAS, porque lá não há satélite
       (styles/recursos.css esconde a camada inteira) e portanto não há vão a
       abrir — a regra que separa as metades é de desktop. */
    title: `O método da ${SITE.organizacaoMae},`,
    titleDepois: 'agora',
    titleHighlight: 'na sua mão.',

    /* PRIMEIRO QUADRADO, e a ordem não é decorativa: a dor que o dono do
       produto nomeia primeiro é a de não ter tempo de planejar o mês. Quem
       lê reconhece a própria semana antes de saber o que a ferramenta faz. */
    planeja: {
      verb: 'Planeja',
      title: 'Monte o mês inteiro',
      beneficio: 'Você não perde o domingo decidindo o que postar na semana.',
      dias: [
        { dia: 'seg 07', formato: 'Carrossel', leve: false },
        { dia: 'ter 08', formato: 'Reels', leve: false },
        { dia: 'qua 09', formato: 'Story', leve: true },
        { dia: 'qui 10', formato: 'Post', leve: false },
        { dia: 'sex 11', formato: 'Reels', leve: false },
        { dia: 'sáb 12', formato: 'Story', leve: true },
        { dia: 'dom 13', formato: 'Carrossel', leve: false },
      ],
    },

    cria: {
      verb: 'Cria',
      title: 'Saia com a campanha pronta',
      beneficio: 'Você não encara a página em branco procurando o que dizer.',
      /**
       * A anatomia da peça pronta — o que substituiu o post fictício.
       *
       * Os seis campos NÃO foram escolhidos por estética: são os que a tela
       * do produto mostra quando um plano é gerado. Se a interface passar a
       * entregar campo diferente, é aqui que se corrige — a página não pode
       * descrever uma tela que não existe (regra do lançamento: módulo
       * mostrado e não entregue queima o posicionamento).
       *
       * SÃO SAÍDA, NÃO MÉTODO, e é isso que os torna publicáveis. Os campos
       * do DNA Estratégico continuam trancados em LANDING.dna porque são a
       * CAUSA; estes são o EFEITO, e qualquer concorrente já supõe que uma
       * peça de conteúdo tem data, canal e formato. Não se copia nada daqui.
       *
       * Cada `valor` é rastreável a algo que a página já afirma: "melhor
       * horário" vem de LANDING.demo, os formatos vêm do calendário do card
       * PLANEJA, e "na voz da sua marca" vem da hero. Nenhum é novo.
       */
      /* SEM TÍTULO INTERNO. A ficha tinha um ("O que vem em cada peça") de
         quando morava num card largo. No quadrado ele custa uma linha e não
         paga por ela: o h3 e a linha de benefício logo acima já dizem que o
         que vem abaixo é a peça pronta. Vale para a estrutura do roteiro
         também, e pelo mesmo motivo. */
      /* OS VALORES SÃO CURTOS DE PROPÓSITO, e ficaram mais curtos em 21/08.
         Nenhum campo saiu — os seis continuam sendo os que a tela do produto
         mostra. O que encolheu foi a explicação de cada um.

         O motivo é de composição: numa fileira de quatro cards sem caixa, o
         que separa um card do outro é só o vazio. Valor que quebra em duas
         linhas estica o bloco até a borda da coluna e cola visualmente no
         vizinho. "post, carrossel, reels ou story" era o pior caso; virou
         "post, reels, story" e o bloco passou a caber em uma linha por campo.

         A régua para acrescentar campo novo aqui: se o valor não couber em
         uma linha na largura da coluna, encurte o VALOR — não a lista. */
      saida: {
        campos: [
          { rotulo: 'Data', valor: 'dia e horário' },
          { rotulo: 'Canal', valor: 'onde publicar' },
          { rotulo: 'Formato', valor: 'post, reels, story' },
          { rotulo: 'Objetivo', valor: 'o que precisa fazer' },
          { rotulo: 'Copy', valor: 'na voz da sua marca' },
          { rotulo: 'CTA', valor: 'a chamada' },
        ],
        /* HAVIA UMA NOTA AQUI: "Nenhuma peça chega como ideia solta." Saiu na
           reestruturação em quadrados, por dois motivos que se somam.

           Media 28px com o filete, e era exatamente o que impedia o CRIA de
           ser quadrado: ele fechava em 260×280 e, num grid, o item mais alto
           estica a linha — os outros três viravam 260×280 junto. Um quadrado
           que não é quadrado é a única coisa que esta composição não pode
           ter.

           E ela tinha virado redundante de qualquer jeito: dizia o que a
           própria ficha de seis campos demonstra, e a linha de benefício
           acima já carrega o argumento do quadrado. Era também a única nota
           sob um artefato entre os quatro — assimetria sem função. */
      },
    },

    /**
     * ROTEIRIZA — o quadrado novo, entrou na reestruturação de 21/08.
     *
     * CONFIRMAR ANTES DE PUBLICAR: "Roteirista" é módulo do plano Pro para
     * cima, e a regra 7 do plano de lançamento é explícita — só entra na
     * comunicação o módulo que estiver rodando em 14/09. Se ele escorregar,
     * este quadrado sai; não vira "em breve".
     *
     * O artefato é a ESTRUTURA do roteiro, não um roteiro. Mesma solução da
     * ficha do CRIA e pelo mesmo motivo: um roteiro concreto seria sobre
     * algum negócio, e a página não inventa negócio. "Gancho" é vocabulário
     * da própria casa, não jargão importado.
     *
     * SEQUÊNCIA, e por isso numerada: um roteiro é ordem no tempo — o gancho
     * vem antes da fala porque perder os primeiros segundos perde o vídeo.
     * A ficha do CRIA é conjunto e não leva número; esta leva.
     */
    roteiriza: {
      verb: 'Roteiriza',
      title: 'Grave sem improvisar',
      beneficio: 'Você não trava na câmera sem saber por onde começar.',
      /* Valores encurtados pelo mesmo motivo da ficha do CRIA, e aqui o
         ganho foi maior: cada passo ocupava DUAS linhas (rótulo em cima,
         explicação embaixo) e este era o artefato mais alto dos quatro, o
         que definia a altura do slot inteiro. Em uma linha por passo, ele
         encolheu pela metade e a fileira toda ficou mais baixa. */
      roteiro: {
        passos: [
          { ordem: '01', rotulo: 'Gancho', valor: 'a primeira linha' },
          { ordem: '02', rotulo: 'Cena', valor: 'o que aparece' },
          { ordem: '03', rotulo: 'Fala', valor: 'a fala, escrita' },
          { ordem: '04', rotulo: 'Fecho', valor: 'a chamada' },
        ],
      },
    },

    /**
     * O investimento é do visitante: arrastar põe o número dele na tela,
     * e é aí que ele para de avaliar um exemplo e passa a avaliar o
     * próprio caso.
     *
     * ATENÇÃO ANTES DO LANÇAMENTO: a curva de retorno abaixo é
     * ilustrativa — inventei os extremos para o controle ter o que
     * mostrar. Trocar por números que a DigiThree consiga sustentar se
     * um cliente perguntar de onde saíram.
     *
     * SEGUNDA ATENÇÃO, levantada em 21/08 e mantida por decisão do dono do
     * produto: na tabela de planos de julho, "Analytics e ROI" é exclusivo
     * do plano Agência — o mais caro. Este quadrado o apresenta com o mesmo
     * peso dos outros três, para um público que a própria página define como
     * comércio, restaurante e clínica, que compra os planos de baixo. Ou o
     * módulo desce de degrau, ou a promessa ganha ressalva em algum lugar.
     * A hero, que está congelada, promete o mesmo ("calcula o retorno").
     */
    calcula: {
      verb: 'Calcula',
      title: 'Saiba o custo antes',
      beneficio: 'Você não descobre quanto gastou depois do dinheiro sair.',
      investimento: {
        rotulo: 'Investimento',
        etiqueta: 'Investimento em mídia, em reais',
        min: 500,
        max: 10000,
        passo: 100,
        inicial: 1840,
      },
      retorno: {
        rotulo: 'ROI projetado',
        /* Duas funções em uma linha: diz que se arrasta (o controle
           precisa de sinal) e que o número é projeção, não promessa. */
        nota: 'Arraste para simular · projeção ilustrativa',
        /* Retorno decrescente: o primeiro real investido rende mais que
           o décimo milésimo. Reta simples entre os dois extremos. */
        maior: 3.4,
        menor: 2.6,
      },
    },

    /* JÁ MORARAM AQUI dois blocos que hoje têm seção própria.

       O card `dna` ("Tom de voz" e "Público") saiu em 20/08: os dois campos
       eram os MESMOS que a ficha de LANDING.dna abre, e o bento os mostrava
       primeiro e menor. Repetir o argumento na versão fraca antes da forte é
       o pior dos dois mundos.

       A faixa `repertorio` saiu em 21/08, na reestruturação para quadrados, e
       virou LANDING.repertorio. O motivo é de definição: esta seção passou a
       ser "o que a IA cria", e as aulas não são criação da IA — são gravadas
       por gente. Faixa de outro assunto no rodapé da composição diluía as
       duas coisas.

       Se alguém precisar de um dos dois de volta aqui, o problema não é
       recriá-lo: é que ele vai brigar com a seção que já existe. */
  },
  demo: {
    eyebrow: 'Como funciona',
    /* Duas partes na mesma linha: o ritmo binário é o argumento. Título de
       seção com 3 a 5 palavras é a norma nas referências; a frase longa
       que ficava aqui virou subtítulo, que é o papel dela. */
    title: 'Você pede.',
    titleAccent: 'Ela entrega.',
    /* A segunda frase vende CONTROLE, que é o segundo medo de quem compra IA
       de marketing — o primeiro é sair genérico, e disso cuida a seção de DNA.
       A etapa de aprovação existe no produto e o site não a vendia. */
    subtitle:
      'Seu pedido ganha forma e evolui com cada ajuste. Nada vai para o ar sem o seu de acordo.',
    windowLabel: 'Digi.IA — demonstração',
    scenes: [
      {
        prompt: 'campanha de dia das mães para uma joalheria de bairro',
        label: 'Campanha gerada — 3 variações',
        items: [
          ['01', 'Headline: “Ela guardou tudo. Guarde isso para ela.”'],
          ['02', 'Headline: “Presente que não vai para a gaveta.”'],
          ['03', 'Headline: “Dez anos de loja. Milhares de mães.”'],
          ['→', 'Legenda, criativo 1080×1350 e versão para stories inclusos.'],
        ],
      },
      {
        prompt: 'calendário editorial de 30 dias para uma clínica odontológica',
        label: 'Calendário gerado — abril',
        items: [
          ['01', 'Seg — Carrossel: o que ninguém conta sobre clareamento'],
          ['02', 'Qua — Reels: bastidor de um dia na clínica'],
          ['03', 'Sex — Post: antes e depois com consentimento do paciente'],
          ['→', 'Mais 27 pautas com formato, legenda e melhor horário.'],
        ],
      },
      {
        prompt: 'qual o ROI de investir R$ 3.000 em tráfego neste lançamento?',
        label: 'Projeção calculada',
        items: [
          ['R$', 'Custo por lead estimado: R$ 4,80 — 625 leads no período'],
          ['%', 'Conversão histórica do setor: 3,2% → 20 vendas'],
          ['→', 'ROI projetado: 2,4× sobre o investimento em mídia'],
          ['→', 'Cenário conservador e cenário otimista no detalhamento.'],
        ],
      },
    ] satisfies readonly DemoScene[],
  },
  /**
   * DNA Estratégico — a estação que responde "por que não sai com cara de IA".
   *
   * A REGRA DESTA SEÇÃO, e ela não é negociável: mostrar o EFEITO, nunca a
   * CAUSA. O diferencial da Digi.IA está no método, e o método é segredo
   * comercial. Nada aqui pode dizer COMO a direção é produzida.
   *
   * Por isso:
   *   - só `abertos` tem valor legível, e são os dois campos que qualquer
   *     concorrente já supõe existir (tom de voz e público). Custam nada.
   *   - `travados` são NOMES DE CATEGORIA e mais nada. Nenhum deles é uma
   *     pergunta reaproveitável. Dizem que existe sistema e param aí.
   *
   * Antes de mexer em qualquer linha daqui, o teste: um concorrente
   * conseguiria copiar alguma coisa lendo isto? Se sim, a linha virou causa e
   * precisa voltar a ser efeito.
   *
   * SEM MARCA DE EXEMPLO, por decisão do dono do produto (20/08/2026). A ficha
   * é a DO VISITANTE, não a de um cliente fictício. Houve aqui um contraste
   * "uma IA qualquer × a sua", com dois textos de saída lado a lado, e ele era
   * a peça mais forte da seção — mas copy concreta é necessariamente sobre
   * ALGUM negócio, e sem exemplo ela não existe. Foi removido inteiro em vez
   * de virar texto abstrato, que não demonstraria nada.
   *
   * Os valores de `abertos` ficam: "Direto, caloroso, sem formalidade" e
   * "Famílias do bairro, 30 a 55" são descritores, não nomeiam negócio nenhum.
   * Se algum dia voltarem a soar como exemplo, é aqui que se troca.
   *
   * Posição: depois do Demo, antes do "+15 anos". Não é estética — a objeção
   * "IA faz conteúdo genérico" nasce logo depois de ver a máquina produzindo,
   * e o "+15 anos" passa a ser a história de origem do DNA em vez de um selo
   * solto. Mexer na ordem desfaz as duas costuras.
   */
  dna: {
    eyebrow: 'DNA Estratégico',
    title: 'Por que não sai com cara de IA.',
    /* "Cara de IA" é a palavra que o dono de negócio usa; "genérico" é a que
       nós usamos. A segunda frase é o que justifica os cadeados abaixo — e
       justifica por CONFIDENCIALIDADE DO CLIENTE, não por segredo nosso. É
       verdade, e ecoa a promessa de privacidade que a FAQ já faz. */
    /* UMA IDEIA SÓ, e curta. É o posto 2 da seção — a resposta à pergunta do
       título — e posto 2 que carrega duas ideias empata com o posto 3.

       Havia aqui uma segunda oração sobre o dado ficar na conta do cliente.
       Saiu por ser redundante: quem justifica os cadeados é a nota do próprio
       cartão ("O DNA completo é confidencial de cada marca"), que está ao
       lado deles, que é onde a dúvida nasce. */
    description: 'Toda IA escreve. A diferença está no que ela sabe antes de escrever.',
    ficha: {
      /* A ficha é a DO VISITANTE. Era "Pizzaria Bella" e virou isto quando os
         exemplos saíram: em vez de espiar o DNA de um estranho, ele olha para
         o próprio. Converte melhor pelo mesmo motivo — a tela passa a falar
         dele, não de um caso. */
      marca: 'a sua marca',
      /* Renomeadas de propósito: no produto as abas têm outros nomes. Estas
         dizem o que interessa a quem compra — que o DNA aprende com o mês
         anterior — sem espelhar a arquitetura interna. */
      abas: ['Marca', 'Resultados', 'Evolução'],
      abertos: [
        { rotulo: 'Tom de voz', valor: 'Direto, caloroso, sem formalidade' },
        { rotulo: 'Público', valor: 'Famílias do bairro, 30 a 55' },
      ],
      /* "Restrições editoriais" e "Diretrizes de linguagem" fazem o trabalho
         mais pesado: plantam a ideia de que existem regras sobre o que ela NÃO
         pode escrever, sem entregar uma única regra. */
      travados: [
        'Posicionamento',
        'Território de marca',
        'Restrições editoriais',
        'Diretrizes de linguagem',
        'Indicadores do mês',
      ],
      nota: 'O DNA completo é confidencial de cada marca.',
    },
    /**
     * As três respostas que a seção precisa dar, agora que não há contraste
     * para dá-las por demonstração.
     *
     * Cada uma responde a uma pergunta que o dono de negócio faz de verdade,
     * nesta ordem: vou ter trabalho? vai ficar igual ao dos outros? e daqui a
     * seis meses? Todas falam do EFEITO — nenhuma descreve o mecanismo.
     *
     * UMA LINHA CADA, e isso é requisito de layout, não de estilo. Eram pares
     * de título e parágrafo, e três blocos de texto ao lado do cartão faziam
     * a seção inteira competir consigo mesma — sem hierarquia, embolada. Como
     * linha única elas viram ritmo na coluna de leitura em vez de um segundo
     * objeto. Se alguma passar de ~55 caracteres, quebra em duas e o ritmo
     * se perde.
     */
    pilares: [
      'A ficha é montada numa conversa, não num formulário.',
      'Duas marcas nunca partem da mesma base.',
      'O que funcionou num mês vira instrução no seguinte.',
    ],
    /* UM trabalho só: entregar o bastão para a próxima seção, que responde
       com "A IA é nova. O método não."

       Fazia três, e por isso era um parágrafo: matava o medo de preencher,
       justificava a vaga limitada e fazia a ponte. Os dois primeiros
       saíram porque já estavam ditos em outro lugar — o primeiro na linha de
       abertura dos pilares ("não num formulário"), o segundo na linha de
       escassez da própria seção de credibilidade. Repetido, cada argumento
       vale menos, não mais.

       A data é o que faz a ponte: ela abre a pergunta "desde 2010?" que a
       seção seguinte existe para responder. */
    fecho: `É o mesmo briefing que a ${SITE.organizacaoMae} monta para cada cliente desde 2010.`,
  },
  offer: {
    eyebrow: 'A oferta',
    title: 'Restam poucas vagas.',
    revealedTitle: 'Condições especiais de lançamento.',
    ticker: 'PRIMEIRA TURMA  CONDIÇÃO DE LANÇAMENTO.',
    cta: 'Garantir minha condição',
  },
  /**
   * "Quem está por trás" — a seção de autoridade.
   *
   * Era um dado só ("+15 anos") mais uma frase. Passou a ser autoridade em
   * CAMADAS, que é o que sustenta a afirmação: âncora temporal (o título e o
   * "desde 2010"), volume (380+ campanhas), alcance (120+ clientes) e
   * amplitude (9 segmentos). Um número sozinho se lê como slogan; quatro que
   * se confirmam se leem como registro.
   *
   * `titleLineTwo` ecoa de propósito o título da hero ("Seu mês, na palma da
   * sua mão"): a promessa da primeira tela reaparecendo aqui com prova atrás
   * dela. Mexer num sem olhar o outro desmancha a costura.
   */
  credibility: {
    kicker: 'Quem está por trás',
    title: '15 anos de campanhas reais.',
    titleLineTwo: 'Agora na palma da sua mão.',
    description: `A ${SITE.organizacaoMae} atende comércio e serviço desde 2010. O planejamento mensal, o tom de voz, o cálculo de ROI, a criação do conteúdo pensada e planejada para te fazer vender mais — tudo que a ${SITE.nome} faz saiu de um processo que já rodou em conta de cliente.`,
    /**
     * A ponte entre a agência e o produto, e a única frase do manifesto que
     * vai em branco cheio. Autoridade de agência não converte sozinha: ela
     * precisa dizer o que tem a ver com o que está sendo vendido.
     */
    punch: 'A IA é nova. O método não.',
    /**
     * Números fornecidos pelo dono do produto (ago/2026) e publicados como
     * FATOS. O "9" é exato de propósito — sem "+": número redondo lê como
     * marketing, número exato lê como medido. Atualizar aqui quando os dados
     * mudarem; nenhum componente conhece esses valores.
     *
     * O primeiro é a ESTRELA (monumental, ao lado do manifesto); os três
     * seguintes formam o trilho na base. A ordem deles é volume → alcance →
     * amplitude, do mais concreto ao mais abstrato.
     */
    stats: [
      { value: '15+', label: 'anos de agência' },
      { value: '380+', label: 'campanhas no ar' },
      { value: '120+', label: 'clientes atendidos' },
      { value: '9', label: 'segmentos' },
    ],
  },
  /**
   * Repertório — as aulas, agora em seção própria.
   *
   * Era uma faixa no rodapé do bento de "O que ela faz" e saiu de lá em
   * 21/08: aquela seção passou a mostrar só o que a IA cria, e aula gravada
   * por gente não é criação da IA.
   *
   * POSIÇÃO: depois da credibilidade, antes da FAQ. A costura é o "15 anos":
   * a seção anterior fecha com "A IA é nova. O método não." e esta abre
   * dizendo de quem são as aulas. Trocada de lugar, vira bônus solto.
   *
   * A LINHA QUE NÃO PODE MUDAR SOZINHA: a FAQ promete "não existe técnica de
   * prompt para aprender — se souber explicar a campanha, sabe usar". Se esta
   * seção vender "aulas de como pedir para a IA", a página passa a se
   * contradizer a duas seções de distância. Por isso `description` diz o
   * oposto com as mesmas palavras da FAQ, de propósito: as aulas são de
   * marketing, não de ferramenta.
   *
   * SÓ QUATRO TÍTULOS, e são os quatro que existem de verdade. As outras seis
   * aulas não estão escritas em lugar nenhum — inventar título de aula é a
   * mesma mentira que a marca de exemplo que acabou de sair da página. Quando
   * as dez estiverem definidas, é aqui que entram e a `nota` sai.
   */
  repertorio: {
    eyebrow: 'Repertório',
    title: '10 aulas de quem faz isso há 15 anos',
    description:
      'Não são aulas de como usar a ferramenta — se você sabe explicar a campanha, já sabe usar. São as decisões de marketing que a gente aprendeu tomando por cliente, uma a uma, desde 2010.',
    selo: 'Incluso em todos os planos',
    aulas: [
      { codigo: 'R01', titulo: 'Post solto x plano de conteúdo' },
      { codigo: 'R04', titulo: 'Como descrever o seu público' },
      { codigo: 'R06', titulo: 'Campanha x post isolado' },
      { codigo: 'R09', titulo: 'Ler o resultado sem se enganar' },
    ],
    nota: 'e mais seis, na biblioteca que abre com a sua conta.',
  },
  faq: {
    eyebrow: 'Perguntas',
    title: 'O que costumam perguntar antes de entrar.',
    /**
     * As DUAS PRIMEIRAS são as mais novas e estão em primeiro de propósito.
     *
     * A FAQ virou peça de conversão, e não só de suporte: a seção da oferta
     * está congelada, então os argumentos que deveriam viver lá — a objeção
     * contra IA e a escassez com motivo — foram realocados para cá, que é o
     * lugar disponível mais perto da decisão.
     *
     * A primeira responde pelo EFEITO. Nenhuma resposta desta FAQ pode
     * descrever como a direção é produzida: ver a regra em LANDING.dna.
     */
    items: [
      {
        question: 'O conteúdo não vai sair com cara de IA?',
        answer:
          'Essa é a pergunta certa. A diferença não está no texto, está no que vem antes dele: a sua marca é configurada com a nossa equipe antes de qualquer conteúdo existir — como ela fala, com quem fala, o que nunca diria. Depois disso, nada é publicado sem você aprovar.',
      },
      {
        question: 'Por que a primeira turma é limitada?',
        answer: `Porque a configuração inicial de cada conta é feita à mão pela nossa equipe, uma por uma. São ${SITE.turma.vagas} vagas nesta primeira turma — é o que conseguimos atender bem até ${SITE.lancamento.diaMes}. Quando encher, a lista continua aberta para a turma seguinte, sem a condição de lançamento.`,
      },
      {
        question: 'Quanto vai custar?',
        answer:
          'Os planos serão anunciados no lançamento. Quem está na lista recebe a tabela antes de todo mundo, já com o desconto aplicado — e decide depois de ver o preço, não antes.',
      },
      {
        question: 'O desconto é garantido mesmo?',
        answer: `Sim, enquanto houver vagas. Ele fica vinculado ao e-mail que você cadastrar e vale por 12 meses a partir da ativação. Se a primeira turma lotar antes de ${SITE.lancamento.diaMes}, avisamos por e-mail.`,
      },
      {
        question: 'Preciso saber usar IA?',
        answer:
          'Não. Você escreve o que precisa como escreveria para um colega. Não existe técnica de prompt para aprender — se souber explicar a campanha, sabe usar.',
      },
      {
        question: 'Meus dados vão treinar algum modelo?',
        answer:
          'Não. O conteúdo da sua marca é usado apenas para gerar as suas peças e fica isolado na sua conta.',
      },
      {
        question: 'O que acontece se eu não gostar?',
        answer:
          'Entrar na lista não é compra. No dia do lançamento você testa e decide. Se não fizer sentido, basta não ativar — nenhum dado de pagamento foi pedido até aqui.',
      },
      {
        question: 'Quando exatamente libera?',
        answer: `${SITE.lancamento.diaMes}. Quem está na lista recebe o acesso pela manhã, antes da abertura pública.`,
      },
    ],
  },
  finalCta: {
    eyebrow: 'Primeira turma com condição de lançamento',
    title: 'Entre agora e receba o preço antes da abertura.',
    signature: 'Onde as ideias ganham vida.',
    cta: 'Entrar na primeira turma',
    note: 'O formulário abre aqui, sem sair da página.',
  },
  waitlist: {
    businessTypes: [
      'Agência de marketing',
      'Social media / freelancer',
      'Comércio ou loja',
      'Restaurante ou bar',
      'Clínica ou consultório',
      'Serviços',
      'Indústria',
    ],
    successTitle: 'Pronto. Você está na lista.',
    successMessage: `Cadastro recebido. No dia ${SITE.lancamento.diaMes}, você recebe o acesso e a tabela de preços antes da abertura pública.`,
  },
  footer: {
    signature: 'Onde as ideias ganham vida.',
    copyright: `© 2026 ${SITE.organizacaoMae}`,
    launch: `Digi.IA · lançamento ${SITE.lancamento.curto}`,
  },
} as const
