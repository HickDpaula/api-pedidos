import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PedidoForm from './PedidoForm'
import { ApiError } from '../types'

const criarPedidoMock = vi.fn()

vi.mock('../api/pedidos', () => ({
  criarPedido: (...args: unknown[]) => criarPedidoMock(...args),
}))

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ token: 'token-123' }),
}))

describe('PedidoForm', () => {
  beforeEach(() => {
    criarPedidoMock.mockReset()
  })

  it('adiciona e remove linhas de item', async () => {
    const user = userEvent.setup()
    render(<PedidoForm />)

    expect(screen.getAllByPlaceholderText('Nome do item')).toHaveLength(1)

    await user.click(screen.getByText('+ Adicionar item'))
    expect(screen.getAllByPlaceholderText('Nome do item')).toHaveLength(2)

    await user.click(screen.getAllByRole('button', { name: 'Remover item' })[0])
    expect(screen.getAllByPlaceholderText('Nome do item')).toHaveLength(1)
  })

  it('envia o payload correto e mostra sucesso', async () => {
    criarPedidoMock.mockResolvedValue({})
    const onCreated = vi.fn()
    const user = userEvent.setup()
    render(<PedidoForm onCreated={onCreated} />)

    await user.type(screen.getByPlaceholderText('Nome do cliente'), 'Maria Silva')
    await user.type(screen.getByPlaceholderText('Rua, número, bairro'), 'Rua A, 10')
    await user.type(screen.getByPlaceholderText('Nome do item'), 'Pizza')

    await user.click(screen.getByRole('button', { name: 'Criar pedido' }))

    await waitFor(() => {
      expect(criarPedidoMock).toHaveBeenCalledWith('token-123', {
        cliente: 'Maria Silva',
        enderecoEntrega: 'Rua A, 10',
        itens: [{ nome: 'Pizza', quantidade: 1 }],
      })
    })

    expect(await screen.findByText('Pedido criado com sucesso!')).toBeInTheDocument()
    expect(onCreated).toHaveBeenCalledTimes(1)
  })

  it('mostra alerta de erro quando a criacao falha', async () => {
    criarPedidoMock.mockRejectedValue(new ApiError('Cliente é obrigatório', 400))
    const user = userEvent.setup()
    render(<PedidoForm />)

    await user.type(screen.getByPlaceholderText('Nome do cliente'), 'Maria')
    await user.type(screen.getByPlaceholderText('Rua, número, bairro'), 'Rua A')
    await user.type(screen.getByPlaceholderText('Nome do item'), 'Pizza')
    await user.click(screen.getByRole('button', { name: 'Criar pedido' }))

    expect(await screen.findByText('Cliente é obrigatório')).toBeInTheDocument()
  })
})
