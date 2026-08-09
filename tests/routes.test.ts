import { describe, expect, it } from 'vitest'
import { isPrimaryRoute, isProtectedRoute, routeFromLaunch } from '@/config/routes'
import { guardNavigation } from '@/router'

describe('route access policy', () => {
  it('keeps first-level tabs public without blocking deeper browsing', () => {
    expect(isPrimaryRoute('/pages/today/index')).toBe(true)
    expect(isPrimaryRoute('/pages/profile/index?from=save')).toBe(true)
    expect(isProtectedRoute('/packages/library/pages/detail?id=demo')).toBe(false)
    expect(isProtectedRoute('/pages/onboarding/index')).toBe(false)
  })

  it('allows guest navigation until the user saves data', () => {
    const target = '/packages/planner/pages/select?area=back'
    expect(guardNavigation(target)).toBe(true)
  })

  it('rebuilds direct launch routes with encoded query values', () => {
    expect(routeFromLaunch('packages/library/pages/detail', { id: '动作 1' }))
      .toBe('/packages/library/pages/detail?id=%E5%8A%A8%E4%BD%9C%201')
  })
})
