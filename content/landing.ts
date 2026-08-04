import { SITE } from '@/config/site'

export type FeatureIcon = 'planeja' | 'cria' | 'calcula'
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
    title: 'Conteúdo e campanhas',
    highlight: 'antes do café esfriar.',
    description:
      'Você explica uma vez. Ela planeja o mês, escreve na voz da sua marca e calcula o retorno. Você aprova.',
    offer: 'Entre na lista antes do lançamento e você recebe o preço antes de todo mundo.',
    cta: 'Garanta sua vaga',
    countdownLabel: 'Faltam',
  },
  video: {
    eyebrow: 'Veja funcionando',
    title: 'A gente usando, sem corte e sem mágica.',
    description:
      'Antes de entrar na lista, veja a Digi.IA sendo operada de verdade — do pedido em português até a peça pronta.',
    caption: `Gravado por quem construiu a ferramenta, na ${SITE.organizacaoMae}.`,
    cta: 'Entrar na lista',
  },
  features: {
    eyebrow: 'O que ela faz',
    title: `O método da ${SITE.organizacaoMae}, agora do seu lado.`,
    description: `A Digi.IA foi construída em cima da forma como a ${SITE.organizacaoMae} trabalha há mais de 15 anos em Comunicação, Marketing, Publicidade e Audiovisual. Ela não responde por achismo — responde pelo método.`,
    proofValue: '15+ anos',
    proofText:
      'de campanhas reais viraram o critério que ela usa para decidir o que funciona.',
    cards: [
      {
        icon: 'planeja' as FeatureIcon,
        verb: 'Planeja',
        title: 'Nada começa na folha em branco',
        description:
          'Você diz o objetivo. Ela devolve a estrutura inteira, pronta para revisar e aprovar.',
        items: ['Planejamento de conteúdo', 'Calendário editorial do mês', 'Briefings detalhados'],
      },
      {
        icon: 'cria' as FeatureIcon,
        verb: 'Cria',
        title: 'A mesma voz em todo canal',
        description: 'Ela aprende como sua marca fala uma vez e mantém o tom do post ao roteiro.',
        items: [
          'Ideias de postagem',
          'Campanhas completas, com variações',
          'Roteiros para vídeo e audiovisual',
        ],
      },
      {
        icon: 'calcula' as FeatureIcon,
        verb: 'Calcula',
        title: 'Os números junto com a criação',
        description: 'A conta que costuma ficar para depois sai na mesma conversa da ideia.',
        items: ['Custos com marketing', 'Projeção de ROI', 'Orçamento por campanha'],
      },
    ],
    audienceLabel: 'Feita para quem faz',
    audience: [
      'Micro e pequenos empresários',
      'Social media',
      'Equipes internas de marketing',
      'Agências',
    ],
  },
  demo: {
    eyebrow: 'Como funciona',
    title: 'Você pede em português. Ela entrega em minutos.',
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
  offer: {
    eyebrow: 'A oferta',
    title: 'A condição da primeira turma não volta.',
    badge: '1ª',
    description:
      'Quem está na lista vê a tabela de preços antes de todo mundo — com a condição de lançamento já aplicada.',
    ticker: 'PRIMEIRA TURMA • CONDIÇÃO DE LANÇAMENTO •',
    countdownLabel: 'A condição muda em',
    cta: 'Garantir minha condição',
    ctaNote: 'Leva menos de 1 minuto. Nenhuma cobrança agora.',
    conditionsLabel: 'O que fica garantido',
    conditions: [
      'A primeira turma é limitada pela nossa capacidade de implantação — não por um número inventado.',
      'Nenhuma cobrança agora. Você escolhe o plano no lançamento.',
      'Se não quiser mais, é só não ativar. Sem multa, sem fidelidade.',
      `O desconto acompanha seu e-mail — não precisa correr no dia ${SITE.lancamento.diaMes.split(' ')[0]}.`,
    ],
  },
  credibility: {
    value: '15+',
    label: 'anos de mercado',
    description: `A Digi.IA nasce dentro da ${SITE.organizacaoMae} — construída em cima de campanhas reais, não de teoria.`,
  },
  faq: {
    eyebrow: 'Perguntas',
    title: 'O que costumam perguntar antes de entrar.',
    items: [
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
