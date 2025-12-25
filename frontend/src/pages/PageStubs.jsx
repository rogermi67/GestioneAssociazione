// ===== pages/auth/Register.jsx =====
import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Registrazione</h2>
          <p className="mt-2 text-sm text-gray-600">
            Crea il tuo account
          </p>
        </div>
        <p className="text-center">
          <Link to="/login" className="text-primary-600 hover:text-primary-500">
            Torna al login
          </Link>
        </p>
      </div>
    </div>
  )
}

// ===== pages/soci/Soci.jsx =====
export function Soci() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Soci</h1>
      <div className="card">
        <p>Lista soci - da implementare</p>
      </div>
    </div>
  )
}

// ===== pages/soci/SocioDetail.jsx =====
export function SocioDetail() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dettaglio Socio</h1>
      <div className="card">
        <p>Dettaglio socio - da implementare</p>
      </div>
    </div>
  )
}

// ===== pages/riunioni/Riunioni.jsx =====
export function Riunioni() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Riunioni</h1>
      <div className="card">
        <p>Lista riunioni - da implementare</p>
      </div>
    </div>
  )
}

// ===== pages/riunioni/RiunioneDetail.jsx =====
export function RiunioneDetail() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dettaglio Riunione</h1>
      <div className="card">
        <p>Dettaglio riunione - da implementare</p>
      </div>
    </div>
  )
}

// ===== pages/eventi/Eventi.jsx =====
export function Eventi() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Eventi</h1>
      <div className="card">
        <p>Lista eventi - da implementare</p>
      </div>
    </div>
  )
}

// ===== pages/eventi/EventoDetail.jsx =====
export function EventoDetail() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dettaglio Evento</h1>
      <div className="card">
        <p>Dettaglio evento - da implementare</p>
      </div>
    </div>
  )
}

// ===== pages/Impostazioni.jsx =====
export function Impostazioni() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Impostazioni</h1>
      <div className="card">
        <p>Impostazioni - da implementare</p>
      </div>
    </div>
  )
}
