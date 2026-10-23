import { ChartColumnBig, Languages, ShieldCheck, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

const features = [
  { icon: ChartColumnBig, text: 'Resumen mensual por categoría y evolución de los últimos meses' },
  { icon: ShieldCheck, text: 'API REST propia en Django con autenticación JWT' },
  { icon: Languages, text: 'Mensajes de la API y emails en español e inglés' },
]

/** Two columns on desktop: the product pitch on the left, the form on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#1c5cab] via-[#2a78d6] to-[#3987e5] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Wallet className="size-6" aria-hidden />
          Gastos
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl leading-tight font-bold">Sabe en qué se va tu dinero cada mes.</h1>
          <ul className="mt-8 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-white/90">
                <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/70">
          Proyecto de portfolio de Alejandro Córdoba ·{' '}
          <a
            className="underline underline-offset-2 hover:text-white"
            href="https://github.com/SEDEBE/expense-tracker-web"
            target="_blank"
            rel="noreferrer"
          >
            ver el código
          </a>
        </p>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-10 bottom-24 size-40 rounded-full bg-white/5" />
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold text-accent lg:hidden">
            <Wallet className="size-6" aria-hidden />
            Gastos
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
