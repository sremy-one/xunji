<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon.vue'
import { exerciseRepository } from '@/services/repositories'

const id = ref('')
const showAnimation = ref(false)
const animationFailed = ref(false)
const exercise = computed(() => exerciseRepository.getById(id.value))
const animationSource = computed(() => exercise.value ? `/packages/library/static/gifs/${exercise.value.id}.gif` : '')
const mediaSource = computed(() => {
  if (!exercise.value) return ''
  return showAnimation.value && !animationFailed.value ? animationSource.value : exercise.value.image
})
onLoad((query) => { id.value = query?.id || '' })
function goBack() { uni.navigateBack({ fail: () => uni.redirectTo({ url: '/packages/library/pages/index' }) }) }
function toggleAnimation() {
  animationFailed.value = false
  showAnimation.value = !showAnimation.value
}
function handleMediaError(event: unknown) {
  if (!showAnimation.value || !exercise.value) return
  console.warn('[exercise-media] library animation failed', exercise.value.id, event)
  animationFailed.value = true
  showAnimation.value = false
  uni.showToast({ title: '动态示范加载失败，已显示动作图', icon: 'none' })
}
</script>

<template>
  <view v-if="exercise" class="detail-page">
    <view class="topbar"><button aria-label="返回" @tap="goBack"><AppIcon name="arrow-left" :size="25" /></button><text>动作详情</text><view class="spacer" /></view>
    <view class="media-stage">
      <image class="stage-background" src="/static/training/training-stage-environment-v1.jpg" mode="aspectFill" aria-hidden="true" />
      <image class="exercise-media" :src="mediaSource" mode="aspectFit" :aria-label="`${exercise.nameZh}动作示范`" @error="handleMediaError" />
      <button v-if="exercise.gif" class="animation-toggle" @tap="toggleAnimation"><AppIcon :name="showAnimation ? 'pause' : 'play'" :size="18" />{{ showAnimation ? '暂停动态示范' : '查看动态示范' }}</button>
    </view>
    <view class="content">
      <text class="eyebrow">{{ exercise.categoryZh }} · {{ exercise.muscleText }}</text>
      <text class="title display-serif">{{ exercise.nameZh }}</text>
      <text class="english-name">{{ exercise.name }}</text>
      <view class="prescription"><view><text>建议</text><strong>{{ exercise.defaultSets }} 组</strong></view><view><text>每组</text><strong>{{ exercise.mode === 'time' ? `${exercise.defaultSeconds} 秒` : `${exercise.defaultReps} 次` }}</strong></view><view><text>器械</text><strong>{{ exercise.equipmentZh }}</strong></view></view>
      <view class="section"><text class="section-heading">动作步骤</text><view v-for="(step, index) in exercise.stepsZh" :key="index" class="step"><text class="step-number">{{ index + 1 }}</text><text>{{ step }}</text></view></view>
      <view class="safety"><AppIcon name="shield" :size="25" /><text>{{ exercise.safetyNote }}</text></view>
      <text class="attribution">{{ exercise.attribution }} · 动画为原创角色示范，不替代专业动作指导</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.detail-page { min-height: 100vh; background: $color-background; }
.topbar { height: 104rpx; padding: 18rpx 30rpx; display: flex; align-items: center; justify-content: space-between; font-weight: 700; }
.topbar button,.spacer { width: 68rpx; height: 68rpx; display: flex; align-items: center; justify-content: center; }
.media-stage { position: relative; height: 550rpx; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #f7f2e8; border-top: 1rpx solid $color-line; border-bottom: 1rpx solid $color-line; }
.stage-background { position: absolute; z-index: 0; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; }
.exercise-media { position: relative; z-index: 1; width: 470rpx; height: 470rpx; }
.animation-toggle { position: absolute; z-index: 2; right: 28rpx; bottom: 24rpx; min-height: 64rpx; padding: 0 20rpx; display: flex; align-items: center; gap: 10rpx; border-radius: 20rpx; background: $color-primary; color: #fff; font-size: 22rpx; }
.content { padding: 44rpx 34rpx 80rpx; }
.title { display: block; margin-top: 15rpx; font-size: 54rpx; line-height: 1.25; font-weight: 700; }
.english-name { display: block; margin-top: 10rpx; color: $color-muted; font-size: 22rpx; }
.prescription { margin-top: 38rpx; padding: 28rpx 0; display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1rpx solid $color-line; border-bottom: 1rpx solid $color-line; }
.prescription>view { text-align: center; border-right: 1rpx solid $color-line; }
.prescription>view:last-child { border-right: 0; }
.prescription text,.prescription strong { display: block; }
.prescription text { color: $color-muted; font-size: 20rpx; }
.prescription strong { margin-top: 8rpx; font-size: 27rpx; }
.section { margin-top: 48rpx; }
.step { display: grid; grid-template-columns: 48rpx 1fr; gap: 16rpx; margin-top: 26rpx; line-height: 1.75; color: #30445c; }
.step-number { width: 44rpx; height: 44rpx; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: $color-primary-soft; color: $color-primary; font-weight: 700; }
.safety { margin-top: 42rpx; padding: 24rpx; display: flex; align-items: flex-start; gap: 16rpx; border-left: 5rpx solid $color-success; background: $color-success-soft; color: #4d5a49; line-height: 1.7; font-size: 23rpx; }
.attribution { display: block; margin-top: 30rpx; color: #999993; text-align: center; font-size: 19rpx; }
</style>
