export function getCustomPageTopInset(): number {
  let inset = 12

  // #ifdef MP-WEIXIN
  try {
    const windowInfo = uni.getWindowInfo()
    const capsule = uni.getMenuButtonBoundingClientRect()
    inset = Math.max((windowInfo.statusBarHeight || 20) + 8, capsule.bottom + 8)
  } catch {
    inset = 56
  }
  // #endif

  return inset
}
