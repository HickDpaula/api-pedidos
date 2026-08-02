import type { ApiErrorBody } from '../types'
import { ApiError } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

interface ApiRequestOptions {
  method?: string
  body?: unknown
  token?: string | null
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: ApiRequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(
      'Não foi possível conectar à API. Verifique se o backend está rodando.',
      0,
    )
  }

  const text = await response.text()
  let data: ApiErrorBody | T | null = null

  if (text) {
    try {
      data = JSON.parse(text) as ApiErrorBody | T
    } catch {
      data = { erro: text }
    }
  }

  if (!response.ok) {
    const errorBody = (data as ApiErrorBody | null) ?? null
    let message =
      errorBody?.erro ||
      (errorBody?.campos && Object.values(errorBody.campos).join(', ')) ||
      'Erro na requisição'

    if (
      response.status === 401 &&
      path.startsWith('/api/auth/') &&
      (!errorBody?.erro || message === 'Erro na requisição')
    ) {
      message = 'E-mail ou senha inválidos'
    }

    throw new ApiError(message, response.status, errorBody)
  }

  return data as T
}
