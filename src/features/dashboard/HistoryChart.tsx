import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { BarShapeProps, TooltipContentProps } from 'recharts'
import { formatMoney, formatMonth, formatShortMonth } from '@/lib/format'
import type { MonthTotal } from '@/lib/types'
import { niceTicks } from './niceTicks'

interface HistoryChartProps {
  data: MonthTotal[]
  selected: string
  onSelect: (month: string) => void
}

const compactEuro = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as (MonthTotal & { value: number }) | undefined
  if (!active || !row) return null
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-md">
      <p className="text-muted">{formatMonth(row.month)}</p>
      <p className="amount font-medium">{formatMoney(row.total)}</p>
    </div>
  )
}

export function HistoryChart({ data, selected, onSelect }: HistoryChartProps) {
  const rows = data.map((row) => ({ ...row, value: Number(row.total) }))
  const ticks = niceTicks(Math.max(...rows.map((row) => row.value)))

  return (
    <>
      <div className="h-64 text-muted lg:h-auto lg:min-h-64 lg:flex-1" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.15} />
            <XAxis
              dataKey="month"
              tickFormatter={formatShortMonth}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              ticks={ticks}
              domain={[0, ticks.at(-1) ?? 0]}
              tickFormatter={(value: number) => compactEuro.format(value)}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={ChartTooltip} cursor={{ fill: 'currentColor', fillOpacity: 0.06 }} />
            <Bar
              dataKey="value"
              maxBarSize={48}
              cursor="pointer"
              onClick={(entry) => onSelect((entry.payload as MonthTotal).month)}
              shape={(props: BarShapeProps) => (
                <Rectangle
                  {...props}
                  radius={[2, 2, 0, 0]}
                  style={{
                    fill:
                      (props.payload as MonthTotal).month === selected
                        ? 'var(--c-chart)'
                        : 'var(--c-chart-muted)',
                  }}
                />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Same data as a table for screen readers. */}
      <table className="sr-only">
        <caption>Total gastado por mes</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.month}>
              <td>{formatMonth(row.month)}</td>
              <td>{formatMoney(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
