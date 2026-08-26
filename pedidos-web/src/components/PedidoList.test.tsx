import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PedidoList from './PedidoList'
import type { Pedido, StatusPedido } from '../types'

function pedido(id: number, status: StatusPedido): Pedido {
  return {
    id,
    cliente: `Cliente ${id}`,
    enderecoEntrega: 'Rua A, 10',
    status,
    itens: [{ id, nome: 'Item', quantidade: 1 }],
    criadoEm: '2026-01-01T10:00:00',
  }
}

const pedidos: Pedido[] = [
  pedido(1, 'RECEBIDO'),
  pedido(2, 'EM_PREPARO'),
  pedido(3, 'ENTREGUE'),
  pedido(4, 'CANCELADO'),
]

describe('PedidoList', () => {
  it('mostra a contagem correta nas abas', () => {
    render(
      <PedidoList pedidos={pedidos} loading={false} erro="" onRefresh={vi.fn()} onStatusChange={vi.fn()} />,
    )

    expect(screen.getByText('Em andamento (2)')).toBeInTheDocument()
    expect(screen.getByText('Histórico (2)')).toBeInTheDocument()
  })

  it('exibe apenas pedidos ativos na aba padrao', () => {
    render(
      <PedidoList pedidos={pedidos} loading={false} erro="" onRefresh={vi.fn()} onStatusChange={vi.fn()} />,
    )

    expect(screen.getByText(/Cliente 1/)).toBeInTheDocument()
    expect(screen.getByText(/Cliente 2/)).toBeInTheDocument()
    expect(screen.queryByText(/Cliente 3/)).not.toBeInTheDocument()
  })

  it('troca para o historico ao clicar na aba', async () => {
    const user = userEvent.setup()
    render(
      <PedidoList pedidos={pedidos} loading={false} erro="" onRefresh={vi.fn()} onStatusChange={vi.fn()} />,
    )

    await user.click(screen.getByText('Histórico (2)'))

    expect(screen.getByText(/Cliente 3/)).toBeInTheDocument()
    expect(screen.getByText(/Cliente 4/)).toBeInTheDocument()
    expect(screen.queryByText(/Cliente 1/)).not.toBeInTheDocument()
  })

  it('mostra mensagem de vazio quando nao ha pedidos ativos', () => {
    render(<PedidoList pedidos={[]} loading={false} erro="" onRefresh={vi.fn()} onStatusChange={vi.fn()} />)
    expect(
      screen.getByText('Nenhum pedido em andamento. Crie o primeiro ao lado.'),
    ).toBeInTheDocument()
  })

  it('mostra estado de carregamento', () => {
    render(<PedidoList pedidos={[]} loading erro="" onRefresh={vi.fn()} onStatusChange={vi.fn()} />)
    expect(screen.getByText('Carregando pedidos...')).toBeInTheDocument()
  })

  it('mostra o erro quando presente', () => {
    render(
      <PedidoList pedidos={[]} loading={false} erro="Falha ao carregar" onRefresh={vi.fn()} onStatusChange={vi.fn()} />,
    )
    expect(screen.getByText('Falha ao carregar')).toBeInTheDocument()
  })

  it('chama onRefresh ao clicar em Atualizar', async () => {
    const onRefresh = vi.fn()
    const user = userEvent.setup()
    render(<PedidoList pedidos={[]} loading={false} erro="" onRefresh={onRefresh} onStatusChange={vi.fn()} />)

    await user.click(screen.getByText('Atualizar'))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })
})
