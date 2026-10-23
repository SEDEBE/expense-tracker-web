import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Alert, Button, Field, PasswordInput } from '@/components/ui'
import { ApiError } from '@/lib/api'
import { AuthLayout } from './AuthLayout'
import { authApi } from './api'

const schema = z.object({ password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres') })
type FormValues = z.infer<typeof schema>

// Opened from the email link: /restablecer?uid=…&token=…
export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const uid = params.get('uid') ?? ''
  const token = params.get('token') ?? ''
  const confirm = useMutation({ mutationFn: authApi.passwordResetConfirm })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(({ password }) =>
    confirm.mutate(
      { uid, token, password },
      {
        onError: (error) => {
          const message = error instanceof ApiError ? error.fieldErrors.password : undefined
          if (message) setError('password', { message })
        },
      },
    ),
  )
  const linkError = confirm.error instanceof ApiError && !confirm.error.fieldErrors.password ? confirm.error.message : null

  return (
    <AuthLayout>
      <h1 className="text-2xl font-medium tracking-tight">Elige una contraseña nueva</h1>
      {!uid || !token ? (
        <div className="mt-4 space-y-6">
          <p className="text-muted">Este enlace está incompleto. Ábrelo de nuevo desde el email o pide otro.</p>
          <Link to="/recuperar" className="font-medium underline-offset-2 hover:underline">
            Pedir otro enlace
          </Link>
        </div>
      ) : confirm.isSuccess ? (
        <div className="mt-4 space-y-6" role="status">
          <p className="text-muted">Contraseña cambiada. Ya puedes entrar con ella.</p>
          <Link to="/login" className="font-medium underline-offset-2 hover:underline">
            Entrar
          </Link>
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
          {linkError && (
            <Alert>
              {linkError}{' '}
              <Link to="/recuperar" className="font-medium underline">
                Pedir otro enlace
              </Link>
            </Alert>
          )}
          <Field label="Contraseña nueva" error={errors.password?.message} hint="Mínimo 8 caracteres.">
            {(props) => <PasswordInput autoComplete="new-password" {...props} {...register('password')} />}
          </Field>
          <Button type="submit" className="w-full" loading={confirm.isPending}>
            Guardar la contraseña
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
