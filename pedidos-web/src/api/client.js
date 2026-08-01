const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

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
    const message =
      data?.erro ||
      (data?.campos && Object.values(data.campos).join(', ')) ||
      'Erro na requisição'
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
