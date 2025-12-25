import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      isAdmin: () => {
        return get().user?.ruolo === 'Admin'
      },

      isSegretario: () => {
        const ruolo = get().user?.ruolo
        return ruolo === 'Admin' || ruolo === 'Segretario'
      },

      isSocio: () => {
        return get().user?.ruolo === 'Utente'
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)