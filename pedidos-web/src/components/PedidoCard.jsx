import { useState } from 'react'
import {
  STATUS_LABELS,
  STATUS_PEDIDO,
  isStatusFinal,
} from '../constants/statusPedido'
import { formatarData } from '../utils/format'
import ConfirmModal from './ui/ConfirmModal'
import StatusBadge from './StatusBadge'

export default function PedidoCard({ pedido, onStatusChange }) {
  const final = isStatusFinal(pedido.status)
  const [pendingStatus, setPendingStatus] = useState(null)
  const [selectKey, setSelectKey] = useState(0)

  function resetSelect() {
    setPendingStatus(null)
    setSelectKey((atual) => atual + 1)
  }

  function handleStatusChange(event) {
    const novoStatus = event.target.value

    if (novoStatus === pedido.status) return

    if (isStatusFinal(novoStatus)) {
      setPendingStatus(novoStatus)
      return
    }

    onStatusChange(pedido.id, novoStatus)
  }

  function handleConfirm() {
    if (!pendingStatus) return
    const statusConfirmado = pendingStatus
    setPendingStatus(null)
    onStatusChange(pedido.id, statusConfirmado)
  }

  function handleCancel() {
    resetSelect()
  }

  const labelPendente = pendingStatus ? STATUS_LABELS[pendingStatus] : ''

  return (
    <li className="rounded-xl border border-foody-border p-4 transition hover:border-foody-red/40">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foody-dark">
            #{pedido.id} — {pedido.cliente}
          </p>
          <p className="text-sm text-foody-gray">{pedido.enderecoEntrega}</p>
          <p className="mt-1 text-xs text-foody-gray">
            {formatarData(pedido.criadoEm)}
          </p>
        </div>
        <StatusBadge status={pedido.status} />
      </div>

      <ul className="mb-3 space-y-1 text-sm text-foody-dark">
        {pedido.itens?.map((item) => (
          <li key={item.id}>
            {item.quantidade}x {item.nome}
          </li>
        ))}
      </ul>

      {final ? (
        <p className="text-xs text-foody-gray">
          Status definitivo — não pode ser alterado.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-foody-gray">
            Atualizar status:
          </label>
          <select
            key={`${pedido.id}-${pedido.status}-${selectKey}`}
            value={pedido.status}
            onChange={handleStatusChange}
            className="rounded-lg border border-foody-border px-2 py-1.5 text-sm outline-none focus:border-foody-red"
          >
            {STATUS_PEDIDO.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] || status}
              </option>
            ))}
          </select>
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingStatus)}
        title="Confirmar status definitivo"
        message={`Ao marcar como "${labelPendente}", este pedido irá para o histórico e não será possível alterar o status depois. Deseja continuar?`}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </li>
  )
}
