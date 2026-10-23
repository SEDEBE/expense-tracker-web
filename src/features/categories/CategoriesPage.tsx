import { Check, Pencil, Plus, Tags, Trash2, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Alert, Button, Card, EmptyState, Input, Spinner } from '@/components/ui'
import type { Category } from '@/lib/types'
import { useCategories, useCreateCategory, useDeleteCategory, useRenameCategory } from './api'

export default function CategoriesPage() {
  const categories = useCategories()
  const create = useCreateCategory()
  const remove = useDeleteCategory()
  const [name, setName] = useState('')
  const [deleting, setDeleting] = useState<Category | null>(null)

  const onCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    create.mutate(name.trim(), { onSuccess: () => setName('') })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <p className="mt-1 text-muted">Al borrar una categoría, sus gastos pasan a «Sin categoría».</p>
      </div>

      <Card>
        <form onSubmit={onCreate} className="flex gap-2">
          <Input
            aria-label="Nombre de la nueva categoría"
            placeholder="Nueva categoría, p. ej. Mascotas"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
          />
          <Button type="submit" loading={create.isPending} className="shrink-0">
            <Plus className="size-4" aria-hidden />
            Añadir
          </Button>
        </form>
        {create.error && (
          <div className="mt-3">
            <Alert>{create.error.message}</Alert>
          </div>
        )}
      </Card>

      <Card className="py-2">
        {categories.isPending ? (
          <Spinner />
        ) : categories.isError ? (
          <p className="py-6 text-center text-danger">{categories.error.message}</p>
        ) : categories.data.length === 0 ? (
          <EmptyState icon={<Tags className="size-5" />} title="Aún no tienes categorías">
            Crea la primera con el formulario de arriba.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {categories.data.map((category) => (
              <CategoryItem key={category.id} category={category} onDelete={() => setDeleting(category)} />
            ))}
          </ul>
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
          Sus gastos no se borran: pasarán a «Sin categoría».
        </ConfirmDialog>
      )}
    </div>
  )
}

function CategoryItem({ category, onDelete }: { category: Category; onDelete: () => void }) {
  const rename = useRenameCategory()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || name.trim() === category.name) return setEditing(false)
    rename.mutate({ id: category.id, name: name.trim() }, { onSuccess: () => setEditing(false) })
  }

  if (editing) {
    return (
      <li className="py-3">
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <Input
            aria-label={`Nuevo nombre de ${category.name}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
            autoFocus
          />
          <Button type="submit" size="sm" className="px-2" loading={rename.isPending} aria-label="Guardar">
            <Check className="size-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label="Cancelar"
            onClick={() => {
              setName(category.name)
              setEditing(false)
              rename.reset()
            }}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </form>
        {rename.error && <p className="mt-2 text-sm text-danger">{rename.error.message}</p>}
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex-1 text-sm font-medium">{category.name}</span>
      <Button
        variant="ghost"
        size="sm"
        className="px-2"
        onClick={() => setEditing(true)}
        aria-label={`Renombrar ${category.name}`}
      >
        <Pencil className="size-4" aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="px-2 hover:text-danger"
        onClick={onDelete}
        aria-label={`Borrar ${category.name}`}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </li>
  )
}
