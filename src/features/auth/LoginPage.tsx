import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Alert, Button, Field, Input } from '@/components/ui'
import { AuthLayout } from './AuthLayout'
import { useDemoLogin, useLogin } from './api'

const schema = z.object({
  email: z.email('Introduce un email válido'),
  password: z.string().min(1, 'Introduce tu contraseña'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const login = useLogin()
  const demo = useDemoLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const error = login.error ?? demo.error

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold">Bienvenido</h2>
      <p className="mt-1 text-sm text-muted">
        Prueba la aplicación con datos de ejemplo, sin registrarte.
      </p>

      <Button
        size="lg"
        className="mt-6 w-full"
        onClick={() => demo.mutate()}
        loading={demo.isPending}
      >
        <Sparkles className="size-5" aria-hidden />
        Entrar como demo
      </Button>
      <p className="mt-2 text-center text-xs text-muted">
        Se crea una cuenta solo para ti, con 6 meses de gastos. Se borra en 24 horas.
      </p>

      <div className="my-8 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />o entra con tu cuenta
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit((values) => login.mutate(values))} noValidate>
        {error && <Alert>{error.message}</Alert>}
        <Field label="Email" error={errors.email?.message}>
          {(props) => <Input type="email" autoComplete="email" {...props} {...register('email')} />}
        </Field>
        <Field label="Contraseña" error={errors.password?.message}>
          {(props) => (
            <Input
              type="password"
              autoComplete="current-password"
              {...props}
              {...register('password')}
            />
          )}
        </Field>
        <Button type="submit" variant="secondary" className="w-full" loading={login.isPending}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-medium text-accent hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  )
}
