// useGrouping 'always': Spanish formatting skips the separator on 4-digit numbers (1486,69), but in
// columns of money every figure needs it (1.486,69).
const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' })
const percent = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})
const monthYear = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
const shortMonth = new Intl.DateTimeFormat('es-ES', { month: 'short' })
const dayMonth = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
const numericDate = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
const longDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatMoney(value: string | number) {
  return currency.format(Number(value))
}

export function formatPercent(ratio: number) {
  return percent.format(ratio)
}

export function monthToDate(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber - 1, 1)
}

/** "2026-10-23" → local Date (new Date("2026-10-23") would be midnight UTC). */
export function isoToDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0') // taste-skill-ignore: a date
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function toMonth(date: Date) {
  return toIsoDate(date).slice(0, 7)
}

export function shiftMonth(month: string, delta: number) {
  const date = monthToDate(month)
  return toMonth(new Date(date.getFullYear(), date.getMonth() + delta, 1))
}

export function daysInMonth(month: string) {
  const date = monthToDate(month)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function monthBounds(month: string) {
  return { date_from: `${month}-01`, date_to: `${month}-${daysInMonth(month)}` }
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatMonth(month: string) {
  return capitalize(monthYear.format(monthToDate(month)))
}

export function formatShortMonth(month: string) {
  return capitalize(shortMonth.format(monthToDate(month)).replace('.', ''))
}

export function formatDayMonth(iso: string) {
  return dayMonth.format(isoToDate(iso)).replace('.', '')
}

export function formatLongDate(iso: string) {
  return longDate.format(isoToDate(iso))
}

export function formatNumericDate(iso: string) {
  return numericDate.format(isoToDate(iso))
}
