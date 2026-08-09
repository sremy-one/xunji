import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { legacyKeyFor, legacyKeysFor, localStorageAdapter, storageKeys } from '@/services/storage'

describe('brand storage migration', () => {
  const bucket = new Map<string, unknown>()

  beforeEach(() => {
    bucket.clear()
    vi.stubGlobal('uni', {
      getStorageSync: (key: string) => bucket.has(key) ? bucket.get(key) : '',
      setStorageSync: (key: string, value: unknown) => bucket.set(key, value),
      removeStorageSync: (key: string) => bucket.delete(key),
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('migrates the previous brand namespace to 由迹而寻 on first read', () => {
    const legacyKey = legacyKeyFor(storageKeys.profile)!
    const profile = { goal: 'habit', onboardingComplete: true }
    bucket.set(legacyKey, profile)

    expect(localStorageAdapter.get(storageKeys.profile, {})).toEqual(profile)
    expect(bucket.get(storageKeys.profile)).toEqual(profile)
  })

  it('still migrates the oldest namespace when the newer legacy value is absent', () => {
    const oldestKey = legacyKeysFor(storageKeys.sessions)[1]
    const sessions = [{ id: 'legacy-session' }]
    bucket.set(oldestKey, sessions)

    expect(localStorageAdapter.get(storageKeys.sessions, [])).toEqual(sessions)
    expect(bucket.get(storageKeys.sessions)).toEqual(sessions)
  })

  it('removes current and both legacy values when local data is reset', () => {
    const legacyKeys = legacyKeysFor(storageKeys.checkIns)
    bucket.set(storageKeys.checkIns, [{ date: '2026-07-30' }])
    legacyKeys.forEach((legacyKey) => bucket.set(legacyKey, [{ date: '2026-07-22' }]))

    localStorageAdapter.remove(storageKeys.checkIns)

    expect(bucket.has(storageKeys.checkIns)).toBe(false)
    legacyKeys.forEach((legacyKey) => expect(bucket.has(legacyKey)).toBe(false))
  })
})
