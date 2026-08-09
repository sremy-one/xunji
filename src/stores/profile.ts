import { defineStore } from 'pinia'
import { ref } from 'vue'
import { profileRepository } from '@/services/repositories'
import { scheduleCloudSync } from '@/services/cloud-sync'
import type { UserProfile } from '@/types/domain'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfile>(profileRepository.load())
  function save(next: UserProfile) {
    profile.value = next
    profileRepository.save(next)
    scheduleCloudSync()
  }
  function reload() { profile.value = profileRepository.load() }
  return { profile, save, reload }
})
