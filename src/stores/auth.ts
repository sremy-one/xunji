import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthSession } from '@/api/auth'
import { clearLegacyLoginPromptFlag, loadAuthSession, loginWithWechat, logoutAccount } from '@/services/auth-session'
import { localStorageAdapter, storageKeys } from '@/services/storage'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<AuthSession | null>(loadAuthSession())
  const busy = ref(false)
  const authenticated = computed(() => Boolean(session.value?.accessToken))
  const account = computed(() => session.value?.account)

  function reload() { session.value = loadAuthSession() }
  function clearLegacyPromptFlag() { clearLegacyLoginPromptFlag() }

  async function login() {
    if (busy.value) return session.value
    busy.value = true
    try {
      session.value = await loginWithWechat()
      return session.value
    } finally {
      busy.value = false
    }
  }

  async function logout() {
    if (busy.value) return
    busy.value = true
    try {
      await logoutAccount()
      session.value = null
    } finally {
      busy.value = false
    }
  }

  function updateAccount(account: AuthSession['account']) {
    if (!session.value) return
    session.value = { ...session.value, account }
    localStorageAdapter.set(storageKeys.authSession, session.value)
  }

  return { session, account, authenticated, busy, reload, clearLegacyPromptFlag, login, logout, updateAccount }
})
