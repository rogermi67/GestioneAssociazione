/* IMPORT */
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuthStore } from './stores/authStore'
import { useState, useEffect } from 'react'
import MainLayout from './components/layouts/MainLayout'
import AuthLayout from './components/layouts/AuthLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Soci from './pages/soci/Soci'
import SocioDetail from './pages/soci/SocioDetail'
import Riunioni from './pages/riunioni/Riunioni'
import RiunioneDetail from './pages/riunioni/RiunioneDetail'
import Cariche from './pages/Cariche'
import Impostazioni from './pages/Impostazioni'
import ImpostazioniEmail from './pages/ImpostazioniEmail'
import Utenti from './pages/Utenti'
import SendNotification from './pages/admin/SendNotification'
import CalendarioEventi from './pages/eventi/CalendarioEventi'
import Eventi from './pages/eventi/Eventi' 
import EventoForm from './pages/eventi/EventoForm'
import EventoDetail from './pages/eventi/EventoDetail'


function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  const [isHydrated, setIsHydrated] = useState(false) 

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true)
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })

    return () => unsub()
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Caricamento sessione...
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/soci" element={<Soci />} />
          <Route path="/soci/:id" element={<SocioDetail />} />
          <Route path="/riunioni" element={<Riunioni />} />
          <Route path="/riunioni/:id" element={<RiunioneDetail />} />
          <Route path="/cariche" element={<Cariche />} />
          <Route path="/impostazioni" element={<Impostazioni />} />
          <Route path="/impostazioni/email" element={<ImpostazioniEmail />} />
          <Route path="/utenti" element={<Utenti />} />
		  <Route path="/notifiche" element={<SendNotification />} />
		  <Route path="/calendario" element={<CalendarioEventi />} />
		  <Route path="/eventi" element={<Eventi />} />
          <Route path="/eventi/nuovo" element={<EventoForm />} />
          <Route path="/eventi/:id/modifica" element={<EventoForm />} />
          <Route path="/eventi/:id" element={<EventoDetail />} />
        </Route>
      </Routes>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App
