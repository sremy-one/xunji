import { describe, expect, it } from 'vitest'
import exercises from '@/data/exercises.generated.json'
import { planRepository } from '@/services/repositories'

describe('original Silverling core exercise set', () => {
  it('contains 28 original animated exercises across three equipment profiles', () => {
    expect(exercises).toHaveLength(28)
    expect(new Set(exercises.map((item) => item.id)).size).toBe(28)
    expect(exercises.filter((item) => item.equipment === 'body weight')).toHaveLength(14)
    expect(exercises.filter((item) => item.equipment === 'dumbbell')).toHaveLength(8)
    expect(exercises.filter((item) => ['band', 'resistance band'].includes(item.equipment))).toHaveLength(6)
    expect(exercises.every((item) =>
      item.id.startsWith('yl-')
      && item.creator === '由迹而寻原创'
      && item.license === 'All Rights Reserved'
      && item.muscleText.startsWith('锻炼')
      && item.stepsZh.length >= 3
      && item.gif
    )).toBe(true)
  })

  it('builds a six-action plan for each equipment profile', () => {
    for (const plan of planRepository.list()) {
      expect(plan.exerciseIds).toHaveLength(6)
      expect(new Set(plan.exerciseIds).size).toBe(plan.exerciseIds.length)
      expect(plan.exerciseIds.every((id) => exercises.find((item) => item.id === id)?.gif)).toBe(true)
    }
  })
})
