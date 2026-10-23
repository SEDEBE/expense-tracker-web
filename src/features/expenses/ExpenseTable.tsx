import { formatDayMonth, formatMoney, formatNumericDate } from '@/lib/format'
import type { Category, Expense } from '@/lib/types'

interface ExpenseTableProps {
  expenses: Expense[]
  categories: Category[]
  /** Opens the expense; without it rows are plain text. */
  onSelect?: (expense: Expense) => void
  /** Rows of the previous page stay visible, dimmed, while the next one loads. */
  stale?: boolean
}

// Columns on wide screens; on a phone each expense is a two-line row (what and how much, then
// category and date). One structure for both, so nothing is rendered twice.
const columns = 'sm:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,11rem)_7.5rem]'

export function ExpenseTable({ expenses, categories, onSelect, stale }: ExpenseTableProps) {
  const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? 'Sin categoría'

  return (
    <div className={stale ? 'opacity-60' : undefined}>
      <div aria-hidden className={`hidden h-9 items-center gap-x-4 px-5 text-xs text-muted sm:grid ${columns}`}>
        <span>Fecha</span>
        <span>Descripción</span>
        <span>Categoría</span>
        <span className="text-right">Importe</span>
      </div>
      <ul>
        {expenses.map((expense) => {
          const description = expense.description || 'Sin descripción'
          const content = (
            <>
              <span className="num hidden text-muted sm:block">{formatNumericDate(expense.date)}</span>
              <span className="truncate">{description}</span>
              <span className="hidden truncate text-muted sm:block">{categoryName(expense.category)}</span>
              <span className="num text-right font-medium">{formatMoney(expense.amount)}</span>
              <span className="col-span-2 text-xs text-muted sm:hidden">
                {categoryName(expense.category)} · {formatDayMonth(expense.date)}
              </span>
            </>
          )
          const rowClass = `grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 border-t border-rule px-5 py-2.5 text-left max-sm:group-first:border-t-0 sm:h-12 sm:py-0 ${columns}`
          return (
            <li key={expense.id} className="group">
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(expense)}
                  aria-label={`Editar ${description}, ${formatMoney(expense.amount)}`}
                  className={`${rowClass} hover:bg-raised`}
                >
                  {content}
                </button>
              ) : (
                <div className={rowClass}>{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
