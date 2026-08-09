import { defineStore } from 'pinia'
import { ref } from 'vue'
import { exerciseRepository, workoutRepository } from '@/services/repositories'
import type { CheckIn, PlanTemplate, WorkoutSession } from '@/types/domain'
import { completeSession, upsertCheckIn } from '@/utils/training'
import { toDateKey } from '@/utils/date'
import { scheduleCloudSync } from '@/services/cloud-sync'

export const useWorkoutStore = defineStore('workout', () => {
  const sessions = ref<WorkoutSession[]>(workoutRepository.listSessions())
  const checkIns = ref<CheckIn[]>(workoutRepository.listCheckIns())
  const activeSession = ref<WorkoutSession | null>(workoutRepository.loadActive())

  function reload() {
    sessions.value = workoutRepository.listSessions()
    checkIns.value = workoutRepository.listCheckIns()
    activeSession.value = workoutRepository.loadActive()
  }

  function startPlan(plan: PlanTemplate) {
    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      planId: plan.id,
      planTitle: plan.title,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      status: 'active',
      records: plan.exerciseIds.map((exerciseId) => {
        const exercise = exerciseRepository.getById(exerciseId)!
        return {
          exerciseId,
          skipped: false,
          sets: Array.from({ length: exercise.defaultSets }, (_, index) => ({
            setNumber: index + 1,
            reps: exercise.defaultReps,
            seconds: exercise.defaultSeconds,
            completed: false,
          })),
        }
      }),
    }
    activeSession.value = session
    workoutRepository.saveActive(session)
    return session
  }

  function persistActive() {
    if (activeSession.value) workoutRepository.saveActive(activeSession.value)
  }

  function markSet(exerciseId: string, setIndex: number, payload: { reps?: number; seconds?: number; weightKg?: number }) {
    if (!activeSession.value) return
    const record = activeSession.value.records.find((item) => item.exerciseId === exerciseId)
    if (!record?.sets[setIndex]) return
    record.sets[setIndex] = { ...record.sets[setIndex], ...payload, completed: !record.sets[setIndex].completed }
    persistActive()
  }

  function skipExercise(exerciseId: string) {
    if (!activeSession.value) return
    const record = activeSession.value.records.find((item) => item.exerciseId === exerciseId)
    if (record) record.skipped = true
    persistActive()
  }

  function replaceExercise(oldId: string, newId: string) {
    if (!activeSession.value) return
    const record = activeSession.value.records.find((item) => item.exerciseId === oldId)
    const replacement = exerciseRepository.getById(newId)
    if (!record || !replacement) return
    record.exerciseId = newId
    record.skipped = false
    record.sets = Array.from({ length: replacement.defaultSets }, (_, index) => ({
      setNumber: index + 1,
      reps: replacement.defaultReps,
      seconds: replacement.defaultSeconds,
      completed: false,
    }))
    persistActive()
  }

  function finish(now = new Date()) {
    if (!activeSession.value) return null
    const completed = completeSession(activeSession.value, now)
    workoutRepository.saveSession(completed)
    const nextCheckIns = upsertCheckIn(checkIns.value, toDateKey(now), completed.id)
    workoutRepository.saveCheckIns(nextCheckIns)
    sessions.value = [completed, ...sessions.value.filter((item) => item.id !== completed.id)]
    checkIns.value = nextCheckIns
    activeSession.value = null
    workoutRepository.clearActive()
    scheduleCloudSync()
    return completed
  }

  function clearAll() {
    workoutRepository.clearAll()
    reload()
  }

  return { sessions, checkIns, activeSession, reload, startPlan, markSet, skipExercise, replaceExercise, finish, clearAll }
})
