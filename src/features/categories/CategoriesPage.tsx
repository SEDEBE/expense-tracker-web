import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Alert, Button, Card, EmptyState, Input, Skeleton } from '@/components/ui'
import { useMonthlySummary } from '@/features/expenses/api'
import { optionalAmountSchema } from '@/lib/amount'
import { formatMoney, formatMonth, toMonth } from '@/lib/format'
import type { Category, CategoryTotal } from '@/lib/types'
import { useToday } from '@/lib/useToday'
import { type CategoryChanges, useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from './api'

export default function CategoriesPage() {
  const month = toMonth(useToday())
  const categories = useCategories()
  const summary = useMonthlySummary(month)
  const create = useCreateCategory()
  const remove = useDeleteCategory()
  const [name, setName] = useState('')
  const [deleting, setDeleting] = useState<Category | null>(null)

  const totals = new Map(summary.data?.by_category.map((row) => [row.category_id, row]))

  const onCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    create.mutate(name.trim(), { onSuccess: () => setName('') })
  }

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h1 className="text-2xl font-medium tracking-tight">Categorías</h1>
        <p className="mt-1 text-muted">
          {categories.data
            ? `${categories.data.length} ${categories.data.length === 1 ? 'categoría' : 'categorías'} · lo gastado en ${formatMonth(month).toLowerCase()}`
            : 'Cargando…'}
        </p>
      </div>

      <form onSubmit={onCreate} className="flex max-w-xl gap-2">
        <Input
          aria-label="Nombre de la nueva categoría"
          placeholder="Nueva categoría, p. ej. Mascotas…"
          autoComplete="off"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={50}
        />
        <Button type="submit" loading={create.isPending}>
          <Plus className="size-4" aria-hidden />
          Añadir
        </Button>
      </form>
      {create.error && <Alert>{create.error.message}</Alert>}

      <Card className="py-1">
        {categories.isPending ? (
          <div className="space-y-4 px-5 py-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : categories.isError ? (
          <p className="px-5 py-6 text-negative">No se han podido cargar las categorías. {categories.error.message}</p>
        ) : categories.data.length === 0 ? (
          <EmptyState title="Aún no tienes categorías">Crea la primera con el campo de arriba.</EmptyState>
        ) : (
          <>
          <div aria-hidden className={`hidden h-9 items-center gap-x-4 px-5 text-xs text-muted sm:grid ${columns}`}>
            <span>Categoría</span>
            <span className="text-right">Gastos este mes</span>
            <span className="text-right">Importe este mes</span>
            <span />
          </div>
          <ul>
            {categories.data.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                total={totals.get(category.id)}
                first={index === 0}
                onDelete={() => setDeleting(category)}
              />
            ))}
          </ul>
          </>
        )}
      </Card>

      {deleting && (
        <ConfirmDialog
          title={`¿Borrar «${deleting.name}»?`}
          confirmLabel="Borrar categoría"
          loading={remove.isPending}
          onClose={() => setDeleting(null)}
          onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        >
          Sus gastos no se borran: pasan a «Sin categoría».
        </ConfirmDialog>
      )}
    </div>
  )
}

// Fixed columns so every amount ends on the same right edge.
const columns = 'grid-cols-[minmax(0,1fr)_auto_auto] sm:grid-cols-[minmax(0,1fr)_9rem_9rem_5rem]'

interface CategoryItemProps {
  category: Category
  total?: CategoryTotal
  first: boolean
  onDelete: () => void
}

function CategoryItem({ category, total, first, onDelete }: CategoryItemProps) {
  const update = useUpdateCategory()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [budget, setBudget] = useState(toInput(category.monthly_budget))
  const [budgetError, setBudgetError] = useState<string | null>(null)
  const rowClass = `min-h-12 items-center gap-x-4 px-5 ${first ? '' : 'border-t border-rule'}`

  const stopEditing = () => {
    setName(category.name)
    setBudget(toInput(category.monthly_budget))
    setBudgetError(null)
    update.reset()
    setEditing(false)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const parsed = optionalAmountSchema.safeParse(budget)
    if (!parsed.success) return setBudgetError(parsed.error.issues[0].message)
    setBudgetError(null)
    // Send only what changed, so an untouched field never overwrites a newer value.
    const changes: CategoryChanges = {}
    if (name.trim() && name.trim() !== category.name) changes.name = name.trim()
    if (Number(parsed.data ?? 0) !== Number(category.monthly_budget ?? 0)) changes.monthly_budget = parsed.data
    if (Object.keys(changes).length === 0) return setEditing(false)
    update.mutate({ id: category.id, changes }, { onSuccess: () => setEditing(false) })
  }

  if (editing) {
    return (
      <li className={`${rowClass} py-3`}>
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
          <label className="min-w-40 flex-[2] space-y-1 text-xs text-muted">
            <span>Nombre</span>
            <Input
              aria-label={`Nuevo nombre de ${category.name}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={50}
              autoFocus
            />
          </label>
          <label className="min-w-32 flex-1 space-y-1 text-xs text-muted">
            <span>Límite al mes (€)</span>
            <Input
              aria-label={`Presupuesto mensual de ${category.name}`}
              aria-invalid={Boolean(budgetError)}
              inputMode="decimal"
              autoComplete="off"
              placeholder="Sin límite"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </label>
          <div className="flex gap-1">
            <Button type="submit" size="md" className="px-2.5" loading={update.isPending} aria-label="Guardar">
              <Check className="size-4" aria-hidden />
            </Button>
            <Button variant="ghost" size="md" className="px-2.5" aria-label="Cancelar" onClick={stopEditing}>
              <X className="size-4" aria-hidden />
            </Button>
          </div>
        </form>
        {(budgetError || update.error) && (
          <p className="mt-2 text-sm text-negative">{budgetError ?? update.error?.message}</p>
        )}
      </li>
    )
  }

  const limit = category.monthly_budget === null ? null : Number(category.monthly_budget)
  const over = limit !== null && Number(total?.total ?? 0) > limit
  return (
    <li className={`${rowClass} grid py-2 ${columns}`}>
      <span className="min-w-0">
        <span className="block truncate">{category.name}</span>
        {limit !== null && (
          <span className={`num block text-xs ${over ? 'text-negative' : 'text-muted'}`}>
            Límite {formatMoney(limit)}
            {over ? ' · superado' : ''}
          </span>
        )}
      </span>
      <span className="num hidden text-right text-muted sm:block">{total?.count ?? 0}</span>
      <span className={`num text-right ${total ? 'font-medium' : 'text-muted'}`}>{formatMoney(total?.total ?? 0)}</span>
      <span className="flex justify-end gap-0.5">
        <Button variant="ghost" size="sm" className="px-2" onClick={() => setEditing(true)} aria-label={`Editar ${category.name}`}>
          <Pencil className="size-4" strokeWidth={1.5} aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 hover:text-negative"
          onClick={onDelete}
          aria-label={`Borrar ${category.name}`}
        >
          <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
        </Button>
      </span>
    </li>
  )
}

/** "150.00" from the API becomes "150" or "150,5" in the field; no budget, an empty field. */
function toInput(budget: string | null) {
  return budget === null ? '' : String(Number(budget)).replace('.', ',')
}
