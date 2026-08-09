import type { AuthSession } from '@/api/auth'
import { loginByWechatCode, refreshByToken, revokeRefreshToken } from '@/api/auth'
import { requestPrivacyConsent } from '@/services/privacy-consent'
import { localStorageAdapter, storageKeys } from './storage'

export class AuthenticationRequiredError extends Error {
  constructor() {
    super('请先保存我的数据后继续')
    this.name = 'AuthenticationRequiredError'
  }
}

let activeAuthentication: Promise<AuthSession> | null = null

export function loadAuthSession() {
  const session = localStorageAdapter.get<AuthSession | null>(storageKeys.authSession, null)
  if (session && !session.account) {
    localStorageAdapter.remove(storageKeys.authSession)
    return null
  }
  return session
}

function saveAuthSession(session: AuthSession) {
  localStorageAdapter.set(storageKeys.authSession, session)
  return session
}

export function clearAuthSession() {
  localStorageAdapter.remove(storageKeys.authSession)
}

export function clearLegacyLoginPromptFlag() {
  localStorageAdapter.remove(storageKeys.loginPromptSeen)
}

export function isAuthenticated() {
  return Boolean(loadAuthSession()?.accessToken)
}

function getWechatLoginCode() {
  return new Promise<string>((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: 'weixin',
      timeout: 10000,
      success(result) {
        if (result.code) resolve(result.code)
        else reject(new Error('微信未返回保存凭证'))
      },
      fail(error) { reject(new Error(error.errMsg || '微信保存凭证获取失败')) },
    })
    // #endif
    // #ifndef MP-WEIXIN
    reject(new Error('保存云端数据需要在微信小程序中使用'))
    // #endif
  })
}

export async function loginWithWechat() {
  if (activeAuthentication) return activeAuthentication
  activeAuthentication = (async () => {
    await requestPrivacyConsent()
    const code = await getWechatLoginCode()
    return saveAuthSession(await loginByWechatCode(code))
  })()
  try { return await activeAuthentication } finally { activeAuthentication = null }
}

export function requireAuthSession() {
  const session = loadAuthSession()
  if (!session) throw new AuthenticationRequiredError()
  return session
}

export async function refreshAuthentication() {
  const current = loadAuthSession()
  if (!current?.refreshToken) throw new AuthenticationRequiredError()
  try {
    const refreshed = await refreshByToken(current.refreshToken)
    return saveAuthSession({ ...refreshed, account: refreshed.account || current.account })
  } catch (error) {
    clearAuthSession()
    throw error
  }
}

export async function logoutAccount() {
  const session = loadAuthSession()
  clearAuthSession()
  if (!session) return
  try { await revokeRefreshToken(session.refreshToken) } catch { /* Offline logout remains local-first. */ }
}
