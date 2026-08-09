import exercisesJson from '@/data/exercises.generated.json'
import type { CheckIn, EquipmentProfile, Exercise, PlanTemplate, UserProfile, WorkoutSession } from '@/types/domain'
import { localStorageAdapter, storageKeys } from './storage'

const exercises = exercisesJson as Exercise[]

export interface ExerciseRepository {
  list(): Exercise[]
  getById(id: string): Exercise | undefined
  search(query: string, category?: string, equipment?: string): Exercise[]
}

export const exerciseRepository: ExerciseRepository = {
  list: () => exercises,
  getById: (id) => exercises.find((item) => item.id === id),
  search(query, category = 'all', equipment = 'all') {
    const keyword = query.trim().toLowerCase()
    return exercises.filter((item) => {
      const matchesKeyword = !keyword || `${item.name} ${item.nameZh} ${item.targetZh} ${item.muscleText}`.toLowerCase().includes(keyword)
      const matchesEquipment = equipment === 'all'
        || item.equipment === equipment
        || (equipment === 'band' && item.equipment === 'resistance band')
      return matchesKeyword && (category === 'all' || item.category === category) && matchesEquipment
    })
  },
}

const equipmentMap: Record<EquipmentProfile, string[]> = {
  bodyweight: ['body weight'], dumbbell: ['dumbbell'], band: ['band', 'resistance band'],
}

function balancedPlanExerciseIds(equipment: EquipmentProfile, size = 6) {
  const equipmentPool = exercises.filter((item) => equipmentMap[equipment].includes(item.equipment))
  const bodyweightWarmups = exercises.filter((item) => item.equipment === 'body weight' && item.category === 'cardio')
  const pool = equipment === 'bodyweight' ? equipmentPool : [...bodyweightWarmups, ...equipmentPool]
  const chosen: Exercise[] = []
  for (const item of pool) {
    if (!chosen.some((entry) => entry.category === item.category)) chosen.push(item)
    if (chosen.length === size) break
  }
  for (const item of pool) {
    if (!chosen.includes(item)) chosen.push(item)
    if (chosen.length === size) break
  }
  return chosen.map((item) => item.id)
}

export interface PlanRepository { getForProfile(profile: UserProfile): PlanTemplate; list(): PlanTemplate[] }

export const planRepository: PlanRepository = {
  list: () => ([
    { id: 'habit-bodyweight', title: '新手舒展与力量', subtitle: '无器械 · 温和唤醒全身', equipment: 'bodyweight', durationMinutes: 15, exerciseIds: balancedPlanExerciseIds('bodyweight') },
    { id: 'dumbbell-foundation', title: '哑铃基础力量', subtitle: '稳定动作 · 建立力量感', equipment: 'dumbbell', durationMinutes: 20, exerciseIds: balancedPlanExerciseIds('dumbbell') },
    { id: 'band-mobility', title: '弹力带全身激活', subtitle: '轻阻力 · 关节友好', equipment: 'band', durationMinutes: 15, exerciseIds: balancedPlanExerciseIds('band') },
  ]),
  getForProfile(profile) {
    const plans = this.list()
    return plans.find((item) => item.equipment === profile.equipment) || plans[0]
  },
}

export const profileRepository = {
  load(): UserProfile {
    return localStorageAdapter.get<UserProfile>(storageKeys.profile, {
      goal: 'habit', equipment: 'bodyweight', durationMinutes: 15, daysPerWeek: 3, onboardingComplete: false,
    })
  },
  save(profile: UserProfile) { localStorageAdapter.set(storageKeys.profile, profile) },
}

export const workoutRepository = {
  listSessions: () => localStorageAdapter.get<WorkoutSession[]>(storageKeys.sessions, []),
  replaceSessions: (sessions: WorkoutSession[]) => localStorageAdapter.set(storageKeys.sessions, sessions),
  saveSession(session: WorkoutSession) {
    const sessions = localStorageAdapter.get<WorkoutSession[]>(storageKeys.sessions, [])
    const next = [session, ...sessions.filter((item) => item.id !== session.id)]
    localStorageAdapter.set(storageKeys.sessions, next)
  },
  listCheckIns: () => localStorageAdapter.get<CheckIn[]>(storageKeys.checkIns, []),
  replaceCheckIns: (items: CheckIn[]) => localStorageAdapter.set(storageKeys.checkIns, items),
  saveCheckIns: (items: CheckIn[]) => localStorageAdapter.set(storageKeys.checkIns, items),
  loadActive: () => localStorageAdapter.get<WorkoutSession | null>(storageKeys.activeSession, null),
  saveActive: (session: WorkoutSession) => localStorageAdapter.set(storageKeys.activeSession, session),
  clearActive: () => localStorageAdapter.remove(storageKeys.activeSession),
  clearAll() {
    localStorageAdapter.remove(storageKeys.sessions)
    localStorageAdapter.remove(storageKeys.checkIns)
    localStorageAdapter.remove(storageKeys.activeSession)
  },
}
