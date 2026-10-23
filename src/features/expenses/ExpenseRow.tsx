import type { ReactNode } from 'react'
import { formatDayMonth, formatMoney } from '@/lib/format'
import type { Category, Expense } from '@/lib/types'

interface ExpenseRowProps {
  expense: Expense
  categories: Category[]
  actions?: ReactNode
}

/** One expense: date, description, category and amount. Works as a list row on any width. */
export function ExpenseRow({ expense, categories, actions }: ExpenseRowProps) {
  const category = categories.find((item) => item.id === expense.category)
  return (
    <li className="flex items-center gap-4 py-3">
      <span className="tabular w-14 shrink-0 text-sm text-muted">{formatDayMonth(expense.date)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.description || 'Sin descripción'}</p>
        <span className="mt-0.5 inline-block rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
          {category?.name ?? 'Sin categoría'}
        </span>
      </div>
      <span className="tabular shrink-0 text-sm font-semibold">{formatMoney(expense.amount)}</span>
      {actions}
    </li>
  )
}
