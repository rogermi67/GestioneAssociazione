import { useState, useEffect } from 'react'
import { todoEventiAPI, sociAPI, collaboratoriAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiPlus, FiCheck, FiTrash2, FiUser, FiClock, FiUserPlus, FiX } from 'react-icons/fi'

export default function TodoList({ eventoId }) {
  const [todos, setTodos] = useState([])
  const [soci, setSoci] = useState([])
  const [collaboratori, setCollaboratori] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssegnaModal, setShowAssegnaModal] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    scadenza: '',
    priorita: 'Media'
  })
  const [assegnaData, setAssegnaData] = useState({
    tipo: 'socio', // 'socio' o 'collaboratore'
    socioId: '',
    collaboratoreId: ''
  })

  useEffect(() => {
    fetchTodos()
    fetchSoci()
    fetchCollaboratori()
  }, [eventoId])

  const fetchTodos = async () => {
    try {
      const response = await todoEventiAPI.getByEvento(eventoId)
      setTodos(response.data.data || [])
    } catch (error) {
      console.error('Errore caricamento todo:', error)
    }
  }

  const fetchSoci = async () => {
    try {
      const response = await sociAPI.getAll()
      setSoci(response.data.data || [])
    } catch (error) {
      console.error('Errore caricamento soci:', error)
    }
  }

  const fetchCollaboratori = async () => {
    try {
      const response = await collaboratoriAPI.getAll()
      setCollaboratori(response.data.data || [])
    } catch (error) {
      console.error('Errore caricamento collaboratori:', error)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await todoEventiAPI.create({ ...formData, eventoId, stato: 'Da fare' })
      toast.success('Todo creato')
      setShowCreateModal(false)
      setFormData({ titolo: '', descrizione: '', scadenza: '', priorita: 'Media' })
      fetchTodos()
    } catch (error) {
      toast.error('Errore nella creazione')
    }
  }

  const handleToggleStato = async (todo) => {
    const nuovoStato = todo.stato === 'Completato' ? 'Da fare' : 'Completato'
    try {
      await todoEventiAPI.update(todo.todoEventoId, { ...todo, stato: nuovoStato })
      fetchTodos()
    } catch (error) {
      toast.error('Errore aggiornamento')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questo todo?')) return
    try {
      await todoEventiAPI.delete(id)
      toast.success('Todo eliminato')
      fetchTodos()
    } catch (error) {
      toast.error('Errore eliminazione')
    }
  }

  const openAssegnaModal = (todo) => {
    setSelectedTodo(todo)
    setAssegnaData({ tipo: 'socio', socioId: '', collaboratoreId: '' })
    setShowAssegnaModal(true)
  }

  const handleAssegna = async (e) => {
    e.preventDefault()
    try {
      const data = {
        todoEventoId: selectedTodo.todoEventoId,
        socioId: assegnaData.tipo === 'socio' ? parseInt(assegnaData.socioId) : null,
        collaboratoreId: assegnaData.tipo === 'collaboratore' ? parseInt(assegnaData.collaboratoreId) : null
      }
      
      await todoEventiAPI.assegna(data)
      toast.success('Assegnazione creata')
      setShowAssegnaModal(false)
      fetchTodos()
    } catch (error) {
      console.error('Errore assegnazione:', error)
      toast.error('Errore assegnazione')
    }
  }

  const handleRimuoviAssegnazione = async (assegnazioneId) => {
    if (!window.confirm('Rimuovere questa assegnazione?')) return
    try {
      await todoEventiAPI.rimuoviAssegnazione(assegnazioneId)
      toast.success('Assegnazione rimossa')
      fetchTodos()
    } catch (error) {
      toast.error('Errore rimozione')
    }
  }

  const getPrioritaColor = (priorita) => {
    switch (priorita) {
      case 'Alta': return 'text-red-600 bg-red-100'
      case 'Media': return 'text-yellow-600 bg-yellow-100'
      case 'Bassa': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Todo List</h3>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Aggiungi
        </button>
      </div>

      <div className="space-y-3">
        {todos.map(todo => (
          <div key={todo.todoEventoId} className={`p-4 border rounded ${todo.stato === 'Completato' ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => handleToggleStato(todo)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    todo.stato === 'Completato' ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {todo.stato === 'Completato' && <FiCheck className="text-white" size={14} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${todo.stato === 'Completato' ? 'line-through text-gray-500' : ''}`}>
                    {todo.titolo}
                  </h4>
                  {todo.descrizione && (
                    <p className="text-sm text-gray-600 mt-1">{todo.descrizione}</p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                    {todo.priorita && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPrioritaColor(todo.priorita)}`}>
                        {todo.priorita}
                      </span>
                    )}
                    {todo.scadenza && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <FiClock size={14} />
                        {new Date(todo.scadenza).toLocaleDateString('it-IT')}
                      </span>
                    )}
                  </div>

                  {/* Assegnazioni */}
                  {todo.assegnazioni && todo.assegnazioni.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {todo.assegnazioni.map(ass => (
                        <div key={ass.assegnazioneId} className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                            <FiUser size={12} />
                            {ass.socio 
                              ? `${ass.socio.nome} ${ass.socio.cognome}` 
                              : ass.collaboratore 
                              ? `${ass.collaboratore.nome} ${ass.collaboratore.cognome}` 
                              : 'N/A'}
                          </span>
                          <button
                            onClick={() => handleRimuoviAssegnazione(ass.assegnazioneId)}
                            className="text-red-500 hover:text-red-700"
                            title="Rimuovi assegnazione"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pulsante Assegna */}
                  <button
                    onClick={() => openAssegnaModal(todo)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <FiUserPlus size={14} />
                    Assegna persona
                  </button>
                </div>
              </div>

              <button onClick={() => handleDelete(todo.todoEventoId)} className="text-red-600 hover:text-red-800 flex-shrink-0">
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {todos.length === 0 && (
          <p className="text-center text-gray-500 py-4">Nessun todo presente</p>
        )}
      </div>

      {/* Modal Crea Todo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Nuovo Todo</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Titolo *</label>
                <input
                  type="text"
                  value={formData.titolo}
                  onChange={(e) => setFormData({...formData, titolo: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Descrizione</label>
                <textarea
                  value={formData.descrizione}
                  onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
                  className="input"
                  rows="3"
                />
              </div>

              <div>
                <label className="label">Scadenza</label>
                <input
                  type="date"
                  value={formData.scadenza}
                  onChange={(e) => setFormData({...formData, scadenza: e.target.value})}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Priorità</label>
                <select
                  value={formData.priorita}
                  onChange={(e) => setFormData({...formData, priorita: e.target.value})}
                  className="input"
                >
                  <option value="Bassa">Bassa</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">Crea</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assegna Persona */}
      {showAssegnaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Assegna a: {selectedTodo?.titolo}</h3>
            <form onSubmit={handleAssegna} className="space-y-4">
              <div>
                <label className="label">Tipo</label>
                <select
                  value={assegnaData.tipo}
                  onChange={(e) => setAssegnaData({...assegnaData, tipo: e.target.value, socioId: '', collaboratoreId: ''})}
                  className="input"
                >
                  <option value="socio">Socio</option>
                  <option value="collaboratore">Collaboratore</option>
                </select>
              </div>

              {assegnaData.tipo === 'socio' && (
                <div>
                  <label className="label">Seleziona Socio *</label>
                  <select
                    value={assegnaData.socioId}
                    onChange={(e) => setAssegnaData({...assegnaData, socioId: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">-- Seleziona --</option>
                    {soci.map(socio => (
                      <option key={socio.socioId} value={socio.socioId}>
                        {socio.nome} {socio.cognome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assegnaData.tipo === 'collaboratore' && (
                <div>
                  <label className="label">Seleziona Collaboratore *</label>
                  <select
                    value={assegnaData.collaboratoreId}
                    onChange={(e) => setAssegnaData({...assegnaData, collaboratoreId: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">-- Seleziona --</option>
                    {collaboratori.map(collab => (
                      <option key={collab.collaboratoreId} value={collab.collaboratoreId}>
                        {collab.nome} {collab.cognome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">Assegna</button>
                <button type="button" onClick={() => setShowAssegnaModal(false)} className="btn-secondary flex-1">
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}