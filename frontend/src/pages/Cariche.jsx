import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { caricheAPI } from '../services/api'
import AdminOnly from '../components/AdminOnly'

export default function Cariche() {
  const [cariche, setCariche] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCarica, setEditingCarica] = useState(null)

  useEffect(() => {
    loadCariche()
  }, [])

  const loadCariche = async () => {
    try {
      const response = await caricheAPI.getAll()
      setCariche(response.data.data || [])
    } catch (error) {
      toast.error('Errore nel caricamento delle cariche')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questa carica?')) return
    
    try {
      await caricheAPI.delete(id)
      toast.success('Carica eliminata')
      loadCariche()
    } catch (error) {
      toast.error('Errore nell\'eliminazione')
    }
  }

  const handleEdit = (carica) => {
    setEditingCarica(carica)
    setShowModal(true)
  }

  const handleNew = () => {
    setEditingCarica(null)
    setShowModal(true)
  }

  if (loading) return <div className="flex justify-center p-8">Caricamento...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Cariche</h1>
        <AdminOnly>
          <button onClick={handleNew} className="btn-primary">
            + Nuova Carica
          </button>
        </AdminOnly>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrizione</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cariche.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  Nessuna carica trovata
                </td>
              </tr>
            ) : (
              cariche.map((carica) => (
                <tr key={carica.caricaId}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{carica.nome}</td>
                  <td className="px-6 py-4">{carica.descrizione || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <AdminOnly>
                      <button
                        onClick={() => handleEdit(carica)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => handleDelete(carica.caricaId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Elimina
                      </button>
                    </AdminOnly>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CaricaModal
        show={showModal}
        onClose={() => setShowModal(false)}
        carica={editingCarica}
        onSuccess={loadCariche}
      />
    </div>
  )
}

function CaricaModal({ show, onClose, carica, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    descrizione: '',
    ordine: 0
  })

  useEffect(() => {
    if (carica) {
      setFormData({
        nome: carica.nome || '',
        descrizione: carica.descrizione || '',
        ordine: carica.ordine || 0
      })
    } else {
      setFormData({ nome: '', descrizione: '', ordine: 0 })
    }
  }, [carica])

  if (!show) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (carica) {
        await caricheAPI.update(carica.caricaId, formData)
        toast.success('Carica aggiornata')
      } else {
        await caricheAPI.create(formData)
        toast.success('Carica creata')
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Errore nel salvataggio')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">
          {carica ? 'Modifica Carica' : 'Nuova Carica'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome Carica *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="input"
              placeholder="Es: Presidente, Segretario..."
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
              placeholder="Descrizione della carica..."
            />
          </div>

          <div>
            <label className="label">Ordine</label>
            <input
              type="number"
              value={formData.ordine}
              onChange={(e) => setFormData({...formData, ordine: parseInt(e.target.value) || 0})}
              className="input"
              placeholder="0"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annulla
            </button>
            <button type="submit" className="btn-primary">
              {carica ? 'Aggiorna' : 'Crea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
