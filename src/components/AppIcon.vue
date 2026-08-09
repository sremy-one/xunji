<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number; muted?: boolean }>(), { size: 24, muted: false })
</script>

<template>
  <image class="app-icon" :class="{ muted }" :src="`/static/icons/${name}.png`" :style="{ width: `${size}px`, height: `${size}px` }" mode="aspectFit" aria-hidden="true" />
</template>

<style scoped>
.app-icon { display: block; flex: 0 0 auto; }
.muted { opacity: .62; }
</style>
