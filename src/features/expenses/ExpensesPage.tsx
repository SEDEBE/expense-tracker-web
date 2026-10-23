import { ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { MonthPicker } from '@/components/MonthPicker'
import { Button, Card, EmptyState, Select, Skeleton } from '@/components/ui'
import { useCategories } from '@/features/categories/api'
import { formatMoney, formatMonth, monthBounds, toMonth } from '@/lib/format'
import type { Expense } from '@/lib/types'
import { useToday } from '@/lib/useToday'
import { type ExpenseFilters, useExpenses, useExportExpenses, useMonthlySummary } from './api'
import { ExpenseFormModal } from './ExpenseFormModal'
import { ExpenseTable } from './ExpenseTable'

const PAGE_SIZE = 20 // The API's page size.

const orderings = [
  { value: '-date', label: 'Más recientes' },
  { value: 'date', label: 'Más antiguos' },
  { value: '-amount', label: 'Importe: mayor primero' },
  { value: 'amount', label: 'Importe: menor primero' },
]

export default function ExpensesPage() {
  // Filters live in the URL, so the dashboard can link here with a month and category chosen.
  const [params, setParams] = useSearchParams()
  const today = useToday()
  const month = params.get('mes') ?? toMonth(today)
  const category = params.get('categoria') ?? ''
  const ordering = params.get('orden') ?? '-date'
  const page = Number(params.get('pagina') ?? 1)

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('pagina' in changes)) next.delete('pagina') // A new filter starts on page 1.
    setParams(next, { replace: true })
  }

  const filters: ExpenseFilters = { ...monthBounds(month), ordering, page }
  if (category === 'ninguna') filters.uncategorized = true
  else if (category) filters.category = Number(category)

  const { data: categories = [] } = useCategories()
  const expenses = useExpenses(filters)
  const summary = useMonthlySummary(month)
  const [editing, setEditing] = useState<Expense | 'new' | null>(null)
  const exportCsv = useExportExpenses()

  // The total of what the filter shows comes from the monthly summary, computed by the API.
  const categoryRow = summary.data?.by_category.find((row) =>
    category === 'ninguna' ? row.category_id === null : String(row.category_id) === category,
  )
  const filteredTotal = category ? Number(categoryRow?.total ?? 0) : Number(summary.data?.total ?? 0)
  const count = expenses.data?.count ?? 0
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 pb-2">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Gastos</h1>
          <p className="num mt-1 text-muted">
            {expenses.data && summary.data
              ? `${count} ${count === 1 ? 'gasto' : 'gastos'} · ${formatMoney(filteredTotal)} en ${formatMonth(month).toLowerCase()}`
              : 'Cargando…'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => exportCsv.mutate(filters)}
            loading={exportCsv.isPending}
            disabled={count === 0}
          >
            {!exportCsv.isPending && <Download className="size-4" aria-hidden />}
            Exportar CSV
          </Button>
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden />
            Nuevo gasto
          </Button>
        </div>
      </div>
      {exportCsv.isError && (
        <p role="alert" className="-mt-2 text-sm text-negative">
          No se ha podido exportar. {exportCsv.error.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <MonthPicker value={month} onChange={(value) => update({ mes: value })} />
        <div className="w-full sm:w-52">
          <Select aria-label="Categoría" value={category} onChange={(event) => update({ categoria: event.target.value })}>
            <option value="">Todas las categorías</option>
            <option value="ninguna">Sin categoría</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-52">
          <Select aria-label="Ordenar" value={ordering} onChange={(event) => update({ orden: event.target.value })}>
            {orderings.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="pt-2 pb-1">
        {expenses.isPending ? (
          <div className="space-y-4 px-5 py-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : expenses.isError ? (
          <p className="px-5 py-6 text-negative">No se han podido cargar los gastos. {expenses.error.message}</p>
        ) : expenses.data.results.length === 0 ? (
          <EmptyState title="No hay gastos con estos filtros">
            Prueba con otro mes o categoría, o añade un gasto nuevo.
          </EmptyState>
        ) : (
          <ExpenseTable
            expenses={expenses.data.results}
            categories={categories}
            onSelect={setEditing}
            stale={expenses.isPlaceholderData}
          />
        )}
      </Card>

      {pages > 1 && (
        <nav aria-label="Paginación" className="flex items-center justify-end gap-3 text-sm">
          <span className="text-muted">
            Página {page} de {pages}
          </span>
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => update({ pagina: String(page - 1) })}>
            <ChevronLeft className="size-4" aria-hidden />
            Anterior
          </Button>
          <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => update({ pagina: String(page + 1) })}>
            Siguiente
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </nav>
      )}

      {editing && (
        <ExpenseFormModal expense={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
