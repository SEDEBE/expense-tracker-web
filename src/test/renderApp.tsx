import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/router'
import { session } from '@/lib/session'
import { tokens } from './server'

/** Renders the whole app at `path`, with a fresh cache, as a logged-in user unless told otherwise. */
export function renderApp(path = '/', { loggedIn = true } = {}) {
  if (loggedIn) session.set(tokens)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { user, router }
}
