import { useMemo, useState } from 'react'
import { isStatusAtivo, isStatusFinal } from '../constants/statusPedido'
import Alert from './ui/Alert'
import PedidoCard from './PedidoCard'

export default function PedidoList({
  pedidos,
  loading,
  erro,
  onRefresh,
  onStatusChange,
}) {
  const [aba, setAba] = useState('ativos')

  const pedidosFiltrados = useMemo(() => {
    if (aba === 'historico') {
      return pedidos.filter((pedido) => isStatusFinal(pedido.status))
    }
    return pedidos.filter((pedido) => isStatusAtivo(pedido.status))
  }, [aba, pedidos])

  const totalAtivos = pedidos.filter((p) => isStatusAtivo(p.status)).length
  const totalHistorico = pedidos.filter((p) => isStatusFinal(p.status)).length

  const emptyMessage =
    aba === 'historico'
      ? 'Nenhum pedido no histórico ainda.'
      : 'Nenhum pedido em andamento. Crie o primeiro ao lado.'

  return (
    <section className="rounded-2xl border border-foody-border bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foody-dark">Pedidos</h2>
          <p className="text-sm text-foody-gray">
            Acompanhe o andamento e o histórico de entregas
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

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-foody-bg p-1">
        <button
          type="button"
          onClick={() => setAba('ativos')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            aba === 'ativos'
              ? 'bg-white text-foody-red shadow-sm'
              : 'text-foody-gray hover:text-foody-dark'
          }`}
        >
          Em andamento ({totalAtivos})
        </button>
        <button
          type="button"
          onClick={() => setAba('historico')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            aba === 'historico'
              ? 'bg-white text-foody-red shadow-sm'
              : 'text-foody-gray hover:text-foody-dark'
          }`}
        >
          Histórico ({totalHistorico})
        </button>
      </div>

      {erro && (
        <div className="mb-4">
          <Alert type="error">{erro}</Alert>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-foody-gray">Carregando pedidos...</p>
      ) : pedidosFiltrados.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foody-border px-4 py-10 text-center text-sm text-foody-gray">
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-3">
          {pedidosFiltrados.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onStatusChange={onStatusChange}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
