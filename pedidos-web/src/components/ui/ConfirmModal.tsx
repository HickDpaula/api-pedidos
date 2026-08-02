import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-foody-dark/50 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-foody-red/10 text-foody-red">
          <span className="text-2xl font-bold leading-none">!</span>
        </div>

        <h3
          id="confirm-modal-title"
          className="text-xl font-bold text-foody-dark"
        >
          {title}
        </h3>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foody-gray">
          {message}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="min-w-[140px] rounded-xl border border-foody-border px-5 py-3 text-sm font-semibold text-foody-dark transition hover:bg-foody-bg"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-w-[140px] rounded-xl bg-foody-red px-5 py-3 text-sm font-bold text-white transition hover:bg-foody-red-dark"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
