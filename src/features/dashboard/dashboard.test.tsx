import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'
import { API, server } from '@/test/server'

describe('dashboard', () => {
  it('shows the month total and the breakdown by category', async () => {
    renderApp('/')

    const card = (await screen.findByText(/^Gastado/)).closest('section')!
    await waitFor(() => expect(card).toHaveTextContent(/692,30/))
    const breakdown = screen.getByRole('heading', { name: 'Por categoría' }).closest('section')!
    const links = within(breakdown).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      expect.stringContaining('Vivienda'),
      expect.stringContaining('Supermercado'),
    ])
  })

  it('links each category to its expenses', async () => {
    renderApp('/?mes=2026-09')

    const link = await screen.findByRole('link', { name: /vivienda/i })
    expect(link).toHaveAttribute('href', '/gastos?mes=2026-09&categoria=2')
  })

  it('lists the latest expenses', async () => {
    renderApp('/')

    expect(await screen.findByText('Alquiler')).toBeInTheDocument()
    expect(screen.getByText('Mercadona')).toBeInTheDocument()
  })

  it('emails the summary of the month on request', async () => {
    const user = userEvent.setup()
    let asked: unknown
    server.use(
      http.post(`${API}/expenses/summary/email/`, async ({ request }) => {
        asked = await request.json()
        return HttpResponse.json({ detail: 'Te estamos enviando el resumen a ana@example.com.' }, { status: 202 })
      }),
    )
    renderApp('/?mes=2026-09')

    const button = await screen.findByRole('button', { name: 'Enviar por email' })
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)

    expect(await screen.findByRole('status')).toHaveTextContent('Te estamos enviando el resumen a ana@example.com.')
    expect(asked).toEqual({ month: '2026-09' })
  })

  it('shows why the summary could not be sent', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/expenses/summary/email/`, () =>
        HttpResponse.json({ detail: 'Las cuentas demo tienen un email inventado.' }, { status: 403 }),
      ),
    )
    renderApp('/')

    const button = await screen.findByRole('button', { name: 'Enviar por email' })
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)

    expect(await screen.findByRole('status')).toHaveTextContent('Las cuentas demo tienen un email inventado.')
  })
})
