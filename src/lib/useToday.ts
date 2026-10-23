import { useState } from 'react'

/**
 * Today's date, read once when the component mounts. Calling new Date() directly in render
 * would make the render impure (a different result each time React renders the component).
 */
export function useToday() {
  const [today] = useState(() => new Date())
  return today
}
