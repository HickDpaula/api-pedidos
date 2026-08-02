import type { StatusPedido } from '../types'
import { STATUS_LABELS, STATUS_STYLES } from '../constants/statusPedido'

interface StatusBadgeProps {
  status: StatusPedido
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style =
    STATUS_STYLES[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  const label = STATUS_LABELS[status] || status

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  )
}
