export type TrainingGoal = 'habit' | 'fatLoss' | 'strength'
export type EquipmentProfile = 'bodyweight' | 'dumbbell' | 'band'
export type TrainingMode = 'reps' | 'time'
export type TrainingArea = 'back' | 'shoulders' | 'legs' | 'chest' | 'core' | 'arms'

export interface Exercise {
  id: string
  name: string
  nameZh: string
  category: string
  categoryZh: string
  equipment: string
  equipmentZh: string
  target: string
  targetZh: string
  muscleText: string
  secondaryMuscles: string[]
  stepsZh: string[]
  mode: TrainingMode
  defaultSets: number
  defaultReps?: number
  defaultSeconds?: number
  difficulty: 'beginner'
  safetyNote: string
  image: string
  gif: string | null
  remoteGifPath: string
  creator: '由迹而寻原创'
  attribution: string
  license: 'All Rights Reserved'
}

export interface UserProfile {
  goal: TrainingGoal
  equipment: EquipmentProfile
  durationMinutes: 15 | 20 | 30
  daysPerWeek: 3 | 4 | 5
  onboardingComplete: boolean
}

export interface PlanTemplate {
  id: string
  title: string
  subtitle: string
  equipment: EquipmentProfile
  durationMinutes: number
  exerciseIds: string[]
}

export interface SetRecord {
  setNumber: number
  reps?: number
  seconds?: number
  weightKg?: number
  completed: boolean
}

export interface ExerciseRecord {
  exerciseId: string
  skipped: boolean
  sets: SetRecord[]
}

export interface WorkoutSession {
  id: string
  planId: string
  planTitle: string
  startedAt: string
  completedAt?: string
  durationSeconds: number
  records: ExerciseRecord[]
  status: 'active' | 'completed'
}

export interface CheckIn {
  date: string
  sessionIds: string[]
}
