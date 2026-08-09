function normalizeBaseUrl(value: string | undefined) {
  return (value || '').trim().replace(/\/+$/, '')
}

function normalizeTimeout(value: string | undefined) {
  const parsed = Number.parseInt(value || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10000
}

export const runtimeConfig = Object.freeze({
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  apiTimeoutMs: normalizeTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
})

export function requireApiBaseUrl() {
  if (!runtimeConfig.apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured')
  }
  return runtimeConfig.apiBaseUrl
}
