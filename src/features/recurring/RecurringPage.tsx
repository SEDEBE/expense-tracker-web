import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { useCategories } from '@/features/categories/api'
import { formatDayMonth, formatMoney } from '@/lib/format'
import type { RecurringExpense } from '@/lib/types'
import { useRecurringExpenses } from './api'
import { RecurringFormModal } from './RecurringFormModal'

export default function RecurringPage() {
  const recurring = useRecurringExpenses()
  const { data: categories = [] } = useCategories()
  const [editing, setEditing] = useState<RecurringExpense | 'new' | null>(null)

  const names = new Map(categories.map((category) => [category.id, category.name]))
  const active = recurring.data?.filter((item) => item.active) ?? []
  const perMonth = active.reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 pb-2">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Gastos fijos</h1>
          <p className="num mt-1 text-muted">
            {recurring.data
              ? `${formatMoney(perMonth)} al mes · se apuntan solos el día que toca`
              : 'Cargando…'}
          </p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus className="size-4" aria-hidden />
          Nuevo gasto fijo
        </Button>
      </div>

      <Card className="py-1">
        {recurring.isPending ? (
          <div className="space-y-4 px-5 py-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : recurring.isError ? (
          <p className="px-5 py-6 text-negative">No se han podido cargar los gastos fijos. {recurring.error.message}</p>
        ) : recurring.data.length === 0 ? (
          <EmptyState title="Aún no tienes gastos fijos">
            Añade el alquiler, tus suscripciones o el gimnasio y se apuntarán solos cada mes.
          </EmptyState>
        ) : (
          <ul>
            {recurring.data.map((item, index) => (
              <li key={item.id} className={index === 0 ? '' : 'border-t border-rule'}>
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-5 py-3 text-left hover:bg-raised"
                >
                  <span className="min-w-0">
                    <span className={`block truncate ${item.active ? '' : 'text-muted'}`}>{item.description}</span>
                    <span className="block truncate text-xs text-muted">
                      {(item.category && names.get(item.category)) || 'Sin categoría'} · día {item.day_of_month} de cada mes
                    </span>
                  </span>
                  <span className="num text-right">
                    <span className={`block ${item.active ? 'font-medium' : 'text-muted'}`}>{formatMoney(item.amount)}</span>
                    <span className="block text-xs text-muted">
                      {item.active ? `Próximo: ${formatDayMonth(item.next_date)}` : 'En pausa'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editing && (
        <RecurringFormModal recurring={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
