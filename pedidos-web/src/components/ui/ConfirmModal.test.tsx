import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ConfirmModal from './ConfirmModal'

describe('ConfirmModal', () => {
  it('nao renderiza nada quando open=false', () => {
    render(
      <ConfirmModal open={false} title="T" message="M" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza titulo e mensagem quando open=true', () => {
    render(
      <ConfirmModal
        open
        title="Confirmar status definitivo"
        message="Esta acao nao pode ser desfeita"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirmar status definitivo')).toBeInTheDocument()
    expect(screen.getByText('Esta acao nao pode ser desfeita')).toBeInTheDocument()
  })

  it('chama onConfirm ao clicar em Confirmar', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmModal open title="T" message="M" onConfirm={onConfirm} onCancel={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('chama onCancel ao clicar em Cancelar', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmModal open title="T" message="M" onConfirm={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('chama onCancel ao clicar no backdrop', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmModal open title="T" message="M" onConfirm={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('chama onCancel ao pressionar Escape', () => {
    const onCancel = vi.fn()
    render(<ConfirmModal open title="T" message="M" onConfirm={vi.fn()} onCancel={onCancel} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
