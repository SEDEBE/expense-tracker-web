import { Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

// What a month looks like in the app; the demo account starts with data like this.
const sample = [
  { day: '01 oct', text: 'Alquiler', category: 'Vivienda', amount: '650,00' },
  { day: '03 oct', text: 'Mercadona', category: 'Supermercado', amount: '42,30' },
  { day: '08 oct', text: 'Luz', category: 'Vivienda', amount: '57,12' },
  { day: '12 oct', text: 'Menú del día', category: 'Restaurantes', amount: '13,50' },
  { day: '15 oct', text: 'Abono de transporte', category: 'Transporte', amount: '20,00' },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="hidden flex-col justify-between border-r border-border bg-surface-2 p-12 lg:flex">
        <div className="flex items-center gap-2 font-semibold text-accent">
          <Wallet className="size-5" aria-hidden />
          Gastos
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl leading-tight font-semibold">
            Tus gastos del mes, por categoría y sin hojas de cálculo.
          </h1>
          <div className="mt-8 rounded-lg border border-border bg-surface p-5">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Octubre 2026</p>
            <ul className="mt-3 divide-y divide-border text-sm">
              {sample.map((row) => (
                <li key={row.day + row.text} className="flex items-baseline gap-3 py-2">
                  <span className="amount w-12 shrink-0 text-xs text-muted">{row.day}</span>
                  <span className="flex-1 truncate">{row.text}</span>
                  <span className="hidden text-xs text-muted xl:inline">{row.category}</span>
                  <span className="amount w-20 text-right">{row.amount} €</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-text pt-3 text-sm font-semibold">
              <span>Total</span>
              <span className="amount">782,92 €</span>
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
          <div className="mb-10 flex items-center gap-2 font-semibold text-accent lg:hidden">
            <Wallet className="size-5" aria-hidden />
            Gastos
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
