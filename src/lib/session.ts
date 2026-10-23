import { useSyncExternalStore } from 'react'
import type { Tokens } from './types'

// The JWT pair lives in localStorage so a reload keeps you logged in. The access token is
// short-lived (15 min) and the API client renews it with the refresh token when it expires.
const KEY = 'expense-tracker.tokens'

type Listener = () => void
const listeners = new Set<Listener>()

function read(): Tokens | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Tokens) : null
  } catch {
    return null
  }
}

let current: Tokens | null = read()

function emit() {
  for (const listener of listeners) listener()
}

export const session = {
  get: () => current,
  set(tokens: Tokens) {
    current = tokens
    try {
      localStorage.setItem(KEY, JSON.stringify(tokens))
    } catch {
      // Private mode or blocked storage: the session still works until the tab closes.
    }
    emit()
  },
  clear() {
    current = null
    try {
      localStorage.removeItem(KEY)
    } catch {
      // Nothing to remove.
    }
    emit()
  },
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

/** True while there is a token pair; components re-render when you log in or out. */
export function useIsLoggedIn() {
  return useSyncExternalStore(session.subscribe, () => session.get() !== null)
}
