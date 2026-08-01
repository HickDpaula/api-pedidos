import { useCallback, useEffect, useState } from 'react'
import { atualizarStatus, listarPedidos } from '../api/pedidos'
import { useAuth } from '../auth/AuthContext'
import Header from '../components/Header'
import PedidoForm from '../components/PedidoForm'
import PedidoList from '../components/PedidoList'

export default function PedidosPage() {
  const { token } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erroLista, setErroLista] = useState('')

  const carregarPedidos = useCallback(async () => {
    setErroLista('')
    setLoading(true)
    try {
      const data = await listarPedidos(token)
      setPedidos(data)
    } catch (error) {
      setErroLista(error.message || 'Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    carregarPedidos()
  }, [carregarPedidos])

  async function handleStatusChange(id, status) {
    setErroLista('')
    try {
      await atualizarStatus(token, id, status)
      await carregarPedidos()
    } catch (error) {
      setErroLista(error.message || 'Erro ao atualizar status')
    }
  }

  return (
    <div className="min-h-screen bg-foody-bg">
      <Header />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[380px_1fr]">
        <PedidoForm onCreated={carregarPedidos} />
        <PedidoList
          pedidos={pedidos}
          loading={loading}
          erro={erroLista}
          onRefresh={carregarPedidos}
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  )
}
