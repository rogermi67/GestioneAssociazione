import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuthStore } from '../stores/authStore'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

console.log('🌐 API_URL configurato:', API_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
const authStorage = localStorage.getItem('auth-storage')
    let token = null

    if (authStorage) {
      try {
        // La chiave 'auth-storage' contiene un oggetto JSON con lo stato.
        const parsed = JSON.parse(authStorage)
        token = parsed.state?.token
      } catch (e) {
        console.error("Error parsing auth-storage:", e)
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Logga la lunghezza per una verifica finale
      console.log('✅ Authorization header set (localStorage SYNC). Token length:', token.length)
    } else {
      // Questo log dovrebbe ora apparire SOLO quando si è veramente sloggati
      console.log('❌ No token found in store (localStorage SYNC). Token value:', token)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚫 401 Unauthorized - redirecting to login')
//      localStorage.removeItem('auth-storage')
//      window.location.href = '/login'
      toast.error('Sessione scaduta. Effettua nuovamente il login.')
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error('Si è verificato un errore. Riprova più tardi.')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (data) => 
    api.post('/auth/register', data),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
}

// Soci API
export const sociAPI = {
  getAll: (params) => 
    api.get('/soci', { params }),
  
  getById: (id) => 
    api.get(`/soci/${id}`),
  
  create: (data) => 
    api.post('/soci', data),
  
  update: (id, data) => 
    api.put(`/soci/${id}`, data),
  
  delete: (id) => 
    api.delete(`/soci/${id}`),
  
  uploadDocumento: (socioId, formData) => 
    api.post(`/soci/${socioId}/documenti`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
}

// Riunioni API
export const riunioniAPI = {
  getAll: () => api.get('/riunioni'),
  getById: (id) => api.get(`/riunioni/${id}`),
  create: (data) => api.post('/riunioni', data),
  update: (id, data) => api.put(`/riunioni/${id}`, data),
  delete: (id) => api.delete(`/riunioni/${id}`),
  getPartecipazioni: (id) => api.get(`/riunioni/${id}/partecipazioni`),
  addPartecipazione: (id, data) => api.post(`/riunioni/${id}/partecipazioni`, data),
  updatePartecipazione: (partecipazioneId, data) => api.put(`/riunioni/partecipazioni/${partecipazioneId}`, data),
  deletePartecipazione: (partecipazioneId) => api.delete(`/riunioni/partecipazioni/${partecipazioneId}`),
  getArgomenti: (id) => api.get(`/riunioni/${id}/argomenti`),
  addArgomento: (id, data) => api.post(`/riunioni/${id}/argomenti`, data),
  deleteArgomento: (argomentoId) => api.delete(`/riunioni/argomenti/${argomentoId}`)
}

// Eventi API
export const eventiAPI = {
  getAll: (params) => 
    api.get('/eventi', { params }),
  
  getById: (id) => 
    api.get(`/eventi/${id}`),
  
  create: (data) => 
    api.post('/eventi', data),
  
  update: (id, data) => 
    api.put(`/eventi/${id}`, data),
  
  delete: (id) => 
    api.delete(`/eventi/${id}`),
  
  aggiungiPartecipante: (eventoId, socioId, data) => 
    api.post(`/eventi/${eventoId}/partecipanti/${socioId}`, data),
}

// Collaboratori API
export const collaboratoriAPI = {
  getAll: () => api.get('/collaboratori'),
  getById: (id) => api.get(`/collaboratori/${id}`),
  create: (data) => api.post('/collaboratori', data),
  update: (id, data) => api.put(`/collaboratori/${id}`, data),
  delete: (id) => api.delete(`/collaboratori/${id}`)
}

// Todo Eventi API
export const todoEventiAPI = {
  getByEvento: (eventoId) => api.get(`/todoeventi/evento/${eventoId}`),
  create: (data) => api.post('/todoeventi', data),
  update: (id, data) => api.put(`/todoeventi/${id}`, data),
  delete: (id) => api.delete(`/todoeventi/${id}`),
  assegna: (data) => api.post('/todoeventi/assegna', data),
  rimuoviAssegnazione: (id) => api.delete(`/todoeventi/assegna/${id}`)
}

// Documenti Eventi API
export const documentiEventiAPI = {
  getByEvento: (eventoId) => api.get(`/documentieventi/evento/${eventoId}`),
  upload: (data) => api.post('/documentieventi', data),
  delete: (id) => api.delete(`/documentieventi/${id}`),
  download: (id) => api.get(`/documentieventi/download/${id}`, { responseType: 'blob' })
}

// Notifiche API
export const notificheAPI = {
  testConnection: () => api.get('/notifiche/test-connection'),
  testSingle: (email) => api.post('/notifiche/test-single', { email }),
  sendCustom: (email, subject, body) => api.post('/notifiche/send-custom', { email, subject, body }),
  sendToAll: (subject, body) => api.post('/notifiche/send-all', { subject, body })
}


// Cariche API
export const caricheAPI = {
  getAll: () => 
    api.get('/cariche'),
  
  getById: (id) => 
    api.get(`/cariche/${id}`),
  
  create: (data) => 
    api.post('/cariche', data),
  
  update: (id, data) => 
    api.put(`/cariche/${id}`, data),
  
  delete: (id) => 
    api.delete(`/cariche/${id}`),
}

// Impostazioni API
export const impostazioniAPI = {
  getAll: () => 
    api.get('/impostazioni'),
  
  update: (chiave, valore) => 
    api.put(`/impostazioni/${chiave}`, { valore }),
}

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  updateRole: (id, ruolo) => api.put(`/users/${id}/role`, { ruolo }),
  updateStatus: (id, attivo) => api.put(`/users/${id}/status`, { attivo }),
  delete: (id) => api.delete(`/users/${id}`)
}

export default api


export const emailAPI = {
  test: (email) => api.post('/email/test', { email }),
  send: (riunioneId, data) => api.post('/email/send/${riunioneId}', data),
  sendCustom: (data) => api.post('/email/send-custom', data)
}

// Push Notifications API
export const pushNotificationAPI = {
  subscribe: (subscription) => api.post('/pushnotification/subscribe', subscription),
  send: (notification) => api.post('/pushnotification/send', notification),
  unsubscribe: () => api.delete('/pushnotification/unsubscribe')
}

// Report API  ← AGGIUNGI DA QUI
export const reportAPI = {
  // PDF Downloads
  downloadEventoPdf: (eventoId) => 
    api.get(`/report/evento/${eventoId}/pdf`, { responseType: 'blob' }),
  
  downloadTodoPdf: (todoId) => 
    api.get(`/report/todo/${todoId}/pdf`, { responseType: 'blob' }),
  
  downloadPersonaPdf: (tipo, personaId, eventoIds, stato) => 
    api.get('/report/persona/pdf', { 
      params: { tipo, personaId, eventoIds, stato },
      responseType: 'blob' 
    }),
  
  // Email Sends
  sendEventoEmail: (eventoId) => 
    api.post(`/report/evento/${eventoId}/email`),
  
  sendTodoEmail: (todoId) => 
    api.post(`/report/todo/${todoId}/email`),
  
  sendPersonaEmail: (tipo, personaId, eventoIds, stato) => 
    api.post('/report/persona/email', null, { 
      params: { tipo, personaId, eventoIds, stato }
    })
}


