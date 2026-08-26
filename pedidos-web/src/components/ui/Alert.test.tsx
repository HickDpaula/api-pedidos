import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Alert from './Alert'

describe('Alert', () => {
  it('renderiza o conteudo filho', () => {
    render(<Alert>Mensagem de erro</Alert>)
    expect(screen.getByText('Mensagem de erro')).toBeInTheDocument()
  })

  it('usa estilo de erro por padrao', () => {
    render(<Alert>Erro</Alert>)
    expect(screen.getByText('Erro')).toHaveClass('text-red-700')
  })

  it('usa estilo de sucesso quando type="success"', () => {
    render(<Alert type="success">Sucesso</Alert>)
    expect(screen.getByText('Sucesso')).toHaveClass('text-emerald-700')
  })
})
