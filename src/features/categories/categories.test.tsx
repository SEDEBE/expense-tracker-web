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
        return HttpResponse.json({ id: 3, name, created_at: '' }, { status: 201 })
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
        return HttpResponse.json({ id: 2, name: 'Casa', created_at: '' })
      }),
    )
    const { user } = renderApp('/categorias')

    await user.click(await screen.findByRole('button', { name: 'Renombrar Vivienda' }))
    const input = screen.getByLabelText('Nuevo nombre de Vivienda')
    await user.clear(input)
    await user.type(input, 'Casa{Enter}')

    await waitFor(() => expect(body).toEqual({ name: 'Casa' }))
  })
})
