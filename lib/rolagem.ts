import type Lenis from 'lenis'

/**
 * Onde a rolagem suave fica guardada, para quem precisa dela sem ser filho.
 *
 * `RolagemSuave` cria a instância e `AncoraSuave` precisa dela para saltar,
 * mas os dois são IRMÃOS em `app/layout.tsx`, não pai e filho. Um contexto
 * de React obrigaria a embrulhar `{children}` num provider — reestruturar o
 * layout inteiro para carregar um valor só.
 *
 * Um módulo resolve porque a coisa descrita é única de verdade: existe uma
 * rolagem por documento, e o valor tem exatamente o mesmo tempo de vida que
 * ela. Não é estado de interface, é uma referência ao scroller da página.
 *
 * SEMPRE PODE SER `null`, e quem chama tem de tratar: durante o primeiro
 * render (o efeito ainda não correu), no servidor, e — o caso que importa —
 * quando o usuário pede movimento reduzido, em que a instância nunca chega
 * a existir. `AncoraSuave` cai de volta no próprio motor quando isto devolve
 * `null`, e é assim que o salto continua funcionando sem Lenis.
 */
let instancia: Lenis | null = null

/** Chamado só por `RolagemSuave`, na montagem e na limpeza. */
export function guardaRolagem(nova: Lenis | null): void {
  instancia = nova
}

/** A rolagem viva, ou `null` quando não há nenhuma. */
export function rolagem(): Lenis | null {
  return instancia
}
