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
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-surface">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="Mes anterior"
        className="rounded-l-md p-2 text-muted hover:bg-surface-2 hover:text-text"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <span className="min-w-36 px-2 text-center text-sm font-medium" aria-live="polite">
        {formatMonth(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        disabled={value >= current}
        aria-label="Mes siguiente"
        className="rounded-r-md p-2 text-muted hover:bg-surface-2 hover:text-text disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  )
}
