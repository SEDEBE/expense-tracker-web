import { QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Retrying a 4xx won't fix it; retry network hiccups and 5xx once.
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 1,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => console.error(error),
    }),
  })
}
