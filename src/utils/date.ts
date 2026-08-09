import type { CheckIn } from '@/types/domain'

export interface Clock { now(): Date }
export const systemClock: Clock = { now: () => new Date() }

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getMonday(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const weekday = copy.getDay() || 7
  copy.setDate(copy.getDate() - weekday + 1)
  return copy
}

export function weekDays(date: Date) {
  const monday = getMonday(date)
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return labels.map((label, index) => {
    const current = new Date(monday)
    current.setDate(monday.getDate() + index)
    return { label, date: toDateKey(current), shortDate: `${current.getMonth() + 1}/${current.getDate()}` }
  })
}

export function calculateStreak(checkIns: CheckIn[], today: Date): number {
  const dates = new Set(checkIns.map((item) => item.date))
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (!dates.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (dates.has(toDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}
