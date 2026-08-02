import { useState, type FormEvent } from 'react'
import logoFoody from '../assets/Logo-Foody-retangular-300x100.png'
import { useAuth } from '../auth/AuthContext'
import MessageModal from '../components/ui/MessageModal'
import TextField from '../components/ui/TextField'
import { ApiError } from '../types'

type AuthMode = 'login' | 'cadastro'

export default function AuthPage() {
  const { login, cadastrar } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroModal, setErroModal] = useState({
    open: false,
    title: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  function mostrarErro(title: string, message: string) {
    setErroModal({ open: true, title, message })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login({ email, senha })
      } else {
        await cadastrar({ nome, email, senha })
      }
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Não foi possível autenticar'
      const title = isLogin ? 'Falha no login' : 'Falha no cadastro'
      mostrarErro(title, message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-foody-bg px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-foody-border bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={logoFoody}
            alt="Foody Delivery"
            className="mb-4 h-14 w-auto object-contain"
          />
          <h1 className="text-2xl font-bold text-foody-dark">
            {isLogin ? 'Entrar' : 'Criar conta'}
          </h1>
          <p className="mt-1 text-sm text-foody-gray">
            Acesse o rastreador de pedidos Foody
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-foody-bg p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              isLogin
                ? 'bg-white text-foody-red shadow-sm'
                : 'text-foody-gray hover:text-foody-dark'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('cadastro')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              !isLogin
                ? 'bg-white text-foody-red shadow-sm'
                : 'text-foody-gray hover:text-foody-dark'
            }`}
          >
            Cadastro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <TextField
              label="Nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
            />
          )}

          <TextField
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />

          <TextField
            label="Senha"
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-foody-red px-4 py-3 text-sm font-bold text-white transition hover:bg-foody-red-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </div>

      <MessageModal
        open={erroModal.open}
        title={erroModal.title}
        message={erroModal.message}
        onClose={() => setErroModal({ open: false, title: '', message: '' })}
      />
    </div>
  )
}
