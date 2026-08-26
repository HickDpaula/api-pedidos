import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MessageModal from './MessageModal'

describe('MessageModal', () => {
  it('nao renderiza nada quando open=false', () => {
    render(<MessageModal open={false} title="T" message="M" onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza titulo e mensagem quando open=true', () => {
    render(
      <MessageModal
        open
        title="Falha no login"
        message="E-mail ou senha inválidos"
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Falha no login')).toBeInTheDocument()
    expect(screen.getByText('E-mail ou senha inválidos')).toBeInTheDocument()
  })

  it('chama onClose ao clicar no botao', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<MessageModal open title="T" message="M" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Entendi' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao clicar no backdrop', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<MessageModal open title="T" message="M" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao pressionar Escape', () => {
    const onClose = vi.fn()
    render(<MessageModal open title="T" message="M" onClose={onClose} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
