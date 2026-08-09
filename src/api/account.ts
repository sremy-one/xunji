import type { AccountInfo } from '@/api/auth'
import { authenticatedRequest } from '@/request/authenticated'

export function updateAccountProfile(payload: { displayName?: string }) {
  return authenticatedRequest<{ account: AccountInfo }>('/account/profile', { method: 'PUT', data: payload })
}

export function uploadAccountAvatar(data: ArrayBuffer, contentType: string) {
  return authenticatedRequest<{ account: AccountInfo }>('/account/avatar', {
    method: 'POST',
    data,
    headers: { 'content-type': contentType },
  })
}
