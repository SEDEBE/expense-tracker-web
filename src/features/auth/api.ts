import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { session, useIsLoggedIn } from '@/lib/session'
import type { Tokens, User } from '@/lib/types'

export interface Credentials {
  email: string
  password: string
}

export interface Registration extends Credentials {
  first_name: string
}

export const authApi = {
  login: (credentials: Credentials) =>
    api<Tokens>('/auth/token/', { method: 'POST', body: credentials, auth: false }),
  register: (data: Registration) =>
    api<User>('/auth/register/', {
      method: 'POST',
      body: { ...data, language: 'es' },
      auth: false,
    }),
  demo: () => api<Tokens>('/auth/demo/', { method: 'POST', auth: false }),
  google: (credential: string) =>
    api<Tokens>('/auth/google/', { method: 'POST', body: { credential }, auth: false }),
  me: () => api<User>('/auth/me/'),
}

export function useMe() {
  const loggedIn = useIsLoggedIn()
  return useQuery({ queryKey: ['me'], queryFn: authApi.me, enabled: loggedIn })
}

function useStartSession() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return (tokens: Tokens) => {
    queryClient.clear()
    session.set(tokens)
    navigate('/', { replace: true })
  }
}

export function useLogin() {
  const start = useStartSession()
  return useMutation({ mutationFn: authApi.login, onSuccess: start })
}

export function useDemoLogin() {
  const start = useStartSession()
  return useMutation({ mutationFn: authApi.demo, onSuccess: start })
}

export function useGoogleLogin() {
  const start = useStartSession()
  return useMutation({ mutationFn: authApi.google, onSuccess: start })
}

export function useRegister() {
  const start = useStartSession()
  return useMutation({
    // Registering doesn't return tokens, so log in right after with the same credentials.
    mutationFn: async (data: Registration) => {
      await authApi.register(data)
      return authApi.login({ email: data.email, password: data.password })
    },
    onSuccess: start,
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return () => {
    session.clear()
    queryClient.clear()
    navigate('/login', { replace: true })
  }
}
