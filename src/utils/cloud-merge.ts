import type { CheckIn, WorkoutSession } from '@/types/domain'

export function mergeWorkoutSessions(local: WorkoutSession[], remote: WorkoutSession[]) {
  const merged = new Map<string, WorkoutSession>()
  ;[...local, ...remote].forEach((session) => {
    const previous = merged.get(session.id)
    const previousTime = new Date(previous?.completedAt || previous?.startedAt || 0).getTime()
    const nextTime = new Date(session.completedAt || session.startedAt).getTime()
    if (!previous || nextTime >= previousTime) merged.set(session.id, session)
  })
  return [...merged.values()].sort((a, b) =>
    new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())
}

export function mergeCheckIns(local: CheckIn[], remote: CheckIn[]) {
  const merged = new Map<string, CheckIn>()
  ;[...local, ...remote].forEach((item) => {
    const previous = merged.get(item.date)
    merged.set(item.date, {
      date: item.date,
      sessionIds: [...new Set([...(previous?.sessionIds || []), ...item.sessionIds])],
    })
  })
  return [...merged.values()].sort((a, b) => b.date.localeCompare(a.date))
}
