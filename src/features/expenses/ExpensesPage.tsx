import { ChevronLeft, ChevronRight, Pencil, Plus, ReceiptText, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { MonthPicker } from '@/components/MonthPicker'
import { Button, Card, EmptyState, Select, Spinner } from '@/components/ui'
import { useCategories } from '@/features/categories/api'
import { formatLongDate, formatMoney, monthBounds, toMonth } from '@/lib/format'
import type { Expense } from '@/lib/types'
import { useToday } from '@/lib/useToday'
import { type ExpenseFilters, useDeleteExpense, useExpenses } from './api'
import { ExpenseFormModal } from './ExpenseFormModal'
import { ExpenseRow } from './ExpenseRow'

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
  const remove = useDeleteExpense()
  const [editing, setEditing] = useState<Expense | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Expense | null>(null)

  const pages = expenses.data ? Math.max(1, Math.ceil(expenses.data.count / PAGE_SIZE)) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gastos</h1>
          <p className="mt-1 text-muted">
            {expenses.data
              ? `${expenses.data.count} ${expenses.data.count === 1 ? 'gasto' : 'gastos'} en este periodo`
              : 'Cargando…'}
          </p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus className="size-4" aria-hidden />
          Nuevo gasto
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <MonthPicker value={month} onChange={(value) => update({ mes: value })} />
          <div className="w-full sm:w-56">
          <Select
            aria-label="Categoría"
            value={category}
            onChange={(event) => update({ categoria: event.target.value })}
          >
            <option value="">Todas las categorías</option>
            <option value="ninguna">Sin categoría</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          </div>
          <div className="w-full sm:w-56">
          <Select
            aria-label="Ordenar"
            value={ordering}
            onChange={(event) => update({ orden: event.target.value })}
          >
            {orderings.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          </div>
        </div>
      </Card>

      <Card className="py-2">
        {expenses.isPending ? (
          <Spinner />
        ) : expenses.isError ? (
          <p className="py-6 text-center text-danger">{expenses.error.message}</p>
        ) : expenses.data.results.length === 0 ? (
          <EmptyState icon={<ReceiptText className="size-5" />} title="No hay gastos con estos filtros">
            Prueba con otro mes o categoría, o añade un gasto nuevo.
          </EmptyState>
        ) : (
          <ul className={`divide-y divide-border ${expenses.isPlaceholderData ? 'opacity-60' : ''}`}>
            {expenses.data.results.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                categories={categories}
                actions={
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2"
                      onClick={() => setEditing(expense)}
                      aria-label={`Editar ${expense.description || 'gasto'}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 hover:text-danger"
                      onClick={() => setDeleting(expense)}
                      aria-label={`Borrar ${expense.description || 'gasto'}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                }
              />
            ))}
          </ul>
        )}
      </Card>

      {pages > 1 && (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-3 text-sm">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => update({ pagina: String(page - 1) })}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Anterior
          </Button>
          <span className="text-muted">
            Página {page} de {pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pages}
            onClick={() => update({ pagina: String(page + 1) })}
          >
            Siguiente
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </nav>
      )}

      {editing && (
        <ExpenseFormModal
          expense={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="¿Borrar este gasto?"
          confirmLabel="Borrar"
          loading={remove.isPending}
          onClose={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        >
          {deleting.description || 'Gasto sin descripción'} · {formatMoney(deleting.amount)} ·{' '}
          {formatLongDate(deleting.date)}. No se puede deshacer.
        </ConfirmDialog>
      )}
    </div>
  )
}
