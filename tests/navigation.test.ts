import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { navigateToSafe } from '@/utils/navigation'

describe('safe mini program navigation', () => {
  let stackDepth = 1
  const navigateTo = vi.fn()
  const redirectTo = vi.fn()
  const reLaunch = vi.fn()

  beforeEach(() => {
    stackDepth = 1
    navigateTo.mockReset()
    redirectTo.mockReset()
    reLaunch.mockReset()

    vi.stubGlobal('getCurrentPages', () => Array.from({ length: stackDepth }, () => ({})))
    vi.stubGlobal('uni', {
      navigateTo,
      redirectTo,
      reLaunch,
      showToast: vi.fn(),
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('uses navigateTo while the page stack has room', () => {
    navigateToSafe('/packages/library/pages/index')

    expect(navigateTo).toHaveBeenCalledWith(expect.objectContaining({
      url: '/packages/library/pages/index',
    }))
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('replaces the current page before reaching the webview limit', () => {
    stackDepth = 9

    navigateToSafe('/packages/planner/pages/select')

    expect(navigateTo).not.toHaveBeenCalled()
    expect(redirectTo).toHaveBeenCalledWith(expect.objectContaining({
      url: '/packages/planner/pages/select',
    }))
  })

  it('falls back to redirectTo when WeChat reports the webview limit', () => {
    navigateTo.mockImplementation((options) => {
      options.fail({ errMsg: 'navigateTo:fail webview count limit exceed' })
    })

    navigateToSafe('/pages/onboarding/index')

    expect(redirectTo).toHaveBeenCalledWith(expect.objectContaining({
      url: '/pages/onboarding/index',
    }))
  })
})
