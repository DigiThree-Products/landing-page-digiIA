'use client'

import { useEffect, useId, useRef, useState, type FormEvent, type PointerEvent } from 'react'
import { CONFIG, cadastroConfigurado, type Lead } from '@/lib/config'
import { marcarConversao } from '@/components/layout/Analytics'
import { confete } from './confete'

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

const TIPOS_NEGOCIO = [
  'Agência de marketing',
  'Social media / freelancer',
  'Comércio ou loja',
  'Restaurante ou bar',
  'Clínica ou consultório',
  'Serviços',
  'Indústria',
]

type Variante = 'completo' | 'curto'

/** Máscara de WhatsApp: (11) 90000-0000 */
function mascarar(bruto: string): string {
  const v = bruto.replace(/\D/g, '').slice(0, 11)
  if (v.length > 6) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
  if (v.length > 2) return `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length > 0) return `(${v}`
  return ''
}

/**
 * Formulário da lista de espera.
 *
 * Duas variantes: `completo` no hero (com tipo de negócio, nome e WhatsApp) e
 * `curto` no CTA final (só e-mail). O campo de tipo de negócio fica aberto, não
 * escondido atrás do "+ adicionar": é ele que qualifica a lista.
 *
 * Sem destino configurado a página NÃO finge que deu certo. A versão anterior
 * gravava no localStorage do próprio visitante e exibia "desconto reservado" —
 * o lead se perdia e a pessoa achava que estava na lista.
 */
export function WaitlistForm({ variante = 'completo' }: { variante?: Variante }) {
  const id = useId()
  const bloco = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [invalido, setInvalido] = useState(false)
  const [extrasAbertos, setExtrasAbertos] = useState(false)

  const completo = variante === 'completo'

  /**
   * Os campos opcionais abrem sozinhos onde há espaço. Precisa ser em efeito:
   * ler a largura durante o render daria HTML diferente do gerado no build e o
   * React acusaria divergência na hidratação.
   */
  useEffect(() => {
    if (window.matchMedia('(min-width: 861px)').matches) setExtrasAbertos(true)
  }, [])

  /** Brilho do botão seguindo o cursor. */
  function aoMoverNoBotao(e: PointerEvent<HTMLButtonElement>) {
    const alvo = e.currentTarget
    const r = alvo.getBoundingClientRect()
    alvo.style.setProperty('--mx', `${e.clientX - r.left}px`)
    alvo.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  function recusar(mensagem: string) {
    setErro(mensagem)
    setInvalido(true)
    emailRef.current?.focus()
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setInvalido(false)

    const dados = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<
      string,
      string
    >
    const email = (dados.email ?? '').trim()

    if (!email) return recusar('Preencha seu e-mail para reservar o desconto.')
    if (!EMAIL_OK.test(email)) return recusar('Esse e-mail parece incompleto. Confira o endereço.')
    if (!dados.lgpd) {
      setErro('Marque a autorização para continuar.')
      return
    }

    if (!cadastroConfigurado()) {
      setErro('A lista ainda não abriu. Volte em instantes — nada foi enviado.')
      console.warn('[Digi.IA] Supabase não configurado: cadastro NÃO foi salvo.')
      return
    }

    setEnviando(true)
    const corpo: Lead = {
      email,
      nome: dados.nome?.trim() || null,
      whatsapp: dados.whatsapp?.trim() || null,
      tipo_negocio: dados.tipo_negocio?.trim() || null,
      origem: window.location.href,
    }

    try {
      const r = await fetch(`${CONFIG.SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: CONFIG.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
          // A política de RLS permite INSERT e nada mais, então o banco não
          // pode devolver a linha criada. Sem isto o PostgREST responde 401.
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(corpo),
      })

      // 409 = e-mail já cadastrado. Para quem preencheu, deu certo: a pessoa
      // está na lista. Tratar como erro só geraria confusão.
      if (!r.ok && r.status !== 409) throw new Error(`resposta ${r.status}`)

      marcarConversao()
      setConcluido(true)
      if (bloco.current) confete(bloco.current)
    } catch (falha) {
      setErro('Não conseguimos enviar agora. Tente de novo em alguns segundos.')
      console.error('[Digi.IA] falha no envio:', falha)
    } finally {
      setEnviando(false)
    }
  }

  if (concluido) {
    return (
      <div className="form-block" ref={bloco}>
        <div className="success" role="status" aria-live="polite">
          <h3>Pronto. Você está na lista.</h3>
          {/* Quem acabou de levantar a mão é quem tem maior intenção. Sem
              checkout configurado, a página segue sendo só lista de espera. */}
          {CONFIG.KIWIFY_CHECKOUT ? (
            <a
              className="ghost"
              href={CONFIG.KIWIFY_CHECKOUT}
              target="_blank"
              rel="noopener"
              style={{ marginBottom: 16 }}
            >
              Garantir meu acesso agora
              <SetaDireita />
            </a>
          ) : null}
          <p>
            {completo
              ? 'Enviamos uma confirmação para o seu e-mail. No dia 14 de setembro você recebe o acesso e a tabela de preços antes da abertura pública.'
              : 'Confirmação a caminho do seu e-mail. No dia 14 de setembro você recebe o acesso e a tabela de preços.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="form-block" ref={bloco}>
      <form onSubmit={enviar} noValidate>
        <div className="fields">
          <div className="field">
            <label htmlFor={`email-${id}`}>E-mail</label>
            <input
              ref={emailRef}
              id={`email-${id}`}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="voce@empresa.com.br"
              aria-describedby={`err-${id}`}
              aria-invalid={invalido || undefined}
              onInput={() => {
                setErro('')
                setInvalido(false)
              }}
            />
            <span className="err" id={`err-${id}`}>
              {erro}
            </span>
          </div>

          {completo ? (
            <>
              {/* "Cem empresários locais valem mais que mil curiosos" — o campo
                  de tipo de negócio existe para qualificar a lista, e por isso
                  fica aberto, não escondido atrás do "+ adicionar". */}
              <div className="field">
                <label htmlFor={`negocio-${id}`}>Que tipo de negócio você tem</label>
                <input
                  id={`negocio-${id}`}
                  name="tipo_negocio"
                  type="text"
                  list={`tipos-${id}`}
                  placeholder="Ex.: restaurante, clínica, agência, loja"
                />
                <datalist id={`tipos-${id}`}>
                  {TIPOS_NEGOCIO.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <details
                className="extra"
                open={extrasAbertos}
                onToggle={(e) => setExtrasAbertos(e.currentTarget.open)}
              >
                <summary>+ Adicionar nome e WhatsApp</summary>
                <div className="row2">
                  <div className="field">
                    <label htmlFor={`nome-${id}`}>
                      Nome{' '}
                      <span style={{ textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                    </label>
                    <input
                      id={`nome-${id}`}
                      name="nome"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Como te chamamos"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`fone-${id}`}>
                      WhatsApp{' '}
                      <span style={{ textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                    </label>
                    <input
                      id={`fone-${id}`}
                      name="whatsapp"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="(11) 90000-0000"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(mascarar(e.target.value))}
                    />
                  </div>
                </div>
              </details>
            </>
          ) : null}
        </div>

        <label className="consent">
          <input type="checkbox" name="lgpd" required />
          <span>
            {completo ? (
              <>
                Quero receber avisos sobre o lançamento. Li a{' '}
                <a href="/privacidade">política de privacidade</a> e autorizo o uso dos meus dados
                conforme a LGPD.
              </>
            ) : (
              <>
                Autorizo o contato sobre o lançamento, conforme a{' '}
                <a href="/privacidade" style={{ color: '#fff' }}>
                  política de privacidade
                </a>
                .
              </>
            )}
          </span>
        </label>

        <button
          className={`cta${enviando ? ' loading' : ''}`}
          type="submit"
          disabled={enviando}
          onPointerMove={aoMoverNoBotao}
        >
          <span>{enviando ? 'Reservando…' : 'Entrar na lista'}</span>
          <div className="spinner" aria-hidden="true" />
        </button>

        <p className="nocard">
          {completo ? <IconeSemCartao /> : null}
          <b>Não pedimos cartão agora.</b> Só o e-mail.
        </p>
      </form>
    </div>
  )
}

function SetaDireita() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

function IconeSemCartao() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#CD82FF"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="1.5" y="3.5" width="13" height="9" rx="2" />
      <path d="M1.5 7h13M3 15L14 1" />
    </svg>
  )
}
