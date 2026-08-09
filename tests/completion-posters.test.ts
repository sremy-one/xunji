import { describe, expect, it } from 'vitest'
import { COMPLETION_POSTERS, resolveCompletionPosterIndex } from '@/utils/completion-posters'
import { COMPLETION_POSTERS as bodyweightPosters } from '@/packages/workout-bodyweight/utils/completion-posters'
import { COMPLETION_POSTERS as equipmentPosters } from '@/packages/workout-equipment/utils/completion-posters'

describe('completion posters', () => {
  it('provides eight unique local celebration posters', () => {
    expect(COMPLETION_POSTERS).toHaveLength(8)
    expect(new Set(COMPLETION_POSTERS.map((poster) => poster.id)).size).toBe(8)
    expect(COMPLETION_POSTERS.every((poster) => poster.src.startsWith('/static/celebration/'))).toBe(true)
  })

  it('keeps both WeChat subpackage copies synchronized with the source list', () => {
    expect(bodyweightPosters).toEqual(COMPLETION_POSTERS)
    expect(equipmentPosters).toEqual(COMPLETION_POSTERS)
  })

  it('keeps the selected poster stable for the same workout session', () => {
    const first = resolveCompletionPosterIndex('session-2026-07-31-a')
    expect(resolveCompletionPosterIndex('session-2026-07-31-a')).toBe(first)
    expect(first).toBeGreaterThanOrEqual(0)
    expect(first).toBeLessThan(COMPLETION_POSTERS.length)
  })

  it('supports deterministic poster overrides for visual QA', () => {
    expect(resolveCompletionPosterIndex('any-session', '1')).toBe(0)
    expect(resolveCompletionPosterIndex('any-session', '8')).toBe(7)
  })
})
