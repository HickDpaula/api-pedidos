import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatusBadge from './StatusBadge'
import { STATUS_LABELS } from '../constants/statusPedido'
import type { StatusPedido } from '../types'

describe('StatusBadge', () => {
  it.each(Object.keys(STATUS_LABELS) as StatusPedido[])(
    'exibe o label de %s',
    (status) => {
      render(<StatusBadge status={status} />)
      expect(screen.getByText(STATUS_LABELS[status])).toBeInTheDocument()
    },
  )
})
