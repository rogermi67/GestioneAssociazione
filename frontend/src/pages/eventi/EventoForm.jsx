import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { eventiAPI } from '../../services/api'
import { toast } from 'react-toastify'

export default function EventoForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    dataInizio: '',
    dataFine: '',
    luogo: '',
    tipoEvento: 'Evento',
    stato: 'Pianificato',
    budget: '',
    note: '',
    pubblicato: false
  })

  useEffect(() => {
    if (isEdit) {
      fetchEvento()
    }
  }, [id])

  const fetchEvento = async () => {
    try {
      const response = await eventiAPI.getById(id)
      const evento = response.data.data
      
      // Formatta date per input datetime-local
      const formatDateTime = (date) => {
        if (!date) return ''
        const d = new Date(date)
        return d.toISOString().slice(0, 16)
      }

      setFormData({
        titolo: evento.titolo || '',
        descrizione: evento.descrizione || '',
        dataInizio: formatDateTime(evento.dataInizio),
        dataFine: formatDateTime(evento.dataFine),
        luogo: evento.luogo || '',
        tipoEvento: evento.tipoEvento || 'Evento',
        stato: evento.stato || 'Pianificato',
        budget: evento.budget || '',
        note: evento.note || '',
        pubblicato: evento.pubblicato || false
      })
    } catch (error) {
      toast.error('Errore nel caricamento dell\'evento')
      navigate('/eventi')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null
      }

      if (isEdit) {
        await eventiAPI.update(id, data)
        toast.success('Evento aggiornato con successo')
      } else {
        await eventiAPI.create(data)
        toast.success('Evento creato con successo')
      }
      
      navigate('/eventi')
    } catch (error) {
      toast.error(isEdit ? 'Errore nell\'aggiornamento' : 'Errore nella creazione')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Modifica Evento' : 'Nuovo Evento'}
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Titolo */}
          <div className="md:col-span-2">
            <label className="label">Titolo *</label>
            <input
              type="text"
              name="titolo"
              value={formData.titolo}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Descrizione */}
          <div className="md:col-span-2">
            <label className="label">Descrizione</label>
            <textarea
              name="descrizione"
              value={formData.descrizione}
              onChange={handleChange}
              className="input"
              rows="4"
            />
          </div>

          {/* Data Inizio */}
          <div>
            <label className="label">Data e Ora Inizio *</label>
            <input
              type="datetime-local"
              name="dataInizio"
              value={formData.dataInizio}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Data Fine */}
          <div>
            <label className="label">Data e Ora Fine</label>
            <input
              type="datetime-local"
              name="dataFine"
              value={formData.dataFine}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Luogo */}
          <div>
            <label className="label">Luogo</label>
            <input
              type="text"
              name="luogo"
              value={formData.luogo}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Tipo Evento */}
          <div>
            <label className="label">Tipo Evento *</label>
            <select
              name="tipoEvento"
              value={formData.tipoEvento}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="Evento">Evento</option>
              <option value="Festa">Festa</option>
              <option value="Rievocazione">Rievocazione</option>
              <option value="Corso">Corso</option>
            </select>
          </div>

          {/* Stato */}
          <div>
            <label className="label">Stato *</label>
            <select
              name="stato"
              value={formData.stato}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="Pianificato">Pianificato</option>
              <option value="In corso">In corso</option>
              <option value="Concluso">Concluso</option>
              <option value="Annullato">Annullato</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="label">Budget (€)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="input"
              step="0.01"
              min="0"
            />
          </div>

          {/* Note */}
          <div className="md:col-span-2">
            <label className="label">Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="input"
              rows="3"
            />
          </div>

          {/* Pubblicato */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="pubblicato"
                checked={formData.pubblicato}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">
                Pubblica evento (visibile al pubblico)
              </span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Salvataggio...' : (isEdit ? 'Aggiorna' : 'Crea Evento')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/eventi')}
            className="btn-secondary"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  )
}