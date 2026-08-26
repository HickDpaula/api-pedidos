import { beforeEach, describe, expect, it } from 'vitest'
import { clearSession, getToken, getUser, saveSession } from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('salva e recupera token e usuario', () => {
    saveSession({ token: 'abc123', id: 1, nome: 'Henrique', email: 'henrique@email.com' })

    expect(getToken()).toBe('abc123')
    expect(getUser()).toEqual({ id: 1, nome: 'Henrique', email: 'henrique@email.com' })
  })

  it('retorna null quando nao ha sessao salva', () => {
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })

  it('limpa a sessao', () => {
    saveSession({ token: 'abc123', id: 1, nome: 'Henrique', email: 'henrique@email.com' })

    clearSession()

    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })

  it('retorna null quando o usuario salvo esta corrompido', () => {
    localStorage.setItem('foody_user', '{invalido')

    expect(getUser()).toBeNull()
  })
})
