<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import {
  cancelPrivacyConsent,
  confirmPrivacyConsent,
  openPrivacyContract,
  privacyAgreeButtonId,
  privacyDialogState,
} from '@/services/privacy-consent'

function updateChecked(event: { detail?: { value?: string[] } }) {
  privacyDialogState.checked = Boolean(event.detail?.value?.length)
}
</script>

<template>
  <view v-if="privacyDialogState.visible" class="privacy-mask">
    <view class="privacy-modal">
      <view class="privacy-hero">
        <AppIcon name="shield" :size="34" />
        <text class="privacy-kicker">保存我的历史记录</text>
      </view>
      <text class="privacy-title display-serif">先确认数据使用方式</text>
      <text class="privacy-copy">由迹而寻会在你主动保存数据时获取微信 OpenID 用户标识，用于区分你的云端训练记录。未保存时可以继续游客浏览。</text>
      <button class="contract-button" @tap="openPrivacyContract">查看《{{ privacyDialogState.contractName }}》</button>
      <label class="agree-row">
        <checkbox-group @change="updateChecked">
          <checkbox class="agree-check" value="accepted" :checked="privacyDialogState.checked" color="#758ddd" />
        </checkbox-group>
        <text>我已阅读并同意隐私保护指引</text>
      </label>
      <view class="privacy-actions">
        <button class="cancel-button" :disabled="privacyDialogState.busy" @tap="cancelPrivacyConsent">暂不保存</button>
        <button
          :id="privacyAgreeButtonId"
          class="confirm-button"
          open-type="agreePrivacyAuthorization"
          :disabled="privacyDialogState.busy || !privacyDialogState.checked"
          @agreeprivacyauthorization="confirmPrivacyConsent"
        >
          {{ privacyDialogState.busy ? '处理中…' : '同意并继续' }}
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.privacy-mask { position: fixed; z-index: 9999; inset: 0; padding: 52rpx 38rpx; display: flex; align-items: center; justify-content: center; background: rgba(16, 43, 76, .34); }
.privacy-modal { width: 100%; max-width: 640rpx; padding: 34rpx 32rpx 30rpx; border: 1rpx solid rgba(16,43,76,.08); border-radius: 28rpx; background: $color-background; box-shadow: 0 28rpx 80rpx rgba(16,43,76,.18); }
.privacy-hero { display: flex; align-items: center; gap: 16rpx; color: $color-primary; }
.privacy-kicker { color: $color-accent; font-size: 22rpx; font-weight: 700; }
.privacy-title { display: block; margin-top: 22rpx; color: $color-ink; font-size: 42rpx; font-weight: 700; line-height: 1.25; }
.privacy-copy { display: block; margin-top: 18rpx; color: $color-muted; font-size: 24rpx; line-height: 1.75; }
.contract-button { margin-top: 22rpx; min-height: 68rpx; border: 1rpx solid rgba(117,141,221,.35); border-radius: 18rpx; color: $color-primary; font-size: 24rpx; font-weight: 700; }
.agree-row { margin-top: 24rpx; display: flex; align-items: center; gap: 14rpx; color: $color-ink; font-size: 23rpx; line-height: 1.5; }
.agree-check { transform: scale(.82); transform-origin: left center; }
.privacy-actions { margin-top: 30rpx; display: grid; grid-template-columns: 1fr 1.25fr; gap: 16rpx; }
.cancel-button,.confirm-button { min-height: 76rpx; border-radius: 20rpx; font-size: 25rpx; font-weight: 700; }
.cancel-button { border: 1rpx solid $color-line; color: $color-muted; }
.confirm-button { background: $color-primary; color: #fff; }
.confirm-button[disabled],.cancel-button[disabled] { opacity: .55; }
</style>
