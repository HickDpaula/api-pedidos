export type StatusPedido =
  | 'RECEBIDO'
  | 'EM_PREPARO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO'

export interface AuthUser {
  id: number
  nome: string
  email: string
}

export interface AuthResponse extends AuthUser {
  token: string
  tipo: string
}

export interface LoginCredentials {
  email: string
  senha: string
}

export interface CadastroCredentials {
  nome: string
  email: string
  senha: string
}

export interface AuthSession extends AuthUser {
  token: string
}

export interface ItemPedido {
  id: number
  nome: string
  quantidade: number
}

export interface Pedido {
  id: number
  cliente: string
  enderecoEntrega: string
  status: StatusPedido
  itens: ItemPedido[]
  criadoEm: string
}

export interface PaginaResponse<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface CriarPedidoPayload {
  cliente: string
  enderecoEntrega: string
  itens: Array<{
    nome: string
    quantidade: number
  }>
}

export interface ApiErrorBody {
  erro?: string
  campos?: Record<string, string>
  status?: number
  timestamp?: string
}

export class ApiError extends Error {
  status: number
  data: ApiErrorBody | null

  constructor(message: string, status = 0, data: ApiErrorBody | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}
