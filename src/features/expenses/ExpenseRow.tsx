import type { ReactNode } from 'react'
import { formatDayMonth, formatMoney } from '@/lib/format'
import type { Category, Expense } from '@/lib/types'

interface ExpenseRowProps {
  expense: Expense
  categories: Category[]
  actions?: ReactNode
}

export function ExpenseRow({ expense, categories, actions }: ExpenseRowProps) {
  const category = categories.find((item) => item.id === expense.category)
  return (
    <li className="flex items-center gap-4 py-3">
      <span className="amount w-14 shrink-0 text-xs text-muted">{formatDayMonth(expense.date)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.description || 'Sin descripción'}</p>
        <span className="text-xs text-muted">
          {category?.name ?? 'Sin categoría'}
        </span>
      </div>
      <span className="amount shrink-0 text-sm font-medium">{formatMoney(expense.amount)}</span>
      {actions}
    </li>
  )
}
