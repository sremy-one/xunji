import { HttpError, rawRequest, type RequestOptions } from './client'
import { refreshAuthentication, requireAuthSession } from '@/services/auth-session'

export async function authenticatedRequest<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const session = requireAuthSession()
  try {
    return await rawRequest<T>(path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${session.accessToken}` },
    })
  } catch (error) {
    if (retry && error instanceof HttpError && error.statusCode === 401) {
      const refreshed = await refreshAuthentication()
      return rawRequest<T>(path, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${refreshed.accessToken}` },
      })
    }
    throw error
  }
}
