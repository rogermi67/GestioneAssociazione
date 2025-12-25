import { useAuthStore } from '../stores/authStore'

export default function AdminOnly({ children, fallback = null }) {
  const isAdmin = useAuthStore(state => state.isAdmin())
  
  if (!isAdmin) {
    return fallback
  }
  
  return children
}
