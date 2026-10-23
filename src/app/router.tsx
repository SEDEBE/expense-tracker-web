// This module builds the route table; it is not a component that fast refresh reloads.
/* oxlint-disable react/only-export-components */
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { Spinner } from '@/components/ui'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { useIsLoggedIn } from '@/lib/session'
import { AppLayout } from './AppLayout'
import { type PageHandle, PageMeta } from './PageMeta'

// Each page is its own chunk: the login screen loads without the dashboard code.
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const ExpensesPage = lazy(() => import('@/features/expenses/ExpensesPage'))
const CategoriesPage = lazy(() => import('@/features/categories/CategoriesPage'))
const RecurringPage = lazy(() => import('@/features/recurring/RecurringPage'))
const DemoStartPage = lazy(() => import('@/features/auth/DemoStartPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage'))

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>
}

function GuestOnly({ children }: { children: ReactNode }) {
  return useIsLoggedIn() ? <Navigate to="/" replace /> : children
}

const page = (title: string, index = false): PageHandle => ({ title, index })

export const routes: RouteObject[] = [
  {
    element: <PageMeta />,
    children: [
      { path: '/login', handle: page('Entrar', true), element: <GuestOnly><LoginPage /></GuestOnly> },
      { path: '/registro', handle: page('Crear cuenta', true), element: <GuestOnly><RegisterPage /></GuestOnly> },
      { path: '/demo', handle: page('Probar la demo'), element: <Page><DemoStartPage /></Page> },
      { path: '/recuperar', handle: page('Recuperar contraseña'), element: <GuestOnly><Page><ForgotPasswordPage /></Page></GuestOnly> },
      { path: '/restablecer', handle: page('Nueva contraseña'), element: <GuestOnly><Page><ResetPasswordPage /></Page></GuestOnly> },
      {
        element: <AppLayout />,
        children: [
          { index: true, handle: page('Resumen'), element: <Page><DashboardPage /></Page> },
          { path: 'gastos', handle: page('Gastos'), element: <Page><ExpensesPage /></Page> },
          { path: 'fijos', handle: page('Gastos fijos'), element: <Page><RecurringPage /></Page> },
          { path: 'categorias', handle: page('Categorías'), element: <Page><CategoriesPage /></Page> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
