import { useCallback, useEffect, useState } from 'react'
import { atualizarStatus, listarPedidos } from '../api/pedidos'
import { useAuth } from '../auth/AuthContext'
import Header from '../components/Header'
import PedidoForm from '../components/PedidoForm'
import PedidoList from '../components/PedidoList'
import { ApiError, type Pedido, type StatusPedido } from '../types'

export default function PedidosPage() {
  const { token } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [erroLista, setErroLista] = useState('')

  const carregarPedidos = useCallback(async () => {
    if (!token) return

    setErroLista('')
    setLoading(true)
    try {
      const data = await listarPedidos(token)
      setPedidos(data)
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Erro ao carregar pedidos'
      setErroLista(message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carregamento inicial na montagem; sem lib de data-fetching no projeto
    void carregarPedidos()
  }, [carregarPedidos])

  async function handleStatusChange(id: number, status: StatusPedido) {
    if (!token) return

    setErroLista('')
    try {
      await atualizarStatus(token, id, status)
      await carregarPedidos()
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Erro ao atualizar status'
      setErroLista(message)
    }
  }

  return (
    <div className="min-h-screen bg-foody-bg">
      <Header />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[380px_1fr]">
        <PedidoForm onCreated={() => void carregarPedidos()} />
        <PedidoList
          pedidos={pedidos}
          loading={loading}
          erro={erroLista}
          onRefresh={() => void carregarPedidos()}
          onStatusChange={(id, status) => void handleStatusChange(id, status)}
        />
      </main>
    </div>
  )
}
