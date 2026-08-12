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
}

/**
 * Fração do mergulho em que a centralização termina e a escala começa
 * (mesmo ponto — ver a nota sobre `desloca` em Hero.tsx: `0,34 * FATOR`,
 * onde FATOR = 1,6/4,0). Exportada daqui porque HeroObject.tsx também
 * precisa dela: a partir deste ponto o objeto deixa de ser um cérebro
 * pequeno e apertável e passa a ser uma imagem que já está crescendo além
 * da tela, então segurar, a paralaxe do cursor e o flutuar ocioso são
 * desligados — do contrário competiriam com a própria escala. Uma
 * constante fixada duas vezes é a mesma dessincronia que o `cedeEm` já
 * ensinou a evitar.
 */
export const ESCALA_EM = 0.136

/**
 * Fração do mergulho em que a seção inteira começa a apagar, revelando a
 * poeira cósmica de verdade atrás do cérebro (mesmo ponto — ver a nota
 * sobre `REVELA_POEIRA_INICIO`/`TOTAL` em Hero.tsx: `3,5 / 4,0`).
 * Exportada daqui pelo mesmo motivo que `ESCALA_EM`: `HeroEstrelas.tsx`
 * precisa saber quando a GEOMETRIA dele termina de convergir — tamanho,
 * profundidade e posição do grão têm que já parecer os do campo do site
 * ANTES de a seção começar a sumir, não durante. Se ainda estivessem
 * mudando na hora da dissolução, seriam mais um eixo saltando junto com
 * o resto, e a travessia voltaria a ler como corte.
 */
export const REVELA_EM = 0.875

/**
 * Fração em que a seção terminou de apagar (`3,8 / 4,0`).
 *
 * A janela era 0,1 tela (3,6→3,7) e foi para 0,3 (3,5→3,8), usando folga
 * que já existia no fim do pin — `TOTAL` não mudou, então nada muda para
 * as seções seguintes.
 *
 * É dentro desta janela que a FOTOMETRIA do núcleo converge, e ela não
 * pode convergir junto com a geometria: enquanto o cérebro cobre a tela o
 * fundo do grão é uma imagem clara, e grão fraco sobre fundo claro é grão
 * nenhum. Presa à dissolução, a opacidade cai na mesma medida em que o
 * mundo escurece — não se vê o alfa mudando, vê-se o mundo apagando com o
 * grão constante em cima.
 */
export const REVELA_FIM_EM = 0.95
