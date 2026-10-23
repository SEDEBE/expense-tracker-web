import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Alert, Button, Field, Input, PasswordInput } from '@/components/ui'
import { AuthLayout } from './AuthLayout'
import { useDemoLogin, useGoogleLogin, useLogin } from './api'
import { GoogleButton } from './GoogleButton'

const schema = z.object({
  email: z.email('Introduce un email válido'),
  password: z.string().min(1, 'Introduce tu contraseña'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const login = useLogin()
  const demo = useDemoLogin()
  const google = useGoogleLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const error = login.error ?? demo.error ?? google.error

  return (
    <AuthLayout>
      <h1 className="text-2xl font-medium tracking-tight">Entrar</h1>
      <p className="mt-1 text-sm text-muted">
        ¿Solo quieres echar un vistazo? Entra con una cuenta de prueba.
      </p>

      <Button
        size="lg"
        className="mt-6 w-full"
        onClick={() => demo.mutate()}
        loading={demo.isPending}
      >
        Entrar como demo
      </Button>
      <p className="mt-2 text-center text-xs text-muted">
        Cuenta solo para ti, con 6 meses de gastos de ejemplo. Se borra a las 24 horas.
      </p>

      <div className="my-8 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />o entra con tu cuenta
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit((values) => login.mutate(values))} noValidate>
        {error && <Alert>{error.message}</Alert>}
        <Field label="Email" error={errors.email?.message}>
          {(props) => <Input type="email" autoComplete="email" spellCheck={false} {...props} {...register('email')} />}
        </Field>
        <Field label="Contraseña" error={errors.password?.message}>
          {(props) => (
            <PasswordInput autoComplete="current-password" {...props} {...register('password')} />
          )}
        </Field>
        <Button type="submit" variant="secondary" className="w-full" loading={login.isPending}>
          Entrar
        </Button>
      </form>

      <div className="mt-3">
        <GoogleButton onCredential={(credential) => google.mutate(credential)} />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-medium text-text underline-offset-2 hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  )
}
