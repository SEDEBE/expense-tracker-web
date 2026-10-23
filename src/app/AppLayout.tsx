import { LayoutDashboard, LogOut, Menu, ReceiptText, Tags, X } from 'lucide-react'
import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router'
import { Mark } from '@/components/Mark'
import { useLogout, useMe } from '@/features/auth/api'
import { cx } from '@/lib/cx'
import { useIsLoggedIn } from '@/lib/session'

const links = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/gastos', label: 'Gastos', icon: ReceiptText, end: false },
  { to: '/categorias', label: 'Categorías', icon: Tags, end: false },
]

// Open plane: the sidebar sits on the page ground, the cards sit on the same ground beside it.
export function AppLayout() {
  const loggedIn = useIsLoggedIn()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!loggedIn) return <Navigate to="/login" replace />

  const current = links.find((link) => (link.end ? location.pathname === link.to : location.pathname.startsWith(link.to)))

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>
      <aside className="sticky top-0 hidden h-dvh flex-col px-3 py-5 lg:flex">
        <Sidebar />
      </aside>

      <header className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-border bg-ground px-4 lg:hidden">
        <Mark className="size-6" />
        <span className="flex-1 font-medium">{current?.label ?? 'Gastos'}</span>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          className="flex size-10 items-center justify-center rounded-md text-muted hover:bg-active"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col overscroll-contain bg-ground px-3 py-4 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-md text-muted hover:bg-active"
          >
            <X className="size-5" aria-hidden />
          </button>
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </div>
      )}

      <main id="contenido" className="min-w-0 px-4 py-6 sm:px-6 lg:py-9 lg:pr-9 lg:pl-3">
        <div className="mx-auto max-w-[1180px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: user } = useMe()
  const logout = useLogout()
  const name = user?.is_demo ? 'Cuenta demo' : user?.first_name || user?.email || ''
  const initial = (user?.is_demo ? 'D' : name.charAt(0)).toUpperCase()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-2">
        <Mark />
        <span className="text-[15px] font-medium">Gastos</span>
      </div>
      {user?.is_demo && (
        <p className="mt-3 px-2 text-xs leading-relaxed text-muted">
          Datos de ejemplo. Esta cuenta se borra a las 24 horas: cambia lo que quieras.
        </p>
      )}

      <nav aria-label="Principal" className="mt-6 flex flex-col gap-0.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                'flex h-8 items-center gap-2.5 rounded-md px-2 text-sm',
                isActive ? 'bg-active text-text' : 'text-muted hover:text-text',
              )
            }
          >
            <Icon className="size-4" strokeWidth={1.5} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1 pt-6">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-active text-xs font-medium">
            {initial}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-sm text-muted hover:bg-active hover:text-text"
        >
          <LogOut className="size-4" strokeWidth={1.5} aria-hidden />
          Salir
        </button>
        <p className="px-2 pt-3 text-xs text-muted">
          Proyecto de{' '}
          <a className="text-text hover:underline" href="https://alejandrocordoba.es">
            Alejandro Córdoba
          </a>{' '}
          ·{' '}
          <a className="text-text hover:underline" href="https://github.com/SEDEBE/expense-tracker-web">
            código
          </a>
        </p>
      </div>
    </div>
  )
}
