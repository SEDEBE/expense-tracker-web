import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import { useId, useState } from 'react'
import { cx } from '@/lib/cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

// The interface carries no colour: the primary action is near-black, the secondary a grey fill.
const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-secondary text-text hover:bg-active',
  ghost: 'text-muted hover:bg-active hover:text-text',
  danger: 'bg-negative text-white hover:opacity-90',
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
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-[background-color,opacity] active:opacity-80',
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-9 px-3.5 text-sm',
        size === 'lg' && 'h-11 px-4 text-[15px]',
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

interface CardProps {
  className?: string
  children: ReactNode
  /** Card title shown in the header, with optional content on its right (a period, a legend, a link). */
  title?: string
  aside?: ReactNode
}

export function Card({ className, children, title, aside }: CardProps) {
  return (
    <section className={cx('rounded-lg border border-border bg-surface', className)}>
      {title && (
        <header className="flex items-baseline justify-between gap-4 px-5 pt-4">
          <h2 className="text-base font-medium">{title}</h2>
          {aside && <div className="text-xs text-muted">{aside}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

const controlClasses =
  'w-full rounded-md border border-control bg-surface px-3 h-9 text-sm text-text placeholder:text-muted ' +
  'focus:outline-2 focus:outline-offset-0 focus:outline-chart aria-invalid:border-negative'

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
        <p id={messageId} className="text-sm text-negative">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-xs text-muted">
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

export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cx('pr-10', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted hover:text-text"
      >
        <Icon className="size-4" aria-hidden />
      </button>
    </div>
  )
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cx(controlClasses, 'pr-8', className)} {...props} />
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-md bg-negative-soft px-3 py-2 text-sm text-negative-ink">
      {children}
    </div>
  )
}

/** Loading placeholder that keeps the final layout: one grey bar per line, no shimmer. */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cx('block rounded-sm bg-active', className)} />
}

export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 px-5 py-8 text-sm text-muted">
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  )
}

/** An empty block keeps its frame: one sentence where the data would be. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mx-5 my-4 rounded-lg border border-dashed border-control px-4 py-5 text-sm">
      <p className="font-medium">{title}</p>
      {children && <div className="mt-1 text-muted">{children}</div>}
    </div>
  )
}
