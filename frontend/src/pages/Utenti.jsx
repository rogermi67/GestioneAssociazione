import { useState, useEffect } from 'react'
import { FiUsers, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi'
import { usersAPI } from '../services/api'
import { toast } from 'react-toastify'

export default function Utenti() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll()
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Errore nel caricamento utenti')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole)
      toast.success('Ruolo aggiornato!')
      loadUsers()
      setEditingUser(null)
    } catch (error) {
      toast.error('Errore nell\'aggiornamento del ruolo')
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await usersAPI.updateStatus(userId, !currentStatus)
      toast.success('Stato aggiornato!')
      loadUsers()
    } catch (error) {
      toast.error('Errore nell\'aggiornamento dello stato')
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Eliminare questo utente?')) return
    
    try {
      await usersAPI.delete(userId)
      toast.success('Utente eliminato')
      loadUsers()
    } catch (error) {
      toast.error('Errore nell\'eliminazione')
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Caricamento...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FiUsers className="mr-3 text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruolo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ultimo Accesso</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{user.nome} {user.cognome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.userId ? (
                      <select
                        className="input py-1"
                        defaultValue={user.ruolo}
                        onChange={(e) => handleChangeRole(user.userId, e.target.value)}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Utente">Socio</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.ruolo === 'Admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.ruolo}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(user.userId, user.attivo)}
                      className={`px-2 py-1 rounded text-sm flex items-center ${
                        user.attivo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.attivo ? (
                        <>
                          <FiCheck className="mr-1" size={14} />
                          Attivo
                        </>
                      ) : (
                        <>
                          <FiX className="mr-1" size={14} />
                          Disattivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.ultimoAccesso ? new Date(user.ultimoAccesso).toLocaleDateString('it-IT') : 'Mai'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(editingUser === user.userId ? null : user.userId)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.userId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nessun utente trovato
          </div>
        )}
      </div>
    </div>
  )
}
