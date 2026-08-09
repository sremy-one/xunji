import type { WorkoutSession } from '@/types/domain'

export function workoutSharePayload(session: WorkoutSession, streak: number) {
  return {
    title: `我在由迹而寻完成了「${session.planTitle}」，连续运动 ${streak} 天`,
    path: `/packages/workout-equipment/pages/complete?sessionId=${session.id}`,
    imageUrl: '/static/brand/youjierxun-yinling-banner.jpg',
  }
}
