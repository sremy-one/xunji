import type { CheckIn, ExerciseRecord, WorkoutSession } from '@/types/domain'

export function calculateVolume(records: ExerciseRecord[]): number {
  return records.reduce((total, record) => total + record.sets.reduce((sum, set) => {
    if (!set.completed) return sum
    return sum + (set.weightKg || 0) * (set.reps || 0)
  }, 0), 0)
}

export function upsertCheckIn(checkIns: CheckIn[], date: string, sessionId: string): CheckIn[] {
  const current = checkIns.find((item) => item.date === date)
  if (!current) return [...checkIns, { date, sessionIds: [sessionId] }].sort((a, b) => a.date.localeCompare(b.date))
  if (current.sessionIds.includes(sessionId)) return checkIns
  return checkIns.map((item) => item.date === date ? { ...item, sessionIds: [...item.sessionIds, sessionId] } : item)
}

export function completeSession(session: WorkoutSession, completedAt: Date): WorkoutSession {
  const started = new Date(session.startedAt).getTime()
  return {
    ...session,
    completedAt: completedAt.toISOString(),
    durationSeconds: Math.max(0, Math.round((completedAt.getTime() - started) / 1000)),
    status: 'completed',
  }
}
