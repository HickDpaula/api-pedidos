import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Header from './Header'

const logoutMock = vi.fn()

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, nome: 'Henrique', email: 'henrique@email.com' },
    logout: logoutMock,
  }),
}))

describe('Header', () => {
  it('exibe o nome do usuario', () => {
    render(<Header />)
    expect(screen.getByText('Henrique')).toBeInTheDocument()
  })

  it('chama logout ao clicar em Sair', async () => {
    const user = userEvent.setup()
    render(<Header />)

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(logoutMock).toHaveBeenCalledTimes(1)
  })
})
