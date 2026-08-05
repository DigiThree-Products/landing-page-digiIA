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
    description:
      'Antes de entrar na lista, veja a Digi.IA sendo operada de verdade — do pedido em português até a peça pronta.',
  },
  /**
   * O que ela faz.
   *
   * Cada célula mostra o que SAI do produto, não o que ele promete — a tela é o
   * argumento. Os exemplos são fictícios de propósito: nome de cliente real não
   * vai a uma página pública sem autorização por escrito.
   *
   * Antes de anunciar um módulo aqui, confirme que ele roda no dia do
   * lançamento. Módulo prometido e não entregue queima o posicionamento.
   */
  features: {
    eyebrow: 'O que ela faz',
    title: `O método da ${SITE.organizacaoMae}, agora`,
    titleHighlight: 'na sua mão.',
    description: `Construída em cima da forma como a ${SITE.organizacaoMae} trabalha há mais de 15 anos em Comunicação, Marketing, Publicidade e Audiovisual. Ela não responde por achismo — responde pelo método.`,
    cria: {
      verb: 'Cria',
      title: 'Saia com a campanha pronta',
      description: 'Ela aprende como sua marca fala uma vez e mantém o tom do post ao roteiro.',
      exemplo: {
        marca: 'Pizzaria Bella',
        contexto: '· Instagram · 8 set',
        legenda:
          'Segunda também merece massa fresca. Hoje o rodízio vai até 23h — e a primeira taça é por nossa conta.',
        marcadores: '#pizzariabella #massafresca #angradosreis',
        variacoes: [
          { rotulo: 'Versão aprovada', ativa: true },
          { rotulo: 'B — foco em preço', ativa: false },
          { rotulo: 'C — happy hour', ativa: false },
          { rotulo: 'Story 1080×1920', ativa: false },
        ],
      },
    },

    planeja: {
      verb: 'Planeja',
      title: 'Monte o mês inteiro',
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

    calcula: {
      verb: 'Calcula',
      title: 'Saiba o custo antes',
      linhas: [
        { rotulo: 'Investimento', valor: 'R$ 1.840', destaque: false },
        { rotulo: 'ROI projetado', valor: '3,2×', destaque: true },
      ],
    },

    dna: {
      verb: 'DNA Estratégico',
      title: 'Por que não sai genérico',
      campos: [
        { rotulo: 'Tom de voz', valor: 'Direto, caloroso, sem formalidade' },
        { rotulo: 'Público', valor: 'Famílias do bairro, 30 a 55' },
      ],
    },

    repertorio: {
      title: '10 aulas que ensinam a pedir',
      selo: 'Repertório · incluso em todos os planos',
      aulas: [
        { codigo: 'R01', titulo: 'Post solto x plano de conteúdo' },
        { codigo: 'R04', titulo: 'Como descrever o seu público' },
        { codigo: 'R06', titulo: 'Campanha x post isolado' },
        { codigo: 'R09', titulo: 'Ler o resultado sem se enganar' },
      ],
    },
  },
  demo: {
    eyebrow: 'Como funciona',
    /* Duas linhas de propósito: o ritmo binário é o argumento. Título de
       seção com 3 a 5 palavras é a norma nas referências; a frase longa
       que ficava aqui virou subtítulo, que é o papel dela. */
    title: 'Você pede.',
    titleAccent: 'Ela entrega.',
    subtitle: 'Seu pedido ganha forma e evolui com cada ajuste.',
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
    title: 'Restam poucas vagas.',
    revealedTitle: 'Condições especiais de lançamento.',
    ticker: 'PRIMEIRA TURMA  CONDIÇÃO DE LANÇAMENTO.',
    cta: 'Garantir minha condição',
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
