import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Modal } from '@/components/Modal'
import { Alert, Button, Field, Input, Select } from '@/components/ui'
import { useCategories } from '@/features/categories/api'
import { amountSchema } from '@/lib/amount'
import { ApiError } from '@/lib/api'
import type { RecurringExpense } from '@/lib/types'
import { useDeleteRecurring, useSaveRecurring } from './api'

const schema = z.object({
  amount: amountSchema,
  description: z.string().trim().min(1, 'Ponle un nombre, p. ej. Alquiler').max(255, 'Máximo 255 caracteres'),
  category: z.string(),
  day_of_month: z.string(),
  active: z.boolean(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

const days = Array.from({ length: 31 }, (_, index) => index + 1)

interface RecurringFormModalProps {
  recurring?: RecurringExpense
  onClose: () => void
}

export function RecurringFormModal({ recurring, onClose }: RecurringFormModalProps) {
  const { data: categories = [] } = useCategories()
  const save = useSaveRecurring()
  const remove = useDeleteRecurring()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: recurring ? recurring.amount.replace('.', ',') : '',
      description: recurring?.description ?? '',
      category: recurring?.category ? String(recurring.category) : '',
      day_of_month: String(recurring?.day_of_month ?? 1),
      active: recurring?.active ?? true,
    },
  })
  const day = Number(useWatch({ control, name: 'day_of_month' }))

  const onSubmit = handleSubmit((values) => {
    const data = {
      ...values,
      category: values.category ? Number(values.category) : null,
      day_of_month: Number(values.day_of_month),
    }
    save.mutate(
      { id: recurring?.id, data },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!(error instanceof ApiError)) return
          for (const field of ['amount', 'description', 'category', 'day_of_month'] as const) {
            const message = error.fieldErrors[field]
            if (message) setError(field, { message })
          }
        },
      },
    )
  })

  return (
    <Modal title={recurring ? 'Editar gasto fijo' : 'Nuevo gasto fijo'} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {save.error && !(save.error instanceof ApiError && save.error.status === 400) && (
          <Alert>{save.error.message}</Alert>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Importe (€)" error={errors.amount?.message}>
            {(props) => (
              <Input inputMode="decimal" autoComplete="off" placeholder="650,00" {...props} {...register('amount')} />
            )}
          </Field>
          <Field
            label="Día de cada mes"
            error={errors.day_of_month?.message}
            hint={day > 28 ? 'En los meses más cortos, el último día.' : undefined}
          >
            {(props) => (
              <Select {...props} {...register('day_of_month')}>
                {days.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <Field label="Descripción" error={errors.description?.message}>
          {(props) => <Input autoComplete="off" placeholder="Alquiler, Netflix, gimnasio…" {...props} {...register('description')} />}
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
        {recurring && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-current" {...register('active')} />
            Apuntarlo cada mes (desmárcalo para pausarlo)
          </label>
        )}
        {remove.error && <Alert>{remove.error.message}</Alert>}
        <div className="flex items-center gap-2 pt-2">
          {recurring && (
            <Button
              variant={confirmDelete ? 'danger' : 'ghost'}
              className={confirmDelete ? '' : 'text-negative hover:text-negative'}
              loading={remove.isPending}
              onClick={() =>
                confirmDelete ? remove.mutate(recurring.id, { onSuccess: onClose }) : setConfirmDelete(true)
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
            {recurring ? 'Guardar cambios' : 'Añadir gasto fijo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
