import { useState, useEffect } from 'react'
import { sociAPI, collaboratoriAPI, eventiAPI, reportAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiFileText, FiDownload, FiMail, FiFilter } from 'react-icons/fi'

export default function Reports() {
  const [tipo, setTipo] = useState('socio')
  const [personaId, setPersonaId] = useState('')
  const [soci, setSoci] = useState([])
  const [collaboratori, setCollaboratori] = useState([])
  const [eventi, setEventi] = useState([])
  const [selectedEventi, setSelectedEventi] = useState([])
  const [stato, setStato] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sociRes, collabRes, eventiRes] = await Promise.all([
        sociAPI.getAll(),
        collaboratoriAPI.getAll(),
        eventiAPI.getAll()
      ])
      setSoci(sociRes.data.data || [])
      setCollaboratori(collabRes.data.data || [])
      setEventi(eventiRes.data.data || [])
    } catch (error) {
      toast.error('Errore nel caricamento dei dati')
    }
  }

  const handleDownloadPdf = async () => {
    if (!personaId) {
      toast.error('Seleziona una persona')
      return
    }

    setLoading(true)
    try {
      const response = await reportAPI.downloadPersonaPdf(
        tipo,
        personaId,
        selectedEventi.length > 0 ? selectedEventi : null,
        stato || null
      )
      
      const persona = tipo === 'socio'
        ? soci.find(s => s.socioId === parseInt(personaId))
        : collaboratori.find(c => c.collaboratoreId === parseInt(personaId))
      
      const nomePersona = persona 
        ? `${persona.nome}_${persona.cognome}` 
        : 'Report'

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `Report_${nomePersona}.pdf`
      link.click()
      toast.success('PDF scaricato con successo')
    } catch (error) {
      toast.error(error.response?.data || 'Errore nel download del PDF')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!personaId) {
      toast.error('Seleziona una persona')
      return
    }

    if (!window.confirm('Inviare il report via email alla persona selezionata?')) return

    setLoading(true)
    try {
      const response = await reportAPI.sendPersonaEmail(
        tipo,
        personaId,
        selectedEventi.length > 0 ? selectedEventi : null,
        stato || null
      )
      toast.success(response.data.message || 'Email inviata con successo')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Errore nell\'invio dell\'email')
    } finally {
      setLoading(false)
    }
  }

  const handleEventoToggle = (eventoId) => {
    setSelectedEventi(prev => 
      prev.includes(eventoId)
        ? prev.filter(id => id !== eventoId)
        : [...prev, eventoId]
    )
  }

  const handleSelectAllEventi = () => {
    if (selectedEventi.length === eventi.length) {
      setSelectedEventi([])
    } else {
      setSelectedEventi(eventi.map(e => e.eventoId))
    }
  }

  const persone = tipo === 'socio' ? soci : collaboratori
  const personaIdKey = tipo === 'socio' ? 'socioId' : 'collaboratoreId'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FiFileText size={32} className="text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Report per Persona</h1>
      </div>

      <div className="card max-w-4xl">
        <p className="text-gray-600 mb-6">
          Genera report personalizzati con l'elenco dei todo assegnati a soci o collaboratori.
        </p>

        {/* Filtri */}
        <div className="space-y-6">
          {/* Tipo Persona */}
          <div>
            <label className="label">Tipo Persona *</label>
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value)
                setPersonaId('')
              }}
              className="input"
            >
              <option value="socio">Socio</option>
              <option value="collaboratore">Collaboratore</option>
            </select>
          </div>

          {/* Seleziona Persona */}
          <div>
            <label className="label">Seleziona {tipo === 'socio' ? 'Socio' : 'Collaboratore'} *</label>
            <select
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
              className="input"
            >
              <option value="">-- Seleziona --</option>
              {persone.map(persona => (
                <option key={persona[personaIdKey]} value={persona[personaIdKey]}>
                  {persona.nome} {persona.cognome}
                </option>
              ))}
            </select>
          </div>

          {/* Stato Todo */}
          <div>
            <label className="label">Stato Todo (opzionale)</label>
            <select
              value={stato}
              onChange={(e) => setStato(e.target.value)}
              className="input"
            >
              <option value="">Tutti</option>
              <option value="Da fare">Da fare</option>
              <option value="Completato">Completato</option>
            </select>
          </div>

          {/* Seleziona Eventi */}
          <div>
            <label className="label">Eventi (opzionale - lascia vuoto per tutti)</label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleSelectAllEventi}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedEventi.length === eventi.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
                </button>
              </div>
              
              {eventi.length === 0 ? (
                <p className="text-sm text-gray-500">Nessun evento disponibile</p>
              ) : (
                <div className="space-y-2">
                  {eventi.map(evento => (
                    <label key={evento.eventoId} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedEventi.includes(evento.eventoId)}
                        onChange={() => handleEventoToggle(evento.eventoId)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {evento.titolo} - {new Date(evento.dataInizio).toLocaleDateString('it-IT')}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleDownloadPdf}
            disabled={loading || !personaId}
            className="btn-primary flex items-center gap-2"
          >
            <FiDownload size={18} />
            {loading ? 'Generazione...' : 'Scarica PDF'}
          </button>
          <button
            onClick={handleSendEmail}
            disabled={loading || !personaId}
            className="btn-secondary flex items-center gap-2"
          >
            <FiMail size={18} />
            {loading ? 'Invio...' : 'Invia Email'}
          </button>
        </div>
      </div>
    </div>
  )
}