import { exerciseRepository } from '@/services/repositories'
import type { EquipmentProfile, Exercise, PlanTemplate, TrainingArea, UserProfile } from '@/types/domain'

export const trainingAreaOptions: Array<{
  id: TrainingArea
  label: string
  description: string
}> = [
  { id: 'back', label: '背部训练', description: '舒展背部，改善体态' },
  { id: 'shoulders', label: '肩部训练', description: '激活肩线，放松紧张' },
  { id: 'legs', label: '腿部训练', description: '下肢力量与稳定' },
  { id: 'chest', label: '胸部训练', description: '推力基础与胸肩协同' },
  { id: 'core', label: '核心训练', description: '躯干稳定与控制' },
  { id: 'arms', label: '手臂训练', description: '肱二、肱三协调发力' },
]

const categoryMap: Record<TrainingArea, string[]> = {
  back: ['back'],
  shoulders: ['shoulders'],
  legs: ['upper legs', 'lower legs'],
  chest: ['chest'],
  core: ['waist'],
  arms: ['upper arms', 'lower arms'],
}

const areaPriority: TrainingArea[] = ['legs', 'back', 'chest', 'shoulders', 'arms', 'core']

const equipmentMap: Record<EquipmentProfile, string[]> = {
  bodyweight: ['body weight'],
  dumbbell: ['dumbbell'],
  band: ['band', 'resistance band'],
}

function uniqueAreas(areas: TrainingArea[]) {
  return [...new Set(areas)].sort((a, b) => areaPriority.indexOf(a) - areaPriority.indexOf(b))
}

function rankedCandidates(area: TrainingArea, equipment: EquipmentProfile): Exercise[] {
  const exactEquipment = equipmentMap[equipment]
  const allowedEquipment = equipment === 'bodyweight' ? exactEquipment : [...exactEquipment, 'body weight']

  return exerciseRepository.list()
    .filter((exercise) => allowedEquipment.includes(exercise.equipment) && categoryMap[area].includes(exercise.category))
    .sort((a, b) => {
      const score = (exercise: Exercise) =>
        (exactEquipment.includes(exercise.equipment) ? 100 : 0)
        + (exercise.image ? 20 : 0)
        + (exercise.mode === 'reps' ? 2 : 0)
      return score(b) - score(a)
    })
}

export function availableTrainingAreas(profile: UserProfile): TrainingArea[] {
  return trainingAreaOptions
    .map((option) => option.id)
    .filter((area) => rankedCandidates(area, profile.equipment).length > 0)
}

function pickWarmup(used: Set<string>): Exercise | undefined {
  return exerciseRepository.list().find((exercise) =>
    exercise.equipment === 'body weight'
    && exercise.category === 'cardio'
    && !used.has(exercise.id))
}

function pickCoreFinish(used: Set<string>): Exercise | undefined {
  return exerciseRepository.list().find((exercise) =>
    exercise.equipment === 'body weight'
    && exercise.category === 'waist'
    && !used.has(exercise.id))
}

export function workoutSizeForAreas(areaCount: number) {
  return Math.min(8, Math.max(4, areaCount + 3))
}

export function buildFocusPlan(profile: UserProfile, areas: TrainingArea[]): PlanTemplate {
  const orderedAreas = uniqueAreas(areas)
  if (!orderedAreas.length) throw new Error('At least one training area is required')

  const targetSize = workoutSizeForAreas(orderedAreas.length)
  const chosen: Exercise[] = []
  const used = new Set<string>()
  const add = (exercise?: Exercise) => {
    if (!exercise || used.has(exercise.id) || chosen.length >= targetSize) return
    chosen.push(exercise)
    used.add(exercise.id)
  }

  add(pickWarmup(used))

  const pools = new Map(orderedAreas.map((area) => [area, rankedCandidates(area, profile.equipment)]))
  for (const area of orderedAreas) add(pools.get(area)?.find((exercise) => !used.has(exercise.id)))

  let pass = 1
  while (chosen.length < targetSize && pass < 4) {
    for (const area of orderedAreas) add(pools.get(area)?.filter((exercise) => !used.has(exercise.id))[pass - 1])
    pass += 1
  }

  if (chosen.length < targetSize && !orderedAreas.includes('core')) add(pickCoreFinish(used))

  for (const exercise of exerciseRepository.list()) {
    if (chosen.length >= targetSize) break
    const belongsToSelection = orderedAreas.some((area) => categoryMap[area].includes(exercise.category))
    if (!used.has(exercise.id) && belongsToSelection) add(exercise)
  }

  const labels = orderedAreas.map((area) => trainingAreaOptions.find((item) => item.id === area)!.label.replace('训练', ''))
  const title = labels.length <= 3 ? `${labels.join('·')}组合训练` : `${labels.length} 部位组合训练`
  const durationMinutes = Math.min(30, Math.max(15, chosen.length * 3))

  return {
    id: `focus-${profile.equipment}-${orderedAreas.join('-')}`,
    title,
    subtitle: '银铃为你编排 · 从热身到收尾',
    equipment: profile.equipment,
    durationMinutes,
    exerciseIds: chosen.map((exercise) => exercise.id),
  }
}
