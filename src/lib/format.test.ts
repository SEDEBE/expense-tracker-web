import { describe, expect, it } from 'vitest'
import { daysInMonth, formatMoney, formatMonth, monthBounds, shiftMonth } from './format'

// Intl puts a non-breaking space before the euro sign; normalize it to compare.
const plain = (text: string) => text.replace(/\s/g, ' ')

describe('format', () => {
  it('formats amounts in Spanish', () => {
    expect(plain(formatMoney('12.5'))).toBe('12,50 €')
    expect(plain(formatMoney('12345.6'))).toBe('12.345,60 €')
  })

  it('names months in Spanish, capitalized', () => {
    expect(formatMonth('2026-10')).toBe('Octubre de 2026')
  })

  it('moves between months across years', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
  })

  it('knows the bounds of a month, leap years included', () => {
    expect(daysInMonth('2028-02')).toBe(29)
    expect(monthBounds('2026-02')).toEqual({ date_from: '2026-02-01', date_to: '2026-02-28' })
  })
})
