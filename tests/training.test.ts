import { describe, expect, it } from 'vitest'
import { calculateVolume, completeSession, upsertCheckIn } from '@/utils/training'
import type { WorkoutSession } from '@/types/domain'

describe('training utilities', () => {
  it('keeps a check-in idempotent for the same session', () => {
    const first = upsertCheckIn([], '2026-07-22', 's1')
    const duplicate = upsertCheckIn(first, '2026-07-22', 's1')
    const secondSession = upsertCheckIn(duplicate, '2026-07-22', 's2')
    expect(secondSession).toEqual([{ date: '2026-07-22', sessionIds: ['s1', 's2'] }])
  })

  it('calculates completed weighted volume only', () => {
    expect(calculateVolume([{ exerciseId: '1', skipped: false, sets: [
      { setNumber: 1, reps: 10, weightKg: 5, completed: true },
      { setNumber: 2, reps: 10, weightKg: 5, completed: false },
    ] }])).toBe(50)
  })

  it('completes a session with elapsed seconds', () => {
    const session: WorkoutSession = { id: 's1', planId: 'p1', planTitle: '计划', startedAt: '2026-07-22T10:00:00.000Z', durationSeconds: 0, status: 'active', records: [] }
    expect(completeSession(session, new Date('2026-07-22T10:18:00.000Z')).durationSeconds).toBe(1080)
  })
})
