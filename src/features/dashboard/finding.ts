import { formatMoney, formatMonth, shiftMonth } from '@/lib/format'
import type { MonthlySummary } from '@/lib/types'

export const monthName = (month: string) => formatMonth(month).split(' ')[0].toLowerCase()

/** The one fact the screen should say first, stated against a named baseline. */
export function findingFor(summary: MonthlySummary, previous: MonthlySummary | undefined, inProgress: boolean) {
  const before = monthName(shiftMonth(summary.month, -1))
  if (!summary.by_category.length) return 'Todavía no hay gastos este mes.'
  if (!previous?.by_category.length) return `Sin gastos en ${before} con los que comparar.`

  const last = new Map(previous.by_category.map((row) => [row.category_id, Number(row.total)]))
  const changes = summary.by_category
    .map((row) => ({ name: row.category ?? 'Sin categoría', now: Number(row.total), then: last.get(row.category_id) ?? 0 }))
    .filter((row) => row.then > 0)
    .sort((a, b) => b.now - b.then - (a.now - a.then))
  const top = changes[0]

  if (inProgress) {
    return top && top.now > top.then
      ? `${top.name} ya supera todo ${before}: ${formatMoney(top.now)} frente a ${formatMoney(top.then)}.`
      : `Ninguna categoría ha llegado todavía a lo que gastaste en todo ${before}.`
  }
  if (top && top.now > top.then) return `${top.name} sube ${formatMoney(top.now - top.then)} respecto a ${before}.`
  const difference = Number(previous.total) - Number(summary.total)
  return difference > 0
    ? `Gastaste ${formatMoney(difference)} menos que en ${before}.`
    : `Gastaste ${formatMoney(-difference)} más que en ${before}.`
}

