import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  deleteCloudAccount,
  disableCloudSync,
  enableCloudSync,
  loadCloudSyncState,
  syncCloudData,
  type CloudSyncState,
} from '@/services/cloud-sync'
import { isAuthenticated } from '@/services/auth-session'

export const useCloudStore = defineStore('cloud', () => {
  const state = ref<CloudSyncState>(loadCloudSyncState())
  const busy = ref(false)

  function reload() { state.value = loadCloudSyncState() }

  async function run(action: () => Promise<CloudSyncState>) {
    if (busy.value) return state.value
    busy.value = true
    try {
      state.value = await action()
      return state.value
    } finally {
      busy.value = false
      reload()
    }
  }

  const enable = () => run(enableCloudSync)
  const disable = () => run(disableCloudSync)
  const syncNow = () => run(syncCloudData)
  const deleteAccount = () => run(deleteCloudAccount)

  async function resume() {
    reload()
    if (!state.value.enabled || !isAuthenticated()) return
    try { await syncNow() } catch { /* The local app remains usable offline. */ }
  }

  return { state, busy, reload, enable, disable, syncNow, deleteAccount, resume }
})
