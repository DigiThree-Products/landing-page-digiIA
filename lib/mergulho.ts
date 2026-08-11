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
 * `v` é monotônico na descida por decisão da hero (ver a nota sobre
 * `avanco` em Hero.tsx): sobe com a rolagem, congela ao subir e só zera
 * quando a hero é reconquistada. Quem lê não precisa saber disso — só
 * que 0 é "fora" e 1 é "dentro".
 */
export const mergulho = {
  /** 0 = cérebro ao longe, 1 = dentro dele. */
  v: 0,
}

/**
 * Fração do mergulho em que a centralização termina e a escala começa
 * (mesmo ponto — ver a nota sobre `desloca` em Hero.tsx). Exportada daqui
 * porque HeroObject.tsx também precisa dela: a partir deste ponto o objeto
 * deixa de ser um cérebro pequeno e apertável e passa a ser uma imagem que
 * já está crescendo além da tela, então segurar, a paralaxe do cursor e o
 * flutuar ocioso são desligados — do contrário competiriam com a própria
 * escala. Uma constante fixada duas vezes é a mesma dessincronia que o
 * `cedeEm` já ensinou a evitar.
 */
export const ESCALA_EM = 0.18
