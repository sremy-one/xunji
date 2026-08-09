import { deleteRemoteAccount, pullSyncData, pushSyncData } from '@/api/cloud'
import { mergeCheckIns, mergeWorkoutSessions } from '@/utils/cloud-merge'
import { loadAuthSession, loginWithWechat, logoutAccount, requireAuthSession } from './auth-session'
import { profileRepository, workoutRepository } from './repositories'
import { localStorageAdapter, storageKeys } from './storage'

export interface CloudSyncState {
  enabled: boolean
  userId?: string
  serverCursor?: string
  lastSyncedAt?: string
  lastError?: string
}

const defaultState: CloudSyncState = { enabled: false }
let scheduledTimer: ReturnType<typeof setTimeout> | undefined

export function loadCloudSyncState() {
  return localStorageAdapter.get<CloudSyncState>(storageKeys.cloudSync, defaultState)
}

function saveCloudSyncState(next: CloudSyncState) {
  localStorageAdapter.set(storageKeys.cloudSync, next)
  return next
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : '同步失败，请稍后重试'
}

async function pushLocalData() {
  const profile = profileRepository.load()
  const sessions = workoutRepository.listSessions().filter((item) => item.status === 'completed')
  if (!sessions.length) {
    await pushSyncData({ profile, sessions: [] })
    return
  }
  for (let index = 0; index < sessions.length; index += 40) {
    await pushSyncData({ profile: index === 0 ? profile : undefined, sessions: sessions.slice(index, index + 40) })
  }
}

export async function syncCloudData() {
  const current = loadCloudSyncState()
  if (!current.enabled) return current
  try {
    await pushLocalData()
    const remote = await pullSyncData(current.serverCursor)
    profileRepository.save({
      goal: remote.profile.goal,
      equipment: remote.profile.equipment,
      durationMinutes: remote.profile.durationMinutes,
      daysPerWeek: remote.profile.daysPerWeek,
      onboardingComplete: remote.profile.onboardingComplete,
    })
    workoutRepository.replaceSessions(mergeWorkoutSessions(workoutRepository.listSessions(), remote.sessions))
    workoutRepository.replaceCheckIns(mergeCheckIns(workoutRepository.listCheckIns(), remote.checkIns))
    return saveCloudSyncState({
      enabled: true,
      userId: loadAuthSession()?.userId,
      serverCursor: remote.serverCursor,
      lastSyncedAt: new Date().toISOString(),
    })
  } catch (error) {
    saveCloudSyncState({ ...current, lastError: errorMessage(error) })
    throw error
  }
}

export async function enableCloudSync() {
  try {
    const session = loadAuthSession() || await loginWithWechat()
    saveCloudSyncState({ enabled: true, userId: session.userId })
    return await syncCloudData()
  } catch (error) {
    saveCloudSyncState({ enabled: false, lastError: errorMessage(error) })
    throw error
  }
}

export async function disableCloudSync() {
  return saveCloudSyncState({ enabled: false })
}

export async function deleteCloudAccount() {
  await deleteRemoteAccount()
  await logoutAccount()
  return saveCloudSyncState({ enabled: false })
}

export function scheduleCloudSync() {
  if (!loadCloudSyncState().enabled || !loadAuthSession()) return
  if (scheduledTimer) clearTimeout(scheduledTimer)
  scheduledTimer = setTimeout(() => {
    scheduledTimer = undefined
    void syncCloudData().catch(() => undefined)
  }, 1200)
}
