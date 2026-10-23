import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/renderApp'

const robots = () => document.head.querySelector('meta[name="robots"]')?.getAttribute('content')
const canonical = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')

describe('page meta', () => {
  it('lets search engines index the public login page', async () => {
    renderApp('/login', { loggedIn: false })

    await screen.findByRole('heading', { name: 'Entrar' })
    await waitFor(() => expect(document.title).toBe('Entrar · Gastos'))
    expect(robots()).toMatch(/^index, follow/)
    expect(canonical()).toBe('https://gastos.alejandrocordoba.es/login')
  })

  it('keeps private pages out of search results', async () => {
    renderApp('/fijos')

    await screen.findByRole('heading', { name: 'Gastos fijos' })
    await waitFor(() => expect(document.title).toBe('Gastos fijos · Gastos'))
    expect(robots()).toBe('noindex, nofollow')
  })
})
