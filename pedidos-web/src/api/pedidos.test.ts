import { beforeEach, describe, expect, it, vi } from 'vitest'
import { atualizarStatus, criarPedido, listarPedidos } from './pedidos'
import type { Pedido } from '../types'

const apiRequestMock = vi.fn()

vi.mock('./client', () => ({
  apiRequest: (...args: unknown[]) => apiRequestMock(...args),
}))

const pedidoExemplo: Pedido = {
  id: 1,
  cliente: 'Maria Silva',
  enderecoEntrega: 'Rua das Flores, 100',
  status: 'RECEBIDO',
  itens: [{ id: 1, nome: 'X-Burger', quantidade: 2 }],
  criadoEm: '2026-01-01T10:00:00',
}

describe('api/pedidos', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
  })

  it('listarPedidos desembrulha o campo content da pagina', async () => {
    apiRequestMock.mockResolvedValue({
      content: [pedidoExemplo],
      page: { size: 50, number: 0, totalElements: 1, totalPages: 1 },
    })

    const resultado = await listarPedidos('token-123')

    expect(resultado).toEqual([pedidoExemplo])
    expect(apiRequestMock).toHaveBeenCalledWith('/api/pedidos', { token: 'token-123' })
  })

  it('listarPedidos retorna array vazio quando a pagina esta vazia', async () => {
    apiRequestMock.mockResolvedValue({
      content: [],
      page: { size: 50, number: 0, totalElements: 0, totalPages: 0 },
    })

    const resultado = await listarPedidos('token-123')

    expect(resultado).toEqual([])
  })

  it('criarPedido envia o payload e token corretos', async () => {
    apiRequestMock.mockResolvedValue(pedidoExemplo)
    const payload = {
      cliente: 'Maria Silva',
      enderecoEntrega: 'Rua das Flores, 100',
      itens: [{ nome: 'X-Burger', quantidade: 2 }],
    }

    await criarPedido('token-123', payload)

    expect(apiRequestMock).toHaveBeenCalledWith('/api/pedidos', {
      method: 'POST',
      body: payload,
      token: 'token-123',
    })
  })

  it('atualizarStatus envia o status no corpo da requisicao', async () => {
    apiRequestMock.mockResolvedValue(pedidoExemplo)

    await atualizarStatus('token-123', 1, 'EM_PREPARO')

    expect(apiRequestMock).toHaveBeenCalledWith('/api/pedidos/1/status', {
      method: 'PUT',
      body: { status: 'EM_PREPARO' },
      token: 'token-123',
    })
  })
})
