export const PRIMARY_ROUTES = new Set([
  '/pages/today/index',
  '/pages/train/index',
  '/pages/records/index',
  '/pages/profile/index',
])

export function normalizeRoute(url: string) {
  const path = url.split('?')[0]
  return path.startsWith('/') ? path : `/${path}`
}

export function isPrimaryRoute(url: string) {
  return PRIMARY_ROUTES.has(normalizeRoute(url))
}

export function isProtectedRoute(_url: string) {
  return false
}

export function routeFromLaunch(path?: string, query?: Record<string, string | number | boolean>) {
  const route = normalizeRoute(path || '/pages/today/index')
  const entries = Object.entries(query || {})
  if (!entries.length) return route
  return `${route}?${entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&')}`
}
