import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './client'
import { ApiError } from '../types'

function mockFetchResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as Response
}

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('retorna os dados em uma resposta de sucesso', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(200, { id: 1, nome: 'Henrique' }))

    const resultado = await apiRequest<{ id: number; nome: string }>('/api/pedidos')

    expect(resultado).toEqual({ id: 1, nome: 'Henrique' })
  })

  it('envia o header Authorization somente quando o token e fornecido', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(200, {}))

    await apiRequest('/api/pedidos', { token: 'meu-token' })

    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect((options?.headers as Record<string, string>).Authorization).toBe('Bearer meu-token')
  })

  it('lanca ApiError com status 0 quando a rede falha', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))

    await expect(apiRequest('/api/pedidos')).rejects.toMatchObject({
      status: 0,
      message: 'Não foi possível conectar à API. Verifique se o backend está rodando.',
    })
  })

  it('lanca ApiError usando o campo erro do corpo de resposta', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(404, { erro: 'Pedido não encontrado' }))

    await expect(apiRequest('/api/pedidos/99')).rejects.toMatchObject({
      status: 404,
      message: 'Pedido não encontrado',
    })
  })

  it('lanca ApiError juntando os campos de validacao quando nao ha erro', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockFetchResponse(400, { campos: { cliente: 'Cliente é obrigatório', itens: 'Pedido deve ter ao menos um item' } }),
    )

    await expect(apiRequest('/api/pedidos', { method: 'POST' })).rejects.toMatchObject({
      status: 400,
      message: 'Cliente é obrigatório, Pedido deve ter ao menos um item',
    })
  })

  it('usa mensagem fixa para 401 em rotas de auth sem erro claro', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(401, {}))

    await expect(apiRequest('/api/auth/login', { method: 'POST' })).rejects.toMatchObject({
      status: 401,
      message: 'E-mail ou senha inválidos',
    })
  })

  it('nao aplica a mensagem fixa de 401 fora de rotas de auth', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(401, {}))

    await expect(apiRequest('/api/pedidos')).rejects.toBeInstanceOf(ApiError)
    await expect(apiRequest('/api/pedidos')).rejects.toMatchObject({
      status: 401,
      message: 'Erro na requisição',
    })
  })
})
