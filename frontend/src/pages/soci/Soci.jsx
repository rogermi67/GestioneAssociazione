import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit, FiSearch, FiEye } from 'react-icons/fi'
import { sociAPI } from '../../services/api'
import { toast } from 'react-toastify'
import AdminOnly from '../../components/AdminOnly'

export default function Soci() {
  const [soci, setSoci] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadSoci()
  }, [])

  const loadSoci = async () => {
    try {
      setLoading(true)
      const response = await sociAPI.getAll()
      setSoci(response.data.data || [])
    } catch (error) {
      console.error('Error loading soci:', error)
      toast.error('Errore nel caricamento dei soci')
    } finally {
      setLoading(false)
    }
  }

  const filteredSoci = soci.filter(socio =>
    `${socio.nome} ${socio.cognome}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.codiceFiscale?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatoBadge = (stato) => {
    const badges = {
      'Attivo': 'badge-success',
      'Sospeso': 'badge-warning',
      'Cessato': 'badge-danger'
    }
    return badges[stato] || 'badge-info'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Soci</h1>
        <AdminOnly>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center justify-center">
            <FiPlus className="mr-2" />
            Nuovo Socio
          </button>
        </AdminOnly>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per nome, cognome o codice fiscale..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-gray-600">Totale Soci</p>
          <p className="text-3xl font-bold text-primary-600">{soci.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Attivi</p>
          <p className="text-3xl font-bold text-green-600">
            {soci.filter(s => s.statoSocio === 'Attivo').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Sospesi/Cessati</p>
          <p className="text-3xl font-bold text-orange-600">
            {soci.filter(s => s.statoSocio !== 'Attivo').length}
          </p>
        </div>
      </div>

      {filteredSoci.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Nessun socio trovato</p>
          <AdminOnly>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Aggiungi il primo socio
            </button>
          </AdminOnly>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="block lg:hidden space-y-4">
            {filteredSoci.map((socio) => (
              <div key={socio.socioId} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-lg">
                        {socio.nome[0]}{socio.cognome[0]}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-lg font-medium text-gray-900">{socio.nomeCompleto}</div>
                      <div className="text-sm text-gray-500">{socio.eta} anni</div>
                    </div>
                  </div>
                  <span className={`badge ${getStatoBadge(socio.statoSocio)}`}>
                    {socio.statoSocio}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CF:</span>
                    <span className="text-gray-900 font-mono">{socio.codiceFiscale}</span>
                  </div>
                  {socio.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900 truncate ml-2">{socio.email}</span>
                    </div>
                  )}
                  {socio.telefono && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tel:</span>
                      <span className="text-gray-900">{socio.telefono}</span>
                    </div>
                  )}
                  {socio.carica && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carica:</span>
                      <span className="text-blue-600 font-medium">{socio.carica.nome}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <AdminOnly fallback={
                    <Link to={`/soci/${socio.socioId}`} className="btn-secondary w-full flex items-center justify-center">
                      <FiEye className="mr-2" /> Visualizza Dettagli
                    </Link>
                  }>
                    <Link to={`/soci/${socio.socioId}`} className="btn-primary w-full flex items-center justify-center">
                      <FiEdit className="mr-2" /> Modifica
                    </Link>
                  </AdminOnly>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome Completo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codice Fiscale</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefono</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carica</th>                  
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSoci.map((socio) => (
                    <tr key={socio.socioId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {socio.nome[0]}{socio.cognome[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{socio.nomeCompleto}</div>
                            <div className="text-sm text-gray-500">Età: {socio.eta} anni</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{socio.codiceFiscale}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{socio.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{socio.telefono || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {socio.carica?.nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getStatoBadge(socio.statoSocio)}`}>{socio.statoSocio}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <AdminOnly fallback={
                          <Link to={`/soci/${socio.socioId}`} className="text-blue-600 hover:text-blue-900">
                            Dettagli
                          </Link>
                        }>
                          <Link to={`/soci/${socio.socioId}`} className="text-primary-600 hover:text-primary-900">
                            <FiEdit className="inline" /> Modifica
                          </Link>
                        </AdminOnly>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showCreateModal && (
        <CreateSocioModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadSoci()
          }}
        />
      )}
    </div>
  )
}

function CreateSocioModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    codiceFiscale: '',
    dataNascita: '',
    email: '',
    telefono: '',
    indirizzo: '',
    note: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sociAPI.create(formData)
      toast.success('Socio creato con successo!')
      onSuccess()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Errore nella creazione del socio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
      <div className="relative top-4 sm:top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Nuovo Socio</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-2xl"></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome *</label>
              <input type="text" className="input" required value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})} />
            </div>
            <div>
              <label className="label">Cognome *</label>
              <input type="text" className="input" required value={formData.cognome}
                onChange={(e) => setFormData({...formData, cognome: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Codice Fiscale *</label>
              <input type="text" className="input" required maxLength={16} value={formData.codiceFiscale}
                onChange={(e) => setFormData({...formData, codiceFiscale: e.target.value.toUpperCase()})} />
            </div>
            <div>
              <label className="label">Data di Nascita *</label>
              <input type="date" className="input" required value={formData.dataNascita}
                onChange={(e) => setFormData({...formData, dataNascita: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="label">Telefono</label>
              <input type="tel" className="input" value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Indirizzo</label>
            <input type="text" className="input" value={formData.indirizzo}
              onChange={(e) => setFormData({...formData, indirizzo: e.target.value})} />
          </div>
          <div>
            <label className="label">Note</label>
            <textarea className="input" rows={3} value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})} />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Annulla
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvataggio...' : 'Crea Socio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
