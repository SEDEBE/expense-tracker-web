import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Expense, ExpenseInput, MonthlySummary, MonthTotal, Page } from '@/lib/types'

export interface ExpenseFilters {
  date_from?: string
  date_to?: string
  category?: number
  uncategorized?: boolean
  ordering?: string
  page?: number
}

export const expensesApi = {
  list: (filters: ExpenseFilters) => api<Page<Expense>>('/expenses/', { query: { ...filters } }),
  create: (data: ExpenseInput) => api<Expense>('/expenses/', { method: 'POST', body: data }),
  update: (id: number, data: ExpenseInput) =>
    api<Expense>(`/expenses/${id}/`, { method: 'PATCH', body: data }),
  remove: (id: number) => api<void>(`/expenses/${id}/`, { method: 'DELETE' }),
  summary: (month: string) => api<MonthlySummary>('/expenses/summary/', { query: { month } }),
  history: (months: number) => api<MonthTotal[]>('/expenses/history/', { query: { months } }),
}

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expensesApi.list(filters),
    // Keep showing the current page while the next one loads, instead of flashing a spinner.
    placeholderData: keepPreviousData,
  })
}

export function useMonthlySummary(month: string) {
  return useQuery({
    queryKey: ['summary', month],
    queryFn: () => expensesApi.summary(month),
    placeholderData: keepPreviousData,
  })
}

export function useHistory(months = 6) {
  return useQuery({ queryKey: ['history', months], queryFn: () => expensesApi.history(months) })
}

function useInvalidateAfterExpenseChange() {
  const queryClient = useQueryClient()
  return () => {
    for (const key of ['expenses', 'summary', 'history']) {
      queryClient.invalidateQueries({ queryKey: [key] })
    }
  }
}

export function useSaveExpense() {
  const invalidate = useInvalidateAfterExpenseChange()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ExpenseInput }) =>
      id ? expensesApi.update(id, data) : expensesApi.create(data),
    onSuccess: invalidate,
  })
}

export function useDeleteExpense() {
  const invalidate = useInvalidateAfterExpenseChange()
  return useMutation({ mutationFn: expensesApi.remove, onSuccess: invalidate })
}
