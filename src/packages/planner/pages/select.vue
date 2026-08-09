<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon.vue'
import { useProfileStore } from '@/stores/profile'
import { useWorkoutStore } from '@/stores/workout'
import { buildFocusPlan, trainingAreaOptions } from '../utils/plan-builder'
import { getCustomPageTopInset } from '@/utils/platform'
import type { TrainingArea } from '@/types/domain'

const profileStore = useProfileStore()
const workoutStore = useWorkoutStore()
const selectedAreas = ref<TrainingArea[]>([])
const pageTopInset = ref(getCustomPageTopInset())
const selectionCount = computed(() => selectedAreas.value.length)
const emotion = computed(() => selectionCount.value >= 5 ? 'surprised' : selectionCount.value === 4 ? 'worried' : 'calm')
const characterImage = computed(() => `/packages/planner/static/yinling-board-${emotion.value}.jpg`)
const feedback = computed(() => {
  if (!selectionCount.value) return '可以多选，先从一两个部位开始吧'
  if (selectionCount.value === 1) return '专注一点，也很好。'
  if (selectionCount.value === 2) return '这个组合很适合今天。'
  if (selectionCount.value === 3) return '刚刚好，我会帮你排好顺序。'
  if (selectionCount.value === 4) return '挑战难度会不会太大了？！'
  return '真的要选这么多吗？！'
})
const previewPlan = computed(() => {
  if (!selectionCount.value) return null
  return buildFocusPlan(profileStore.profile, selectedAreas.value)
})

onLoad((query) => {
  profileStore.reload()
  pageTopInset.value = query?.wechat === '1' ? 102 : getCustomPageTopInset()
})

function toggleArea(area: TrainingArea) {
  selectedAreas.value = selectedAreas.value.includes(area)
    ? selectedAreas.value.filter((item) => item !== area)
    : [...selectedAreas.value, area]
}

function goBack() {
  uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/today/index' }) })
}

function beginWorkout() {
  if (!previewPlan.value) {
    uni.showToast({ title: '先选一个想练的部位吧', icon: 'none' })
    return
  }
  workoutStore.startPlan(previewPlan.value)
  const root = previewPlan.value.equipment === 'bodyweight' ? 'workout-bodyweight' : 'workout-equipment'
  uni.redirectTo({ url: `/packages/${root}/pages/session?planId=${previewPlan.value.id}` })
}
</script>

<template>
  <view class="selection-page" :style="{ paddingTop: `${pageTopInset}px` }">
    <view class="selection-topbar">
      <button class="back-button" aria-label="返回今日首页" @tap="goBack"><AppIcon name="arrow-left" :size="22" /></button>
      <view class="topbar-copy">
        <text class="topbar-kicker">由迹而寻</text>
        <text class="topbar-title">安排今天的训练</text>
      </view>
      <text class="step-count">01 / 02</text>
    </view>

    <view class="character-window" :class="`is-${emotion}`">
      <image :src="characterImage" mode="widthFix" :aria-label="`银铃${emotion === 'calm' ? '微笑' : emotion === 'worried' ? '担心' : '惊讶'}地举着告示牌`" />
      <view class="board-copy">
        <text class="board-question display-serif">今天想做点什么？</text>
        <text class="board-feedback">{{ feedback }}</text>
      </view>
    </view>

    <view class="choice-heading">
      <view>
        <text class="choice-kicker">可多选</text>
        <text class="choice-title display-serif">挑选训练部位</text>
      </view>
      <text class="selected-count">已选择 {{ selectionCount }} / {{ trainingAreaOptions.length }}</text>
    </view>

    <view class="choice-grid">
      <button
        v-for="option in trainingAreaOptions"
        :key="option.id"
        class="area-option"
        :class="{ selected: selectedAreas.includes(option.id) }"
        :aria-pressed="selectedAreas.includes(option.id)"
        @tap="toggleArea(option.id)"
      >
        <view class="option-copy">
          <text class="option-label">{{ option.label }}</text>
          <text class="option-description">{{ option.description }}</text>
        </view>
        <AppIcon :name="selectedAreas.includes(option.id) ? 'check-circle' : 'circle'" :size="23" />
      </button>
    </view>

    <view v-if="previewPlan" class="plan-preview" :class="{ caution: selectionCount >= 4 }">
      <AppIcon :name="selectionCount >= 4 ? 'sun-horizon' : 'plant'" :size="28" />
      <view>
        <text class="preview-title">{{ previewPlan.title }}</text>
        <text class="preview-meta">预计 {{ previewPlan.exerciseIds.length }} 个动作 · {{ previewPlan.durationMinutes }} 分钟</text>
      </view>
    </view>

    <view class="selection-footer">
      <button class="primary-button confirm-button" :class="{ disabled: !selectionCount }" @tap="beginWorkout">
        <text>{{ selectionCount ? '按这个组合开始' : '先选择训练部位' }}</text>
        <AppIcon name="arrow-right" :size="23" />
      </button>
      <text class="footer-note">仅展示当前器械条件下可安全编排的训练部位</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.selection-page { min-height: 100vh; padding-right: 28rpx; padding-bottom: calc(190rpx + env(safe-area-inset-bottom)); padding-left: 28rpx; background: $color-background; }
.selection-topbar { min-height: 82rpx; display: grid; grid-template-columns: 70rpx 1fr auto; gap: 18rpx; align-items: center; }
.back-button { width: 66rpx; height: 66rpx; display: flex; align-items: center; justify-content: center; border: 1rpx solid $color-line; border-radius: 21rpx; background: rgba(255, 253, 248, .74); }
.topbar-kicker,.topbar-title { display: block; }
.topbar-kicker { color: $color-accent; font-size: 18rpx; font-weight: 700; letter-spacing: 2rpx; }
.topbar-title { margin-top: 3rpx; color: $color-ink; font-size: 25rpx; font-weight: 700; }
.step-count { color: $color-muted; font-size: 19rpx; font-variant-numeric: tabular-nums; }
.character-window { position: relative; margin-top: 20rpx; overflow: hidden; border: 1rpx solid rgba(16, 43, 76, .08); border-radius: 30rpx; background: #fffaf0; box-shadow: 0 16rpx 38rpx rgba(16, 43, 76, .08); transition: box-shadow .2s ease; }
.character-window.is-worried { box-shadow: 0 16rpx 38rpx rgba(223, 79, 63, .11); }
.character-window.is-surprised { box-shadow: 0 16rpx 40rpx rgba(117, 141, 221, .16); }
.character-window>image { display: block; width: 100%; }
.board-copy { position: absolute; left: 24%; right: 24%; top: 60.5%; display: flex; flex-direction: column; align-items: center; text-align: center; pointer-events: none; }
.board-question { color: $color-ink; font-size: 29rpx; line-height: 1.2; font-weight: 700; white-space: nowrap; }
.board-feedback { margin-top: 7rpx; color: $color-muted; font-size: 18rpx; line-height: 1.25; white-space: nowrap; }
.is-worried .board-feedback,.is-surprised .board-feedback { color: $color-accent; font-weight: 700; }
.choice-heading { margin: 42rpx 4rpx 0; display: flex; align-items: flex-end; justify-content: space-between; }
.choice-kicker,.choice-title { display: block; }
.choice-kicker { color: $color-accent; font-size: 19rpx; font-weight: 700; letter-spacing: 3rpx; }
.choice-title { margin-top: 5rpx; color: $color-ink; font-size: 38rpx; font-weight: 700; }
.selected-count { color: $color-primary; font-size: 22rpx; font-weight: 700; }
.choice-grid { margin-top: 24rpx; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16rpx; }
.area-option { min-height: 112rpx; padding: 20rpx 18rpx; display: flex; align-items: center; justify-content: space-between; gap: 12rpx; border: 1rpx solid $color-line; border-radius: 24rpx; background: rgba(255, 253, 248, .7); text-align: left; transition: transform .15s ease, border-color .15s ease, background .15s ease; }
.area-option.selected { border-color: rgba(117, 141, 221, .56); background: $color-primary-soft; color: $color-primary; transform: translateY(-2rpx); }
.option-copy { min-width: 0; }
.option-label,.option-description { display: block; }
.option-label { color: $color-ink; font-size: 25rpx; font-weight: 700; }
.selected .option-label { color: $color-primary; }
.option-description { margin-top: 6rpx; overflow: hidden; color: $color-muted; font-size: 18rpx; text-overflow: ellipsis; white-space: nowrap; }
.plan-preview { margin-top: 24rpx; padding: 22rpx 24rpx; display: flex; align-items: center; gap: 18rpx; border-left: 5rpx solid $color-success; background: $color-success-soft; color: #4d5a49; }
.plan-preview.caution { border-left-color: $color-accent; background: rgba(223, 79, 63, .08); color: $color-accent; }
.preview-title,.preview-meta { display: block; }
.preview-title { font-size: 23rpx; font-weight: 700; }
.preview-meta { margin-top: 5rpx; opacity: .74; font-size: 19rpx; }
.selection-footer { position: fixed; z-index: 20; right: 0; bottom: 0; left: 0; padding: 20rpx 32rpx calc(22rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid $color-line; background: rgba(247, 243, 234, .96); backdrop-filter: blur(16px); }
.confirm-button { margin: 0 auto; max-width: 686rpx; }
.confirm-button.disabled { opacity: .42; }
.footer-note { display: block; margin-top: 10rpx; color: $color-muted; text-align: center; font-size: 18rpx; }
@media (max-height: 760px) {
  .character-window { margin-top: 12rpx; }
  .choice-heading { margin-top: 28rpx; }
}
</style>
