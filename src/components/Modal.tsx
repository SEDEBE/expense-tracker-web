import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Centered dialog. Closes with Escape or a click outside, and focuses its first field. */
export function Modal({ title, onClose, children }: ModalProps) {
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)

  // Keep the latest onClose without re-running the effect: parents often pass a new arrow
  // function on every render, and re-running would steal the focus while you type.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    const first = panel.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([tabindex="-1"])',
    )
    first?.focus()
    // Stop the page behind from scrolling while the dialog is open.
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-text"
            tabIndex={-1}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
