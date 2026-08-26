import type { StatusPedido } from '../types'

export const STATUS_PEDIDO: StatusPedido[] = [
  'RECEBIDO',
  'EM_PREPARO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
  'CANCELADO',
]

export const STATUS_ATIVOS: StatusPedido[] = [
  'RECEBIDO',
  'EM_PREPARO',
  'SAIU_PARA_ENTREGA',
]

export const STATUS_FINAIS: StatusPedido[] = ['ENTREGUE', 'CANCELADO']

export const STATUS_LABELS: Record<StatusPedido, string> = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export const STATUS_STYLES: Record<StatusPedido, string> = {
  RECEBIDO: 'bg-blue-50 text-blue-700 border-blue-200',
  EM_PREPARO: 'bg-amber-50 text-amber-700 border-amber-200',
  SAIU_PARA_ENTREGA: 'bg-purple-50 text-purple-700 border-purple-200',
  ENTREGUE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELADO: 'bg-red-50 text-red-700 border-red-200',
}

export function isStatusFinal(status: StatusPedido) {
  return STATUS_FINAIS.includes(status)
}

export function isStatusAtivo(status: StatusPedido) {
  return STATUS_ATIVOS.includes(status)
}

// Espelha PedidoService.TRANSICOES_PERMITIDAS (backend) — mantenha os dois em sincronia.
const TRANSICOES_PERMITIDAS: Record<StatusPedido, StatusPedido[]> = {
  RECEBIDO: ['EM_PREPARO', 'CANCELADO'],
  EM_PREPARO: ['SAIU_PARA_ENTREGA', 'CANCELADO'],
  SAIU_PARA_ENTREGA: ['ENTREGUE', 'CANCELADO'],
  ENTREGUE: [],
  CANCELADO: [],
}

export function getTransicoesPermitidas(status: StatusPedido): StatusPedido[] {
  return TRANSICOES_PERMITIDAS[status]
}
