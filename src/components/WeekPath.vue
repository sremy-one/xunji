<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import type { CheckIn } from '@/types/domain'
import { toDateKey, weekDays } from '@/utils/date'

const props = defineProps<{ checkIns: CheckIn[]; current?: Date }>()
const today = computed(() => props.current || new Date())
const days = computed(() => weekDays(today.value))
const completed = computed(() => new Set(props.checkIns.map((item) => item.date)))
</script>

<template>
  <view class="week-path">
    <view v-for="day in days" :key="day.date" class="day" :class="{ today: day.date === toDateKey(today), complete: completed.has(day.date) }">
      <text class="weekday">{{ day.label }}</text>
      <text class="date">{{ day.shortDate }}</text>
      <view class="dot">
        <AppIcon v-if="completed.has(day.date)" name="check" :size="17" />
      </view>
      <text class="state">{{ day.date === toDateKey(today) ? '今天' : completed.has(day.date) ? '完成' : '待打卡' }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.week-path { display: grid; grid-template-columns: repeat(7, 1fr); margin-top: 28rpx; }
.day { min-width: 0; padding: 0 4rpx; text-align: center; border-right: 1rpx solid $color-line; color: $color-muted; }
.day:last-child { border-right: 0; }
.weekday { display: block; color: $color-ink; font-size: 22rpx; }
.date { display: block; margin-top: 9rpx; font-size: 21rpx; }
.dot { width: 38rpx; height: 38rpx; margin: 16rpx auto 10rpx; border: 2rpx dashed #aeb1b3; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.state { font-size: 19rpx; white-space: nowrap; }
.day.complete .dot { border-style: solid; border-color: $color-success; background: $color-success; }
.day.today { color: $color-primary; }
.day.today .weekday { color: $color-primary; font-weight: 700; }
.day.today .dot { border-style: solid; border-color: $color-primary; background: $color-primary; }
.day.today .state { font-weight: 700; }
</style>
