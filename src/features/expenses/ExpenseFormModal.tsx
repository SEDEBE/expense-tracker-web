import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Modal } from '@/components/Modal'
import { Alert, Button, Field, Input, Select } from '@/components/ui'
import { useCategories } from '@/features/categories/api'
import { ApiError } from '@/lib/api'
import { toIsoDate } from '@/lib/format'
import { amountSchema } from '@/lib/amount'
import type { Expense } from '@/lib/types'
import { useToday } from '@/lib/useToday'
import { useDeleteExpense, useSaveExpense } from './api'

const schema = z.object({
  // Spanish keyboards type "12,50"; the API wants "12.50".
  amount: amountSchema,
  date: z.string().min(1, 'Elige una fecha'),
  description: z.string().trim().max(255, 'Máximo 255 caracteres'),
  category: z.string(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

interface ExpenseFormModalProps {
  /** The expense to edit; without it the form creates a new one. */
  expense?: Expense
  onClose: () => void
}

export function ExpenseFormModal({ expense, onClose }: ExpenseFormModalProps) {
  const today = useToday()
  const { data: categories = [] } = useCategories()
  const save = useSaveExpense()
  const remove = useDeleteExpense()
  // Deleting takes two clicks: the first one turns the button into the confirmation.
  const [confirmDelete, setConfirmDelete] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: expense ? expense.amount.replace('.', ',') : '',
      date: expense?.date ?? toIsoDate(today),
      description: expense?.description ?? '',
      category: expense?.category ? String(expense.category) : '',
    },
  })

  const onSubmit = handleSubmit((values) => {
    const data = { ...values, category: values.category ? Number(values.category) : null }
    save.mutate(
      { id: expense?.id, data },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!(error instanceof ApiError)) return
          for (const field of ['amount', 'date', 'description', 'category'] as const) {
            const message = error.fieldErrors[field]
            if (message) setError(field, { message })
          }
        },
      },
    )
  })

  return (
    <Modal title={expense ? 'Editar gasto' : 'Nuevo gasto'} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {save.error && !(save.error instanceof ApiError && save.error.status === 400) && (
          <Alert>{save.error.message}</Alert>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Importe (€)" error={errors.amount?.message}>
            {(props) => (
              <Input inputMode="decimal" autoComplete="off" placeholder="12,50" {...props} {...register('amount')} />
            )}
          </Field>
          <Field label="Fecha" error={errors.date?.message}>
            {(props) => <Input type="date" {...props} {...register('date')} />}
          </Field>
        </div>
        <Field label="Descripción" error={errors.description?.message}>
          {(props) => <Input autoComplete="off" placeholder="Compra semanal…" {...props} {...register('description')} />}
        </Field>
        <Field label="Categoría" error={errors.category?.message}>
          {(props) => (
            <Select {...props} {...register('category')}>
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {remove.error && <Alert>{remove.error.message}</Alert>}
        <div className="flex items-center gap-2 pt-2">
          {expense && (
            <Button
              variant={confirmDelete ? 'danger' : 'ghost'}
              className={confirmDelete ? '' : 'text-negative hover:text-negative'}
              loading={remove.isPending}
              onClick={() =>
                confirmDelete ? remove.mutate(expense.id, { onSuccess: onClose }) : setConfirmDelete(true)
              }
            >
              {confirmDelete ? 'Sí, borrar' : 'Borrar'}
            </Button>
          )}
          <span className="flex-1" />
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={save.isPending}>
            {expense ? 'Guardar cambios' : 'Añadir gasto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
