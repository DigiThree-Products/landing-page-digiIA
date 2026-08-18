/**
 * Fonte única do progresso do mergulho na hero.
 *
 * A timeline em Hero.tsx é quem manda; HeroEstrelas só lê. O canal é um
 * objeto mutável em vez de estado do React ou de uma variável CSS por
 * dois motivos:
 *
 * 1. O mergulho anda a cada quadro. Passar por estado do React seria um
 *    render por quadro; passar por variável CSS obrigaria o canvas a
 *    chamar getComputedStyle no laço, que força recálculo de estilo.
 *    Um campo simples não faz nem um nem outro.
 * 2. Os dois lados precisam concordar sobre o que "0" e "1" significam.
 *    Junto num arquivo, a definição fica onde os dois olham — o mesmo
 *    motivo de lib/poeira.ts existir.
 *
 * `v` segue a rolagem nos dois sentidos (bidirecional — ver o `onUpdate`
 * em Hero.tsx): sobe ao descer, desce ao subir, no mesmo ritmo amortecido
 * do `scrub`. Quem lê não precisa saber disso — só que 0 é "fora" e 1 é
 * "dentro".
 */
export const mergulho = {
  /** 0 = cérebro ao longe, 1 = dentro dele. */
  v: 0,
  /**
   * Taxa de avanço em profundidade do campo dentro do cérebro, por
   * segundo e proporcional à própria profundidade (`dz/dt = -z · taxa`).
   * Publicada por `HeroEstrelas` a cada quadro; lida por `PoeiraFundo`.
   *
   * Existe porque velocidade também é um eixo da travessia, e era o
   * último desencontrado: o campo do site chegava cerca de cinco vezes
   * mais rápido que o do cérebro, e o salto quebrava a continuidade
   * mesmo com tamanho, cor, alfa, densidade e direção casados.
   *
   * É uma taxa publicada, e não uma constante copiada, porque os dois
   * campos medem velocidade em unidades diferentes — aqui é progresso de
   * um pin de 4 telas, lá é delta de rolagem em pixels. Igualar
   * constantes não igualaria nada; só a taxa resolvida casa. E assim o
   * casamento sobrevive a mudanças de calibragem de qualquer um dos dois.
   */
  taxaVoo: 0,
}

/**
 * Quanto o pin da hero segura ALÉM do mergulho original de 1,6 telas.
 *
 * O caminho foi 2,4 → 1,9 → 1,0 (pins de 4,0, 3,5 e 2,6 telas), sempre pelo
 * mesmo motivo: o movimento inteiro — do instante em que o cérebro começa a
 * ir para o centro até ele chegar ao tamanho final — estava longo demais de
 * rolar. Encurtar por aqui, e não pelas durações da timeline, é o que mantém
 * a proporção interna intacta: `FATOR` reabsorve a mudança e a fase de
 * centralização continua ocupando os mesmos ~490px de rolagem que sempre
 * ocupou.
 *
 * "Só o crescimento encolhe" era verdade enquanto `REVELA_EM` foi 0,875, e
 * deixou de ser: aquela fração é CRUA, não passa pelo `FATOR`, então a
 * janela de dissolução — que é a pista de pouso onde o cérebro é de fato
 * visto no tamanho cheio — encolhia junto, calada. Ela agora é defendida
 * explicitamente (ver `REVELA_EM`), e o corte sai inteiro do crescimento,
 * que é transporte:
 *
 *   centralização   0,54 tela   (preservada pelo `FATOR`)
 *   crescimento     1,62 tela   (era 2,52 — absorveu o corte inteiro)
 *   pista de pouso  0,44 tela   (preservada por `REVELA_EM`)
 *                   ─────────
 *                   2,60 telas
 */
export const SEGURA = 1

/** Comprimento do pin da hero, em telas. */
export const TOTAL = 1.6 + SEGURA

/**
 * Comprime as durações do texto e da centralização para o pin alongado,
 * mantendo as duas no mesmo ponto FÍSICO de rolagem qualquer que seja
 * `TOTAL` — uma duração de `0,34 * FATOR` num pin de `TOTAL` telas mede
 * `0,34 * 1,6` telas de rolagem, e o `TOTAL` se cancela.
 *
 * É por isso que mexer em `SEGURA` não desloca o começo do mergulho: só o
 * trecho de crescimento, que é o que sobra, muda de comprimento.
 */
export const FATOR = 1.6 / TOTAL

/**
 * Fração do mergulho em que a centralização termina e a escala começa
 * (mesmo ponto — ver a nota sobre `desloca` em Hero.tsx).
 *
 * DERIVADA, não digitada. Ela vale `0,34 * FATOR`, e enquanto foi um
 * literal (`0.136`, casado com `FATOR = 1,6/4,0`) qualquer mudança em
 * `SEGURA` a deixava mentindo em silêncio — o comentário que estava aqui
 * alertava contra "uma constante fixada duas vezes" sendo exatamente isso.
 * Agora `SEGURA` é o único dial: os dois valores mudam juntos por
 * construção.
 *
 * Exportada porque HeroObject.tsx também precisa dela: a partir deste
 * ponto o objeto deixa de ser um cérebro pequeno e apertável e passa a ser
 * uma imagem que já está crescendo além da tela, então segurar, a paralaxe
 * do cursor e o flutuar ocioso são desligados — do contrário competiriam
 * com a própria escala.
 */
export const ESCALA_EM = 0.34 * FATOR

/**
 * A pista de pouso, em TELAS de rolagem — o comprimento físico da janela de
 * dissolução, que `REVELA_EM` converte em fração.
 *
 * Escrita em telas e não em fração porque é assim que ela precisa ser
 * pensada: é o espaço em que o `scrub` (~1,1s de atraso) tem de alcançar a
 * escala para o cérebro ser visto nos 150× antes de apagar. Esse prazo é
 * medido em rolagem percorrida, não em fração de um pin cujo tamanho muda.
 *
 * 0,4375 é o valor que a janela sempre teve na prática — é quanto media o
 * literal 0,875 num pin de 3,5 telas. Mantido ao encurtar o pin para 2,6,
 * que é o ponto de existir esta constante.
 */
export const PISTA = 0.4375

/**
 * Fração do mergulho em que a seção inteira começa a apagar, revelando a
 * poeira cósmica de verdade atrás do cérebro.
 *
 * E, desde agora, o ponto em que o tween de ESCALA termina — o cérebro
 * chega ao tamanho final aqui, e só então começa a sumir. Antes ele crescia
 * e apagava ao mesmo tempo, os dois acabando juntos no fim do pin; na
 * prática isso significava que ele nunca era VISTO no tamanho cheio, porque
 * a escala anda no relógio atrasado do `scrub` e a opacidade no relógio cru
 * da rolagem (ver o `onUpdate` em Hero.tsx). A opacidade chegava a zero
 * primeiro e os últimos múltiplos de escala rodavam invisíveis. Terminar o
 * crescimento aqui dá ao `scrub` a folga da janela de dissolução inteira
 * para alcançar — é essa folga que faz os 150× aparecerem.
 *
 * Exportada daqui pelo mesmo motivo que `ESCALA_EM`: é o prazo que
 * `HeroEstrelas.tsx` tem. O que ele fizer com o grão ao longo do
 * mergulho precisa estar TERMINADO quando esta fração chega — o que
 * ainda estivesse mudando aqui viraria mais um eixo saltando junto com a
 * dissolução, e a travessia voltaria a ler como corte.
 *
 * DERIVADA de `PISTA`, e não mais o literal 0,875 que ficou aqui enquanto o
 * pin mediu 3,5 telas. A diferença só aparece quando `SEGURA` muda: sendo
 * fração crua, 0,875 não passa pelo `FATOR`, então encurtar o pin encolhia a
 * janela de dissolução em silêncio — e ela é justamente onde o `scrub` gasta
 * o atraso dele e o cérebro é VISTO nos 150×. Encurtando o pin de 3,5 para
 * 2,6, o literal teria levado a pista de 0,44 para 0,33 tela e escondido de
 * volta o tamanho final, que é exatamente o que a nota em `REVELA_FIM_EM`
 * avisa para não fazer. Escrita assim, a pista tem comprimento FÍSICO fixo e
 * quem encolhe é o crescimento, que é o transporte.
 */
export const REVELA_EM = 1 - PISTA / TOTAL

/**
 * Fração em que a seção terminou de apagar — o fim do pin.
 *
 * A janela era 0,1 tela, foi para 0,3 e agora ocupa a folga inteira até o
 * fim do pin: de `REVELA_EM` a aqui, 1/8 do mergulho.
 *
 * Terminar exatamente no fim do pin é o que dá a garantia dura: a opacidade
 * é escrita a partir do progresso CRU (ver o `onUpdate` em Hero.tsx), então
 * ela chega a zero no mesmo quadro em que o pin solta, em qualquer
 * velocidade de rolagem. Sem isso via-se o cérebro semitransparente
 * deslizando junto com a seção seguinte.
 *
 * O que esta janela passou a ser, além disso: a PISTA DE POUSO da escala.
 * O crescimento acaba em `REVELA_EM`, e o atraso do `scrub` é consumido
 * aqui dentro — é neste 1/8 que o cérebro termina de chegar aos 150× e é
 * efetivamente visto neles. Encurtá-la volta a esconder o tamanho final.
 *
 * É dentro desta janela que a FOTOMETRIA do núcleo converge, e ela não
 * pode convergir junto com a geometria: enquanto o cérebro cobre a tela o
 * fundo do grão é uma imagem clara, e grão fraco sobre fundo claro é grão
 * nenhum. Presa à dissolução, a opacidade cai na mesma medida em que o
 * mundo escurece — não se vê o alfa mudando, vê-se o mundo apagando com o
 * grão constante em cima.
 */
export const REVELA_FIM_EM = 1
