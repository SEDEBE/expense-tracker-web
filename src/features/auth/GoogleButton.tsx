import { useEffect, useRef } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCRIPT_URL = 'https://accounts.google.com/gsi/client'

// The few parts of Google Identity Services used here.
interface GoogleIdentity {
  initialize(options: { client_id: string; callback: (response: { credential: string }) => void }): void
  renderButton(parent: HTMLElement, options: Record<string, string | number>): void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } }
  }
}

let scriptPromise: Promise<void> | null = null

function loadScript() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('No se ha podido cargar el botón de Google'))
    }
    document.head.append(script)
  })
  return scriptPromise
}

interface GoogleButtonProps {
  onCredential: (credential: string) => void
  text?: 'continue_with' | 'signup_with' | 'signin_with'
}

/** Google's own "Continuar con Google" button. Renders nothing until a client ID is configured. */
export function GoogleButton(props: GoogleButtonProps) {
  return CLIENT_ID ? <RenderedButton clientId={CLIENT_ID} {...props} /> : null
}

function RenderedButton({
  clientId,
  onCredential,
  text = 'continue_with',
}: GoogleButtonProps & { clientId: string }) {
  const container = useRef<HTMLDivElement>(null)
  const callback = useRef(onCredential)
  useEffect(() => {
    callback.current = onCredential
  })

  useEffect(() => {
    let cancelled = false
    loadScript()
      .then(() => {
        const google = window.google?.accounts.id
        if (cancelled || !google || !container.current) return
        google.initialize({ client_id: clientId, callback: (r) => callback.current(r.credential) })
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
        google.renderButton(container.current, {
          type: 'standard',
          theme: dark ? 'filled_black' : 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          locale: 'es',
          width: Math.min(container.current.offsetWidth, 400),
        })
      })
      .catch(() => {
        // Blocked by an extension or offline: the email form still works.
      })
    return () => {
      cancelled = true
    }
  }, [clientId, text])

  return <div ref={container} className="flex min-h-10 justify-center" />
}
