import { describe, expect, it } from 'vitest'
import { calculateStreak, getMonday, toDateKey, weekDays } from '@/utils/date'

describe('date utilities', () => {
  it('builds a Monday to Sunday week', () => {
    const days = weekDays(new Date(2026, 6, 22))
    expect(days.map((day) => day.date)).toEqual(['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25', '2026-07-26'])
    expect(toDateKey(getMonday(new Date(2026, 6, 26)))).toBe('2026-07-20')
  })

  it('counts a streak once per natural day', () => {
    const checkIns = ['2026-07-19', '2026-07-20', '2026-07-21', '2026-07-22'].map((date) => ({ date, sessionIds: [date] }))
    expect(calculateStreak(checkIns, new Date(2026, 6, 22))).toBe(4)
  })

  it('allows today to be a rest day while preserving yesterday streak', () => {
    const checkIns = ['2026-07-19', '2026-07-20', '2026-07-21'].map((date) => ({ date, sessionIds: [date] }))
    expect(calculateStreak(checkIns, new Date(2026, 6, 22))).toBe(3)
  })
})
