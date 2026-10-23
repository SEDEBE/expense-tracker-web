import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, server } from '@/test/server'
import { renderApp } from '@/test/renderApp'

describe('categories page', () => {
  it('creates a category', async () => {
    let name: string | undefined
    server.use(
      http.post(`${API}/categories/`, async ({ request }) => {
        name = ((await request.json()) as { name: string }).name
        return HttpResponse.json({ id: 4, name, monthly_budget: null, created_at: '' }, { status: 201 })
      }),
    )
    const { user } = renderApp('/categorias')

    await user.type(await screen.findByLabelText('Nombre de la nueva categoría'), '  Mascotas ')
    await user.click(screen.getByRole('button', { name: /añadir/i }))

    await waitFor(() => expect(name).toBe('Mascotas'))
  })

  it('shows the API message for a duplicated name', async () => {
    server.use(
      http.post(`${API}/categories/`, () =>
        HttpResponse.json({ name: ['Ya tienes una categoría con este nombre.'] }, { status: 400 }),
      ),
    )
    const { user } = renderApp('/categorias')

    await user.type(await screen.findByLabelText('Nombre de la nueva categoría'), 'Vivienda')
    await user.click(screen.getByRole('button', { name: /añadir/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya tienes una categoría con este nombre.')
  })

  it('renames a category', async () => {
    let body: unknown
    server.use(
      http.patch(`${API}/categories/2/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 2, name: 'Casa', monthly_budget: '600.00', created_at: '' })
      }),
    )
    const { user } = renderApp('/categorias')

    await user.click(await screen.findByRole('button', { name: 'Editar Vivienda' }))
    const input = screen.getByLabelText('Nuevo nombre de Vivienda')
    await user.clear(input)
    await user.type(input, 'Casa{Enter}')

    await waitFor(() => expect(body).toEqual({ name: 'Casa' }))
  })

  it('sets a monthly budget, accepting a decimal comma', async () => {
    let body: unknown
    server.use(
      http.patch(`${API}/categories/3/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 3, name: 'Ocio', monthly_budget: '120.50', created_at: '' })
      }),
    )
    const { user } = renderApp('/categorias')

    await user.click(await screen.findByRole('button', { name: 'Editar Ocio' }))
    await user.type(screen.getByLabelText('Presupuesto mensual de Ocio'), '120,5{Enter}')

    await waitFor(() => expect(body).toEqual({ monthly_budget: '120.5' }))
  })

  it('removes a budget when the field is emptied', async () => {
    let body: unknown
    server.use(
      http.patch(`${API}/categories/2/`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 2, name: 'Vivienda', monthly_budget: null, created_at: '' })
      }),
    )
    const { user } = renderApp('/categorias')

    await user.click(await screen.findByRole('button', { name: 'Editar Vivienda' }))
    await user.clear(screen.getByLabelText('Presupuesto mensual de Vivienda'))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(body).toEqual({ monthly_budget: null }))
  })

  it('rejects an invalid budget without calling the API', async () => {
    const { user } = renderApp('/categorias')

    await user.click(await screen.findByRole('button', { name: 'Editar Ocio' }))
    await user.type(screen.getByLabelText('Presupuesto mensual de Ocio'), 'mucho{Enter}')

    expect(await screen.findByText('Introduce un importe como 12,50')).toBeInTheDocument()
  })
})
