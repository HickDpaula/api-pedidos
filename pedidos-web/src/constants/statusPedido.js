export const STATUS_PEDIDO = [
  'RECEBIDO',
  'EM_PREPARO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
  'CANCELADO',
]

export const STATUS_LABELS = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export const STATUS_STYLES = {
  RECEBIDO: 'bg-blue-50 text-blue-700 border-blue-200',
  EM_PREPARO: 'bg-amber-50 text-amber-700 border-amber-200',
  SAIU_PARA_ENTREGA: 'bg-purple-50 text-purple-700 border-purple-200',
  ENTREGUE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELADO: 'bg-red-50 text-red-700 border-red-200',
}
