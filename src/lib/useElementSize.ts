import { useEffect, useRef, useState } from 'react'

/** Size of an element, updated when it resizes. Charts draw at their real pixel size. */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) }),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, size] as const
}
