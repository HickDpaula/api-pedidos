import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthPage from './AuthPage'
import { ApiError } from '../types'

const loginMock = vi.fn()
const cadastrarMock = vi.fn()

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ login: loginMock, cadastrar: cadastrarMock }),
}))

describe('AuthPage', () => {
  beforeEach(() => {
    loginMock.mockReset()
    cadastrarMock.mockReset()
  })

  it('inicia no modo login, sem campo Nome', () => {
    render(<AuthPage />)
    expect(screen.queryByPlaceholderText('Seu nome')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('mostra o campo Nome ao alternar para cadastro', async () => {
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: 'Cadastro' }))

    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument()
  })

  it('envia login com email e senha', async () => {
    loginMock.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.type(screen.getByPlaceholderText('voce@email.com'), 'henrique@email.com')
    await user.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(loginMock).toHaveBeenCalledWith({ email: 'henrique@email.com', senha: '123456' })
  })

  it('mostra modal de falha no login com a mensagem do erro', async () => {
    loginMock.mockRejectedValue(new ApiError('E-mail ou senha inválidos', 401))
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.type(screen.getByPlaceholderText('voce@email.com'), 'henrique@email.com')
    await user.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Falha no login')).toBeInTheDocument()
    expect(screen.getByText('E-mail ou senha inválidos')).toBeInTheDocument()
  })
})
