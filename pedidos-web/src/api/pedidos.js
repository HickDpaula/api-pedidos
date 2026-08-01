import { apiRequest } from './client'

export function listarPedidos(token) {
  return apiRequest('/api/pedidos', { token })
}

export function criarPedido(token, payload) {
  return apiRequest('/api/pedidos', {
    method: 'POST',
    body: payload,
    token,
  })
}

export function atualizarStatus(token, id, status) {
  return apiRequest(`/api/pedidos/${id}/status`, {
    method: 'PUT',
    body: { status },
    token,
  })
}
