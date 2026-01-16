import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collaboratoriAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiBriefcase } from 'react-icons/fi'

export default function Collaboratori() {
  const [collaboratori, setCollaboratori] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCollaboratori()
  }, [])

  const fetchCollaboratori = async () => {
    try {
      const response = await collaboratoriAPI.getAll()
      setCollaboratori(response.data.data || [])
    } catch (error) {
      console.error('Errore caricamento collaboratori:', error)
      toast.error('Errore nel caricamento dei collaboratori')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo collaboratore?')) return

    try {
      await collaboratoriAPI.delete(id)
      toast.success('Collaboratore eliminato con successo')
      fetchCollaboratori()
    } catch (error) {
      toast.error("Errore nell'eliminazione del collaboratore")
    }
  }

  const filteredCollaboratori = collaboratori.filter(c =>
    `${c.nome} ${c.cognome} ${c.azienda || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="text-center py-8">Caricamento...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Collaboratori Esterni</h1>
        <Link to="/collaboratori/nuovo" className="btn-primary flex items-center gap-2">
          <FiPlus /> Nuovo Collaboratore
        </Link>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <input
          type="text"
          placeholder="Cerca collaboratore..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
        />
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollaboratori.map(collab => (
          <div key={collab.collaboratoreId} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {collab.nome} {collab.cognome}
                </h3>
                {collab.azienda && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <FiBriefcase size={14} />
                    {collab.azienda}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/collaboratori/${collab.collaboratoreId}/modifica`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(collab.collaboratoreId)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {collab.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMail size={14} />
                  <a href={`mailto:${collab.email}`} className="hover:text-blue-600">
                    {collab.email}
                  </a>
                </div>
              )}
              {collab.telefono && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPhone size={14} />
                  <a href={`tel:${collab.telefono}`} className="hover:text-blue-600">
                    {collab.telefono}
                  </a>
                </div>
              )}
            </div>

            {collab.note && (
              <p className="mt-3 text-sm text-gray-500 line-clamp-2">{collab.note}</p>
            )}
          </div>
        ))}

        {filteredCollaboratori.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nessun collaboratore trovato
          </div>
        )}
      </div>
    </div>
  )
}
