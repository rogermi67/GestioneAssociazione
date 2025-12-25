import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
// 🛑 Rimuovi: import { useAuth } from '../../context/AuthContext'
import { useAuthStore } from '../../stores/authStore' // ✅ Importa lo store di Zustand
import { authAPI } from '../../services/api' // ✅ Importa le funzioni API

export default function Login() {
  const navigate = useNavigate()
  // ✅ Ottieni la funzione di salvataggio dallo store Zustand
  const zustandLogin = useAuthStore(state => state.login) 
  
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

const onSubmit = async (data) => {
  setIsLoading(true)
  try {
    const response = await authAPI.login(data.email, data.password)
    const { token, ...user } = response.data.data
    
    zustandLogin(user, token)
    toast.success('Login effettuato con successo!')
    navigate('/')
  } catch (error) {
    console.error('Login error:', error)
    toast.error(error.response?.data?.message || 'Email o password errati')
  } finally {
    setIsLoading(false)
  }
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Associazione ETS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema di gestione associazione
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                {...register('email', {
                  required: 'Email obbligatoria',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email non valida',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`input ${errors.password ? 'border-red-500' : ''}`}
                {...register('password', {
                  required: 'Password obbligatoria',
                  minLength: {
                    value: 6,
                    message: 'La password deve essere di almeno 6 caratteri',
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Accesso in corso...
              </span>
            ) : (
              'Accedi'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Non hai un account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Registrati
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}