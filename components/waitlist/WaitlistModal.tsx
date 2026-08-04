'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { WaitlistForm } from '@/components/waitlist/WaitlistForm'

interface WaitlistModalContextValue {
  openModal: (trigger: HTMLElement) => void
}

const WaitlistModalContext = createContext<WaitlistModalContextValue | null>(null)

export function WaitlistModalProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  const unlockPage = useCallback(() => {
    document.documentElement.classList.remove('waitlist-modal-open')
  }, [])

  const finishClose = useCallback(() => {
    const dialog = dialogRef.current
    if (dialog?.open) dialog.close()
  }, [])

  const closeModal = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog?.open || dialog.dataset.closing === 'true') return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose()
      return
    }

    dialog.dataset.closing = 'true'
    closeTimerRef.current = window.setTimeout(finishClose, 220)
  }, [finishClose])

  const openModal = useCallback((trigger: HTMLElement) => {
    const dialog = dialogRef.current
    if (!dialog) return

    triggerRef.current = trigger
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    delete dialog.dataset.closing

    if (!dialog.open) dialog.showModal()
    document.documentElement.classList.add('waitlist-modal-open')

    window.requestAnimationFrame(() => {
      dialog.querySelector<HTMLInputElement>('input[type="email"]')?.focus()
    })
  }, [])

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    unlockPage()
  }, [unlockPage])

  function handleDialogClose() {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
    const dialog = dialogRef.current
    if (dialog) delete dialog.dataset.closing
    unlockPage()
    triggerRef.current?.focus()
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeModal()
  }

  return (
    <WaitlistModalContext.Provider value={{ openModal }}>
      {children}
      <dialog
        ref={dialogRef}
        className="waitlist-modal"
        aria-labelledby="waitlist-modal-title"
        aria-describedby="waitlist-modal-description"
        onCancel={(event) => {
          event.preventDefault()
          closeModal()
        }}
        onClose={handleDialogClose}
        onClick={handleBackdropClick}
      >
        <div className="waitlist-modal__panel">
          <div className="waitlist-modal__accent" aria-hidden="true" />
          <button className="waitlist-modal__close" type="button" onClick={closeModal} aria-label="Fechar formulário">
            <span aria-hidden="true">×</span>
          </button>

          <header className="waitlist-modal__header">
            <p className="waitlist-modal__eyebrow"><span aria-hidden="true" /> Condição de lançamento</p>
            <h2 id="waitlist-modal-title">Entre na primeira turma.</h2>
            <p id="waitlist-modal-description">
              Preencha seus dados para receber o acesso e a tabela de preços antes da abertura pública.
            </p>
          </header>

          <div className="waitlist-modal__body">
            <WaitlistForm variante="completo" onCancel={closeModal} />
          </div>
        </div>
      </dialog>
    </WaitlistModalContext.Provider>
  )
}

export function WaitlistModalTrigger({ onClick, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(WaitlistModalContext)
  if (!context) throw new Error('WaitlistModalTrigger precisa estar dentro de WaitlistModalProvider.')

  return (
    <button
      {...props}
      type={type}
      aria-haspopup="dialog"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) context.openModal(event.currentTarget)
      }}
    />
  )
}
