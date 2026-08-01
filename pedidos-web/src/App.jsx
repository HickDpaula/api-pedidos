import { AuthProvider, useAuth } from './auth/AuthContext'
import AuthPage from './pages/AuthPage'
import PedidosPage from './pages/PedidosPage'

function AppContent() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <PedidosPage /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
