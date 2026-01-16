import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collaboratoriAPI } from '../../services/api'
import { toast } from 'react-toastify'

export default function CollaboratoreForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    azienda: '',
    note: ''
  })

  useEffect(() => {
    if (isEdit) {
      fetchCollaboratore()
    }
  }, [id])

  const fetchCollaboratore = async () => {
    try {
      const response = await collaboratoriAPI.getById(id)
      const collab = response.data.data
      setFormData({
        nome: collab.nome || '',
        cognome: collab.cognome || '',
        email: collab.email || '',
        telefono: collab.telefono || '',
        azienda: collab.azienda || '',
        note: collab.note || ''
      })
    } catch (error) {
      toast.error('Errore nel caricamento del collaboratore')
      navigate('/collaboratori')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        await collaboratoriAPI.update(id, formData)
        toast.success('Collaboratore aggiornato con successo')
      } else {
        await collaboratoriAPI.create(formData)
        toast.success('Collaboratore creato con successo')
      }
      navigate('/collaboratori')
    } catch (error) {
      toast.error(isEdit ? "Errore nell'aggiornamento" : 'Errore nella creazione')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Modifica Collaboratore' : 'Nuovo Collaboratore'}
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Nome *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Cognome *</label>
            <input
              type="text"
              name="cognome"
              value={formData.cognome}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Telefono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Azienda</label>
            <input
              type="text"
              name="azienda"
              value={formData.azienda}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="input"
              rows="4"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvataggio...' : (isEdit ? 'Aggiorna' : 'Crea Collaboratore')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/collaboratori')}
            className="btn-secondary"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  )
}