import { Link } from 'react-router'
import { formatMoney, formatPercent } from '@/lib/format'
import type { MonthlySummary } from '@/lib/types'

interface CategoryBreakdownProps {
  summary: MonthlySummary
}

// One colour for every bar: the length already shows which category is bigger.
export function CategoryBreakdown({ summary }: CategoryBreakdownProps) {
  const total = Number(summary.total)
  const max = Math.max(...summary.by_category.map((row) => Number(row.total)))

  return (
    <ul className="space-y-1">
      {summary.by_category.map((row) => {
        const amount = Number(row.total)
        const query = new URLSearchParams({ mes: summary.month })
        query.set('categoria', row.category_id === null ? 'ninguna' : String(row.category_id))
        return (
          <li key={row.category_id ?? 'none'}>
            <Link
              to={`/gastos?${query}`}
              className="block rounded-md px-2 py-2 hover:bg-surface-2"
              title={`Ver los gastos de ${row.category ?? 'sin categoría'}`}
            >
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium">{row.category ?? 'Sin categoría'}</span>
                <span className="amount shrink-0">
                  {formatMoney(amount)}
                  <span className="ml-2 inline-block w-14 text-right text-muted">
                    {formatPercent(amount / total).replace('+', '')}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 bg-surface-2">
                <div
                  className="h-1.5 rounded-r-sm bg-chart"
                  style={{ width: `${(amount / max) * 100}%` }}
                />
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
