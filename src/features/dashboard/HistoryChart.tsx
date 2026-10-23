import { formatMoney, formatMonth, formatShortMonth } from '@/lib/format'
import type { MonthTotal } from '@/lib/types'
import { useElementSize } from '@/lib/useElementSize'
import { niceTicks } from './niceTicks'

interface HistoryChartProps {
  data: MonthTotal[]
  /** The month shown on the screen: its column takes the blue, the others stay grey. */
  selected: string
  onSelect: (month: string) => void
}

const MIN_HEIGHT = 200
const PAD = { top: 22, right: 4, bottom: 26, left: 48 }
const signedMoney = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatMoney(Math.abs(value))}`
const wholeEuro = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, useGrouping: 'always' })

export function HistoryChart({ data, selected, onSelect }: HistoryChartProps) {
  // The plot takes the height its card has left, so the card never holds a blank band.
  const [ref, { width, height }] = useElementSize<HTMLDivElement>()
  const HEIGHT = Math.max(MIN_HEIGHT, height)
  const values = data.map((row) => Number(row.total))
  const ticks = niceTicks(Math.max(...values, 0))
  const top = ticks.at(-1) || 1
  const plotWidth = Math.max(0, width - PAD.left - PAD.right)
  const plotHeight = HEIGHT - PAD.top - PAD.bottom
  const band = data.length ? plotWidth / data.length : 0
  const barWidth = Math.min(36, band * 0.56)
  const y = (value: number) => PAD.top + plotHeight - (value / top) * plotHeight
  const average = values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
  const peak = data[values.indexOf(Math.max(...values))]
  const selectedIndex = data.findIndex((row) => row.month === selected)

  return (
    <div className="flex flex-1 flex-col px-5 pt-3 pb-4">
     <div ref={ref} className="relative min-h-[200px] flex-1">
      {width > 0 && (
        <svg width={width} height={HEIGHT} className="absolute inset-0 block overflow-visible" aria-hidden>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke={tick === 0 ? 'var(--c-muted)' : 'var(--c-grid)'}
                strokeWidth={1}
              />
              <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="num fill-muted text-xs">
                {wholeEuro.format(tick)} €
              </text>
            </g>
          ))}
          {data.map((row, i) => {
            const value = values[i]
            const x = PAD.left + band * i + (band - barWidth) / 2
            const isSelected = row.month === selected
            const barTop = y(value)
            const h = PAD.top + plotHeight - barTop
            return (
              <g key={row.month}>
                {h > 0 && (
                  <path
                    d={`M${x},${PAD.top + plotHeight} V${barTop + 2} q0,-2 2,-2 H${x + barWidth - 2} q2,0 2,2 V${PAD.top + plotHeight} Z`}
                    fill={isSelected ? 'var(--c-chart)' : 'var(--c-chart-muted)'}
                  />
                )}
                {isSelected && (
                  <text x={x + barWidth / 2} y={barTop - 6} textAnchor="middle" className="num fill-text text-xs font-medium">
                    {wholeEuro.format(value)} €
                  </text>
                )}
                <text
                  x={x + barWidth / 2}
                  y={HEIGHT - 6}
                  textAnchor="middle"
                  className={isSelected ? 'fill-text text-xs font-medium' : 'fill-muted text-xs'}
                >
                  {formatShortMonth(row.month)}
                </text>
              </g>
            )
          })}
          {average > 0 && (
            <g>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(average)}
                y2={y(average)}
                stroke="var(--c-text)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            </g>
          )}
        </svg>
      )}

      {/* Hit areas wider than the bars, reachable with the keyboard. */}
      {width > 0 && (
        <div className="absolute top-0 flex" style={{ left: PAD.left, width: plotWidth, height: HEIGHT }}>
          {data.map((row, i) => (
            <button
              key={row.month}
              type="button"
              onClick={() => onSelect(row.month)}
              title={`${formatMonth(row.month)}: ${formatMoney(values[i])}`}
              aria-label={`Ver ${formatMonth(row.month)}: ${formatMoney(values[i])}`}
              aria-pressed={row.month === selected}
              className="flex-1 rounded-sm hover:bg-active/40"
            />
          ))}
        </div>
      )}

     </div>

      {data.length > 0 && (
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted">
              <span className="w-4 border-t border-dashed border-text" aria-hidden />
              Media de los 6 meses
            </dt>
            <dd className="num font-medium">{formatMoney(average)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Mes con más gasto</dt>
            <dd className="num">
              {peak && `${formatMonth(peak.month).split(' ')[0]}, ${formatMoney(peak.total)}`}
            </dd>
          </div>
          {selectedIndex >= 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{formatMonth(selected).split(' ')[0]} frente a la media</dt>
              <dd className="num">{signedMoney(values[selectedIndex] - average)}</dd>
            </div>
          )}
        </dl>
      )}

      <table className="sr-only">
        <caption>Total gastado por mes</caption>
        <tbody>
          {data.map((row) => (
            <tr key={row.month}>
              <th scope="row">{formatMonth(row.month)}</th>
              <td>{formatMoney(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
