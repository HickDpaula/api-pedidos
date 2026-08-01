import { useState } from 'react'
import logoFoody from '../assets/Logo-Foody-retangular-300x100.png'
import { useAuth } from '../auth/AuthContext'
import Alert from '../components/ui/Alert'
import TextField from '../components/ui/TextField'

export default function AuthPage() {
  const { login, cadastrar } = useAuth()
  const [mode, setMode] = useState('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')
    setLoading(true)

    try {
      if (isLogin) {
        await login({ email, senha })
      } else {
        await cadastrar({ nome, email, senha })
      }
    } catch (error) {
      setErro(error.message || 'Não foi possível autenticar')
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
            onClick={() => {
              setMode('login')
              setErro('')
            }}
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
            onClick={() => {
              setMode('cadastro')
              setErro('')
            }}
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

          {erro && <Alert type="error">{erro}</Alert>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-foody-red px-4 py-3 text-sm font-bold text-white transition hover:bg-foody-red-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
