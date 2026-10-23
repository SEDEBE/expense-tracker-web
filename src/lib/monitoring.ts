// Error tracking and visit statistics, both off unless their build-time variables are set.

/** Reports unhandled errors to Sentry. The SDK is its own chunk, downloaded only when enabled. */
export function startErrorTracking() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (!dsn) return
  void import('@sentry/react').then((Sentry) =>
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      // No IPs, cookies or emails in the reports.
      sendDefaultPii: false,
    }),
  )
}

/**
 * Counts visits with the self-hosted Umami: no cookies and no personal data, so no consent
 * banner is needed. It follows page changes inside the app on its own.
 */
export function startVisitStatistics() {
  const url = import.meta.env.VITE_UMAMI_URL as string | undefined
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined
  if (!url || !websiteId) return
  const script = document.createElement('script')
  script.defer = true
  script.src = `${url}/script.js`
  script.dataset.websiteId = websiteId
  document.head.append(script)
}
