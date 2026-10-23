import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import { useId } from 'react'
import { cx } from '@/lib/cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-strong',
  secondary: 'bg-surface text-text border border-border hover:bg-surface-2',
  ghost: 'text-muted hover:text-text hover:bg-surface-2',
  danger: 'bg-danger text-on-accent hover:opacity-90',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-base',
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cx('rounded-lg border border-border bg-surface p-5', className)}>
      {children}
    </section>
  )
}

const controlClasses =
  'w-full rounded-md border border-border bg-surface px-3 h-10 text-sm text-text placeholder:text-muted ' +
  'focus:outline-2 focus:outline-offset-0 focus:outline-accent aria-invalid:border-danger'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error || hint ? messageId : undefined,
      })}
      {error ? (
        <p id={messageId} className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

// React 19 passes `ref` as a normal prop, so register() works without forwardRef.
export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cx(controlClasses, className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cx(controlClasses, 'pr-8', className)} {...props} />
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
      {children}
    </div>
  )
}

export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
      <LoaderCircle className="size-5 animate-spin" aria-hidden />
      {label}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="text-muted">{icon}</div>
      <p className="font-medium">{title}</p>
      {children && <div className="max-w-sm text-sm text-muted">{children}</div>}
    </div>
  )
}
