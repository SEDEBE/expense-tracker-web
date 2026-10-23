import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth, shiftMonth, toMonth } from '@/lib/format'
import { useToday } from '@/lib/useToday'

interface MonthPickerProps {
  value: string
  onChange: (month: string) => void
}

// Stops at the current month: there are no future expenses to look at.
export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const current = toMonth(useToday())
  const button = 'flex h-full w-8 items-center justify-center text-muted hover:bg-active hover:text-text disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <div className="inline-flex h-9 items-center overflow-hidden rounded-md border border-control bg-surface">
      <button type="button" onClick={() => onChange(shiftMonth(value, -1))} aria-label="Mes anterior" className={button}>
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <span className="min-w-34 px-1 text-center text-sm font-medium" aria-live="polite">
        {formatMonth(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        disabled={value >= current}
        aria-label="Mes siguiente"
        className={button}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  )
}
