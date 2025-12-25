import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiCalendar, FiUsers, FiFileText, FiEye } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { riunioniAPI } from '../../services/api'
import AdminOnly from '../../components/AdminOnly'

export default function Riunioni() {
  const [riunioni, setRiunioni] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('Tutti')
  const [filtroStato, setFiltroStato] = useState('Tutti')

  useEffect(() => {
    loadRiunioni()
  }, [])

  const loadRiunioni = async () => {
    try {
      setLoading(true)
      const response = await riunioniAPI.getAll()
      setRiunioni(response.data.data || [])
    } catch (error) {
      console.error('Error loading riunioni:', error)
      toast.error('Errore nel caricamento delle riunioni')
    } finally {
      setLoading(false)
    }
  }

  const filteredRiunioni = riunioni.filter(r => {
    if (filtroTipo !== 'Tutti' && r.tipoRiunione !== filtroTipo) return false
    if (filtroStato !== 'Tutti' && r.statoVerbale !== filtroStato) return false
    return true
  })

  if (loading) {
    return <div className="flex justify-center p-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Riunioni</h1>
        <AdminOnly>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center justify-center">
            <FiPlus className="mr-2" />
            Nuova Riunione
          </button>
        </AdminOnly>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tipo</label>
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="input"
            >
              <option value="Tutti">Tutti</option>
              <option value="Assemblea Ordinaria">Assemblea Ordinaria</option>
              <option value="Assemblea Straordinaria">Assemblea Straordinaria</option>
              <option value="Consiglio Direttivo">Consiglio Direttivo</option>
              <option value="Riunione Operativa">Riunione Operativa</option>
            </select>
          </div>
          <div>
            <label className="label">Stato Verbale</label>
            <select 
              value={filtroStato} 
              onChange={(e) => setFiltroStato(e.target.value)}
              className="input"
            >
              <option value="Tutti">Tutti</option>
              <option value="Bozza">Bozza</option>
              <option value="Approvato">Approvato</option>
              <option value="Archiviato">Archiviato</option>
            </select>
          </div>
        </div>
      </div>

      {filteredRiunioni.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Nessuna riunione trovata</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="block lg:hidden space-y-4">
            {filteredRiunioni.map((riunione) => (
              <div key={riunione.riunioneId} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <FiCalendar className="mr-2" />
                      {new Date(riunione.dataRiunione).toLocaleDateString('it-IT')}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{riunione.tipoRiunione}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {riunione.oraInizio}{riunione.oraFine ? ` - ${riunione.oraFine}` : ''}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    riunione.statoVerbale === 'Approvato' 
                      ? 'bg-green-100 text-green-800' 
                      : riunione.statoVerbale === 'Archiviato'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <FiFileText className="mr-1" />
                    {riunione.statoVerbale}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {riunione.luogo && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Luogo:</span>
                      <span>{riunione.luogo}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <FiUsers className="mr-2" />
                    <span className="text-green-600 font-medium">
                      {riunione.partecipazioni?.filter(p => p.presente).length || 0}
                    </span>
                    <span className="mx-1">/</span>
                    <span className="text-red-600">
                      {riunione.partecipazioni?.filter(p => !p.presente).length || 0}
                    </span>
                    <span className="text-gray-500 ml-1">
                      (tot: {riunione.partecipazioni?.length || 0})
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Link 
                    to={`/riunioni/${riunione.riunioneId}`}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    <FiEye className="mr-2" /> Visualizza Dettagli
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luogo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partecipanti</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRiunioni.map((riunione) => (
                    <tr key={riunione.riunioneId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiCalendar className="text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(riunione.dataRiunione).toLocaleDateString('it-IT')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {riunione.oraInizio}{riunione.oraFine ? ` - ${riunione.oraFine}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{riunione.tipoRiunione}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{riunione.luogo || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <FiUsers className="text-gray-400 mr-2" />
                          <span className="text-green-600 font-medium">
                            {riunione.partecipazioni?.filter(p => p.presente).length || 0}
                          </span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-red-600">
                            {riunione.partecipazioni?.filter(p => !p.presente).length || 0}
                          </span>
                          <span className="text-gray-400 ml-1">
                            (tot: {riunione.partecipazioni?.length || 0})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          riunione.statoVerbale === 'Approvato' 
                            ? 'bg-green-100 text-green-800' 
                            : riunione.statoVerbale === 'Archiviato'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <FiFileText className="mr-1" />
                          {riunione.statoVerbale}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/riunioni/${riunione.riunioneId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Dettagli
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <CreateRiunioneModal 
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadRiunioni}
      />
    </div>
  )
}

function CreateRiunioneModal({ show, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    dataRiunione: '',
    oraInizio: '',
    oraFine: '',
    luogo: '',
    tipoRiunione: '',
    note: ''
  })

  if (!show) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await riunioniAPI.create(formData)
      toast.success('Riunione creata con successo!')
      onSuccess()
      onClose()
      setFormData({
        dataRiunione: '',
        oraInizio: '',
        oraFine: '',
        luogo: '',
        tipoRiunione: '',
        note: ''
      })
    } catch (error) {
      console.error('Error creating riunione:', error)
      toast.error('Errore nella creazione della riunione')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Nuova Riunione</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo Riunione *</label>
              <select
                value={formData.tipoRiunione}
                onChange={(e) => setFormData({...formData, tipoRiunione: e.target.value})}
                className="input"
                required
              >
                <option value="">Seleziona...</option>
                <option value="Assemblea Ordinaria">Assemblea Ordinaria</option>
                <option value="Assemblea Straordinaria">Assemblea Straordinaria</option>
                <option value="Consiglio Direttivo">Consiglio Direttivo</option>
                <option value="Riunione Operativa">Riunione Operativa</option>
              </select>
            </div>

            <div>
              <label className="label">Data *</label>
              <input
                type="date"
                value={formData.dataRiunione}
                onChange={(e) => setFormData({...formData, dataRiunione: e.target.value})}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Ora Inizio *</label>
              <input
                type="time"
                value={formData.oraInizio}
                onChange={(e) => setFormData({...formData, oraInizio: e.target.value})}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Ora Fine</label>
              <input
                type="time"
                value={formData.oraFine}
                onChange={(e) => setFormData({...formData, oraFine: e.target.value})}
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Luogo</label>
              <input
                type="text"
                value={formData.luogo}
                onChange={(e) => setFormData({...formData, luogo: e.target.value})}
                className="input"
                placeholder="Sede associazione"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                className="input"
                rows="3"
                placeholder="Note aggiuntive..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annulla
            </button>
            <button type="submit" className="btn-primary">
              Crea Riunione
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
