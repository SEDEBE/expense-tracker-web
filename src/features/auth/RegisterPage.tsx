import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Alert, Button, Field, Input } from '@/components/ui'
import { ApiError } from '@/lib/api'
import { AuthLayout } from './AuthLayout'
import { useRegister } from './api'

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
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { first_name: '' } })

  const onSubmit = handleSubmit((values) =>
    registration.mutate(values, {
      onError: (error) => {
        // Show the API's validation messages (already in Spanish) next to each field.
        if (error instanceof ApiError) {
          for (const field of fields) {
            const message = error.fieldErrors[field]
            if (message) setError(field, { message })
          }
        }
      },
    }),
  )

  // Field errors are shown under each field; anything else goes in the alert at the top.
  const apiError = registration.error
  const fieldErrorsFromApi =
    apiError instanceof ApiError && fields.some((field) => field in apiError.fieldErrors)

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold">Crea tu cuenta</h2>
      <p className="mt-1 text-sm text-muted">Empieza a registrar tus gastos en un minuto.</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        {registration.error && !fieldErrorsFromApi && <Alert>{registration.error.message}</Alert>}
        <Field label="Nombre (opcional)" error={errors.first_name?.message}>
          {(props) => <Input autoComplete="given-name" {...props} {...register('first_name')} />}
        </Field>
        <Field label="Email" error={errors.email?.message}>
          {(props) => <Input type="email" autoComplete="email" {...props} {...register('email')} />}
        </Field>
        <Field label="Contraseña" error={errors.password?.message} hint="Mínimo 8 caracteres.">
          {(props) => (
            <Input type="password" autoComplete="new-password" {...props} {...register('password')} />
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
