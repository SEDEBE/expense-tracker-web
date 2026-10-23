import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { authApi } from '@/features/auth/api'
import { API, server, tokens } from '@/test/server'
import { renderApp } from '@/test/renderApp'

describe('login form extras', () => {
  it('shows and hides the password', async () => {
    const { user } = renderApp('/login', { loggedIn: false })
    const password = await screen.findByLabelText('Contraseña')
    await user.type(password, 'S3cure-pass!')

    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(password).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('hides the Google button when no client ID is configured', async () => {
    renderApp('/login', { loggedIn: false })

    await screen.findByRole('button', { name: /entrar como demo/i })
    expect(document.querySelector('script[src*="accounts.google.com"]')).toBeNull()
  })

  it('exchanges the Google credential for the API tokens', async () => {
    let body: unknown
    server.use(
      http.post(`${API}/auth/google/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(tokens)
      }),
    )

    await expect(authApi.google('google-id-token')).resolves.toEqual(tokens)
    expect(body).toEqual({ credential: 'google-id-token' })
  })
})
