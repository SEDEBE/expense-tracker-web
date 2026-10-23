import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, server } from '@/test/server'
import { renderApp } from '@/test/renderApp'

describe('authentication', () => {
  it('sends visitors without a session to the login page', async () => {
    renderApp('/', { loggedIn: false })

    expect(await screen.findByRole('button', { name: /entrar como demo/i })).toBeInTheDocument()
  })

  it('opens the dashboard of a new demo account', async () => {
    const { user } = renderApp('/login', { loggedIn: false })

    await user.click(await screen.findByRole('button', { name: /entrar como demo/i }))

    expect(await screen.findByText('Total del mes')).toBeInTheDocument()
    expect(screen.getByText(/estás en una cuenta demo/i)).toBeInTheDocument()
  })

  it('shows the API error when the credentials are wrong', async () => {
    server.use(
      http.post(`${API}/auth/token/`, () =>
        HttpResponse.json(
          { detail: 'No se encontró una cuenta activa con las credenciales dadas' },
          { status: 401 },
        ),
      ),
    )
    const { user } = renderApp('/login', { loggedIn: false })

    await user.type(await screen.findByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se encontró una cuenta activa/i)
  })

  it('validates the form before calling the API', async () => {
    const { user } = renderApp('/login', { loggedIn: false })

    await user.click(await screen.findByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Introduce un email válido')).toBeInTheDocument()
    expect(screen.getByText('Introduce tu contraseña')).toBeInTheDocument()
  })

  it('logs out', async () => {
    const { user } = renderApp('/')

    await user.click(await screen.findByRole('button', { name: /salir/i }))

    expect(await screen.findByRole('button', { name: /entrar como demo/i })).toBeInTheDocument()
  })
})
