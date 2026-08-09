<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import { useWorkoutStore } from '@/stores/workout'
import { calculateStreak, parseDateKey, toDateKey } from '@/utils/date'
import { calculateVolume } from '@/utils/training'

const store = useWorkoutStore()
onShow(() => store.reload())
const completedSessions = computed(() => store.sessions.filter((item) => item.status === 'completed'))
const totalMinutes = computed(() => Math.round(completedSessions.value.reduce((sum, item) => sum + item.durationSeconds, 0) / 60))
const totalSets = computed(() => completedSessions.value.reduce((sum, item) => sum + item.records.flatMap((record) => record.sets).filter((set) => set.completed).length, 0))
const totalVolume = computed(() => Math.round(completedSessions.value.reduce((sum, item) => sum + calculateVolume(item.records), 0)))
const streak = computed(() => calculateStreak(store.checkIns, new Date()))
const recentDays = computed(() => Array.from({ length: 14 }, (_, index) => {
  const date = new Date(); date.setDate(date.getDate() - (13 - index))
  const key = toDateKey(date)
  return { key, label: `${date.getMonth() + 1}/${date.getDate()}`, completed: store.checkIns.some((item) => item.date === key) }
}))
</script>

<template>
  <view class="page-shell records-page">
    <text class="eyebrow">看见每一次出现</text>
    <text class="page-title display-serif">训练记录</text>
    <view class="summary-grid">
      <view><text class="summary-value">{{ completedSessions.length }}</text><text class="summary-label">完成训练</text></view>
      <view><text class="summary-value">{{ totalMinutes }}</text><text class="summary-label">累计分钟</text></view>
      <view><text class="summary-value">{{ totalSets }}</text><text class="summary-label">完成组数</text></view>
    </view>

    <view class="streak-row">
      <AppIcon name="check-circle" :size="38" /><view><text class="streak-title">连续 {{ streak }} 天</text><text class="streak-sub">训练量 {{ totalVolume }} kg · 只记录完成，不制造压力</text></view>
    </view>

    <view class="calendar-section">
      <text class="section-heading">最近 14 天</text>
      <view class="day-grid">
        <view v-for="day in recentDays" :key="day.key" class="calendar-day" :class="{ complete: day.completed }">
          <view class="calendar-dot"><AppIcon v-if="day.completed" name="check" :size="14" /></view><text>{{ day.label }}</text>
        </view>
      </view>
    </view>

    <view class="history-section">
      <text class="section-heading">历史训练</text>
      <view v-if="!completedSessions.length" class="empty-state"><AppIcon name="notebook" :size="46" muted /><text>完成第一次训练后，记录会出现在这里。</text></view>
      <view v-for="session in completedSessions.slice(0, 8)" :key="session.id" class="history-row">
        <view class="date-box"><text>{{ session.completedAt ? parseDateKey(toDateKey(new Date(session.completedAt))).getDate() : '--' }}</text><text>日</text></view>
        <view class="history-main"><text class="history-title">{{ session.planTitle }}</text><text class="history-meta">{{ Math.max(1, Math.round(session.durationSeconds / 60)) }} 分钟 · {{ session.records.filter(item => !item.skipped).length }} 个动作</text></view>
      </view>
    </view>
    <AppTabBar active="records" />
  </view>
</template>

<style scoped lang="scss">
.records-page { padding-top: 58rpx; }
.page-title { display: block; margin-top: 14rpx; font-size: 66rpx; font-weight: 700; }
.summary-grid { margin-top: 46rpx; display: grid; grid-template-columns: repeat(3, 1fr); padding: 32rpx 0; border-top: 1rpx solid $color-line; border-bottom: 1rpx solid $color-line; }
.summary-grid>view { text-align: center; border-right: 1rpx solid $color-line; }
.summary-grid>view:last-child { border-right: 0; }
.summary-value,.summary-label { display: block; }
.summary-value { font-family: "STSong", serif; font-size: 48rpx; font-weight: 700; }
.summary-label { margin-top: 8rpx; color: $color-muted; font-size: 21rpx; }
.streak-row { margin-top: 32rpx; padding: 28rpx; display: flex; gap: 20rpx; align-items: center; border-radius: 26rpx; background: $color-success-soft; }
.streak-title,.streak-sub { display: block; }
.streak-title { font-weight: 700; }
.streak-sub { margin-top: 7rpx; color: $color-muted; font-size: 21rpx; }
.calendar-section,.history-section { margin-top: 52rpx; }
.day-grid { margin-top: 28rpx; display: grid; grid-template-columns: repeat(7, 1fr); row-gap: 24rpx; }
.calendar-day { text-align: center; color: $color-muted; font-size: 19rpx; }
.calendar-dot { width: 36rpx; height: 36rpx; margin: 0 auto 8rpx; border: 2rpx dashed #b8b9b5; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.calendar-day.complete .calendar-dot { border-style: solid; background: $color-success; border-color: $color-success; }
.empty-state { margin-top: 26rpx; min-height: 200rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20rpx; color: $color-muted; border: 1rpx solid $color-line; border-radius: 26rpx; }
.history-row { min-height: 132rpx; display: flex; gap: 20rpx; align-items: center; border-bottom: 1rpx solid $color-line; }
.date-box { width: 66rpx; height: 66rpx; border-radius: 18rpx; background: $color-primary-soft; color: $color-primary; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 18rpx; }
.date-box text:first-child { font-size: 27rpx; font-weight: 700; }
.history-main { flex: 1; }
.history-title,.history-meta { display: block; }
.history-title { font-weight: 700; }
.history-meta { margin-top: 8rpx; color: $color-muted; font-size: 22rpx; }
</style>
