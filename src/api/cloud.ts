import type { CheckIn, UserProfile, WorkoutSession } from '@/types/domain'
import { authenticatedRequest } from '@/request/authenticated'

export interface PullSyncResponse {
  profile: UserProfile
  sessions: Array<WorkoutSession & { updatedAt?: string }>
  checkIns: Array<CheckIn & { updatedAt?: string }>
  serverCursor: string
}

export function pushSyncData(payload: { profile?: UserProfile; sessions: WorkoutSession[] }) {
  return authenticatedRequest<{ acceptedSessionIds: string[]; serverCursor: string }>('/sync/push', {
    method: 'POST', data: payload,
  })
}

export function pullSyncData(cursor?: string) {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return authenticatedRequest<PullSyncResponse>(`/sync/pull${query}`)
}

export function deleteRemoteAccount() {
  return authenticatedRequest<void>('/account', { method: 'DELETE' })
}
