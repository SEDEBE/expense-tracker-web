import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Page, RecurringExpense, RecurringExpenseInput } from '@/lib/types'

export const recurringApi = {
  // Nobody has more than a page of fixed expenses, so one request is enough.
  list: () => api<Page<RecurringExpense>>('/recurring/').then((page) => page.results),
  create: (data: RecurringExpenseInput) => api<RecurringExpense>('/recurring/', { method: 'POST', body: data }),
  update: (id: number, data: Partial<RecurringExpenseInput>) =>
    api<RecurringExpense>(`/recurring/${id}/`, { method: 'PATCH', body: data }),
  remove: (id: number) => api<void>(`/recurring/${id}/`, { method: 'DELETE' }),
}

export function useRecurringExpenses() {
  return useQuery({ queryKey: ['recurring'], queryFn: recurringApi.list })
}

function useInvalidate() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['recurring'] })
}

export function useSaveRecurring() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: RecurringExpenseInput }) =>
      id ? recurringApi.update(id, data) : recurringApi.create(data),
    onSuccess: invalidate,
  })
}

export function useDeleteRecurring() {
  const invalidate = useInvalidate()
  return useMutation({ mutationFn: recurringApi.remove, onSuccess: invalidate })
}
