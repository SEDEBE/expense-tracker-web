import { useEffect } from 'react'
import { Outlet, useLocation, useMatches } from 'react-router'

/** What a route tells search engines; set in the route table as `handle`. */
export interface PageHandle {
  title: string
  /** Public pages worth finding in a search. Private and one-off pages are `noindex`. */
  index?: boolean
}

const SITE = 'https://gastos.alejandrocordoba.es'

function setMeta(selector: string, create: () => HTMLElement, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLElement>(selector)
  if (!element) {
    element = create()
    document.head.append(element)
  }
  element.setAttribute(attribute, value)
}

/** Root route: keeps the tab title, the robots meta and the canonical link in step with the page. */
export function PageMeta() {
  const matches = useMatches()
  const { pathname } = useLocation()
  const handle = [...matches].reverse().find((match) => match.handle)?.handle as PageHandle | undefined

  useEffect(() => {
    if (!handle) return
    document.title = `${handle.title} · Gastos`
    setMeta(
      'meta[name="robots"]',
      () => Object.assign(document.createElement('meta'), { name: 'robots' }),
      'content',
      handle.index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
    )
    setMeta(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
      'href',
      `${SITE}${pathname}`,
    )
  }, [handle, pathname])

  return <Outlet />
}
