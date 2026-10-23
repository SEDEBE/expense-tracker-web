import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { MonthPicker } from '@/components/MonthPicker'
import { Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { useCategories } from '@/features/categories/api'
import { useExpenses, useHistory, useMonthlySummary } from '@/features/expenses/api'
import { ExpenseFormModal } from '@/features/expenses/ExpenseFormModal'
import { ExpenseTable } from '@/features/expenses/ExpenseTable'
import { daysInMonth, formatMoney, formatMonth, monthBounds, shiftMonth, toMonth } from '@/lib/format'
import type { Expense } from '@/lib/types'
import { useToday } from '@/lib/useToday'
import { CategoryBreakdown, CategoryLegend } from './CategoryBreakdown'
import { findingFor, monthName } from './finding'
import { HistoryChart } from './HistoryChart'

export default function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const today = useToday()
  const currentMonth = toMonth(today)
  // The month lives in the URL (?mes=2026-09), so a reload or a shared link keeps it.
  const month = params.get('mes') ?? currentMonth
  const inProgress = month === currentMonth
  const setMonth = (value: string) => setParams(value === currentMonth ? {} : { mes: value }, { replace: true })

  const [editing, setEditing] = useState<Expense | 'new' | null>(null)
  const { data: categories = [] } = useCategories()
  const summary = useMonthlySummary(month)
  const previous = useMonthlySummary(shiftMonth(month, -1))
  const history = useHistory(6)
  const recent = useExpenses({ ...monthBounds(month), ordering: '-date' })

  const days = inProgress ? today.getDate() : daysInMonth(month)
  const count = summary.data?.by_category.reduce((sum, row) => sum + row.count, 0) ?? 0
  const total = Number(summary.data?.total ?? 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 pb-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-medium tracking-tight">{formatMonth(month)}</h1>
          <p className="mt-1 text-muted">
            {summary.data ? findingFor(summary.data, previous.data, inProgress) : 'Cargando el resumen…'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker value={month} onChange={setMonth} />
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden />
            Añadir gasto
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card
          className="lg:col-span-7"
          title="Por categoría"
          aside={<CategoryLegend month={monthName(month)} previousMonth={monthName(shiftMonth(month, -1))} />}
        >
          <div className="px-5 pt-3 pb-2">
            <p className="text-sm text-muted">{inProgress ? 'Gastado hasta hoy' : 'Gastado'}</p>
            {summary.data ? (
              <>
                <p className="num mt-0.5 text-[30px] leading-tight font-bold tracking-tight">{formatMoney(total)}</p>
                <p className="num mt-1 text-sm text-muted">
                  {count} {count === 1 ? 'gasto' : 'gastos'} · {formatMoney(total / days)} al día
                  {inProgress ? ` · día ${days} de ${daysInMonth(month)}` : ''}
                </p>
              </>
            ) : (
              <div className="mt-1.5 space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-56" />
              </div>
            )}
          </div>
          {summary.isError ? (
            <p className="px-5 pb-5 text-negative">No se ha podido cargar el resumen. {summary.error.message}</p>
          ) : summary.data?.by_category.length ? (
            <CategoryBreakdown summary={summary.data} previous={previous.data} inProgress={inProgress} />
          ) : summary.data ? (
            <EmptyState title="Sin gastos este mes">Cuando añadas uno, aquí verás el reparto por categoría.</EmptyState>
          ) : null}
        </Card>

        <Card className="flex flex-col lg:col-span-5" title="Últimos 6 meses">
          {history.data ? (
            <HistoryChart data={history.data} selected={month} onSelect={setMonth} />
          ) : (
            <div className="px-5 py-4">
              <Skeleton className="h-48 w-full" />
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Últimos gastos"
        aside={
          <Link to={`/gastos${inProgress ? '' : `?mes=${month}`}`} className="text-sm text-text hover:underline">
            Ver todos
          </Link>
        }
      >
        <div className="pt-2 pb-1">
          {recent.data?.results.length ? (
            <ExpenseTable expenses={recent.data.results.slice(0, 5)} categories={categories} onSelect={setEditing} />
          ) : recent.isPending ? (
            <div className="space-y-3 px-5 py-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <EmptyState title="Todavía no hay gastos este mes" />
          )}
        </div>
      </Card>

      {editing && (
        <ExpenseFormModal expense={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
