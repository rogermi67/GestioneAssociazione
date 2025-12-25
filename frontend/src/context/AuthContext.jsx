import { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.getCurrentUser()
      setUser(response.data.data)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await authAPI.login(email, password)
    const { token } = response.data.data
    
    localStorage.setItem('token', token)
    
    const userResponse = await authAPI.getCurrentUser()
    setUser(userResponse.data.data)
    
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin = () => {
    return user?.ruolo === 'Admin'
  }

  const isSocio = () => {
    return user?.ruolo === 'Utente' || user?.ruolo === 'Socio'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isSocio }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
