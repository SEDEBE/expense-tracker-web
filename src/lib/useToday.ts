import { useState } from 'react'

// Read once on mount: calling new Date() during render makes the render impure.
export function useToday() {
  const [today] = useState(() => new Date())
  return today
}
