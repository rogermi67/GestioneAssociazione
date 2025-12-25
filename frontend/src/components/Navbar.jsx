import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Gestionale ETS
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link to="/soci" className="text-gray-700 hover:text-blue-600">
                Soci
              </Link>
              <Link to="/riunioni" className="text-gray-700 hover:text-blue-600">
                Riunioni
              </Link>
              <Link to="/cariche" className="text-gray-700 hover:text-blue-600">
                Cariche
              </Link>
              <Link to="/impostazioni" className="text-gray-700 hover:text-blue-600">
                Impostazioni
              </Link>
			  <Link to="/utenti" className="nav-link">
                Utenti
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {user?.nome} {user?.cognome}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600"
            >
              Esci
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}