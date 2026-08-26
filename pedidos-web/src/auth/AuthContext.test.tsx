import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import type { AuthResponse } from '../types'

const loginMock = vi.fn()
const cadastrarMock = vi.fn()
const logoutMock = vi.fn()

vi.mock('../api/auth', () => ({
  login: (...args: unknown[]) => loginMock(...args),
  cadastrar: (...args: unknown[]) => cadastrarMock(...args),
  logout: (...args: unknown[]) => logoutMock(...args),
}))

const authResponse: AuthResponse = {
  token: 'token-123',
  tipo: 'Bearer',
  id: 1,
  nome: 'Henrique',
  email: 'henrique@email.com',
}

function TestConsumer() {
  const { token, user, isAuthenticated, login, cadastrar, logout } = useAuth()
  return (
    <div>
      <span data-testid="token">{token ?? 'sem-token'}</span>
      <span data-testid="user">{user?.nome ?? 'sem-user'}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <button onClick={() => login({ email: 'henrique@email.com', senha: '123456' })}>
        Login
      </button>
      <button
        onClick={() =>
          cadastrar({ nome: 'Henrique', email: 'henrique@email.com', senha: '123456' })
        }
      >
        Cadastrar
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

function renderComProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    loginMock.mockReset()
    cadastrarMock.mockReset()
    logoutMock.mockReset()
  })

  it('inicia sem sessao quando localStorage esta vazio', () => {
    renderComProvider()

    expect(screen.getByTestId('token')).toHaveTextContent('sem-token')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })

  it('login bem sucedido salva sessao e atualiza o contexto', async () => {
    loginMock.mockResolvedValue(authResponse)
    const user = userEvent.setup()
    renderComProvider()

    await user.click(screen.getByText('Login'))

    expect(screen.getByTestId('token')).toHaveTextContent('token-123')
    expect(screen.getByTestId('user')).toHaveTextContent('Henrique')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
    expect(localStorage.getItem('foody_token')).toBe('token-123')
  })

  it('cadastro bem sucedido salva sessao e atualiza o contexto', async () => {
    cadastrarMock.mockResolvedValue(authResponse)
    const user = userEvent.setup()
    renderComProvider()

    await user.click(screen.getByText('Cadastrar'))

    expect(screen.getByTestId('token')).toHaveTextContent('token-123')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
  })

  it('logout limpa sessao local e revoga o token no backend', async () => {
    loginMock.mockResolvedValue(authResponse)
    logoutMock.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderComProvider()

    await user.click(screen.getByText('Login'))
    await user.click(screen.getByText('Logout'))

    expect(screen.getByTestId('token')).toHaveTextContent('sem-token')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
    expect(localStorage.getItem('foody_token')).toBeNull()
    expect(logoutMock).toHaveBeenCalledWith('token-123')
  })

  it('logout sem sessao ativa nao chama a API', async () => {
    const user = userEvent.setup()
    renderComProvider()

    await user.click(screen.getByText('Logout'))

    expect(logoutMock).not.toHaveBeenCalled()
  })

  it('logout limpa a sessao local mesmo se a revogacao no backend falhar', async () => {
    loginMock.mockResolvedValue(authResponse)
    logoutMock.mockRejectedValue(new Error('rede fora'))
    const user = userEvent.setup()
    renderComProvider()

    await user.click(screen.getByText('Login'))
    await user.click(screen.getByText('Logout'))

    expect(screen.getByTestId('token')).toHaveTextContent('sem-token')
  })
})
