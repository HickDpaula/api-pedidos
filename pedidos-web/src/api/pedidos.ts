import type { CriarPedidoPayload, Pedido, StatusPedido } from '../types'
import { apiRequest } from './client'

export function listarPedidos(token: string) {
  return apiRequest<Pedido[]>('/api/pedidos', { token })
}

export function criarPedido(token: string, payload: CriarPedidoPayload) {
  return apiRequest<Pedido>('/api/pedidos', {
    method: 'POST',
    body: payload,
    token,
  })
}

export function atualizarStatus(
  token: string,
  id: number,
  status: StatusPedido,
) {
  return apiRequest<Pedido>(`/api/pedidos/${id}/status`, {
    method: 'PUT',
    body: { status },
    token,
  })
}
