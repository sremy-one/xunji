<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon.vue'
import PrivacyConsentModal from '@/components/PrivacyConsentModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useCloudStore } from '@/stores/cloud'
import { useWorkoutStore } from '@/stores/workout'

const authStore = useAuthStore()
const cloudStore = useCloudStore()
const workoutStore = useWorkoutStore()

const localSummary = computed(() => `${workoutStore.sessions.length} 次训练 · ${workoutStore.checkIns.length} 个打卡日`)
const cloudStatus = computed(() => {
  if (!cloudStore.state.enabled) return '未开启，训练记录默认仅保存在当前设备'
  if (!authStore.authenticated) return '已暂停，保存我的数据后可继续同步'
  if (cloudStore.state.lastError) return `上次同步失败：${cloudStore.state.lastError}`
  if (!cloudStore.state.lastSyncedAt) return '已开启，等待首次同步'
  const value = new Date(cloudStore.state.lastSyncedAt)
  return `上次同步 ${value.getMonth() + 1}/${value.getDate()} ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
})

onShow(() => {
  authStore.reload()
  cloudStore.reload()
  workoutStore.reload()
})

function showError(error: unknown) {
  uni.showToast({ title: error instanceof Error ? error.message : '操作失败，请稍后重试', icon: 'none', duration: 2600 })
}

function enableCloud() {
  uni.showModal({
    title: '开启云端备份？',
    content: '开启后会先请你确认隐私保护指引，再获取微信 OpenID 用户标识，用于保存和恢复训练偏好、已完成训练和打卡日期。',
    confirmText: '确认开启',
    confirmColor: '#758ddd',
    success(result) {
      if (!result.confirm) return
      void cloudStore.enable()
        .then(() => uni.showToast({ title: '云端备份已开启', icon: 'none' }))
        .catch(showError)
    },
    fail: showError,
  })
}

function syncNow() {
  void cloudStore.syncNow()
    .then(() => uni.showToast({ title: '同步完成', icon: 'none' }))
    .catch(showError)
}

function disableCloud() {
  uni.showModal({
    title: '关闭云端备份？',
    content: '当前设备仍会保留本地记录；服务器上的已有备份不会自动删除。',
    confirmText: '关闭备份',
    confirmColor: '#b7463b',
    success(result) {
      if (!result.confirm) return
      void cloudStore.disable()
        .then(() => uni.showToast({ title: '云端备份已关闭', icon: 'none' }))
        .catch(showError)
    },
  })
}

function stopCurrentDataSave() {
  uni.showModal({
    title: '停止当前云端保存？',
    content: '停止后仍可继续游客浏览，本机训练记录不会删除；再次保存云端数据时会重新确认隐私保护指引。',
    confirmText: '停止保存',
    confirmColor: '#b7463b',
    success(result) {
      if (!result.confirm) return
      void authStore.logout().then(() => uni.showToast({ title: '已停止云端保存', icon: 'none' })).catch(showError)
    },
  })
}

function resetLocalData() {
  uni.showModal({
    title: '清空本地训练记录？',
    content: '计划偏好会保留，当前设备的训练和打卡记录将无法恢复。云端已有备份不会随之删除。',
    confirmText: '清空本地',
    confirmColor: '#b7463b',
    success(result) {
      if (!result.confirm) return
      workoutStore.clearAll()
      uni.showToast({ title: '本地记录已清空', icon: 'none' })
    },
  })
}

function deleteCloudData() {
  uni.showModal({
    title: '清除我的全部云端历史数据？',
    content: '服务器上与你的微信 OpenID 用户标识关联的训练偏好、训练记录和打卡日期将永久删除；当前设备的本地数据会保留。',
    confirmText: '永久删除',
    confirmColor: '#b7463b',
    success(result) {
      if (!result.confirm) return
      const ensureIdentity = authStore.authenticated ? Promise.resolve() : cloudStore.enable().then(() => undefined)
      void ensureIdentity
        .then(() => cloudStore.deleteAccount())
        .then(() => { authStore.reload(); uni.showToast({ title: '云端数据已删除', icon: 'none' }) })
        .catch(showError)
    },
  })
}

function clearAllData() {
  uni.showModal({
    title: '清除我的全部本地及云端历史数据？',
    content: '本机训练记录会立即清空；若当前设备曾开启云端备份，也会删除服务器上的历史数据。此操作无法恢复。',
    confirmText: '全部清除',
    confirmColor: '#b7463b',
    success(result) {
      if (!result.confirm) return
      const hasCloudIdentity = cloudStore.state.enabled || authStore.authenticated
      const deleteRemote = hasCloudIdentity
        ? (authStore.authenticated ? cloudStore.deleteAccount() : cloudStore.enable().then(() => cloudStore.deleteAccount()))
        : Promise.resolve()
      void deleteRemote
        .then(() => {
          workoutStore.clearAll()
          authStore.reload()
          uni.showToast({ title: '全部历史数据已清除', icon: 'none' })
        })
        .catch(showError)
    },
  })
}
</script>

<template>
  <view class="secondary-page data-page">
    <view class="summary-card local-card">
      <view class="summary-icon local-icon"><AppIcon name="notebook" :size="25" /></view>
      <view class="summary-copy">
        <text class="summary-title">本地数据</text>
        <text class="summary-text">{{ localSummary }}</text>
        <text class="summary-note">无需授权，保存在当前设备</text>
      </view>
    </view>

    <view class="summary-card cloud-card">
      <view class="summary-icon cloud-icon"><AppIcon name="shield" :size="25" /></view>
      <view class="summary-copy">
        <text class="summary-title">云端备份</text>
        <text class="summary-text" :class="{ error: cloudStore.state.lastError }">{{ cloudStatus }}</text>
      </view>
    </view>

    <view class="action-card">
      <button v-if="!cloudStore.state.enabled" class="action-row" :disabled="cloudStore.busy" @tap="enableCloud">
        <view><text class="action-title">开启云端备份</text><text class="action-sub">主动确认隐私指引后保存我的数据</text></view>
        <AppIcon name="arrow-right" :size="20" muted />
      </button>
      <template v-else>
        <button class="action-row" :disabled="cloudStore.busy" @tap="syncNow">
          <view><text class="action-title success-title">{{ cloudStore.busy ? '同步中…' : '已是云端备份' }}</text><text class="action-sub">点击立即同步本机记录</text></view>
          <AppIcon name="arrows-clockwise" :size="21" muted />
        </button>
        <button class="action-row" :disabled="cloudStore.busy" @tap="disableCloud">
          <view><text class="action-title">关闭自动备份</text><text class="action-sub">已有云端数据仍会保留</text></view>
          <AppIcon name="arrow-right" :size="20" muted />
        </button>
      </template>
      <button v-if="authStore.authenticated" class="action-row last-row" :disabled="authStore.busy" @tap="stopCurrentDataSave">
        <view><text class="action-title">停止当前云端保存</text><text class="action-sub">回到游客状态，本机数据不受影响</text></view>
        <AppIcon name="arrow-right" :size="20" muted />
      </button>
    </view>

    <text class="section-label">删除与清理</text>
    <view class="action-card danger-card">
      <button class="action-row" @tap="resetLocalData">
        <view><text class="action-title danger-title">清空本地训练记录</text><text class="action-sub">保留训练计划偏好与云端备份</text></view>
        <AppIcon name="trash" :size="21" muted />
      </button>
      <button class="action-row" :disabled="cloudStore.busy" @tap="deleteCloudData">
        <view><text class="action-title danger-title">只清除云端历史数据</text><text class="action-sub">本机数据不会被删除</text></view>
        <AppIcon name="trash" :size="21" muted />
      </button>
      <button class="action-row last-row" :disabled="cloudStore.busy" @tap="clearAllData">
        <view><text class="action-title danger-title">清除我的全部本地及云端历史数据</text><text class="action-sub">训练记录与打卡日期将无法恢复</text></view>
        <AppIcon name="trash" :size="21" muted />
      </button>
    </view>

    <view class="data-note">
      <text>云端请求由服务端根据微信临时凭证识别 OpenID，前端不会传递或保存 OpenID 明文。</text>
    </view>
    <PrivacyConsentModal />
  </view>
</template>

<style scoped lang="scss">
.secondary-page { min-height: 100vh; padding: 34rpx 32rpx calc(60rpx + env(safe-area-inset-bottom)); background: $color-background; }
.summary-card { padding: 28rpx; display: flex; align-items: flex-start; gap: 22rpx; border: 1rpx solid $color-line; border-radius: 26rpx; background: rgba(255, 253, 248, .82); }
.cloud-card { margin-top: 18rpx; }
.summary-icon { width: 68rpx; height: 68rpx; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; border-radius: 20rpx; }
.local-icon { background: $color-primary-soft; color: $color-primary; }
.cloud-icon { background: $color-success-soft; color: $color-success; }
.summary-copy { min-width: 0; flex: 1; }
.summary-title, .summary-text, .summary-note, .action-title, .action-sub { display: block; }
.summary-title { color: $color-ink; font-size: 29rpx; font-weight: 700; }
.summary-text { margin-top: 9rpx; color: $color-ink; font-size: 23rpx; line-height: 1.55; }
.summary-note { margin-top: 6rpx; color: $color-muted; font-size: 21rpx; }
.error { color: $color-danger; }
.action-card { margin-top: 28rpx; padding: 0 26rpx; border: 1rpx solid $color-line; border-radius: 26rpx; background: rgba(255, 253, 248, .82); overflow: hidden; }
.action-row { width: 100%; min-height: 116rpx; display: flex; align-items: center; justify-content: space-between; gap: 20rpx; border-bottom: 1rpx solid $color-line; text-align: left; }
.action-row > view { min-width: 0; flex: 1; }
.last-row { border-bottom: 0; }
.action-title { color: $color-ink; font-size: 27rpx; font-weight: 700; }
.action-sub { margin-top: 8rpx; color: $color-muted; font-size: 21rpx; line-height: 1.45; }
.success-title { color: $color-success; }
.section-label { display: block; margin: 36rpx 6rpx 14rpx; color: $color-muted; font-size: 22rpx; letter-spacing: 2rpx; }
.danger-card { margin-top: 0; }
.danger-title { color: $color-danger; }
.action-row[disabled] { opacity: .55; }
.data-note { margin-top: 28rpx; padding: 24rpx 26rpx; border-left: 5rpx solid $color-success; background: rgba(255, 253, 248, .66); color: $color-muted; font-size: 21rpx; line-height: 1.75; }
</style>
