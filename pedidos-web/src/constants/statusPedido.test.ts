import { describe, expect, it } from 'vitest'
import {
  getTransicoesPermitidas,
  isStatusAtivo,
  isStatusFinal,
} from './statusPedido'
import type { StatusPedido } from '../types'

describe('isStatusFinal / isStatusAtivo', () => {
  it.each<[StatusPedido, boolean]>([
    ['RECEBIDO', false],
    ['EM_PREPARO', false],
    ['SAIU_PARA_ENTREGA', false],
    ['ENTREGUE', true],
    ['CANCELADO', true],
  ])('isStatusFinal(%s) === %s', (status, esperado) => {
    expect(isStatusFinal(status)).toBe(esperado)
    expect(isStatusAtivo(status)).toBe(!esperado)
  })
})

describe('getTransicoesPermitidas', () => {
  // Copia atual de PedidoService.TRANSICOES_PERMITIDAS (backend) — se o mapa
  // do backend mudar, este teste precisa mudar junto para continuar valendo
  // como guardiao de sincronia entre as duas camadas.
  it.each<[StatusPedido, StatusPedido[]]>([
    ['RECEBIDO', ['EM_PREPARO', 'CANCELADO']],
    ['EM_PREPARO', ['SAIU_PARA_ENTREGA', 'CANCELADO']],
    ['SAIU_PARA_ENTREGA', ['ENTREGUE', 'CANCELADO']],
    ['ENTREGUE', []],
    ['CANCELADO', []],
  ])('%s -> %s', (status, esperado) => {
    expect(getTransicoesPermitidas(status)).toEqual(esperado)
  })
})
