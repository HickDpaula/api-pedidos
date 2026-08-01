import { STATUS_LABELS, STATUS_PEDIDO } from '../constants/statusPedido'
import { formatarData } from '../utils/format'
import Alert from './ui/Alert'
import StatusBadge from './StatusBadge'

export default function PedidoList({
  pedidos,
  loading,
  erro,
  onRefresh,
  onStatusChange,
}) {
  return (
    <section className="rounded-2xl border border-foody-border bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foody-dark">Pedidos</h2>
          <p className="text-sm text-foody-gray">
            Status atuais dos pedidos cadastrados
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg border border-foody-border px-3 py-2 text-sm font-medium hover:border-foody-red hover:text-foody-red"
        >
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="mb-4">
          <Alert type="error">{erro}</Alert>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-foody-gray">Carregando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foody-border px-4 py-10 text-center text-sm text-foody-gray">
          Nenhum pedido ainda. Crie o primeiro ao lado.
        </p>
      ) : (
        <ul className="space-y-3">
          {pedidos.map((pedido) => (
            <li
              key={pedido.id}
              className="rounded-xl border border-foody-border p-4 transition hover:border-foody-red/40"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foody-dark">
                    #{pedido.id} — {pedido.cliente}
                  </p>
                  <p className="text-sm text-foody-gray">
                    {pedido.enderecoEntrega}
                  </p>
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

              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-medium text-foody-gray">
                  Atualizar status:
                </label>
                <select
                  value={pedido.status}
                  onChange={(e) => onStatusChange(pedido.id, e.target.value)}
                  className="rounded-lg border border-foody-border px-2 py-1.5 text-sm outline-none focus:border-foody-red"
                >
                  {STATUS_PEDIDO.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status] || status}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
