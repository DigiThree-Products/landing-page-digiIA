'use client'

import { useEffect, useId, useRef, useState, type FormEvent, type PointerEvent } from 'react'
import { PRODUCT_CONFIG, cadastroConfigurado } from '@/config/product'
import { LANDING } from '@/content/landing'
import { montarLead, enviarLead } from '@/lib/leads'
import { marcarConversao } from '@/components/layout/Analytics'
import { confete } from './confete'

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
type Variant = 'completo' | 'curto'
type InvalidField = 'email' | 'consent' | null

function maskWhatsapp(raw: string): string {
  const value = raw.replace(/\D/g, '').slice(0, 11)
  if (value.length > 6) return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
  if (value.length > 2) return `(${value.slice(0, 2)}) ${value.slice(2)}`
  if (value.length > 0) return `(${value}`
  return ''
}

export function WaitlistForm({ variante = 'completo' }: { variante?: Variant }) {
  const id = useId()
  const blockRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [invalidField, setInvalidField] = useState<InvalidField>(null)
  const [sending, setSending] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')
  const [extrasOpen, setExtrasOpen] = useState(false)
  const complete = variante === 'completo'

  useEffect(() => {
    if (complete && window.matchMedia('(min-width: 861px)').matches) setExtrasOpen(true)
  }, [complete])

  function clearError(field?: Exclude<InvalidField, null>) {
    if (field && invalidField !== field) return
    setError('')
    setInvalidField(null)
  }

  function reject(field: Exclude<InvalidField, null>, message: string) {
    setError(message)
    setInvalidField(field)
    if (field === 'email') emailRef.current?.focus()
    else consentRef.current?.focus()
  }

  function trackButtonPointer(event: PointerEvent<HTMLButtonElement>) {
    const target = event.currentTarget
    const bounds = target.getBoundingClientRect()
    target.style.setProperty('--mx', `${event.clientX - bounds.left}px`)
    target.style.setProperty('--my', `${event.clientY - bounds.top}px`)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>
    const email = (data.email ?? '').trim()

    if (!email) return reject('email', 'Preencha seu e-mail para entrar na lista.')
    if (!EMAIL_OK.test(email)) return reject('email', 'Esse e-mail parece incompleto. Confira o endereço.')
    if (!data.lgpd) return reject('consent', 'Marque a autorização para continuar.')
    if (!cadastroConfigurado()) {
      setError('A lista ainda não abriu. Volte em instantes — nada foi enviado.')
      console.warn('[Digi.IA] Supabase não configurado: cadastro não foi salvo.')
      return
    }

    setSending(true)
    try {
      await enviarLead(montarLead({ ...data, email }, window.location.href))
      marcarConversao()
      setCompleted(true)
      if (blockRef.current) confete(blockRef.current)
    } catch (failure) {
      setError('Não conseguimos enviar agora. Tente de novo em alguns segundos.')
      console.error('[Digi.IA] falha no envio:', failure)
    } finally {
      setSending(false)
    }
  }

  if (completed) {
    return (
      <div className="form-block" ref={blockRef}>
        <div className="success" role="status" aria-live="polite">
          <h3>{LANDING.waitlist.successTitle}</h3>
          {PRODUCT_CONFIG.checkoutUrl ? (
            <a className="ghost success-checkout" href={PRODUCT_CONFIG.checkoutUrl} target="_blank" rel="noopener">
              Garantir meu acesso agora <ArrowRight />
            </a>
          ) : null}
          <p>{LANDING.waitlist.successMessage}</p>
        </div>
      </div>
    )
  }

  const errorId = `err-${id}`
  return (
    <div className="form-block" ref={blockRef}>
      <form onSubmit={submit} noValidate>
        <div className="fields">
          <div className="field">
            <label htmlFor={`email-${id}`}>E-mail</label>
            <input ref={emailRef} id={`email-${id}`} name="email" type="email" autoComplete="email" required placeholder="voce@empresa.com.br" aria-describedby={errorId} aria-invalid={invalidField === 'email' || undefined} onInput={() => clearError('email')} />
            <span className="err" id={errorId} role="alert">{error}</span>
          </div>

          {complete ? <>
            <div className="field">
              <label htmlFor={`business-${id}`}>Que tipo de negócio você tem</label>
              <input id={`business-${id}`} name="tipo_negocio" type="text" list={`business-types-${id}`} placeholder="Ex.: restaurante, clínica, agência, loja" />
              <datalist id={`business-types-${id}`}>{LANDING.waitlist.businessTypes.map((type) => <option key={type} value={type} />)}</datalist>
            </div>
            <details className="extra" open={extrasOpen} onToggle={(event) => setExtrasOpen(event.currentTarget.open)}>
              <summary>+ Adicionar nome e WhatsApp</summary>
              <div className="row2">
                <div className="field"><label htmlFor={`name-${id}`}>Nome <span className="optional-label">(opcional)</span></label><input id={`name-${id}`} name="nome" type="text" autoComplete="given-name" placeholder="Como te chamamos" /></div>
                <div className="field"><label htmlFor={`phone-${id}`}>WhatsApp <span className="optional-label">(opcional)</span></label><input id={`phone-${id}`} name="whatsapp" type="tel" inputMode="numeric" autoComplete="tel" placeholder="(11) 90000-0000" value={whatsapp} onChange={(event) => setWhatsapp(maskWhatsapp(event.target.value))} /></div>
              </div>
            </details>
          </> : null}
        </div>

        <label className="consent">
          <input ref={consentRef} type="checkbox" name="lgpd" required aria-describedby={invalidField === 'consent' ? errorId : undefined} aria-invalid={invalidField === 'consent' || undefined} onChange={() => clearError('consent')} />
          <span>{complete ? <>Quero receber avisos sobre o lançamento. Li a <a href="/privacidade">política de privacidade</a> e autorizo o uso dos meus dados conforme a LGPD.</> : <>Autorizo o contato sobre o lançamento, conforme a <a className="consent-link" href="/privacidade">política de privacidade</a>.</>}</span>
        </label>

        <button className={`cta${sending ? ' loading' : ''}`} type="submit" disabled={sending} onPointerMove={trackButtonPointer}>
          <span>{sending ? 'Reservando…' : 'Entrar na lista'}</span><span className="spinner" aria-hidden="true" />
        </button>
        <p className="nocard">{complete ? <NoCardIcon /> : null}<b>Não pedimos cartão agora.</b> Só o e-mail.</p>
      </form>
    </div>
  )
}

function ArrowRight() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
}

function NoCardIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#CD82FF" strokeWidth="1.6" aria-hidden="true"><rect x="1.5" y="3.5" width="13" height="9" rx="2" /><path d="M1.5 7h13M3 15L14 1" /></svg>
}
