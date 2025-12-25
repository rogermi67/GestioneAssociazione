import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { authAPI } from '../../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authAPI.register({
        username: data.username,
        email: data.email,
        password: data.password,
        nome: data.nome,
        cognome: data.cognome
      })
      
      if (response.data.success) {
        toast.success('Registrazione completata! Effettua il login.')
        navigate('/login')
      }
    } catch (error) {
      console.error('Register error:', error)
      toast.error('Errore durante la registrazione')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Registrazione
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Crea il tuo account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="label">Nome</label>
                <input
                  id="nome"
                  type="text"
                  className={`input ${errors.nome ? 'border-red-500' : ''}`}
                  {...register('nome', { required: 'Nome obbligatorio' })}
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="cognome" className="label">Cognome</label>
                <input
                  id="cognome"
                  type="text"
                  className={`input ${errors.cognome ? 'border-red-500' : ''}`}
                  {...register('cognome', { required: 'Cognome obbligatorio' })}
                />
                {errors.cognome && (
                  <p className="mt-1 text-sm text-red-600">{errors.cognome.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                type="text"
                className={`input ${errors.username ? 'border-red-500' : ''}`}
                {...register('username', {
                  required: 'Username obbligatorio',
                  minLength: { value: 3, message: 'Minimo 3 caratteri' }
                })}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
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
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                className={`input ${errors.password ? 'border-red-500' : ''}`}
                {...register('password', {
                  required: 'Password obbligatoria',
                  minLength: {
                    value: 6,
                    message: 'Minimo 6 caratteri',
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Conferma Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                {...register('confirmPassword', {
                  required: 'Conferma password obbligatoria',
                  validate: value => value === password || 'Le password non corrispondono'
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Registrazione...' : 'Registrati'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hai già un account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Accedi
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
