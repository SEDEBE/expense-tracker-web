import type { ReactNode } from 'react'
import { Mark } from '@/components/Mark'

// What a month looks like in the app; the demo account starts with data like this.
const sample = [
  { day: '1 oct', text: 'Alquiler', category: 'Vivienda', amount: '650,00' },
  { day: '3 oct', text: 'Mercadona', category: 'Supermercado', amount: '42,30' },
  { day: '8 oct', text: 'Luz', category: 'Vivienda', amount: '57,12' },
  { day: '12 oct', text: 'Menú del día', category: 'Restaurantes', amount: '13,50' },
  { day: '15 oct', text: 'Abono de transporte', category: 'Transporte', amount: '20,00' },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="hidden flex-col justify-between border-r border-border bg-raised p-12 lg:flex">
        <div className="flex items-center gap-2.5 text-[15px] font-medium">
          <Mark />
          Gastos
        </div>

        <div className="max-w-md">
          <p className="text-[28px] leading-tight font-medium tracking-tight">
            Tus gastos del mes, por categoría y sin hojas de cálculo.
          </p>
          <div data-ui className="mt-8 rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-muted">Octubre de 2026</p>
            <ul className="mt-3 divide-y divide-border text-sm">
              {sample.map((row) => (
                <li key={row.day + row.text} className="flex items-baseline gap-3 py-2">
                  <span className="num w-12 shrink-0 text-muted">{row.day}</span>
                  <span className="flex-1 truncate">{row.text}</span>
                  <span className="hidden text-xs text-muted xl:inline">{row.category}</span>
                  <span className="num w-20 text-right font-medium">{row.amount} €</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-text pt-3 text-sm font-semibold">
              <span>Total</span>
              <span className="num font-bold">782,92 €</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted">
          Proyecto de portfolio de Alejandro Córdoba ·{' '}
          <a
            className="text-text underline underline-offset-2"
            href="https://github.com/SEDEBE/expense-tracker-web"
            target="_blank"
            rel="noreferrer"
          >
            código en GitHub
          </a>
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 text-[15px] font-medium lg:hidden">
            <Mark />
            Gastos
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
