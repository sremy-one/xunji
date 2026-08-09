const WECHAT_SAFE_STACK_DEPTH = 9
const STACK_LIMIT_MESSAGE = /webview count limit exceed/i

function replaceCurrentPage(url: string) {
  uni.redirectTo({
    url,
    fail: () => {
      uni.reLaunch({ url })
    },
  })
}

export function navigateToSafe(url: string) {
  if (getCurrentPages().length >= WECHAT_SAFE_STACK_DEPTH) {
    replaceCurrentPage(url)
    return
  }

  uni.navigateTo({
    url,
    fail: (error) => {
      if (STACK_LIMIT_MESSAGE.test(error.errMsg || '')) {
        replaceCurrentPage(url)
        return
      }

      console.warn(`[navigation] navigateTo failed: ${error.errMsg}`)
      uni.showToast({ title: '页面暂时无法打开，请稍后重试', icon: 'none' })
    },
  })
}
