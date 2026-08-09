const prefix = 'youjierxun.v1.'
const legacyPrefixes = ['lianwushu.v1.', 'lianji.v1.'] as const

export const storageKeys = {
  profile: `${prefix}profile`,
  sessions: `${prefix}sessions`,
  checkIns: `${prefix}checkins`,
  activeSession: `${prefix}active-session`,
  authSession: `${prefix}auth-session`,
  accountSignature: `${prefix}account-signature`,
  cloudSync: `${prefix}cloud-sync`,
  loginPromptSeen: `${prefix}login-prompt-seen`,
}

export interface StorageAdapter {
  get<T>(key: string, fallback: T): T
  set<T>(key: string, value: T): void
  remove(key: string): void
}

export function legacyKeyFor(key: string): string | undefined {
  return legacyKeysFor(key)[0]
}

export function legacyKeysFor(key: string): string[] {
  return key.startsWith(prefix)
    ? legacyPrefixes.map((legacyPrefix) => `${legacyPrefix}${key.slice(prefix.length)}`)
    : []
}

export const localStorageAdapter: StorageAdapter = {
  get<T>(key: string, fallback: T): T {
    try {
      const value = uni.getStorageSync(key)
      if (value !== '' && value !== undefined && value !== null) return value as T

      for (const legacyKey of legacyKeysFor(key)) {
        const legacyValue = uni.getStorageSync(legacyKey)
        if (legacyValue === '' || legacyValue === undefined || legacyValue === null) continue
        uni.setStorageSync(key, legacyValue)
        return legacyValue as T
      }
      return fallback
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T) {
    try { uni.setStorageSync(key, value) } catch (error) { console.warn('Unable to persist local data', error) }
  },
  remove(key: string) {
    try {
      uni.removeStorageSync(key)
      legacyKeysFor(key).forEach((legacyKey) => uni.removeStorageSync(legacyKey))
    } catch (error) { console.warn('Unable to remove local data', error) }
  },
}
