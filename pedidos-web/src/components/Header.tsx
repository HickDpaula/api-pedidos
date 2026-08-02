import logoFoody from '../assets/Logo-Foody-retangular-300x100.png'
import { useAuth } from '../auth/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-foody-border bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={logoFoody}
            alt="Foody Delivery"
            className="h-10 w-auto object-contain"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foody-dark">
              Rastreador de Pedidos
            </p>
            <p className="text-xs text-foody-gray">Painel operacional</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-foody-gray sm:inline">
              Olá, <strong className="text-foody-dark">{user.nome}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-foody-border px-3 py-2 text-sm font-medium text-foody-dark transition hover:border-foody-red hover:text-foody-red"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
