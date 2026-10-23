import { Link } from 'react-router'
import { Card, EmptyState } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import type { Category, MonthlySummary } from '@/lib/types'

interface BudgetsCardProps {
  categories: Category[]
  summary?: MonthlySummary
  /** This month can still change, so the wording is "left"; a past month "was left". */
  inProgress: boolean
}

interface Row {
  id: number
  name: string
  spent: number
  limit: number
}

/** Spending against each category's monthly limit, the closest to it first. */
export function BudgetsCard({ categories, summary, inProgress }: BudgetsCardProps) {
  const spent = new Map(summary?.by_category.map((row) => [row.category_id, Number(row.total)]))
  const rows: Row[] = categories
    .filter((category) => category.monthly_budget !== null)
    .map((category) => ({
      id: category.id,
      name: category.name,
      spent: spent.get(category.id) ?? 0,
      limit: Number(category.monthly_budget),
    }))
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit)

  return (
    <Card title="Presupuestos" aside={rows.length > 0 && <Link to="/categorias" className="text-text hover:underline">Editar</Link>}>
      {rows.length === 0 ? (
        <EmptyState title="Sin presupuestos">
          <Link to="/categorias" className="text-text underline underline-offset-2">
            Pon un límite al mes
          </Link>{' '}
          a una categoría y te avisaremos por email al llegar al 80 %.
        </EmptyState>
      ) : (
        <ul className="space-y-4 px-5 pt-3 pb-5">
          {rows.map((row) => {
            const over = row.spent > row.limit
            const left = Math.abs(row.limit - row.spent)
            return (
              <li key={row.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="truncate">{row.name}</span>
                  <span className="num shrink-0 text-sm">
                    <span className="font-medium">{formatMoney(row.spent)}</span>
                    <span className="text-muted"> de {formatMoney(row.limit)}</span>
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-active"
                  role="meter"
                  aria-label={`${row.name}: ${formatMoney(row.spent)} de ${formatMoney(row.limit)}`}
                  aria-valuemin={0}
                  aria-valuemax={row.limit}
                  aria-valuenow={Math.min(row.spent, row.limit)}
                >
                  <div
                    className={`h-full rounded-full ${over ? 'bg-negative' : 'bg-chart'}`}
                    style={{ width: `${Math.min(100, (row.spent / row.limit) * 100)}%` }}
                  />
                </div>
                <p className={`num mt-1 text-xs ${over ? 'text-negative' : 'text-muted'}`}>
                  {over
                    ? `${inProgress ? 'Te has pasado' : 'Te pasaste'} ${formatMoney(left)}`
                    : `${inProgress ? 'Quedan' : 'Sobraron'} ${formatMoney(left)}`}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
