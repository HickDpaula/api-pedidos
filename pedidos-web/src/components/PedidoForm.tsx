import { useState, type ChangeEvent, type FormEvent } from 'react'
import { criarPedido } from '../api/pedidos'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../types'
import Alert from './ui/Alert'
import TextField from './ui/TextField'

interface ItemForm {
  nome: string
  quantidade: number | string
}

const ITEM_VAZIO: ItemForm = { nome: '', quantidade: 1 }

interface PedidoFormProps {
  onCreated?: () => void
}

export default function PedidoForm({ onCreated }: PedidoFormProps) {
  const { token } = useAuth()
  const [cliente, setCliente] = useState('')
  const [enderecoEntrega, setEnderecoEntrega] = useState('')
  const [itens, setItens] = useState<ItemForm[]>([{ ...ITEM_VAZIO }])
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [salvando, setSalvando] = useState(false)

  function atualizarItem(
    index: number,
    campo: keyof ItemForm,
    valor: string,
  ) {
    setItens((atual) =>
      atual.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)),
    )
  }

  function adicionarItem() {
    setItens((atual) => [...atual, { ...ITEM_VAZIO }])
  }

  function removerItem(index: number) {
    setItens((atual) =>
      atual.length === 1 ? atual : atual.filter((_, i) => i !== index),
    )
  }

  function resetForm() {
    setCliente('')
    setEnderecoEntrega('')
    setItens([{ ...ITEM_VAZIO }])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return

    setErro('')
    setSucesso('')
    setSalvando(true)

    try {
      await criarPedido(token, {
        cliente: cliente.trim(),
        enderecoEntrega: enderecoEntrega.trim(),
        itens: itens.map((item) => ({
          nome: item.nome.trim(),
          quantidade: Number(item.quantidade),
        })),
      })

      resetForm()
      setSucesso('Pedido criado com sucesso!')
      onCreated?.()
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Erro ao criar pedido'
      setErro(message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="h-fit rounded-2xl border border-foody-border bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-foody-dark">Novo pedido</h2>
      <p className="mb-5 text-sm text-foody-gray">
        Informe cliente, endereço e itens da entrega.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Cliente"
          required
          value={cliente}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCliente(e.target.value)
          }
          placeholder="Nome do cliente"
        />

        <TextField
          label="Endereço de entrega"
          required
          value={enderecoEntrega}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEnderecoEntrega(e.target.value)
          }
          placeholder="Rua, número, bairro"
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Itens</label>
            <button
              type="button"
              onClick={adicionarItem}
              className="text-sm font-semibold text-foody-red hover:text-foody-red-dark"
            >
              + Adicionar item
            </button>
          </div>

          {itens.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_88px_auto] gap-2">
              <input
                required
                value={item.nome}
                onChange={(e) => atualizarItem(index, 'nome', e.target.value)}
                className="rounded-lg border border-foody-border px-3 py-2 outline-none focus:border-foody-red focus:ring-2 focus:ring-foody-red/20"
                placeholder="Nome do item"
              />
              <input
                required
                type="number"
                min={1}
                value={item.quantidade}
                onChange={(e) =>
                  atualizarItem(index, 'quantidade', e.target.value)
                }
                className="rounded-lg border border-foody-border px-3 py-2 outline-none focus:border-foody-red focus:ring-2 focus:ring-foody-red/20"
              />
              <button
                type="button"
                onClick={() => removerItem(index)}
                className="rounded-lg border border-foody-border px-3 text-sm text-foody-gray hover:border-foody-red hover:text-foody-red"
                aria-label="Remover item"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {erro && <Alert type="error">{erro}</Alert>}
        {sucesso && <Alert type="success">{sucesso}</Alert>}

        <button
          type="submit"
          disabled={salvando}
          className="w-full rounded-lg bg-foody-red px-4 py-3 text-sm font-bold text-white transition hover:bg-foody-red-dark disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Criar pedido'}
        </button>
      </form>
    </section>
  )
}
