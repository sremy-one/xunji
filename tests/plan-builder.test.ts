import { describe, expect, it } from 'vitest'
import { exerciseRepository } from '@/services/repositories'
import { availableTrainingAreas, buildFocusPlan, workoutSizeForAreas } from '@/packages/planner/utils/plan-builder'
import type { UserProfile } from '@/types/domain'

const profile: UserProfile = {
  goal: 'habit',
  equipment: 'bodyweight',
  durationMinutes: 20,
  daysPerWeek: 3,
  onboardingComplete: true,
}

describe('focused workout planning with the 28-action core set', () => {
  it('builds a warm-up-first five-action chest and legs workout', () => {
    const plan = buildFocusPlan(profile, ['chest', 'legs'])
    const exercises = plan.exerciseIds.map((id) => exerciseRepository.getById(id)!)

    expect(workoutSizeForAreas(2)).toBe(5)
    expect(plan.exerciseIds).toHaveLength(5)
    expect(new Set(plan.exerciseIds).size).toBe(plan.exerciseIds.length)
    expect(exercises[0].id).toBe('yl-standing-march')
    expect(exercises.slice(1).every((item) => ['upper legs', 'lower legs', 'chest'].includes(item.category))).toBe(true)
  })

  it('advertises only areas supported by the chosen equipment profile', () => {
    expect(availableTrainingAreas(profile)).toEqual(['back', 'shoulders', 'legs', 'chest', 'core', 'arms'])
    expect(availableTrainingAreas({ ...profile, equipment: 'dumbbell' })).toEqual(['back', 'shoulders', 'legs', 'chest', 'core', 'arms'])
    expect(availableTrainingAreas({ ...profile, equipment: 'band' })).toEqual(['back', 'shoulders', 'legs', 'chest', 'core', 'arms'])
  })

  it('prefers profile equipment and fills the workout with same-area safe fallbacks', () => {
    const plan = buildFocusPlan({ ...profile, equipment: 'dumbbell' }, ['arms'])
    const selected = plan.exerciseIds.map((id) => exerciseRepository.getById(id)!)
    expect(selected).toHaveLength(4)
    expect(selected[0].id).toBe('yl-standing-march')
    expect(selected.some((item) => item.id === 'yl-dumbbell-curl')).toBe(true)
    expect(selected.some((item) => item.id === 'yl-dumbbell-triceps-extension')).toBe(true)
    expect(selected.slice(1).every((item) => item.category === 'upper arms')).toBe(true)
  })
})
