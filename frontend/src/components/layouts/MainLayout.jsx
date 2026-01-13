import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import AdminOnly from '../AdminOnly'
import { 
  FiHome, FiUsers, FiCalendar, FiFileText, 
  FiSettings, FiLogOut, FiMenu, FiX, FiAward, FiUserCheck, FiBell
} from 'react-icons/fi'
import { useState } from 'react'
import { 
  FiHome, FiUsers, FiCalendar, FiFileText, 
  FiSettings, FiLogOut, FiMenu, FiX, FiAward, FiUserCheck, FiBell
} from 'react-icons/fi'

export default function MainLayout() {
  const { user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

const menuItems = [
  { name: 'Dashboard', icon: FiHome, path: '/', adminOnly: false },
  { name: 'Soci', icon: FiUsers, path: '/soci', adminOnly: false },
  { name: 'Riunioni', icon: FiFileText, path: '/riunioni', adminOnly: false },
  { name: 'Cariche', icon: FiAward, path: '/cariche', adminOnly: false },
  { name: 'Calendario', icon: FiCalendar, path: '/calendario', adminOnly: false },
  { name: 'Utenti', icon: FiUserCheck, path: '/utenti', adminOnly: true },
  { name: 'Notifiche Push', icon: FiBell, path: '/notifiche', adminOnly: true },  // <-- AGGIUNGI QUESTA
  { name: 'Impostazioni', icon: FiSettings, path: '/impostazioni', adminOnly: false },
]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const NavLink = ({ item }) => {
    const active = isActive(item.path)
    const baseClasses = "flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors duration-150"
    const activeClasses = active 
      ? "bg-blue-50 text-blue-700 font-medium" 
      : "text-gray-700 hover:bg-gray-100"

    const linkContent = (
      <>
        <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-blue-700' : 'text-gray-500'}`} />
        {item.name}
      </>
    )

    if (item.adminOnly) {
      return (
        <AdminOnly fallback={null}>
          <Link
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`${baseClasses} ${activeClasses}`}
          >
            {linkContent}
          </Link>
        </AdminOnly>
      )
    }

    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`${baseClasses} ${activeClasses}`}
      >
        {linkContent}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <span className="text-xl font-bold text-blue-600">
            Gestionale ETS
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* User Info Mobile */}
        <div className="flex-shrink-0 flex border-t p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {user?.nome?.[0]}{user?.cognome?.[0]}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nome} {user?.cognome}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.ruolo}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 text-gray-400 hover:text-red-600 p-2"
              title="Esci"
            >
              <FiLogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r shadow-sm">
          <div className="flex items-center h-16 px-4 border-b">
            <span className="text-xl font-bold text-blue-600">
              Gestionale ETS
            </span>
          </div>
          
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </nav>

          {/* User Info Desktop */}
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user?.nome?.[0]}{user?.cognome?.[0]}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nome} {user?.cognome}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.ruolo}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 text-gray-400 hover:text-red-600 p-2"
                title="Esci"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar Mobile */}
        <div className="sticky top-0 z-30 flex h-16 flex-shrink-0 bg-white border-b shadow-sm lg:hidden">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 items-center justify-between px-4">
            <span className="text-lg font-bold text-blue-600">
              Gestionale ETS
            </span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
