import { FlaskConical, LayoutDashboard, LogOut, ReceiptText, Tags, Wallet } from 'lucide-react'
import { Navigate, NavLink, Outlet } from 'react-router'
import { cx } from '@/lib/cx'
import { useLogout, useMe } from '@/features/auth/api'
import { useIsLoggedIn } from '@/lib/session'

const links = [
  { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/gastos', label: 'Gastos', icon: ReceiptText, end: false },
  { to: '/categorias', label: 'Categorías', icon: Tags, end: false },
]

/** Layout of every logged-in page. Without a session it sends you to the login page. */
export function AppLayout() {
  const loggedIn = useIsLoggedIn()
  const { data: user } = useMe()
  const logout = useLogout()

  if (!loggedIn) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-dvh flex-col">
      {user?.is_demo && (
        <div className="bg-accent-soft text-accent-strong">
          <p className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center text-sm">
            <FlaskConical className="size-4 shrink-0" aria-hidden />
            Estás en una cuenta demo: los datos son de ejemplo y se borrarán en 24 horas. Cámbialos sin miedo.
          </p>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-accent">
            <Wallet className="size-6" aria-hidden />
            <span className="hidden sm:inline">Gastos</span>
          </NavLink>

          <nav aria-label="Principal" className="flex flex-1 gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-accent-soft text-accent-strong' : 'text-muted hover:bg-surface-2 hover:text-text',
                  )
                }
              >
                <Icon className="size-4" aria-hidden />
                <span className="hidden sm:inline">{label}</span>
                <span className="sr-only sm:hidden">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-muted md:inline">
              {user?.is_demo ? 'Usuario demo' : user?.first_name || user?.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-text"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Salir</span>
              <span className="sr-only sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        Hecho por Alejandro Córdoba con React y Django · Código en GitHub:{' '}
        <a className="text-accent hover:underline" href="https://github.com/SEDEBE/expense-tracker-web" target="_blank" rel="noreferrer">
          web
        </a>{' '}
        y{' '}
        <a className="text-accent hover:underline" href="https://github.com/SEDEBE/expense-tracker-api" target="_blank" rel="noreferrer">
          API
        </a>
      </footer>
    </div>
  )
}
