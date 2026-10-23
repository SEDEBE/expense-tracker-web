// Spanish formatting for amounts and dates: 1.234,50 €, "octubre de 2026", "23 oct".

const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const percent = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})
const monthYear = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
const shortMonth = new Intl.DateTimeFormat('es-ES', { month: 'short' })
const dayMonth = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
const longDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatMoney(value: string | number) {
  return currency.format(Number(value))
}

export function formatPercent(ratio: number) {
  return percent.format(ratio)
}

/** "2026-10" → Date for the 1st of that month, in local time. */
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
  const pad = (n: number) => String(n).padStart(2, '0')
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

/** First and last day of a month, as the API's date filters expect them. */
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
