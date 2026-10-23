import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Alert, Button, Field, Input, PasswordInput } from '@/components/ui'
import { ApiError } from '@/lib/api'
import { AuthLayout } from './AuthLayout'
import { useGoogleLogin, useRegister } from './api'
import { GoogleButton } from './GoogleButton'

const schema = z.object({
  first_name: z.string().trim().max(150),
  email: z.email('Introduce un email válido'),
  // The API runs Django's password validators too; this only catches the obvious case early.
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

type FormValues = z.infer<typeof schema>
const fields = ['first_name', 'email', 'password'] as const

export function RegisterPage() {
  const registration = useRegister()
  const google = useGoogleLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { first_name: '' } })

  const onSubmit = handleSubmit((values) =>
    registration.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiError) {
          for (const field of fields) {
            const message = error.fieldErrors[field]
            if (message) setError(field, { message })
          }
        }
      },
    }),
  )

  const apiError = registration.error
  const fieldErrorsFromApi =
    apiError instanceof ApiError && fields.some((field) => field in apiError.fieldErrors)

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold">Crear cuenta</h2>
      <p className="mt-1 text-sm text-muted">Solo necesitas un email y una contraseña.</p>

      <div className="mt-8">
        <GoogleButton text="signup_with" onCredential={(credential) => google.mutate(credential)} />
      </div>

      <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
        {google.error && <Alert>{google.error.message}</Alert>}
        {registration.error && !fieldErrorsFromApi && <Alert>{registration.error.message}</Alert>}
        <Field label="Nombre (opcional)" error={errors.first_name?.message}>
          {(props) => <Input autoComplete="given-name" {...props} {...register('first_name')} />}
        </Field>
        <Field label="Email" error={errors.email?.message}>
          {(props) => <Input type="email" autoComplete="email" {...props} {...register('email')} />}
        </Field>
        <Field label="Contraseña" error={errors.password?.message} hint="Mínimo 8 caracteres.">
          {(props) => (
            <PasswordInput autoComplete="new-password" {...props} {...register('password')} />
          )}
        </Field>
        <Button type="submit" className="w-full" loading={registration.isPending}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Entra
        </Link>
      </p>
    </AuthLayout>
  )
}
