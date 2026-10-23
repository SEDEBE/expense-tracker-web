// This module builds the route table; it is not a component that fast refresh reloads.
/* oxlint-disable react/only-export-components */
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { Spinner } from '@/components/ui'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { useIsLoggedIn } from '@/lib/session'
import { AppLayout } from './AppLayout'

// Each page is its own chunk: the login screen loads without the dashboard code.
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const ExpensesPage = lazy(() => import('@/features/expenses/ExpensesPage'))
const CategoriesPage = lazy(() => import('@/features/categories/CategoriesPage'))
const DemoStartPage = lazy(() => import('@/features/auth/DemoStartPage'))

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>
}

function GuestOnly({ children }: { children: ReactNode }) {
  return useIsLoggedIn() ? <Navigate to="/" replace /> : children
}

export const routes: RouteObject[] = [
  { path: '/login', element: <GuestOnly><LoginPage /></GuestOnly> },
  { path: '/registro', element: <GuestOnly><RegisterPage /></GuestOnly> },
  { path: '/demo', element: <Page><DemoStartPage /></Page> },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Page><DashboardPage /></Page> },
      { path: 'gastos', element: <Page><ExpensesPage /></Page> },
      { path: 'categorias', element: <Page><CategoriesPage /></Page> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]

export const router = createBrowserRouter(routes)
