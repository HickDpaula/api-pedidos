import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PedidoCard from './PedidoCard'
import type { Pedido, StatusPedido } from '../types'

function criarPedido(status: StatusPedido): Pedido {
  return {
    id: 1,
    cliente: 'Maria Silva',
    enderecoEntrega: 'Rua das Flores, 100',
    status,
    itens: [{ id: 1, nome: 'X-Burger', quantidade: 2 }],
    criadoEm: '2026-01-01T10:00:00',
  }
}

function opcoesDoSelect() {
  return screen
    .getAllByRole('option')
    .map((option) => (option as HTMLOptionElement).value)
}

describe('PedidoCard — opcoes de status (regressao)', () => {
  // Antes da correcao, o select oferecia sempre os 5 status, permitindo
  // escolher transicoes que o backend (TRANSICOES_PERMITIDAS) rejeitaria.
  it.each<[StatusPedido, StatusPedido[]]>([
    ['RECEBIDO', ['RECEBIDO', 'EM_PREPARO', 'CANCELADO']],
    ['EM_PREPARO', ['EM_PREPARO', 'SAIU_PARA_ENTREGA', 'CANCELADO']],
    ['SAIU_PARA_ENTREGA', ['SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']],
  ])('para status %s, o select oferece exatamente %s', (status, esperado) => {
    render(<PedidoCard pedido={criarPedido(status)} onStatusChange={vi.fn()} />)
    expect(opcoesDoSelect()).toEqual(esperado)
  })

  it.each<StatusPedido>(['ENTREGUE', 'CANCELADO'])(
    'para status terminal %s, nao renderiza select e mostra aviso definitivo',
    (status) => {
      render(<PedidoCard pedido={criarPedido(status)} onStatusChange={vi.fn()} />)
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
      expect(
        screen.getByText('Status definitivo — não pode ser alterado.'),
      ).toBeInTheDocument()
    },
  )
})

describe('PedidoCard — fluxo de confirmacao', () => {
  it('transicao nao-terminal chama onStatusChange direto, sem modal', async () => {
    const onStatusChange = vi.fn()
    const user = userEvent.setup()
    render(<PedidoCard pedido={criarPedido('RECEBIDO')} onStatusChange={onStatusChange} />)

    await user.selectOptions(screen.getByRole('combobox'), 'EM_PREPARO')

    expect(onStatusChange).toHaveBeenCalledWith(1, 'EM_PREPARO')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('transicao para status terminal abre o modal antes de chamar onStatusChange', async () => {
    const onStatusChange = vi.fn()
    const user = userEvent.setup()
    render(<PedidoCard pedido={criarPedido('RECEBIDO')} onStatusChange={onStatusChange} />)

    await user.selectOptions(screen.getByRole('combobox'), 'CANCELADO')

    expect(onStatusChange).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onStatusChange).toHaveBeenCalledWith(1, 'CANCELADO')
  })

  it('cancelar no modal nao chama onStatusChange e reseta o select', async () => {
    const onStatusChange = vi.fn()
    const user = userEvent.setup()
    render(<PedidoCard pedido={criarPedido('RECEBIDO')} onStatusChange={onStatusChange} />)

    await user.selectOptions(screen.getByRole('combobox'), 'CANCELADO')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onStatusChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('RECEBIDO')
  })
})
