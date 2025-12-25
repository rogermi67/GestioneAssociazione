import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  // Se già autenticato, redirect alla dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      <Outlet />
    </div>
  )
}
