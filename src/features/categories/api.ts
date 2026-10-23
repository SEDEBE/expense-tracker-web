import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Category, Page } from '@/lib/types'

// The endpoint is paginated; follow `next` until the last page.
async function listAll(): Promise<Category[]> {
  const categories: Category[] = []
  for (let page = 1; ; page++) {
    const data = await api<Page<Category>>('/categories/', { query: { page } })
    categories.push(...data.results)
    if (!data.next) return categories
  }
}

export const categoriesApi = {
  listAll,
  create: (name: string) => api<Category>('/categories/', { method: 'POST', body: { name } }),
  rename: (id: number, name: string) =>
    api<Category>(`/categories/${id}/`, { method: 'PATCH', body: { name } }),
  remove: (id: number) => api<void>(`/categories/${id}/`, { method: 'DELETE' }),
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: categoriesApi.listAll })
}

function useInvalidateAfterCategoryChange() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    // Expenses and summaries show category names, and deleting one uncategorizes its expenses.
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['summary'] })
  }
}

export function useCreateCategory() {
  const invalidate = useInvalidateAfterCategoryChange()
  return useMutation({ mutationFn: categoriesApi.create, onSuccess: invalidate })
}

export function useRenameCategory() {
  const invalidate = useInvalidateAfterCategoryChange()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => categoriesApi.rename(id, name),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateAfterCategoryChange()
  return useMutation({ mutationFn: categoriesApi.remove, onSuccess: invalidate })
}
