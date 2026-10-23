import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, server } from '@/test/server'
import { renderApp } from '@/test/renderApp'

describe('expenses page', () => {
  it('creates an expense, accepting a decimal comma', async () => {
    let body: unknown
    server.use(
      http.post(`${API}/expenses/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 99, ...(body as object) }, { status: 201 })
      }),
    )
    const { user } = renderApp('/gastos')

    await user.click(await screen.findByRole('button', { name: /nuevo gasto/i }))
    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText('Importe (€)'), '12,5')
    await user.type(dialog.getByLabelText('Descripción'), 'Cine')
    await user.selectOptions(dialog.getByLabelText('Categoría'), 'Supermercado')
    await user.click(dialog.getByRole('button', { name: 'Añadir gasto' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(body).toMatchObject({ amount: '12.5', description: 'Cine', category: 1 })
  })

  it('rejects an invalid amount without calling the API', async () => {
    const { user } = renderApp('/gastos')

    await user.click(await screen.findByRole('button', { name: /nuevo gasto/i }))
    await user.type(screen.getByLabelText('Importe (€)'), 'doce')
    await user.click(screen.getByRole('button', { name: 'Añadir gasto' }))

    expect(await screen.findByText('Introduce un importe como 12,50')).toBeInTheDocument()
  })

  it('asks before deleting an expense', async () => {
    let deleted = false
    server.use(
      http.delete(`${API}/expenses/10/`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { user } = renderApp('/gastos')

    await user.click(await screen.findByRole('button', { name: 'Borrar Alquiler' }))
    expect(screen.getByRole('dialog', { name: '¿Borrar este gasto?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(deleted).toBe(true))
  })

  it('filters by the category in the URL', async () => {
    let query: URLSearchParams | undefined
    server.use(
      http.get(`${API}/expenses/`, ({ request }) => {
        query = new URL(request.url).searchParams
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      }),
    )
    renderApp('/gastos?mes=2026-09&categoria=ninguna')

    expect(await screen.findByText('No hay gastos con estos filtros')).toBeInTheDocument()
    expect(query?.get('uncategorized')).toBe('true')
    expect(query?.get('date_from')).toBe('2026-09-01')
    expect(query?.get('date_to')).toBe('2026-09-30')
  })
})
