import type { ReactNode } from 'react'
import { Modal } from './Modal'
import { Button } from './ui'

interface ConfirmDialogProps {
  title: string
  children: ReactNode
  confirmLabel: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

/** Asks before a destructive action, instead of the browser's blocking confirm(). */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="text-sm text-muted">{children}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
