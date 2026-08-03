/**
 * Tailwind v4 é um plugin do PostCSS e dispensa tailwind.config.js — o tema
 * fica no próprio CSS, no bloco @theme de app/globals.css.
 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
