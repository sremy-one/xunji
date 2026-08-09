import { rawRequest } from '@/request/client'

export interface AccountInfo {
  id: string
  displayName: string
  avatarUrl?: string
  createdAt: string
}

export interface AuthSession {
  userId: string
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: string
  account: AccountInfo
  isNewUser?: boolean
}

export function loginByWechatCode(code: string) {
  return rawRequest<AuthSession>('/auth/wechat', { method: 'POST', data: { code } })
}

export function refreshByToken(refreshToken: string) {
  return rawRequest<AuthSession>('/auth/refresh', { method: 'POST', data: { refreshToken } })
}

export function revokeRefreshToken(refreshToken: string) {
  return rawRequest<void>('/auth/logout', { method: 'POST', data: { refreshToken } })
}
