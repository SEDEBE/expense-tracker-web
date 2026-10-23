import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'

describe('dashboard', () => {
  it('shows the month total and the breakdown by category', async () => {
    renderApp('/')

    const tile = (await screen.findByText('Total del mes')).closest('section')!
    expect(tile).toHaveTextContent(/692,30/)
    const breakdown = screen.getByRole('heading', { name: 'Por categoría' }).parentElement!
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
})
