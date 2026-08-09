import { describe, expect, it } from 'vitest'
import { mergeCheckIns, mergeWorkoutSessions } from '@/utils/cloud-merge'
import type { WorkoutSession } from '@/types/domain'

function session(id: string, completedAt: string, durationSeconds: number): WorkoutSession {
  return {
    id,
    planId: 'starter',
    planTitle: '入门训练',
    startedAt: completedAt,
    completedAt,
    durationSeconds,
    records: [],
    status: 'completed',
  }
}

describe('cloud data merge', () => {
  it('deduplicates sessions and keeps the newest completed version', () => {
    const result = mergeWorkoutSessions(
      [session('same', '2026-08-01T01:00:00.000Z', 300)],
      [session('same', '2026-08-01T01:00:00.000Z', 360), session('new', '2026-08-02T01:00:00.000Z', 420)],
    )

    expect(result.map((item) => item.id)).toEqual(['new', 'same'])
    expect(result[1].durationSeconds).toBe(360)
  })

  it('unions same-day check-in session ids without duplicating the day', () => {
    const result = mergeCheckIns(
      [{ date: '2026-08-02', sessionIds: ['local'] }],
      [{ date: '2026-08-02', sessionIds: ['local', 'remote'] }, { date: '2026-08-01', sessionIds: ['older'] }],
    )

    expect(result).toEqual([
      { date: '2026-08-02', sessionIds: ['local', 'remote'] },
      { date: '2026-08-01', sessionIds: ['older'] },
    ])
  })
})
