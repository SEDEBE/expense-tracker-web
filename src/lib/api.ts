import { session } from './session'
import type { Tokens } from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

/** An HTTP error from the API, with DRF's error body (`{"field": ["message"]}` or `{"detail": ...}`). */
export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    super(firstMessage(data) ?? `Error ${status}`)
    this.status = status
    this.data = data
  }

  /** Errors per field, as DRF returns them for a 400. */
  get fieldErrors(): Record<string, string> {
    if (!this.data || typeof this.data !== 'object') return {}
    const errors: Record<string, string> = {}
    for (const [field, value] of Object.entries(this.data)) {
      const message = Array.isArray(value) ? value[0] : value
      if (typeof message === 'string') errors[field] = message
    }
    return errors
  }
}

function firstMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const values = Object.values(data)
  const first = values[0]
  if (typeof first === 'string') return first
  if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
  return undefined
}

type Query = Record<string, string | number | boolean | null | undefined>

interface RequestOptions {
  method?: string
  body?: unknown
  query?: Query
  /** Send the access token and renew it on a 401. False for login and register. */
  auth?: boolean
}

function buildUrl(path: string, query?: Query) {
  const url = `${BASE_URL}${path}`
  if (!query) return url
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const search = params.toString()
  return search ? `${url}?${search}` : url
}

async function send(path: string, options: RequestOptions, access?: string) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    // The API translates its error messages; the whole app is in Spanish for now.
    'Accept-Language': 'es',
  }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (access) headers.Authorization = `Bearer ${access}`

  return fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
}

// Several requests can fail with 401 at the same time; they all wait for a single refresh.
let refreshing: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  refreshing ??= (async () => {
    const refresh = session.get()?.refresh
    if (!refresh) return null
    const response = await send('/auth/token/refresh/', { method: 'POST', body: { refresh } })
    if (!response.ok) return null
    const data = (await response.json()) as Pick<Tokens, 'access'> & Partial<Tokens>
    session.set({ access: data.access, refresh: data.refresh ?? refresh })
    return data.access
  })().finally(() => {
    refreshing = null
  })
  return refreshing
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const auth = options.auth ?? true
  let response = await send(path, options, auth ? session.get()?.access : undefined)

  if (response.status === 401 && auth) {
    const access = await refreshAccessToken()
    if (!access) {
      // The refresh token expired too (or the demo account was deleted): back to the login page.
      session.clear()
      throw new ApiError(401, { detail: 'Tu sesión ha caducado. Vuelve a entrar.' })
    }
    response = await send(path, options, access)
  }

  if (response.status === 204) return undefined as T
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data)
  return data as T
}
