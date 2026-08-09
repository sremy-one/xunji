<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon.vue'
import PrivacyConsentModal from '@/components/PrivacyConsentModal.vue'
import { workoutSharePayload } from '../utils/share'
import { useWorkoutStore } from '@/stores/workout'
import { useCloudStore } from '@/stores/cloud'
import { COMPLETION_POSTERS, resolveCompletionPosterIndex } from '../utils/completion-posters'
import { calculateStreak } from '@/utils/date'
import { getCustomPageTopInset } from '@/utils/platform'
import { calculateVolume } from '@/utils/training'
import type { WorkoutSession } from '@/types/domain'

const store = useWorkoutStore()
const cloudStore = useCloudStore()
const sessionId = ref('')
const posterPath = ref('')
const posterIndex = ref(0)
const pageTopInset = ref(Math.max(28, getCustomPageTopInset()))
const previewMode = ref(false)
const emptyMode = ref(false)
const previewSession: WorkoutSession = {
  id: 'preview-completed-session',
  planId: 'preview-focus-plan',
  planTitle: '背部·核心组合训练',
  startedAt: '2026-07-31T02:10:00.000Z',
  completedAt: '2026-07-31T02:34:00.000Z',
  durationSeconds: 24 * 60,
  status: 'completed',
  records: Array.from({ length: 3 }, (_, exerciseIndex) => ({
    exerciseId: `preview-${exerciseIndex + 1}`,
    skipped: false,
    sets: Array.from({ length: 3 }, (_, setIndex) => ({
      setNumber: setIndex + 1,
      reps: 12,
      completed: true,
    })),
  })),
}
const session = computed(() => emptyMode.value ? undefined : (store.sessions.find((item) => item.id === sessionId.value) || (previewMode.value ? previewSession : undefined)))
const selectedPoster = computed(() => COMPLETION_POSTERS[posterIndex.value])
const streak = computed(() => previewMode.value ? 2 : calculateStreak(store.checkIns, new Date()))
const minutes = computed(() => Math.max(1, Math.round((session.value?.durationSeconds || 0) / 60)))
const completedSets = computed(() => session.value?.records.flatMap((record) => record.sets).filter((set) => set.completed).length || 0)
const volume = computed(() => session.value ? Math.round(calculateVolume(session.value.records)) : 0)

onLoad((query) => {
  store.reload()
  previewMode.value = query?.preview === '1'
  emptyMode.value = query?.empty === '1'
  sessionId.value = query?.sessionId || store.sessions[0]?.id || ''
  posterIndex.value = resolveCompletionPosterIndex(sessionId.value, query?.poster)
  pageTopInset.value = query?.wechat === '1' ? 102 : Math.max(28, getCustomPageTopInset())
})
onShareAppMessage(() => session.value ? workoutSharePayload(session.value, streak.value) : ({ title: '由迹而寻 · 随时随地，即刻开始训练', path: '/pages/today/index' }))

function drawPoster() {
  if (!session.value) return
  const context = uni.createCanvasContext('sharePoster')
  context.setFillStyle('#f7f3ea'); context.fillRect(0, 0, 620, 900)
  context.setFillStyle('#102b4c'); context.setFontSize(34); context.fillText('由迹而寻', 48, 70)
  context.setFillStyle('#df4f3f'); context.setFontSize(24); context.fillText('今天也动一动', 48, 135)
  context.setFillStyle('#102b4c'); context.setFontSize(46); context.fillText(session.value.planTitle, 48, 205)
  context.drawImage(selectedPoster.value.src, 48, 235, 524, 350)
  context.setFillStyle('#758ddd'); context.fillRect(48, 615, 524, 120)
  context.setFillStyle('#ffffff'); context.setFontSize(28); context.fillText(`${minutes.value} 分钟   ${completedSets.value} 组   连续 ${streak.value} 天`, 78, 684)
  context.setFillStyle('#102b4c'); context.setFontSize(24); context.fillText('慢慢来，持续就好。', 48, 800)
  context.setFillStyle('#7e848b'); context.setFontSize(18); context.fillText('银铃插画 · 由迹而寻', 48, 860)
  context.draw(false, () => {
    uni.canvasToTempFilePath({ canvasId: 'sharePoster', width: 620, height: 900, destWidth: 620, destHeight: 900, success(result) {
      posterPath.value = result.tempFilePath
      // #ifdef H5
      uni.previewImage({ urls: [result.tempFilePath] })
      // #endif
      // #ifndef H5
      uni.saveImageToPhotosAlbum({ filePath: result.tempFilePath, success: () => uni.showToast({ title: '海报已保存' }), fail: () => uni.previewImage({ urls: [result.tempFilePath] }) })
      // #endif
    }, fail: () => uni.showToast({ title: '海报生成失败', icon: 'none' }) })
  })
}

function handleShareTap() {
  // #ifdef H5
  uni.showToast({ title: '请使用右上角分享或保存海报', icon: 'none' })
  // #endif
}
function showError(error: unknown) {
  uni.showToast({ title: error instanceof Error ? error.message : '保存失败，请稍后重试', icon: 'none', duration: 2600 })
}
function saveHistory() {
  void cloudStore.enable()
    .then(() => uni.showToast({ title: '历史记录已保存', icon: 'none' }))
    .catch(showError)
}
function startWorkout() { uni.redirectTo({ url: '/packages/planner/pages/select' }) }
function goHome() { uni.reLaunch({ url: '/pages/today/index' }) }
</script>

<template>
  <view v-if="session" class="complete-page" :style="{ paddingTop: `${pageTopInset}px` }">
    <view class="moment-card">
      <image class="moment-poster" :src="selectedPoster.src" mode="widthFix" :aria-label="selectedPoster.alt" />
      <text class="moment-label">训练定格 · {{ selectedPoster.title }}</text>
    </view>
    <text class="eyebrow">今天的计划完成了</text>
    <text class="title display-serif">每一步，\n都算数。</text>
    <text class="subtitle">你完成了「{{ session.planTitle }}」，身体已经记住了今天的努力。</text>
    <view class="result-grid"><view><strong>{{ minutes }}</strong><text>分钟</text></view><view><strong>{{ completedSets }}</strong><text>完成组数</text></view><view><strong>{{ streak }}</strong><text>连续天数</text></view></view>
    <text v-if="volume" class="volume">本次训练量 {{ volume }} kg</text>
    <view class="week-message"><AppIcon name="plant" :size="40" muted /><view><text>慢慢来，持续就好。</text><small>明天也可以休息，恢复同样是训练的一部分。</small></view></view>
    <button class="primary-button save-history-button" :disabled="cloudStore.busy" @tap="saveHistory">
      <AppIcon name="shield" :size="24" />{{ cloudStore.state.enabled ? '历史记录已云端备份' : '保存我的历史记录' }}
    </button>
    <button class="primary-button share-button" open-type="share" @tap="handleShareTap"><AppIcon name="share" :size="24" />分享训练成果</button>
    <button class="secondary-button" @tap="drawPoster"><AppIcon name="download" :size="22" />保存成果海报</button>
    <button class="home-link" @tap="goHome">回到今日</button>
    <PrivacyConsentModal />
    <canvas canvas-id="sharePoster" class="poster-canvas" />
  </view>
  <view v-else class="complete-page fallback-page" :style="{ paddingTop: `${pageTopInset}px` }">
    <view class="fallback-state">
      <view class="fallback-poster">
        <image class="fallback-image" src="/static/celebration/yinling-finish-04-daydream.jpg" mode="widthFix" aria-label="银铃坐在窗边喝水，等待和你开始下一次训练" />
        <text class="fallback-label">银铃正在等你</text>
      </view>
      <text class="eyebrow fallback-eyebrow">还没有找到训练记录</text>
      <text class="fallback-title display-serif">这次的足迹，\n还没有留下。</text>
      <text class="fallback-copy">可能是页面被单独打开，或本地训练记录已经清理。完成一次训练后，银铃会在这里为你保存纪念。</text>
      <view class="fallback-note">
        <AppIcon name="plant" :size="40" muted />
        <view><text>没关系，随时都能重新开始。</text><small>先选择今天想练的部位，我会帮你安排顺序。</small></view>
      </view>
      <button class="primary-button fallback-primary" @tap="startWorkout"><AppIcon name="arrow-right" :size="24" />挑选今天的训练</button>
      <button class="secondary-button fallback-secondary" @tap="goHome">回到今日</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.complete-page { min-height: 100vh; padding: 0 38rpx 70rpx; text-align: center; background: $color-background; }
.fallback-page { display: flex; align-items: flex-start; }
.fallback-state { width: 100%; text-align: center; }
.fallback-poster { position: relative; overflow: hidden; width: 100%; border: 1rpx solid $color-line; border-radius: 30rpx; background: #fffdf8; box-shadow: 0 16rpx 36rpx rgba(16,43,76,.1); }
.fallback-image { display: block; width: 100%; }
.fallback-label { position: absolute; right: 18rpx; bottom: 18rpx; padding: 10rpx 18rpx; border: 1rpx solid rgba(16,43,76,.1); border-radius: 999rpx; background: rgba(255,253,248,.9); color: $color-ink; font-size: 20rpx; font-weight: 700; }
.fallback-eyebrow { display: block; margin-top: 32rpx; }
.fallback-title { display: block; margin-top: 18rpx; color: $color-ink; font-size: 58rpx; font-weight: 700; line-height: 1.16; white-space: pre-line; }
.fallback-copy { display: block; max-width: 620rpx; margin: 22rpx auto 0; color: $color-muted; font-size: 24rpx; line-height: 1.75; }
.fallback-note { margin: 34rpx 0 28rpx; padding: 24rpx; display: flex; gap: 22rpx; align-items: center; text-align: left; background: rgba(255,253,248,.72); border-left: 5rpx solid $color-success; }
.fallback-note text,.fallback-note small { display: block; }
.fallback-note text { font-family: "STSong", serif; font-size: 28rpx; font-weight: 700; }
.fallback-note small { margin-top: 8rpx; color: $color-muted; font-size: 21rpx; line-height: 1.55; }
.fallback-primary,.fallback-secondary { width: 100%; }
.fallback-secondary { margin-top: 16rpx; }
.moment-card { position: relative; overflow: hidden; width: 100%; margin: 0 auto 28rpx; border: 1rpx solid $color-line; border-radius: 30rpx; background: #fffdf8; box-shadow: 0 16rpx 36rpx rgba(16,43,76,.1); }
.moment-poster { display: block; width: 100%; }
.moment-label { position: absolute; right: 18rpx; bottom: 18rpx; padding: 10rpx 18rpx; border: 1rpx solid rgba(16,43,76,.1); border-radius: 999rpx; background: rgba(255,253,248,.9); color: $color-ink; font-size: 20rpx; font-weight: 700; backdrop-filter: blur(8px); }
.title { display: block; margin-top: 18rpx; font-size: 64rpx; line-height: 1.15; font-weight: 700; white-space: pre-line; }
.subtitle { display: block; max-width: 620rpx; margin: 20rpx auto 0; color: $color-muted; line-height: 1.7; }
.result-grid { margin-top: 36rpx; padding: 26rpx 0; display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1rpx solid $color-line; border-bottom: 1rpx solid $color-line; }
.result-grid>view { border-right: 1rpx solid $color-line; }
.result-grid>view:last-child { border-right: 0; }
.result-grid strong,.result-grid text { display: block; }
.result-grid strong { font-family: "STSong", serif; font-size: 44rpx; }
.result-grid text { margin-top: 8rpx; color: $color-muted; font-size: 21rpx; }
.volume { display: block; margin-top: 20rpx; color: $color-primary; font-size: 22rpx; }
.week-message { margin: 30rpx 0 26rpx; padding: 24rpx; display: flex; gap: 22rpx; align-items: center; text-align: left; background: rgba(255,253,248,.72); border-left: 5rpx solid $color-success; }
.week-message text,.week-message small { display: block; }
.week-message text { font-family: "STSong", serif; font-size: 29rpx; font-weight: 700; }
.week-message small { margin-top: 8rpx; color: $color-muted; font-size: 21rpx; line-height: 1.6; }
.save-history-button,.share-button,.secondary-button { margin-top: 16rpx; gap: 12rpx; }
.save-history-button[disabled] { opacity: .68; }
.home-link { margin: 22rpx auto 0; color: $color-muted; font-size: 23rpx; }
.poster-canvas { position: fixed; left: -9999px; top: 0; width: 620px; height: 900px; }
</style>
