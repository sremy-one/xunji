<script setup lang="ts">
import { reactive } from 'vue'
import { useProfileStore } from '@/stores/profile'
import type { EquipmentProfile, TrainingGoal, UserProfile } from '@/types/domain'

const store = useProfileStore()
const form = reactive<UserProfile>({ ...store.profile })
const goals: { value: TrainingGoal; label: string; note: string }[] = [
  { value: 'habit', label: '建立习惯', note: '轻量开始，稳稳坚持' },
  { value: 'fatLoss', label: '减脂体能', note: '提升心肺与活动量' },
  { value: 'strength', label: '基础力量', note: '循序渐进建立力量' },
]
const equipments: { value: EquipmentProfile; label: string }[] = [
  { value: 'bodyweight', label: '无器械' }, { value: 'dumbbell', label: '哑铃' }, { value: 'band', label: '弹力带' },
]

function submit() {
  store.save({ ...form, onboardingComplete: true })
  uni.showToast({ title: '计划已准备好', icon: 'success' })
  setTimeout(() => uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/today/index' }) }), 450)
}
</script>

<template>
  <view class="onboarding page-shell">
    <text class="eyebrow">开始你的第一小步</text>
    <text class="title display-serif">给自己一份\n刚刚好的计划</text>
    <text class="intro">不用追求完美。告诉我们你现在的状态，由迹而寻会匹配一套可解释的新手计划。</text>

    <view class="question">
      <text class="question-title">你最想先做到什么？</text>
      <button v-for="item in goals" :key="item.value" class="option-row" :class="{ selected: form.goal === item.value }" @tap="form.goal = item.value">
        <view><text class="option-label">{{ item.label }}</text><text class="option-note">{{ item.note }}</text></view><view class="radio" />
      </button>
    </view>

    <view class="question">
      <text class="question-title">你手边有什么器械？</text>
      <view class="chips"><button v-for="item in equipments" :key="item.value" class="chip" :class="{ selected: form.equipment === item.value }" @tap="form.equipment = item.value">{{ item.label }}</button></view>
    </view>

    <view class="question two-columns">
      <view><text class="question-title">单次时长</text><view class="chips compact"><button v-for="n in [15, 20, 30]" :key="n" class="chip" :class="{ selected: form.durationMinutes === n }" @tap="form.durationMinutes = n as 15 | 20 | 30">{{ n }} 分钟</button></view></view>
      <view><text class="question-title">每周频次</text><view class="chips compact"><button v-for="n in [3, 4, 5]" :key="n" class="chip" :class="{ selected: form.daysPerWeek === n }" @tap="form.daysPerWeek = n as 3 | 4 | 5">{{ n }} 天</button></view></view>
    </view>

    <view class="notice">本计划仅用于一般健身与习惯培养，不替代医疗或康复建议。疼痛、胸闷或眩晕时请立即停止运动。</view>
    <button class="primary-button" @tap="submit">生成我的计划</button>
  </view>
</template>

<style scoped lang="scss">
.onboarding { padding-top: 38rpx; }
.title { display: block; margin-top: 24rpx; font-size: 62rpx; line-height: 1.22; font-weight: 700; white-space: pre-line; }
.intro { display: block; margin-top: 28rpx; color: $color-muted; line-height: 1.8; }
.question { margin-top: 48rpx; }
.question-title { display: block; margin-bottom: 20rpx; font-size: 29rpx; font-weight: 700; }
.option-row { width: 100%; min-height: 112rpx; padding: 22rpx 26rpx; display: flex; align-items: center; justify-content: space-between; text-align: left; border: 2rpx solid $color-line; border-radius: 24rpx; margin-bottom: 16rpx; }
.option-row.selected { border-color: $color-primary; background: $color-primary-soft; }
.option-label, .option-note { display: block; }
.option-label { color: $color-ink; font-weight: 700; }
.option-note { margin-top: 6rpx; color: $color-muted; font-size: 23rpx; }
.radio { width: 30rpx; height: 30rpx; border: 2rpx solid #a9adb0; border-radius: 50%; }
.selected .radio { border: 8rpx solid $color-primary; background: #fff; }
.chips { display: flex; gap: 14rpx; flex-wrap: wrap; }
.chip { min-height: 70rpx; padding: 0 24rpx; border: 2rpx solid $color-line; border-radius: 22rpx; color: $color-ink; }
.chip.selected { background: $color-primary; color: #fff; border-color: $color-primary; }
.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 24rpx; }
.compact .chip { padding: 0 16rpx; font-size: 23rpx; }
.notice { margin: 52rpx 0 28rpx; padding: 24rpx; color: $color-muted; background: rgba(255,253,248,.68); border-left: 5rpx solid $color-success; line-height: 1.7; font-size: 23rpx; }
</style>
