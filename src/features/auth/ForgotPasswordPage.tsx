import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Alert, Button, Field, Input } from '@/components/ui'
import { AuthLayout } from './AuthLayout'
import { authApi } from './api'

const schema = z.object({ email: z.email('Introduce un email válido') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const reset = useMutation({ mutationFn: authApi.passwordReset })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <AuthLayout>
      <h1 className="text-2xl font-medium tracking-tight">Recuperar la contraseña</h1>
      {reset.isSuccess ? (
        <div className="mt-4 space-y-6" role="status">
          <p className="text-muted">{reset.data.detail} Revisa también la carpeta de spam. El enlace caduca en 2 horas.</p>
          <Link to="/login" className="font-medium underline-offset-2 hover:underline">
            Volver a entrar
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">Te enviaremos un enlace para elegir una contraseña nueva.</p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit(({ email }) => reset.mutate(email))} noValidate>
            {reset.error && <Alert>{reset.error.message}</Alert>}
            <Field label="Email" error={errors.email?.message}>
              {(props) => <Input type="email" autoComplete="email" spellCheck={false} {...props} {...register('email')} />}
            </Field>
            <Button type="submit" className="w-full" loading={reset.isPending}>
              Enviar el enlace
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            ¿Te has acordado?{' '}
            <Link to="/login" className="font-medium text-text underline-offset-2 hover:underline">
              Entra
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
