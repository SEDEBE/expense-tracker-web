import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'
import { API, server } from '@/test/server'

describe('recurring expenses page', () => {
  it('lists them with what they add up to each month', async () => {
    renderApp('/fijos')

    const rent = (await screen.findByText('Alquiler')).closest('button')!
    expect(rent).toHaveTextContent(/Vivienda · día 1 de cada mes/)
    expect(rent).toHaveTextContent(/Próximo: 1 nov/)
    expect(screen.getByText('Netflix').closest('button')).toHaveTextContent('En pausa')
    // Paused ones don't count towards the monthly total.
    expect(screen.getByText(/al mes/)).toHaveTextContent(/^650,00\s€ al mes/)
  })

  it('creates one', async () => {
    let body: unknown
    server.use(
      http.post(`${API}/recurring/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 9, ...(body as object), next_date: '2026-11-02' }, { status: 201 })
      }),
    )
    const { user } = renderApp('/fijos')

    await user.click(await screen.findByRole('button', { name: 'Nuevo gasto fijo' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText('Importe (€)'), '34,9')
    await user.selectOptions(dialog.getByLabelText('Día de cada mes'), '2')
    await user.type(dialog.getByLabelText('Descripción'), 'Gimnasio')
    await user.click(dialog.getByRole('button', { name: 'Añadir gasto fijo' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(body).toEqual({ amount: '34.9', description: 'Gimnasio', category: null, day_of_month: 2, active: true })
  })

  it('warns that late days fall on the last day of short months', async () => {
    const { user } = renderApp('/fijos')

    await user.click(await screen.findByRole('button', { name: 'Nuevo gasto fijo' }))
    await user.selectOptions(screen.getByLabelText('Día de cada mes'), '31')

    expect(screen.getByText('En los meses más cortos, el último día.')).toBeInTheDocument()
  })

  it('pauses one', async () => {
    let body: unknown
    server.use(
      http.patch(`${API}/recurring/7/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 7, ...(body as object) })
      }),
    )
    const { user } = renderApp('/fijos')

    await user.click(await screen.findByText('Alquiler'))
    await user.click(screen.getByLabelText(/Apuntarlo cada mes/))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(body).toMatchObject({ active: false, description: 'Alquiler', day_of_month: 1 }))
  })
})
