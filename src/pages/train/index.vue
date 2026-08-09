<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import { planRepository } from '@/services/repositories'
import { useWorkoutStore } from '@/stores/workout'
import { navigateToSafe } from '@/utils/navigation'

const plans = planRepository.list()
const store = useWorkoutStore()
function openLibrary() { navigateToSafe('/packages/library/pages/index') }

function start(planId: string) {
  const plan = plans.find((item) => item.id === planId)!
  store.startPlan(plan)
  const root = plan.equipment === 'bodyweight' ? 'workout-bodyweight' : 'workout-equipment'
  navigateToSafe(`/packages/${root}/pages/session?planId=${plan.id}`)
}
</script>

<template>
  <view class="page-shell train-page">
    <text class="eyebrow">为今天挑一份合适的</text>
    <text class="page-title display-serif">训练计划</text>
    <view class="library-entry" @tap="openLibrary">
      <view class="entry-copy"><text class="entry-title">浏览动作库</text><text class="entry-sub">按部位、器械或名称查找</text></view>
      <view class="entry-aside"><text class="entry-update">持续更新中</text><AppIcon name="arrow-right" :size="24" /></view>
    </view>

    <view class="plan-list">
      <view v-for="(plan, index) in plans" :key="plan.id" class="plan-item">
        <view class="plan-number">0{{ index + 1 }}</view>
        <view class="plan-main"><text class="plan-title display-serif">{{ plan.title }}</text><text class="plan-sub">{{ plan.subtitle }}</text><text class="plan-meta">{{ plan.durationMinutes }} 分钟 · {{ plan.exerciseIds.length }} 个动作</text></view>
        <button class="start-mini" @tap="start(plan.id)">开始</button>
      </view>
    </view>
    <view class="gentle-note"><AppIcon name="plant" :size="34" muted /><text>计划可以随时调整。今天状态一般，也可以只完成一半。</text></view>
    <AppTabBar active="train" />
  </view>
</template>

<style scoped lang="scss">
.train-page { padding-top: 58rpx; }
.page-title { display: block; margin-top: 14rpx; font-size: 66rpx; font-weight: 700; }
.library-entry { margin-top: 44rpx; min-height: 118rpx; padding: 26rpx 28rpx; display: flex; align-items: center; justify-content: space-between; background: $color-primary; color: #fff; border-radius: 28rpx; box-shadow: 0 18rpx 40rpx rgba(104,128,211,.2); }
.entry-copy { min-width: 0; flex: 1; }
.entry-title,.entry-sub { display: block; }
.entry-title { font-size: 29rpx; font-weight: 700; }
.entry-sub { margin-top: 7rpx; opacity: .8; font-size: 22rpx; }
.entry-aside { flex: 0 0 auto; display: flex; align-items: center; gap: 12rpx; }
.entry-update { padding: 8rpx 13rpx; border: 1rpx solid rgba(255,255,255,.5); border-radius: 999rpx; color: rgba(255,255,255,.9); font-size: 19rpx; white-space: nowrap; }
.plan-list { margin-top: 60rpx; border-top: 1rpx solid $color-line; }
.plan-item { min-height: 190rpx; display: grid; grid-template-columns: 74rpx 1fr auto; gap: 20rpx; align-items: center; border-bottom: 1rpx solid $color-line; }
.plan-number { color: $color-accent; font-size: 24rpx; font-weight: 700; align-self: start; padding-top: 38rpx; }
.plan-title,.plan-sub,.plan-meta { display: block; }
.plan-title { font-size: 35rpx; font-weight: 700; }
.plan-sub { margin-top: 10rpx; color: $color-muted; font-size: 23rpx; }
.plan-meta { margin-top: 17rpx; color: $color-primary; font-size: 21rpx; }
.start-mini { min-width: 90rpx; min-height: 68rpx; padding: 0 20rpx; border: 2rpx solid $color-primary; border-radius: 20rpx; color: $color-primary; font-weight: 700; }
.gentle-note { margin-top: 42rpx; display: flex; gap: 18rpx; align-items: center; color: $color-muted; font-size: 23rpx; line-height: 1.7; }
</style>
