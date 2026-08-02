import type { AuthResponse, CadastroCredentials, LoginCredentials } from '../types'
import { apiRequest } from './client'

export function cadastrar(credentials: CadastroCredentials) {
  return apiRequest<AuthResponse>('/api/auth/cadastro', {
    method: 'POST',
    body: credentials,
  })
}

export function login(credentials: LoginCredentials) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: credentials,
  })
}
