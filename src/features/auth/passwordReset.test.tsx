import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, server } from '@/test/server'
import { renderApp } from '@/test/renderApp'

describe('password reset', () => {
  it('links to it from the login page', async () => {
    const { user } = renderApp('/login', { loggedIn: false })

    await user.click(await screen.findByRole('link', { name: '¿Has olvidado tu contraseña?' }))

    expect(await screen.findByRole('heading', { name: 'Recuperar la contraseña' })).toBeInTheDocument()
  })

  it('asks the API to email a link', async () => {
    let body: unknown
    server.use(
      http.post(`${API}/auth/password-reset/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ detail: 'Si hay una cuenta con ese email, le hemos enviado un enlace.' }, { status: 202 })
      }),
    )
    const { user } = renderApp('/recuperar', { loggedIn: false })

    await user.type(await screen.findByLabelText('Email'), 'ana@example.com') // taste-skill-ignore: reserved test domain
    await user.click(screen.getByRole('button', { name: 'Enviar el enlace' }))

    expect(await screen.findByRole('status')).toHaveTextContent('le hemos enviado un enlace')
    expect(body).toEqual({ email: 'ana@example.com' }) // taste-skill-ignore: reserved test domain
  })

  it('sets the new password from the email link', async () => {
    let body: unknown
    server.use(
      http.post(`${API}/auth/password-reset/confirm/`, async ({ request }) => {
        body = await request.json()
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { user } = renderApp('/restablecer?uid=MQ&token=abc-123', { loggedIn: false })

    await user.type(await screen.findByLabelText('Contraseña nueva'), 'Otra-clave-42')
    await user.click(screen.getByRole('button', { name: 'Guardar la contraseña' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Contraseña cambiada')
    expect(body).toEqual({ uid: 'MQ', token: 'abc-123', password: 'Otra-clave-42' })
  })

  it('explains an expired link', async () => {
    server.use(
      http.post(`${API}/auth/password-reset/confirm/`, () =>
        HttpResponse.json({ detail: 'Este enlace no es válido o ha caducado. Pide uno nuevo.' }, { status: 400 }),
      ),
    )
    const { user } = renderApp('/restablecer?uid=MQ&token=old', { loggedIn: false })

    await user.type(await screen.findByLabelText('Contraseña nueva'), 'Otra-clave-42')
    await user.click(screen.getByRole('button', { name: 'Guardar la contraseña' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('ha caducado')
  })
})
