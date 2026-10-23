import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Mark } from '@/components/Mark'
import { useDemoLogin } from './api'

/**
 * /demo creates a demo account and opens its dashboard straight away, so a link from the
 * portfolio lands on the app with data in one click.
 */
export default function DemoStartPage() {
  const demo = useDemoLogin()
  // React runs effects twice in development; one visit must create one account.
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    demo.mutate()
  }, [demo])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <Mark className="size-8" />
      {demo.isError ? (
        <>
          <p className="text-base font-medium">No se ha podido crear la cuenta demo.</p>
          <p className="max-w-sm text-muted">{demo.error.message}</p>
          <Link to="/login" className="font-medium underline underline-offset-2">
            Ir al inicio de sesión
          </Link>
        </>
      ) : (
        <p className="text-muted" role="status">
          Preparando tu cuenta demo con 6 meses de gastos…
        </p>
      )}
    </main>
  )
}
