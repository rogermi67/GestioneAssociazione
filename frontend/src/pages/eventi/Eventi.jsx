import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventiAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFilter } from 'react-icons/fi'

export default function Eventi() {
  const [eventi, setEventi] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    tipo: 'Tutti',
    stato: 'Tutti',
    pubblicato: 'Tutti'
  })

  useEffect(() => {
    fetchEventi()
  }, [])

  const fetchEventi = async () => {
    try {
      const response = await eventiAPI.getAll()
      setEventi(response.data.data || [])
    } catch (error) {
      console.error('Errore caricamento eventi:', error)
      toast.error('Errore nel caricamento degli eventi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo evento?')) return

    try {
      await eventiAPI.delete(id)
      toast.success('Evento eliminato con successo')
      fetchEventi()
    } catch (error) {
      toast.error('Errore nell\'eliminazione dell\'evento')
    }
  }

  const filteredEventi = eventi.filter(e => {
    if (filters.tipo !== 'Tutti' && e.tipoEvento !== filters.tipo) return false
    if (filters.stato !== 'Tutti' && e.stato !== filters.stato) return false
    if (filters.pubblicato !== 'Tutti') {
      const isPubblicato = filters.pubblicato === 'Pubblicato'
      if (e.pubblicato !== isPubblicato) return false
    }
    return true
  })

  if (loading) return <div className="text-center py-8">Caricamento...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Eventi</h1>
        <Link to="/eventi/nuovo" className="btn-primary flex items-center gap-2">
          <FiPlus /> Nuovo Evento
        </Link>
      </div>

      {/* Filtri */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <FiFilter className="text-gray-500" />
          
          <select
            className="input max-w-xs"
            value={filters.tipo}
            onChange={(e) => setFilters({...filters, tipo: e.target.value})}
          >
            <option value="Tutti">Tutti i tipi</option>
            <option value="Evento">Evento</option>
            <option value="Festa">Festa</option>
            <option value="Rievocazione">Rievocazione</option>
            <option value="Corso">Corso</option>
          </select>

          <select
            className="input max-w-xs"
            value={filters.stato}
            onChange={(e) => setFilters({...filters, stato: e.target.value})}
          >
            <option value="Tutti">Tutti gli stati</option>
            <option value="Pianificato">Pianificato</option>
            <option value="In corso">In corso</option>
            <option value="Concluso">Concluso</option>
            <option value="Annullato">Annullato</option>
          </select>

          <select
            className="input max-w-xs"
            value={filters.pubblicato}
            onChange={(e) => setFilters({...filters, pubblicato: e.target.value})}
          >
            <option value="Tutti">Tutti</option>
            <option value="Pubblicato">Pubblicati</option>
            <option value="NonPubblicato">Non pubblicati</option>
          </select>

          <div className="text-sm text-gray-500 ml-auto">
            {filteredEventi.length} eventi
          </div>
        </div>
      </div>

      {/* Tabella */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Titolo</th>
                <th>Tipo</th>
                <th>Data Inizio</th>
                <th>Luogo</th>
                <th>Stato</th>
                <th>Pubblicato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredEventi.map((evento) => (
                <tr key={evento.eventoId}>
                  <td className="font-medium">{evento.titolo}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      evento.tipoEvento === 'Festa' ? 'bg-pink-100 text-pink-800' :
                      evento.tipoEvento === 'Corso' ? 'bg-green-100 text-green-800' :
                      evento.tipoEvento === 'Rievocazione' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {evento.tipoEvento}
                    </span>
                  </td>
                  <td>{new Date(evento.dataInizio).toLocaleDateString('it-IT')}</td>
                  <td>{evento.luogo || '-'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      evento.stato === 'In corso' ? 'bg-green-100 text-green-800' :
                      evento.stato === 'Concluso' ? 'bg-gray-100 text-gray-800' :
                      evento.stato === 'Annullato' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {evento.stato}
                    </span>
                  </td>
                  <td>
                    {evento.pubblicato ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">✗</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        to={`/eventi/${evento.eventoId}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Visualizza"
                      >
                        <FiEye size={18} />
                      </Link>
                      <Link
                        to={`/eventi/${evento.eventoId}/modifica`}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Modifica"
                      >
                        <FiEdit2 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(evento.eventoId)}
                        className="text-red-600 hover:text-red-800"
                        title="Elimina"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEventi.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    Nessun evento trovato
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}