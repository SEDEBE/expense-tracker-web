import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { Category, Expense, MonthlySummary, MonthTotal, Page, RecurringExpense, User } from '@/lib/types'

export const API = 'http://localhost/api/v1'

export const demoUser: User = {
  id: 1,
  email: 'demo-abc@demo.invalid',
  first_name: 'Demo',
  last_name: '',
  language: 'es',
  is_demo: true,
  date_joined: '2026-10-23T09:00:00Z',
}

export const categories: Category[] = [
  { id: 1, name: 'Supermercado', monthly_budget: '300.00', created_at: '2026-10-01T00:00:00Z' },
  { id: 2, name: 'Vivienda', monthly_budget: '600.00', created_at: '2026-10-01T00:00:00Z' },
  { id: 3, name: 'Ocio', monthly_budget: null, created_at: '2026-10-01T00:00:00Z' },
]

export const recurring: RecurringExpense[] = [
  {
    id: 7,
    amount: '650.00',
    description: 'Alquiler',
    category: 2,
    day_of_month: 1,
    active: true,
    next_date: '2026-11-01',
    last_date: '2026-10-01',
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 8,
    amount: '13.99',
    description: 'Netflix',
    category: null,
    day_of_month: 12,
    active: false,
    next_date: '2026-10-12',
    last_date: null,
    created_at: '2026-10-01T00:00:00Z',
  },
]

export const expenses: Expense[] = [
  {
    id: 10,
    amount: '650.00',
    date: '2026-10-01',
    description: 'Alquiler',
    category: 2,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 11,
    amount: '42.30',
    date: '2026-10-03',
    description: 'Mercadona',
    category: 1,
    created_at: '2026-10-03T00:00:00Z',
    updated_at: '2026-10-03T00:00:00Z',
  },
]

export function page<T>(results: T[]): Page<T> {
  return { count: results.length, next: null, previous: null, results }
}

export const tokens = { access: 'access-token', refresh: 'refresh-token' }

// Default answers for a logged-in demo user; each test overrides what it needs with server.use().
export const handlers = [
  http.post(`${API}/auth/demo/`, () => HttpResponse.json(tokens, { status: 201 })),
  http.post(`${API}/auth/token/`, () => HttpResponse.json(tokens)),
  http.get(`${API}/auth/me/`, () => HttpResponse.json(demoUser)),
  http.get(`${API}/categories/`, () => HttpResponse.json(page(categories))),
  http.get(`${API}/expenses/`, () => HttpResponse.json(page(expenses))),
  http.get(`${API}/recurring/`, () => HttpResponse.json(page(recurring))),
  http.get(`${API}/expenses/summary/`, ({ request }) => {
    const month = new URL(request.url).searchParams.get('month') ?? '2026-10'
    const summary: MonthlySummary = {
      month,
      total: '692.30',
      by_category: [
        { category_id: 2, category: 'Vivienda', total: '650.00', count: 1 },
        { category_id: 1, category: 'Supermercado', total: '42.30', count: 1 },
      ],
    }
    return HttpResponse.json(summary)
  }),
  http.post(`${API}/expenses/summary/email/`, () =>
    HttpResponse.json({ detail: 'Te estamos enviando el resumen a demo-abc@demo.invalid.' }, { status: 202 }),
  ),
  http.get(`${API}/expenses/history/`, () => {
    const history: MonthTotal[] = [
      { month: '2026-09', total: '1200.00' },
      { month: '2026-10', total: '692.30' },
    ]
    return HttpResponse.json(history)
  }),
]

export const server = setupServer(...handlers)
