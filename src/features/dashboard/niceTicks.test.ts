import { describe, expect, it } from 'vitest'
import { niceTicks } from './niceTicks'

describe('niceTicks', () => {
  it('uses round steps', () => {
    expect(niceTicks(1821)).toEqual([0, 500, 1000, 1500, 2000])
    expect(niceTicks(380)).toEqual([0, 100, 200, 300, 400])
  })

  it('keeps the top tick above the largest value', () => {
    expect(niceTicks(400)).toEqual([0, 100, 200, 300, 400, 500])
  })

  it('handles an empty history', () => {
    expect(niceTicks(0)).toEqual([0])
  })
})
