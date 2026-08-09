<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { updateAccountProfile, uploadAccountAvatar } from '@/api/account'
import AppIcon from '@/components/AppIcon.vue'
import PrivacyConsentModal from '@/components/PrivacyConsentModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useCloudStore } from '@/stores/cloud'
import { localStorageAdapter, storageKeys } from '@/services/storage'

type EditableField = 'nickname' | 'bio' | null

const authStore = useAuthStore()
const cloudStore = useCloudStore()
const editingField = ref<EditableField>(null)
const nickname = ref('')
const bio = ref('')
const avatarPreview = ref('')

onShow(() => {
  authStore.reload()
  cloudStore.reload()
  nickname.value = authStore.account?.displayName || ''
  bio.value = localStorageAdapter.get(storageKeys.accountSignature, '')
  avatarPreview.value = authStore.account?.avatarUrl || ''
})

function showError(error: unknown) {
  uni.showToast({ title: error instanceof Error ? error.message : '操作失败，请稍后重试', icon: 'none', duration: 2600 })
}

function edit(field: Exclude<EditableField, null>) {
  editingField.value = field
}

function ensureCloudSaving() {
  return cloudStore.state.enabled && authStore.authenticated ? cloudStore.syncNow() : cloudStore.enable()
}

function readAvatarFile(filePath: string) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.getFileSystemManager().readFile({
      filePath,
      success(result) { resolve(result.data as ArrayBuffer) },
      fail(error) { reject(new Error(error.errMsg || '头像读取失败')) },
    })
    // #endif
    // #ifndef MP-WEIXIN
    reject(new Error('头像保存需要在微信小程序中使用'))
    // #endif
  })
}

function avatarContentType(filePath: string) {
  return filePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
}

function chooseAvatar(event: { detail?: { avatarUrl?: string } }) {
  const filePath = event.detail?.avatarUrl
  if (!filePath) return
  const previous = avatarPreview.value
  avatarPreview.value = filePath
  void ensureCloudSaving()
    .then(() => readAvatarFile(filePath))
    .then((data) => uploadAccountAvatar(data, avatarContentType(filePath)))
    .then(({ account }) => {
      authStore.updateAccount(account)
      avatarPreview.value = account.avatarUrl || filePath
      uni.showToast({ title: '头像已保存', icon: 'none' })
    })
    .catch((error) => {
      avatarPreview.value = previous
      showError(error)
    })
}

function saveProfile() {
  const displayName = nickname.value.trim()
  const signature = bio.value.trim()
  if (displayName.length > 20) {
    uni.showToast({ title: '昵称最多 20 个字', icon: 'none' })
    return
  }
  if (signature.length > 40) {
    uni.showToast({ title: '个性签名最多 40 个字', icon: 'none' })
    return
  }

  localStorageAdapter.set(storageKeys.accountSignature, signature)
  void ensureCloudSaving()
    .then(() => updateAccountProfile({ displayName: displayName || '训练伙伴' }))
    .then(({ account }) => {
      authStore.updateAccount(account)
      nickname.value = account.displayName
      editingField.value = null
      uni.showToast({ title: '我的数据已保存', icon: 'none' })
    })
    .catch(showError)
}
</script>

<template>
  <view class="secondary-page account-page">
    <view class="intro-card">
      <text class="intro-kicker">只展示你愿意留下的内容</text>
      <text class="intro-title display-serif">我的个人信息</text>
      <text class="intro-copy">点击任意一行即可编辑。头像、昵称和签名均为可选内容，仅在你主动保存后上传。</text>
    </view>

    <view class="info-list">
      <button class="info-row avatar-row" open-type="chooseAvatar" hover-class="row-pressed" @chooseavatar="chooseAvatar">
        <view class="row-label">
          <text class="label">头像</text>
          <text class="hint">点击选择新头像</text>
        </view>
        <view class="row-value">
          <image class="avatar" :src="avatarPreview || '/static/brand/youjierxun-app-avatar.jpg'" mode="aspectFill" />
          <AppIcon name="arrow-right" :size="19" muted />
        </view>
      </button>

      <view class="info-row" hover-class="row-pressed" @tap="edit('nickname')">
        <view class="row-label">
          <text class="label">昵称</text>
          <text class="hint">点击编辑昵称</text>
        </view>
        <view class="editable-value">
          <input
            v-if="editingField === 'nickname'"
            v-model="nickname"
            class="row-input"
            type="nickname"
            maxlength="20"
            :focus="true"
            placeholder="填写昵称"
            @tap.stop
          />
          <text v-else class="value-text" :class="{ placeholder: !nickname }">{{ nickname || '未填写' }}</text>
          <AppIcon name="arrow-right" :size="19" muted />
        </view>
      </view>

      <view class="info-row last-row" hover-class="row-pressed" @tap="edit('bio')">
        <view class="row-label">
          <text class="label">个性签名</text>
          <text class="hint">点击写下训练态度（仅本机）</text>
        </view>
        <view class="editable-value">
          <input
            v-if="editingField === 'bio'"
            v-model="bio"
            class="row-input signature-input"
            type="text"
            maxlength="40"
            :focus="true"
            placeholder="例如：慢慢来，持续就好。"
            @tap.stop
          />
          <text v-else class="value-text signature" :class="{ placeholder: !bio }">{{ bio || '未填写' }}</text>
          <AppIcon name="arrow-right" :size="19" muted />
        </view>
      </view>
    </view>

    <view class="privacy-note">
      <AppIcon name="shield" :size="22" muted />
      <text>头像临时地址约 2 小时有效，选择后会上传至由迹而寻服务器转存；个性签名仅保存在当前设备。首次保存前会先征得你的隐私授权。</text>
    </view>

    <button class="primary-button save-button" :disabled="cloudStore.busy" @tap="saveProfile">
      {{ cloudStore.busy ? '保存中…' : '保存我的数据' }}
    </button>
    <PrivacyConsentModal />
  </view>
</template>

<style scoped lang="scss">
.secondary-page { min-height: 100vh; padding: 38rpx 32rpx calc(60rpx + env(safe-area-inset-bottom)); background: $color-background; }
.intro-card { padding: 32rpx 30rpx; border-radius: 28rpx; background: rgba(117, 141, 221, .1); }
.intro-kicker, .intro-title, .intro-copy { display: block; }
.intro-kicker { color: $color-accent; font-size: 22rpx; font-weight: 700; letter-spacing: 1rpx; }
.intro-title { margin-top: 12rpx; color: $color-ink; font-size: 44rpx; font-weight: 700; }
.intro-copy { margin-top: 16rpx; color: $color-muted; font-size: 23rpx; line-height: 1.7; }
.info-list { margin-top: 30rpx; padding: 0 26rpx; border: 1rpx solid $color-line; border-radius: 28rpx; background: rgba(255, 253, 248, .82); overflow: hidden; }
.info-row { width: 100%; min-height: 130rpx; display: flex; align-items: center; justify-content: space-between; gap: 24rpx; border-bottom: 1rpx solid $color-line; text-align: left; }
.avatar-row { padding: 0; }
.last-row { border-bottom: 0; }
.row-label { width: 220rpx; flex: 0 0 auto; }
.label, .hint { display: block; }
.label { color: $color-ink; font-size: 28rpx; font-weight: 700; }
.hint { margin-top: 8rpx; color: $color-muted; font-size: 21rpx; }
.row-value, .editable-value { min-width: 0; flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 14rpx; }
.avatar { width: 78rpx; height: 78rpx; border: 2rpx solid rgba(117, 141, 221, .28); border-radius: 22rpx; background: #fff; }
.value-text { max-width: 250rpx; color: $color-ink; font-size: 24rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.value-text.signature { max-width: 270rpx; }
.placeholder { color: #a6a9ad; }
.row-input { width: 230rpx; min-height: 70rpx; padding: 0 18rpx; border: 2rpx solid rgba(117, 141, 221, .32); border-radius: 16rpx; background: #fffdf8; color: $color-ink; font-size: 24rpx; }
.signature-input { width: 280rpx; }
.privacy-note { margin-top: 26rpx; padding: 24rpx 26rpx; display: flex; align-items: flex-start; gap: 16rpx; border-left: 5rpx solid $color-success; background: rgba(255, 253, 248, .66); color: $color-muted; font-size: 21rpx; line-height: 1.7; }
.save-button { width: 100%; margin-top: 30rpx; }
.save-button[disabled] { opacity: .58; }
.row-pressed { opacity: .66; background: rgba(117, 141, 221, .06); }
</style>
