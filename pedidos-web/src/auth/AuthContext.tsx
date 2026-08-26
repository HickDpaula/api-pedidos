import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import type {
  AuthResponse,
  AuthUser,
  CadastroCredentials,
  LoginCredentials,
} from '../types'
import { clearSession, getToken, getUser, saveSession } from './storage'

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  cadastrar: (data: CadastroCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<AuthUser | null>(() => getUser())

  async function handleAuthSuccess(response: AuthResponse) {
    const session = {
      token: response.token,
      id: response.id,
      nome: response.nome,
      email: response.email,
    }
    saveSession(session)
    setToken(session.token)
    setUser({ id: session.id, nome: session.nome, email: session.email })
  }

  async function login(credentials: LoginCredentials) {
    const response = await authApi.login(credentials)
    await handleAuthSuccess(response)
  }

  async function cadastrar(data: CadastroCredentials) {
    const response = await authApi.cadastrar(data)
    await handleAuthSuccess(response)
  }

  function logout() {
    clearSession()
    setToken(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      cadastrar,
      logout,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-localizado de propósito com seu Provider
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
