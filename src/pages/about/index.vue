<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
</script>

<template>
  <view class="secondary-page about-page">
    <view class="brand-card">
      <image class="brand-avatar" src="/static/brand/youjierxun-app-avatar.jpg" mode="aspectFill" />
      <view class="brand-copy">
        <text class="brand-name display-serif">由迹而寻</text>
        <text class="brand-slogan">随时随地，即刻开始训练</text>
      </view>
    </view>

    <view class="statement-card">
      <view class="statement-heading">
        <view class="heading-icon"><AppIcon name="shield" :size="22" /></view>
        <text>数据如何使用</text>
      </view>
      <text class="statement-copy">默认情况下，训练数据只保存在当前设备。只有你主动保存我的数据后，才会获取微信 OpenID 用户标识并上传训练偏好、已完成训练和打卡日期。</text>
      <text class="statement-copy">你可以随时关闭备份，或在“数据管理”中清除本地及云端历史数据。</text>
    </view>

    <view class="statement-card health-card">
      <view class="statement-heading">
        <view class="heading-icon health-icon"><AppIcon name="plant" :size="22" /></view>
        <text>健康提示</text>
      </view>
      <text class="statement-copy">由迹而寻提供一般健身与习惯培养信息，不替代医疗、康复或专业教练建议。</text>
      <text class="statement-copy">运动中如出现疼痛、胸闷或眩晕，请立即停止，并根据身体状况寻求专业帮助。</text>
    </view>

    <view class="statement-card copyright-card">
      <view class="statement-heading">
        <view class="heading-icon copyright-icon"><AppIcon name="notebook" :size="22" /></view>
        <text>版权说明</text>
      </view>
      <text class="statement-copy">银铃角色形象为独立原创绘制，创作灵感受到作品《Re：从零开始的异世界生活》爱蜜莉雅启发，本形象并非原作角色，与原作官方无关联、无授权合作。</text>
    </view>

    <text class="version">由迹而寻 v1.0.0</text>
  </view>
</template>

<style scoped lang="scss">
.secondary-page { min-height: 100vh; padding: 36rpx 32rpx calc(60rpx + env(safe-area-inset-bottom)); background: $color-background; }
.brand-card { padding: 30rpx; display: flex; align-items: center; gap: 24rpx; border-radius: 28rpx; background: linear-gradient(135deg, rgba(117, 141, 221, .14), rgba(145, 160, 128, .12)); }
.brand-avatar { width: 104rpx; height: 104rpx; flex: 0 0 auto; border: 3rpx solid rgba(255,255,255,.76); border-radius: 30rpx; box-shadow: 0 10rpx 26rpx rgba(16,43,76,.1); }
.brand-name, .brand-slogan { display: block; }
.brand-name { color: $color-ink; font-size: 42rpx; font-weight: 700; }
.brand-slogan { margin-top: 8rpx; color: $color-muted; font-size: 22rpx; }
.statement-card { margin-top: 24rpx; padding: 30rpx; border: 1rpx solid $color-line; border-radius: 26rpx; background: rgba(255, 253, 248, .78); }
.statement-heading { display: flex; align-items: center; gap: 16rpx; color: $color-ink; font-size: 29rpx; font-weight: 700; }
.heading-icon { width: 54rpx; height: 54rpx; display: flex; align-items: center; justify-content: center; border-radius: 17rpx; background: $color-primary-soft; }
.health-icon { background: $color-success-soft; }
.copyright-icon { background: rgba(223, 79, 63, .1); }
.statement-copy { display: block; margin-top: 20rpx; color: $color-muted; font-size: 23rpx; line-height: 1.82; }
.version { display: block; margin-top: 34rpx; color: #a1a19d; text-align: center; font-size: 20rpx; }
</style>
