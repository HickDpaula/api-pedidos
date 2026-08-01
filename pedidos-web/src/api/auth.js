import { apiRequest } from './client'

export function cadastrar({ nome, email, senha }) {
  return apiRequest('/api/auth/cadastro', {
    method: 'POST',
    body: { nome, email, senha },
  })
}

export function login({ email, senha }) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, senha },
  })
}
