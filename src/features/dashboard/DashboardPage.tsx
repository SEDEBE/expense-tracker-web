import { CalendarDays, ChartPie, Plus, ReceiptText, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { MonthPicker } from '@/components/MonthPicker'
import { Button, Card, EmptyState, Spinner } from '@/components/ui'
import { useMe } from '@/features/auth/api'
import { useCategories } from '@/features/categories/api'
import { useExpenses, useHistory, useMonthlySummary } from '@/features/expenses/api'
import { ExpenseFormModal } from '@/features/expenses/ExpenseFormModal'
import { ExpenseRow } from '@/features/expenses/ExpenseRow'
import {
  daysInMonth,
  formatMoney,
  formatMonth,
  formatPercent,
  monthBounds,
  shiftMonth,
  toMonth,
} from '@/lib/format'
import { useToday } from '@/lib/useToday'
import { CategoryBreakdown } from './CategoryBreakdown'
import { HistoryChart } from './HistoryChart'
import { StatTile } from './StatTile'

export default function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const today = useToday()
  const currentMonth = toMonth(today)
  // The month lives in the URL (?mes=2026-09), so a reload or a shared link keeps it.
  const month = params.get('mes') ?? currentMonth
  const isCurrentMonth = month === currentMonth
  const setMonth = (value: string) =>
    setParams(value === currentMonth ? {} : { mes: value }, { replace: true })

  const [adding, setAdding] = useState(false)
  const { data: user } = useMe()
  const { data: categories = [] } = useCategories()
  const summary = useMonthlySummary(month)
  const previous = useMonthlySummary(shiftMonth(month, -1))
  const history = useHistory(6)
  const recent = useExpenses({ ...monthBounds(month), ordering: '-date' })

  const greeting = user?.is_demo ? 'Hola' : `Hola${user?.first_name ? `, ${user.first_name}` : ''}`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{greeting} 👋</h1>
          <p className="mt-1 text-muted">Así van tus gastos de {formatMonth(month).toLowerCase()}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker value={month} onChange={setMonth} />
          <Button onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Añadir gasto
          </Button>
        </div>
      </div>

      {summary.isPending ? (
        <Spinner />
      ) : summary.isError ? (
        <Card>
          <p className="text-danger">No se ha podido cargar el resumen: {summary.error.message}</p>
        </Card>
      ) : (
        <>
          <Stats
            month={month}
            isCurrentMonth={isCurrentMonth}
            today={today}
            total={Number(summary.data.total)}
            previousTotal={previous.data ? Number(previous.data.total) : undefined}
            count={summary.data.by_category.reduce((sum, row) => sum + row.count, 0)}
            top={summary.data.by_category[0]}
          />

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <h2 className="font-semibold">Por categoría</h2>
              <p className="mb-3 text-sm text-muted">Pulsa una categoría para ver sus gastos.</p>
              {summary.data.by_category.length ? (
                <CategoryBreakdown summary={summary.data} />
              ) : (
                <EmptyState icon={<ChartPie className="size-5" />} title="Sin gastos este mes">
                  Añade tu primer gasto y aquí verás en qué se va tu dinero.
                </EmptyState>
              )}
            </Card>

            <Card className="flex flex-col lg:col-span-3">
              <h2 className="font-semibold">Últimos 6 meses</h2>
              <p className="mb-3 text-sm text-muted">Pulsa una columna para ver ese mes.</p>
              {history.data ? (
                <HistoryChart data={history.data} selected={month} onSelect={setMonth} />
              ) : (
                <Spinner />
              )}
            </Card>
          </div>
        </>
      )}

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Últimos gastos</h2>
          <Link
            to={`/gastos${isCurrentMonth ? '' : `?mes=${month}`}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Ver todos
          </Link>
        </div>
        {recent.data?.results.length ? (
          <ul className="divide-y divide-border">
            {recent.data.results.slice(0, 5).map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} categories={categories} />
            ))}
          </ul>
        ) : recent.isPending ? (
          <Spinner />
        ) : (
          <EmptyState icon={<ReceiptText className="size-5" />} title="Todavía no hay gastos" />
        )}
      </Card>

      {adding && <ExpenseFormModal onClose={() => setAdding(false)} />}
    </div>
  )
}

interface StatsProps {
  month: string
  isCurrentMonth: boolean
  today: Date
  total: number
  previousTotal?: number
  count: number
  top?: { category: string | null; total: string }
}

function Stats({ month, isCurrentMonth, today, total, previousTotal, count, top }: StatsProps) {
  const days = isCurrentMonth ? today.getDate() : daysInMonth(month)
  const previousName = formatMonth(shiftMonth(month, -1)).split(' ')[0].toLowerCase()

  // Comparing a month in progress with a full month would always look like "less", so the
  // change is only shown for finished months.
  let detail: ReactNode = `Mes en curso · día ${days} de ${daysInMonth(month)}`
  if (!isCurrentMonth && previousTotal) {
    const change = (total - previousTotal) / previousTotal
    const Icon = change >= 0 ? TrendingUp : TrendingDown
    detail = (
      <span className="inline-flex items-center gap-1">
        <Icon className="size-4" aria-hidden />
        {formatPercent(change)} respecto a {previousName}
      </span>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatTile
        label="Total del mes"
        value={formatMoney(total)}
        detail={detail}
        icon={<Wallet className="size-4" />}
      />
      <StatTile
        label="Media diaria"
        value={formatMoney(total / days)}
        detail={isCurrentMonth ? `En los ${days} días que llevamos` : `En ${days} días`}
        icon={<CalendarDays className="size-4" />}
      />
      <StatTile
        label="Gastos registrados"
        value={String(count)}
        detail={
          top
            ? `Donde más: ${top.category ?? 'sin categoría'} (${formatPercent(Number(top.total) / total).replace('+', '')})`
            : 'Ninguno todavía'
        }
        icon={<ReceiptText className="size-4" />}
      />
    </div>
  )
}
