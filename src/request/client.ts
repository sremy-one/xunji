import { requireApiBaseUrl, runtimeConfig } from '@/config/runtime'

export class HttpError extends Error {
  constructor(public readonly statusCode: number, public readonly code: string, message: string) {
    super(message)
    this.name = 'HttpError'
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: UniNamespace.RequestOptions['data']
  headers?: Record<string, string>
}

export function rawRequest<T>(path: string, options: RequestOptions = {}) {
  const baseUrl = requireApiBaseUrl()
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${path}`,
      method: options.method || 'GET',
      data: options.data,
      header: { 'content-type': 'application/json', ...options.headers },
      timeout: runtimeConfig.apiTimeoutMs,
      success(response) {
        const body = response.data as Record<string, unknown> | undefined
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data as T)
          return
        }
        reject(new HttpError(
          response.statusCode,
          typeof body?.code === 'string' ? body.code : 'HTTP_ERROR',
          typeof body?.message === 'string' ? body.message : `Request failed with status ${response.statusCode}`,
        ))
      },
      fail(error) {
        reject(new HttpError(0, 'NETWORK_ERROR', error.errMsg || 'Network request failed'))
      },
    })
  })
}
