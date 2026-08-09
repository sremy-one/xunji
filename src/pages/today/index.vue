<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import WeekPath from '@/components/WeekPath.vue'
import { useProfileStore } from '@/stores/profile'
import { useWorkoutStore } from '@/stores/workout'
import { planRepository } from '@/services/repositories'
import { calculateStreak } from '@/utils/date'
import { navigateToSafe } from '@/utils/navigation'
import { getCustomPageTopInset } from '@/utils/platform'
import type { CheckIn } from '@/types/domain'

const profileStore = useProfileStore()
const workoutStore = useWorkoutStore()
const previewMode = ref(false)
const pageTopInset = ref(getCustomPageTopInset())
const fixedPreviewDate = new Date(2026, 6, 22)
const currentDate = computed(() => previewMode.value ? fixedPreviewDate : new Date())
const plan = computed(() => planRepository.getForProfile(profileStore.profile))
const previewCheckIns: CheckIn[] = [
  { date: '2026-07-17', sessionIds: ['demo-0'] },
  { date: '2026-07-18', sessionIds: ['demo-1'] }, { date: '2026-07-19', sessionIds: ['demo-2'] },
  { date: '2026-07-20', sessionIds: ['demo-3'] }, { date: '2026-07-21', sessionIds: ['demo-4'] },
]
const visibleCheckIns = computed(() => previewMode.value && !workoutStore.checkIns.length ? previewCheckIns : workoutStore.checkIns)
const streak = computed(() => calculateStreak(visibleCheckIns.value, currentDate.value) || (previewMode.value ? 5 : 0))

onLoad((query) => {
  previewMode.value = query?.preview === '1'
  pageTopInset.value = query?.wechat === '1' ? 102 : getCustomPageTopInset()
})
onShow(() => {
  profileStore.reload()
  workoutStore.reload()
})

function startWorkout() {
  if (!profileStore.profile.onboardingComplete && !previewMode.value) {
    navigateToSafe('/pages/onboarding/index')
    return
  }
  navigateToSafe('/packages/planner/pages/select')
}
</script>

<template>
  <view class="today-page" :style="{ paddingTop: `${pageTopInset}px` }">
    <view class="poster-card">
      <image
        class="promo-poster"
        src="/static/brand/youjierxun-yinling-banner.jpg"
        mode="aspectFill"
        aria-label="由迹而寻宣传海报：随时随地，即刻开始训练"
      />
      <view class="poster-action">
        <view class="plan-summary">
          <text class="plan-kicker">今日推荐</text>
          <text class="plan-title display-serif">{{ plan.title }}</text>
          <view class="plan-meta">
            <AppIcon name="clock" :size="18" muted />
            <text>{{ plan.durationMinutes }} 分钟 · {{ plan.equipment === 'bodyweight' ? '无器械' : plan.equipment === 'dumbbell' ? '哑铃' : '弹力带' }}</text>
          </view>
        </view>
        <button class="start-button" aria-label="即刻开始训练" @tap="startWorkout">
          <text>即刻开始</text><AppIcon name="arrow-right" :size="21" />
        </button>
      </view>
    </view>

    <view class="week-section">
      <view class="week-heading">
        <text class="section-heading">这一周的小目标</text>
        <text class="week-summary">连续 {{ streak }} 天，每一步都算数</text>
      </view>
      <WeekPath :check-ins="visibleCheckIns" :current="currentDate" />
    </view>

    <view class="encouragement">
      <AppIcon name="plant" :size="46" muted />
      <view><text class="encouragement-title display-serif">慢慢来，持续就好。</text><text class="encouragement-sub">不追求完美，只在乎坚持的你。</text></view>
    </view>
    <AppTabBar active="today" />
  </view>
</template>

<style scoped lang="scss">
.today-page { min-height: 100vh; padding: 0 28rpx 178rpx; background: $color-background; overflow: hidden; }
.poster-card { overflow: hidden; border: 1rpx solid $color-line; border-radius: 28rpx; background: #fffdf8; box-shadow: 0 14rpx 36rpx rgba(16, 43, 76, .08); }
.promo-poster { display: block; width: 100%; height: 420rpx; }
.poster-action { min-height: 124rpx; padding: 16rpx 20rpx; display: flex; align-items: center; justify-content: space-between; gap: 18rpx; border-top: 1rpx solid $color-line; background: rgba(255, 253, 248, .98); }
.plan-summary { min-width: 0; }
.plan-kicker { display: block; color: $color-accent; font-size: 19rpx; font-weight: 700; letter-spacing: 2rpx; }
.plan-title { display: block; margin-top: 6rpx; overflow: hidden; color: $color-ink; font-size: 27rpx; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.plan-meta { display: flex; align-items: center; gap: 8rpx; margin-top: 7rpx; color: $color-muted; font-size: 19rpx; }
.start-button { flex: 0 0 auto; min-width: 156rpx; min-height: 88rpx; padding: 0 20rpx; display: flex; align-items: center; justify-content: center; gap: 8rpx; border-radius: 22rpx; background: $color-primary; color: #fff; font-size: 24rpx; font-weight: 700; box-shadow: 0 12rpx 26rpx rgba(104, 128, 211, .22); }
.week-section { margin: 32rpx 12rpx 0; padding-top: 26rpx; border-top: 1rpx solid $color-line; }
.week-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 20rpx; }
.week-summary { color: $color-muted; font-size: 22rpx; text-align: right; }
.encouragement { display: flex; gap: 24rpx; align-items: center; margin: 36rpx -28rpx 0; padding: 32rpx 52rpx; background: rgba(255, 253, 248, .72); border-top: 1rpx solid $color-line; }
.encouragement-title { display: block; font-size: 31rpx; font-weight: 700; }
.encouragement-sub { display: block; margin-top: 8rpx; color: $color-muted; font-size: 22rpx; }
@media (max-height: 760px) { .promo-poster { height: 390rpx; } .week-section { margin-top: 26rpx; } }
</style>
