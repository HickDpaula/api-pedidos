const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    const error = new Error(
      'Não foi possível conectar à API. Verifique se o backend está rodando.',
    )
    error.status = 0
    throw error
  }

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { erro: text }
    }
  }

  if (!response.ok) {
    let message =
      data?.erro ||
      (data?.campos && Object.values(data.campos).join(', ')) ||
      'Erro na requisição'

    if (
      response.status === 401 &&
      path.startsWith('/api/auth/') &&
      (!data?.erro || message === 'Erro na requisição')
    ) {
      message = 'E-mail ou senha inválidos'
    }

    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
