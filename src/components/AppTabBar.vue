<script setup lang="ts">
import AppIcon from './AppIcon.vue'

const props = defineProps<{ active: 'today' | 'train' | 'records' | 'profile' }>()
const items = [
  { key: 'today', label: '今日', icon: 'house', path: '/pages/today/index' },
  { key: 'train', label: '训练', icon: 'barbell', path: '/pages/train/index' },
  { key: 'records', label: '记录', icon: 'notebook', path: '/pages/records/index' },
  { key: 'profile', label: '我的', icon: 'user', path: '/pages/profile/index' },
] as const

function go(path: string, key: string) {
  if (props.active === key) return
  uni.reLaunch({ url: path })
}
</script>

<template>
  <view class="tab-bar">
    <button v-for="item in items" :key="item.key" class="tab-item" :class="{ active: active === item.key }" @tap="go(item.path, item.key)">
      <AppIcon :name="item.icon" :size="25" :muted="active !== item.key" />
      <text>{{ item.label }}</text>
    </button>
  </view>
</template>

<style scoped lang="scss">
.tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  height: calc(126rpx + env(safe-area-inset-bottom));
  padding: 12rpx 20rpx env(safe-area-inset-bottom);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: rgba(255, 253, 248, .98);
  border-top: 1rpx solid $color-line;
}
.tab-item {
  min-height: 96rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7rpx;
  color: #696d72;
  font-size: 24rpx;
}
.tab-item.active { color: $color-primary; font-weight: 700; }
@media (min-width: 600px) {
  .tab-bar { left: 50%; right: auto; width: 390px; transform: translateX(-50%); }
}
</style>
