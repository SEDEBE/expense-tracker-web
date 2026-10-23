import { Link } from 'react-router'
import { formatMoney } from '@/lib/format'
import type { MonthlySummary } from '@/lib/types'

interface CategoryBreakdownProps {
  summary: MonthlySummary
  previous?: MonthlySummary
  /** A month still in progress is compared with the whole previous month, so no signed change. */
  inProgress: boolean
}

interface Row {
  key: string
  categoryId: number | null
  name: string
  current: number
  previous: number
}

function buildRows(summary: MonthlySummary, previous?: MonthlySummary): Row[] {
  const before = new Map(previous?.by_category.map((row) => [row.category_id, Number(row.total)]))
  return summary.by_category.map((row) => ({
    key: String(row.category_id ?? 'none'),
    categoryId: row.category_id,
    name: row.category ?? 'Sin categoría',
    current: Number(row.total),
    previous: before.get(row.category_id) ?? 0,
  }))
}

const signed = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatMoney(Math.abs(value))}`

/**
 * One row per category: this month as a blue bar, the previous month as a thin tick on the same
 * scale. Spending more is the bad direction, so a rise is red and a fall is green.
 */
export function CategoryBreakdown({ summary, previous, inProgress }: CategoryBreakdownProps) {
  const rows = buildRows(summary, previous)
  const scale = Math.max(...rows.flatMap((row) => [row.current, row.previous]), 1)

  return (
    <ul className="px-3 pb-3">
      {rows.map((row) => {
        const query = new URLSearchParams({ mes: summary.month, categoria: row.categoryId === null ? 'ninguna' : String(row.categoryId) })
        const change = row.current - row.previous
        return (
          <li key={row.key}>
            <Link
              to={`/gastos?${query}`}
              className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-x-4 rounded-md px-2 py-2 hover:bg-raised sm:grid-cols-[minmax(0,10rem)_1fr_auto]"
            >
              <span className="truncate">{row.name}</span>
              <span className="relative h-2" aria-hidden>
                <span className="absolute inset-y-0 left-0 rounded-r-sm bg-chart" style={{ width: `${(row.current / scale) * 100}%` }} />
                {row.previous > 0 && (
                  <span className="absolute -top-1 -bottom-1 w-px bg-text" style={{ left: `${(row.previous / scale) * 100}%` }} />
                )}
              </span>
              <span className="num text-right">
                <span className="block font-medium">{formatMoney(row.current)}</span>
                <span className={inProgress || change === 0 ? 'block text-xs text-muted' : change > 0 ? 'block text-xs text-negative' : 'block text-xs text-positive'}>
                  {inProgress
                    ? row.previous > 0
                      ? `de ${formatMoney(row.previous)}`
                      : 'nueva'
                    : row.previous > 0
                      ? signed(change)
                      : `${signed(change)} (nueva)`}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** The legend sits in the card header; each swatch is the mark it explains, scaled down. */
export function CategoryLegend({ month, previousMonth }: { month: string; previousMonth: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-3 rounded-r-sm bg-chart" aria-hidden />
        {month}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-px bg-text" aria-hidden />
        {previousMonth}
      </span>
    </span>
  )
}
