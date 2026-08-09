export interface CompletionPoster {
  id: string
  title: string
  alt: string
  src: string
}

export const COMPLETION_POSTERS: CompletionPoster[] = [
  {
    id: 'victory-jump',
    title: '跃起的瞬间',
    alt: '银铃扎着高马尾，开心地跃起庆祝完成训练',
    src: '/static/celebration/yinling-finish-01-jump.jpg',
  },
  {
    id: 'quiet-stretch',
    title: '慢慢舒展',
    alt: '银铃扎着丸子头，在窗边惬意地做训练后拉伸',
    src: '/static/celebration/yinling-finish-02-stretch.jpg',
  },
  {
    id: 'catching-breath',
    title: '大口呼吸',
    alt: '银铃扎着双马尾，流着汗弯腰喘气又露出笑容',
    src: '/static/celebration/yinling-finish-03-breath.jpg',
  },
  {
    id: 'daydream',
    title: '风里发呆',
    alt: '银铃披着长发，训练后坐在窗边喝水发呆',
    src: '/static/celebration/yinling-finish-04-daydream.jpg',
  },
  {
    id: 'peace-sign',
    title: '给今天比个耶',
    alt: '银铃梳着双丸子头，披着毛巾开心地比出胜利手势',
    src: '/static/celebration/yinling-finish-05-peace.jpg',
  },
  {
    id: 'last-curl',
    title: '最后一组',
    alt: '银铃扎着侧马尾，定格完成最后一次哑铃弯举的瞬间',
    src: '/static/celebration/yinling-finish-06-curl.jpg',
  },
  {
    id: 'happy-recovery',
    title: '安心躺一会',
    alt: '银铃完成训练后惬意地躺在瑜伽垫上恢复',
    src: '/static/celebration/yinling-finish-07-recovery.jpg',
  },
  {
    id: 'training-journal',
    title: '记下这一刻',
    alt: '银铃梳着编发马尾，在窗边记录今天的训练',
    src: '/static/celebration/yinling-finish-08-journal.jpg',
  },
]

function hashSessionId(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function resolveCompletionPosterIndex(sessionId: string, previewValue?: string) {
  const previewIndex = Number.parseInt(previewValue || '', 10)
  if (Number.isFinite(previewIndex) && previewIndex >= 1 && previewIndex <= COMPLETION_POSTERS.length) {
    return previewIndex - 1
  }
  return hashSessionId(sessionId || `${Date.now()}-${Math.random()}`) % COMPLETION_POSTERS.length
}

