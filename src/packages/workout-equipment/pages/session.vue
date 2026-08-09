<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AppIcon from '@/components/AppIcon.vue'
import { exerciseRepository, planRepository } from '@/services/repositories'
import { useWorkoutStore } from '@/stores/workout'
import { formatDuration } from '@/utils/date'

const store = useWorkoutStore()
const currentIndex = ref(0)
const paused = ref(false)
const elapsedSeconds = ref(0)
const restSeconds = ref(0)
const weights = ref<Record<string, number>>({})
const requestedPlanId = ref('')
const failedMedia = ref<Record<string, boolean>>({})
let elapsedTimer: ReturnType<typeof setInterval> | undefined
let restTimer: ReturnType<typeof setInterval> | undefined

const session = computed(() => store.activeSession)
const currentRecord = computed(() => session.value?.records[currentIndex.value])
const currentExercise = computed(() => currentRecord.value ? exerciseRepository.getById(currentRecord.value.exerciseId) : undefined)
const currentMediaSource = computed(() => {
  const exercise = currentExercise.value
  if (!exercise) return ''
  const folder = failedMedia.value[exercise.id] ? 'images' : 'gifs'
  const extension = failedMedia.value[exercise.id] ? 'jpg' : 'gif'
  return `/packages/workout-equipment/static/${folder}/${exercise.id}.${extension}`
})
const progress = computed(() => session.value?.records.length ? Math.round(((currentIndex.value + 1) / session.value.records.length) * 100) : 0)
const completedSets = computed(() => currentRecord.value?.sets.filter((item) => item.completed).length || 0)
const canGoNext = computed(() => !!currentRecord.value && (completedSets.value > 0 || currentRecord.value.skipped))

onLoad((query) => {
  requestedPlanId.value = query?.planId || ''
  store.reload()
  ensureSession(requestedPlanId.value)
  elapsedTimer = setInterval(() => { if (!paused.value) elapsedSeconds.value += 1 }, 1000)
})

onBeforeUnmount(() => { if (elapsedTimer) clearInterval(elapsedTimer); if (restTimer) clearInterval(restTimer) })

function requestExit() {
  uni.showModal({
    title: '结束本次训练？',
    content: '当前进度会保存在本机。',
    success: (result) => {
      if (result.confirm) uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/train/index' }) })
    },
  })
}

function toggleSet(setIndex: number) {
  const exercise = currentExercise.value
  if (!exercise || !currentRecord.value || paused.value) return
  const isCompleting = !currentRecord.value.sets[setIndex].completed
  store.markSet(exercise.id, setIndex, {
    reps: exercise.defaultReps,
    seconds: exercise.defaultSeconds,
    weightKg: weights.value[`${exercise.id}-${setIndex}`] || undefined,
  })
  if (isCompleting && setIndex < currentRecord.value.sets.length - 1) startRest()
}

function startRest() {
  restSeconds.value = 45
  if (restTimer) clearInterval(restTimer)
  restTimer = setInterval(() => {
    if (!paused.value && restSeconds.value > 0) restSeconds.value -= 1
    if (restSeconds.value <= 0 && restTimer) clearInterval(restTimer)
  }, 1000)
}

function next() {
  if (!session.value) return
  if (!canGoNext.value) {
    uni.showToast({ title: '请先完成一组或选择跳过', icon: 'none' })
    return
  }
  restSeconds.value = 0
  if (currentIndex.value < session.value.records.length - 1) currentIndex.value += 1
  else finish()
}

function skip() {
  if (!currentExercise.value) return
  store.skipExercise(currentExercise.value.id)
  next()
}

function replace() {
  const current = currentExercise.value
  if (!current || !session.value) return
  const used = new Set(session.value.records.map((item) => item.exerciseId))
  const candidates = exerciseRepository.list().filter((item) => item.equipment === current.equipment && !used.has(item.id))
  const replacement = candidates.find((item) => item.category === current.category && item.mode === current.mode)
    || candidates.find((item) => item.category === current.category)
    || candidates.find((item) => item.mode === current.mode)
    || candidates[0]
  if (!replacement) {
    uni.showToast({ title: '当前训练已包含全部可替换动作', icon: 'none' })
    return
  }
  store.replaceExercise(current.id, replacement.id)
  uni.showToast({ title: `已替换为${replacement.nameZh}`, icon: 'none' })
}

function finish() {
  const completed = store.finish(new Date())
  if (completed) uni.redirectTo({ url: `/packages/workout-equipment/pages/complete?sessionId=${completed.id}` })
}

function ensureSession(planId = '') {
  const active = store.activeSession
  const valid = !!active?.records.length && active.records.every((record) => !!exerciseRepository.getById(record.exerciseId) && record.sets.length > 0)
  if (valid) return
  const plans = planRepository.list()
  const plan = plans.find((item) => item.id === planId) || plans[0]
  if (!plan) return
  currentIndex.value = 0
  store.startPlan(plan)
}

function retrySession() {
  store.reload()
  ensureSession(requestedPlanId.value)
  if (!currentExercise.value) uni.showToast({ title: '训练加载失败，请返回重选', icon: 'none' })
}

function returnToPlans() { uni.reLaunch({ url: '/pages/train/index' }) }
function handleMediaError(event: unknown) {
  const exercise = currentExercise.value
  if (!exercise || failedMedia.value[exercise.id]) return
  console.warn('[exercise-media] equipment animation failed', exercise.id, event)
  failedMedia.value = { ...failedMedia.value, [exercise.id]: true }
  uni.showToast({ title: '动画加载失败，已显示动作图', icon: 'none' })
}
</script>

<template>
  <view v-if="session && currentExercise && currentRecord" class="session-page">
    <scroll-view class="session-scroll" scroll-y :show-scrollbar="false">
      <view class="topbar"><button aria-label="退出训练" @tap="requestExit"><AppIcon name="x" :size="23" /></button><view class="timer"><AppIcon name="clock" :size="19" muted /><text>{{ formatDuration(elapsedSeconds) }}</text></view><button :aria-label="paused ? '继续训练' : '暂停训练'" @tap="paused = !paused"><AppIcon :name="paused ? 'play' : 'pause'" :size="23" /></button></view>
      <view class="progress-track"><view class="progress-value" :style="{ width: `${progress}%` }" /></view>
      <view class="progress-copy"><text>动作 {{ currentIndex + 1 }} / {{ session.records.length }}</text><text>{{ progress }}%</text></view>

      <view class="exercise-stage" :class="{ paused }">
        <image class="stage-background" src="/static/training/training-stage-environment-v1.jpg" mode="aspectFill" aria-hidden="true" />
        <image class="exercise-animation" :src="currentMediaSource" mode="aspectFit" :aria-label="`${currentExercise.nameZh}动作示范`" @error="handleMediaError" />
        <view v-if="paused" class="pause-layer"><AppIcon name="pause" :size="42" /><text>训练已暂停</text></view>
      </view>

      <view class="session-content">
        <text class="eyebrow">{{ currentExercise.categoryZh }} · {{ currentExercise.muscleText }}</text>
        <text class="exercise-title display-serif">{{ currentExercise.nameZh }}</text>
        <text class="cue">{{ currentExercise.stepsZh[0] }}</text>

        <view v-if="restSeconds" class="rest-banner"><view><text class="rest-label">组间休息</text><text class="rest-value">{{ restSeconds }} 秒</text></view><button @tap="restSeconds = 0">跳过休息</button></view>

        <view class="set-list">
          <view v-for="(set, index) in currentRecord.sets" :key="set.setNumber" class="set-row" :class="{ complete: set.completed }">
            <text class="set-number">第 {{ set.setNumber }} 组</text>
            <view v-if="currentExercise.mode === 'reps'" class="set-target"><text>{{ currentExercise.defaultReps }}</text><small>次</small></view>
            <view v-else class="set-target"><text>{{ currentExercise.defaultSeconds }}</text><small>秒</small></view>
            <input v-if="currentExercise.equipment !== 'body weight'" v-model.number="weights[`${currentExercise.id}-${index}`]" type="digit" class="weight-input" placeholder="kg" />
            <button class="set-check" @tap="toggleSet(index)"><AppIcon :name="set.completed ? 'check' : 'circle'" :size="22" /></button>
          </view>
        </view>

        <view class="secondary-actions"><button @tap="replace"><AppIcon name="arrows-clockwise" :size="20" />替换动作</button><button @tap="skip"><AppIcon name="skip-forward" :size="20" />跳过</button></view>
        <text class="attribution">{{ currentExercise.attribution }}</text>
        <view class="action-spacer" />
      </view>
    </scroll-view>

    <view class="action-dock">
      <button class="primary-button next-button" :class="{ disabled: !canGoNext }" @tap="next">{{ currentIndex === session.records.length - 1 ? '完成训练' : '下一个动作' }}<AppIcon name="arrow-right" :size="24" /></button>
    </view>
  </view>
  <view v-else class="session-fallback">
    <image class="fallback-image" src="/static/celebration/yinling-finish-04-daydream.jpg" mode="widthFix" aria-label="银铃坐在窗边等待训练加载" />
    <text class="eyebrow">训练还没有准备好</text>
    <text class="fallback-title display-serif">稍等一下，\n我们重新整理脚步。</text>
    <text class="fallback-copy">可能是训练记录已经清理，或页面被单独打开。你可以重新加载，也可以返回训练页挑选计划。</text>
    <button class="primary-button fallback-primary" @tap="retrySession"><AppIcon name="arrows-clockwise" :size="22" />重新加载训练</button>
    <button class="secondary-button fallback-secondary" @tap="returnToPlans">返回训练页</button>
  </view>
</template>

<style scoped lang="scss">
.session-page { position: relative; height: 100vh; overflow: hidden; background: $color-background; }
.session-scroll { height: 100%; }
.topbar { height: 106rpx; padding: 18rpx 30rpx; display: flex; align-items: center; justify-content: space-between; }
.topbar button { width: 68rpx; height: 68rpx; display: flex; align-items: center; justify-content: center; border: 1rpx solid $color-line; border-radius: 22rpx; }
.timer { display: flex; gap: 10rpx; align-items: center; color: $color-muted; font-variant-numeric: tabular-nums; }
.progress-track { height: 6rpx; margin: 0 30rpx; background: #e2e0da; border-radius: 4rpx; overflow: hidden; }
.progress-value { height: 100%; background: $color-primary; transition: width .25s ease; }
.progress-copy { margin: 12rpx 32rpx 20rpx; display: flex; justify-content: space-between; color: $color-muted; font-size: 20rpx; }
.exercise-stage { position: relative; height: 480rpx; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #f7f2e8; border-top: 1rpx solid $color-line; border-bottom: 1rpx solid $color-line; }
.stage-background { position: absolute; z-index: 0; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; }
.exercise-animation { position: relative; z-index: 1; width: 430rpx; height: 430rpx; }
.exercise-stage.paused>.exercise-animation { opacity: .22; }
.pause-layer { position: absolute; z-index: 2; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18rpx; color: $color-ink; font-weight: 700; }
.session-content { padding: 36rpx 32rpx 24rpx; }
.exercise-title { display: block; margin-top: 10rpx; font-size: 50rpx; line-height: 1.25; font-weight: 700; }
.cue { display: block; margin-top: 20rpx; color: $color-muted; line-height: 1.7; font-size: 23rpx; }
.rest-banner { margin-top: 24rpx; padding: 22rpx 24rpx; display: flex; align-items: center; justify-content: space-between; border-radius: 22rpx; background: $color-primary-soft; color: $color-primary; }
.rest-label,.rest-value { display: block; }
.rest-label { font-size: 20rpx; }
.rest-value { margin-top: 4rpx; font-weight: 700; }
.rest-banner button { min-height: 58rpx; padding: 0 18rpx; border: 1rpx solid $color-primary; border-radius: 18rpx; color: $color-primary; font-size: 21rpx; }
.set-list { margin-top: 30rpx; border-top: 1rpx solid $color-line; }
.set-row { min-height: 96rpx; display: grid; grid-template-columns: 1fr 90rpx 98rpx 64rpx; align-items: center; gap: 12rpx; border-bottom: 1rpx solid $color-line; }
.set-row.complete { color: $color-success; }
.set-number { font-weight: 700; }
.set-target text { font-size: 29rpx; font-weight: 700; }
.set-target small { margin-left: 5rpx; color: $color-muted; font-size: 19rpx; }
.weight-input { width: 94rpx; height: 58rpx; padding: 0 12rpx; border: 1rpx solid $color-line; border-radius: 16rpx; text-align: center; font-size: 22rpx; }
.set-check { width: 58rpx; height: 58rpx; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: $color-primary-soft; }
.complete .set-check { background: $color-success; }
.secondary-actions { margin-top: 26rpx; display: flex; justify-content: space-between; }
.secondary-actions button { min-height: 64rpx; display: flex; gap: 8rpx; align-items: center; color: $color-muted; font-size: 22rpx; }
.action-spacer { height: calc(136rpx + constant(safe-area-inset-bottom)); height: calc(136rpx + env(safe-area-inset-bottom)); }
.action-dock { position: absolute; z-index: 20; right: 0; bottom: 0; left: 0; padding: 16rpx 32rpx calc(16rpx + constant(safe-area-inset-bottom)); padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid $color-line; background: rgba(247, 243, 234, .98); box-shadow: 0 -12rpx 30rpx rgba(16, 43, 76, .08); }
.next-button { width: 100%; margin: 0; }
.next-button.disabled { opacity: .38; }
.attribution { display: block; margin-top: 22rpx; color: #9b9b96; text-align: center; font-size: 18rpx; }
.session-fallback { min-height: 100vh; padding: 70rpx 36rpx calc(70rpx + env(safe-area-inset-bottom)); text-align: center; background: $color-background; }
.fallback-image { display: block; width: 100%; margin-bottom: 34rpx; border: 1rpx solid $color-line; border-radius: 30rpx; box-shadow: 0 16rpx 36rpx rgba(16,43,76,.1); }
.fallback-title { display: block; margin-top: 16rpx; color: $color-ink; font-size: 54rpx; font-weight: 700; line-height: 1.2; white-space: pre-line; }
.fallback-copy { display: block; margin-top: 22rpx; color: $color-muted; font-size: 24rpx; line-height: 1.75; }
.fallback-primary,.fallback-secondary { width: 100%; }
.fallback-primary { margin-top: 36rpx; gap: 10rpx; }
.fallback-secondary { margin-top: 16rpx; }

@media (max-height: 700px) {
  .topbar { height: 90rpx; padding-top: 10rpx; padding-bottom: 10rpx; }
  .topbar button { width: 60rpx; height: 60rpx; border-radius: 20rpx; }
  .progress-copy { margin-top: 10rpx; margin-bottom: 14rpx; }
  .exercise-stage { height: 390rpx; }
  .exercise-animation { width: 350rpx; height: 350rpx; }
  .session-content { padding-top: 26rpx; }
  .exercise-title { font-size: 44rpx; }
  .cue { margin-top: 12rpx; line-height: 1.55; }
  .rest-banner { margin-top: 16rpx; padding: 16rpx 20rpx; border-radius: 18rpx; }
  .set-list { margin-top: 20rpx; }
  .set-row { min-height: 82rpx; }
  .secondary-actions { margin-top: 18rpx; }
}
</style>
