import type { CriarPedidoPayload, PaginaResponse, Pedido, StatusPedido } from '../types'
import { apiRequest } from './client'

export async function listarPedidos(token: string): Promise<Pedido[]> {
  const pagina = await apiRequest<PaginaResponse<Pedido>>('/api/pedidos', { token })
  return pagina.content
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
