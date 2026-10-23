// Shapes returned by the Django API (see /api/docs/ on the backend).
// Amounts come as strings to keep decimal precision; convert them only to display or chart them.

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  language: 'en' | 'es'
  is_demo: boolean
  date_joined: string
}

export interface Tokens {
  access: string
  refresh: string
}

export interface Category {
  id: number
  name: string
  created_at: string
}

export interface Expense {
  id: number
  amount: string
  date: string
  description: string
  category: number | null
  created_at: string
  updated_at: string
}

export interface ExpenseInput {
  amount: string
  date: string
  description: string
  category: number | null
}

export interface Page<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CategoryTotal {
  category_id: number | null
  category: string | null
  total: string
  count: number
}

export interface MonthlySummary {
  month: string
  total: string
  by_category: CategoryTotal[]
}

export interface MonthTotal {
  month: string
  total: string
}
