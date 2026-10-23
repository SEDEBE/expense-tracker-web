import { describe, expect, it } from 'vitest'
import type { MonthlySummary } from '@/lib/types'
import { findingFor } from './finding'

const plain = (text: string) => text.replace(/\s/g, ' ')
const summary = (month: string, rows: [number, string, string][]): MonthlySummary => ({
  month,
  total: rows.reduce((sum, [, , total]) => sum + Number(total), 0).toFixed(2),
  by_category: rows.map(([id, name, total]) => ({ category_id: id, category: name, total, count: 1 })),
})

describe('findingFor', () => {
  it('in a month in progress, names a category that already passed the whole previous month', () => {
    const now = summary('2026-10', [[1, 'Restaurantes', '158.58'], [2, 'Vivienda', '650.00']])
    const before = summary('2026-09', [[1, 'Restaurantes', '120.30'], [2, 'Vivienda', '700.00']])

    expect(plain(findingFor(now, before, true))).toBe(
      'Restaurantes ya supera todo septiembre: 158,58 € frente a 120,30 €.',
    )
  })

  it('in a month in progress, says when nothing has passed the previous month yet', () => {
    const now = summary('2026-10', [[1, 'Ocio', '10.00'], [2, 'Suscripciones', '60.88']])
    const before = summary('2026-09', [[1, 'Ocio', '40.00'], [2, 'Suscripciones', '60.88']])

    expect(findingFor(now, before, true)).toBe(
      'Ninguna categoría ha llegado todavía a lo que gastaste en todo septiembre.',
    )
  })

  it('in a finished month, names the biggest rise', () => {
    const now = summary('2026-09', [[1, 'Supermercado', '348.10'], [2, 'Ocio', '20.00']])
    const before = summary('2026-08', [[1, 'Supermercado', '300.00'], [2, 'Ocio', '50.00']])

    expect(plain(findingFor(now, before, false))).toBe('Supermercado sube 48,10 € respecto a agosto.')
  })

  it('handles an empty month', () => {
    expect(findingFor(summary('2026-10', []), undefined, true)).toBe('Todavía no hay gastos este mes.')
  })
})
