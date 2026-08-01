import { createContext, useContext, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import { clearSession, getToken, getUser, saveSession } from './storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(() => getUser())

  async function handleAuthSuccess(response) {
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

  async function login(credentials) {
    const response = await authApi.login(credentials)
    await handleAuthSuccess(response)
  }

  async function cadastrar(data) {
    const response = await authApi.cadastrar(data)
    await handleAuthSuccess(response)
  }

  function logout() {
    clearSession()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
