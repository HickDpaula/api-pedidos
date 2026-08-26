import { describe, expect, it } from 'vitest'
import { formatarData } from './format'

describe('formatarData', () => {
  it('retorna "-" para valor vazio', () => {
    expect(formatarData(undefined)).toBe('-')
    expect(formatarData(null)).toBe('-')
    expect(formatarData('')).toBe('-')
  })

  it('formata uma data ISO valida no padrao pt-BR', () => {
    const iso = '2026-03-15T10:30:00'
    const esperado = new Date(iso).toLocaleString('pt-BR')

    expect(formatarData(iso)).toBe(esperado)
  })
})
