<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import { useAuthStore } from '@/stores/auth'
import { useCloudStore } from '@/stores/cloud'
import { useProfileStore } from '@/stores/profile'
import { localStorageAdapter, storageKeys } from '@/services/storage'
import { navigateToSafe } from '@/utils/navigation'

declare const wx: any

const authStore = useAuthStore()
const cloudStore = useCloudStore()
const profileStore = useProfileStore()
const localSignature = ref('')

const goalLabel = computed(() => ({ habit: '建立习惯', fatLoss: '减脂体能', strength: '基础力量' }[profileStore.profile.goal]))
const equipmentLabel = computed(() => ({ bodyweight: '无器械', dumbbell: '哑铃', band: '弹力带' }[profileStore.profile.equipment]))
const avatarUrl = computed(() => authStore.account?.avatarUrl || '/static/brand/youjierxun-app-avatar.jpg')
const displayName = computed(() => authStore.account?.displayName || '游客训练者')
const profileSummary = computed(() => localSignature.value || (authStore.authenticated ? '已允许保存云端数据' : '游客模式，可正常浏览和本机记录'))
const cloudSummary = computed(() => {
  if (!cloudStore.state.enabled) return '当前仅保存在本机'
  if (!authStore.authenticated) return '云端备份已暂停'
  return cloudStore.state.lastError ? '上次同步未完成' : '已是云端备份'
})

onShow(() => {
  authStore.reload()
  cloudStore.reload()
  localSignature.value = localStorageAdapter.get(storageKeys.accountSignature, '')
})

function goAccountSettings() { navigateToSafe('/pages/account/settings') }
function goDataSettings() { navigateToSafe('/pages/data/settings') }
function goAbout() { navigateToSafe('/pages/about/index') }
function editPlan() { navigateToSafe('/pages/onboarding/index') }

function goPrivacy() {
  // #ifdef MP-WEIXIN
  wx.navigateTo({ url: '/pages/privacy/privacy' })
  // #endif
  // #ifndef MP-WEIXIN
  uni.navigateTo({ url: '/pages/privacy/privacy' })
  // #endif
}
</script>

<template>
  <view class="page-shell profile-page">
    <text class="eyebrow">你的节奏，由你决定</text>
    <text class="page-title display-serif">我的训练</text>

    <button class="profile-card" hover-class="row-pressed" @tap="goAccountSettings">
      <image class="avatar" :src="avatarUrl" mode="aspectFill" aria-label="由迹而寻训练伙伴头像" />
      <view class="profile-main">
        <text class="profile-name">{{ displayName }}</text>
        <text class="profile-sub">{{ profileSummary }} · {{ goalLabel }}</text>
      </view>
      <AppIcon name="arrow-right" :size="20" muted />
    </button>

    <view class="settings-card">
      <button class="setting-row" hover-class="row-pressed" @tap="goAccountSettings">
        <view class="setting-copy">
          <text class="setting-title">账号设置</text>
          <text class="setting-sub">头像、昵称与个性签名</text>
        </view>
        <AppIcon name="arrow-right" :size="20" muted />
      </button>

      <button class="setting-row" hover-class="row-pressed" @tap="editPlan">
        <view class="setting-copy">
          <text class="setting-title">训练计划偏好</text>
          <text class="setting-sub">{{ equipmentLabel }} · {{ profileStore.profile.durationMinutes }} 分钟</text>
        </view>
        <AppIcon name="arrow-right" :size="20" muted />
      </button>

      <button class="setting-row" hover-class="row-pressed" @tap="goDataSettings">
        <view class="setting-copy">
          <text class="setting-title">数据管理</text>
          <text class="setting-sub">{{ cloudSummary }}</text>
        </view>
        <AppIcon name="arrow-right" :size="20" muted />
      </button>

      <button class="setting-row" hover-class="row-pressed" @tap="goAbout">
        <view class="setting-copy">
          <text class="setting-title">关于与声明</text>
          <text class="setting-sub">数据使用、健康提示与版权说明</text>
        </view>
        <AppIcon name="arrow-right" :size="20" muted />
      </button>

      <button class="setting-row last-row" hover-class="row-pressed" @tap="goPrivacy">
        <view class="setting-copy">
          <text class="setting-title">隐私协议</text>
          <text class="setting-sub">查看由迹而寻隐私保护指引</text>
        </view>
        <AppIcon name="arrow-right" :size="20" muted />
      </button>
    </view>

    <text class="version">由迹而寻 v1.0.0</text>
    <AppTabBar active="profile" />
  </view>
</template>

<style scoped lang="scss">
.profile-page { padding-top: 58rpx; }
.page-title { display: block; margin-top: 14rpx; font-size: 66rpx; font-weight: 700; }
.profile-card {
  width: 100%; margin-top: 46rpx; padding: 0 0 38rpx; display: flex; align-items: center; gap: 24rpx;
  border-bottom: 1rpx solid $color-line; text-align: left;
}
.avatar {
  width: 96rpx; height: 96rpx; flex: 0 0 auto; border: 2rpx solid rgba(117, 141, 221, .28);
  border-radius: 26rpx; background: $color-surface; box-shadow: 0 8rpx 22rpx rgba(16, 43, 76, .1);
}
.profile-main, .setting-copy { min-width: 0; flex: 1; }
.profile-name, .profile-sub, .setting-title, .setting-sub { display: block; }
.profile-name { color: $color-ink; font-size: 31rpx; font-weight: 700; }
.profile-sub { margin-top: 9rpx; color: $color-muted; font-size: 23rpx; line-height: 1.45; }
.settings-card {
  margin-top: 30rpx; padding: 0 26rpx; overflow: hidden; border: 1rpx solid $color-line;
  border-radius: 26rpx; background: rgba(255, 253, 248, .72);
}
.setting-row {
  width: 100%; min-height: 118rpx; display: flex; align-items: center; justify-content: space-between;
  gap: 18rpx; text-align: left; border-bottom: 1rpx solid $color-line;
}
.last-row { border-bottom: 0; }
.setting-title { color: $color-ink; font-size: 28rpx; font-weight: 700; }
.setting-sub { margin-top: 8rpx; color: $color-muted; font-size: 22rpx; line-height: 1.45; }
.row-pressed { opacity: .64; background: rgba(117, 141, 221, .06); }
.version { display: block; margin-top: 36rpx; color: #a1a19d; text-align: center; font-size: 20rpx; }
</style>
