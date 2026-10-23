/** Round axis steps (1, 2, 2.5 or 5 × 10ⁿ) whose top tick sits above the largest value. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0]
  const raw = max / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw)!
  let top = Math.ceil(max / step) * step
  if (top <= max) top += step
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)
}
