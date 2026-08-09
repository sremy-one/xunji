<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { exerciseRepository } from '@/services/repositories'
import { navigateToSafe } from '@/utils/navigation'

const query = ref('')
const category = ref('all')
const equipment = ref('all')
const categories = [{ key: 'all', label: '全部' }, { key: 'waist', label: '核心' }, { key: 'upper legs', label: '腿部' }, { key: 'chest', label: '胸部' }, { key: 'back', label: '背部' }, { key: 'shoulders', label: '肩部' }, { key: 'upper arms', label: '手臂' }]
const equipments = [{ key: 'all', label: '全部器械' }, { key: 'body weight', label: '徒手' }, { key: 'dumbbell', label: '哑铃' }, { key: 'band', label: '弹力带' }]
const results = computed(() => exerciseRepository.search(query.value, category.value, equipment.value === 'band' ? 'band' : equipment.value))

function openDetail(id: string) { navigateToSafe(`/packages/library/pages/detail?id=${id}`) }
function goBack() { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/train/index' }) }) }
</script>

<template>
  <view class="library-page">
    <view class="library-header"><button class="back" aria-label="返回" @tap="goBack"><AppIcon name="arrow-left" :size="25" /></button><view><text class="eyebrow">28 个银铃原创动作</text><text class="title display-serif">动作库</text></view></view>
    <view class="search-box"><AppIcon name="search" :size="22" muted /><input v-model="query" placeholder="搜索动作或目标肌群" placeholder-class="placeholder" /></view>
    <scroll-view scroll-x class="filter-scroll"><view class="filters"><button v-for="item in categories" :key="item.key" class="filter" :class="{ active: category === item.key }" @tap="category = item.key">{{ item.label }}</button></view></scroll-view>
    <scroll-view scroll-x class="filter-scroll secondary"><view class="filters"><button v-for="item in equipments" :key="item.key" class="filter" :class="{ active: equipment === item.key }" @tap="equipment = item.key">{{ item.label }}</button></view></scroll-view>
    <text class="result-count">找到 {{ results.length }} 个动作</text>
    <view class="exercise-list">
      <button v-for="exercise in results" :key="exercise.id" class="exercise-row" @tap="openDetail(exercise.id)">
        <image :src="exercise.image" mode="aspectFit" lazy-load :aria-label="`${exercise.nameZh}动作示范`" />
        <view class="exercise-main"><text class="exercise-name">{{ exercise.nameZh }}</text><text class="exercise-en">{{ exercise.name }}</text><text class="exercise-meta">{{ exercise.categoryZh }} · {{ exercise.equipmentZh }} · {{ exercise.muscleText }}</text></view>
        <AppIcon name="arrow-right" :size="20" muted />
      </button>
    </view>
    <view v-if="!results.length" class="empty"><AppIcon name="search" :size="44" muted /><text>没有找到匹配动作，试试减少筛选条件。</text></view>
  </view>
</template>

<style scoped lang="scss">
.library-page { min-height: 100vh; padding: 42rpx 30rpx 80rpx; background: $color-background; }
.library-header { display: flex; gap: 24rpx; align-items: center; }
.back { width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; border: 1rpx solid $color-line; border-radius: 22rpx; }
.title { display: block; margin-top: 5rpx; font-size: 50rpx; font-weight: 700; }
.search-box { height: 92rpx; margin-top: 38rpx; padding: 0 24rpx; display: flex; align-items: center; gap: 14rpx; border: 1rpx solid $color-line; border-radius: 24rpx; background: $color-surface; }
.search-box input { flex: 1; font-size: 26rpx; color: $color-ink; }
.placeholder { color: #a1a39f; }
.filter-scroll { margin-top: 28rpx; white-space: nowrap; }
.filter-scroll.secondary { margin-top: 14rpx; }
.filters { display: flex; gap: 12rpx; width: max-content; }
.filter { min-height: 64rpx; padding: 0 24rpx; border-radius: 20rpx; border: 1rpx solid $color-line; color: $color-muted; font-size: 23rpx; }
.filter.active { background: $color-primary; border-color: $color-primary; color: #fff; }
.result-count { display: block; margin-top: 30rpx; color: $color-muted; font-size: 22rpx; }
.exercise-list { margin-top: 8rpx; }
.exercise-row { width: 100%; min-height: 162rpx; display: flex; align-items: center; gap: 20rpx; border-bottom: 1rpx solid $color-line; text-align: left; }
.exercise-row image { width: 118rpx; height: 118rpx; border-radius: 18rpx; background: #fff; }
.exercise-main { flex: 1; min-width: 0; }
.exercise-name,.exercise-en,.exercise-meta { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.exercise-name { color: $color-ink; font-size: 28rpx; font-weight: 700; }
.exercise-en { margin-top: 5rpx; color: $color-muted; font-size: 20rpx; }
.exercise-meta { margin-top: 12rpx; color: $color-primary; font-size: 20rpx; }
.empty { height: 360rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20rpx; color: $color-muted; }
</style>
