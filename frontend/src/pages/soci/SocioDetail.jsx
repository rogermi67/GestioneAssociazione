import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi'
import { sociAPI, caricheAPI } from '../../services/api'
import { toast } from 'react-toastify'
import AdminOnly from '../../components/AdminOnly'

export default function SocioDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [socio, setSocio] = useState(null)
  const [cariche, setCariche] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [socioRes, caricheRes] = await Promise.all([
        sociAPI.getById(id),
        caricheAPI.getAll()
      ])
      
      setSocio(socioRes.data.data)
      setCariche(caricheRes.data.data || [])
      
      setFormData({
        nome: socioRes.data.data.nome,
        cognome: socioRes.data.data.cognome,
        codiceFiscale: socioRes.data.data.codiceFiscale,
        dataNascita: socioRes.data.data.dataNascita.split('T')[0],
        email: socioRes.data.data.email || '',
        telefono: socioRes.data.data.telefono || '',
        indirizzo: socioRes.data.data.indirizzo || '',
        statoSocio: socioRes.data.data.statoSocio,
        caricaId: socioRes.data.data.caricaId || '',
        note: socioRes.data.data.note || ''
      })
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await sociAPI.update(id, {
        ...formData,
        dataNascita: formData.dataNascita,
        caricaId: formData.caricaId ? parseInt(formData.caricaId) : null
      })
      toast.success('Socio aggiornato con successo!')
      setEditing(false)
      loadData()
    } catch (error) {
      console.error('Error updating socio:', error)
      toast.error('Errore nell\'aggiornamento del socio')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questo socio?')) {
      return
    }
    try {
      await sociAPI.delete(id)
      toast.success('Socio eliminato con successo!')
      navigate('/soci')
    } catch (error) {
      console.error('Error deleting socio:', error)
      toast.error('Errore nell\'eliminazione del socio')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!socio) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Socio non trovato</p>
        <Link to="/soci" className="btn-primary">Torna alla lista</Link>
      </div>
    )
  }

  const caricaCorrente = cariche.find(c => c.caricaId === socio.caricaId)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center">
          <Link to="/soci" className="mr-4 text-gray-400 hover:text-gray-600">
            <FiArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{socio.nomeCompleto}</h1>
        </div>
        <AdminOnly>
          <div className="flex flex-col sm:flex-row gap-3">
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} className="btn-primary flex items-center justify-center">
                  <FiEdit className="mr-2" />
                  Modifica
                </button>
                <button onClick={handleDelete} className="btn-danger flex items-center justify-center">
                  <FiTrash2 className="mr-2" />
                  Elimina
                </button>
              </>
            ) : (
              <>
                <button onClick={handleUpdate} className="btn-primary flex items-center justify-center">
                  <FiSave className="mr-2" />
                  Salva
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary flex items-center justify-center">
                  <FiX className="mr-2" />
                  Annulla
                </button>
              </>
            )}
          </div>
        </AdminOnly>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Informazioni Personali</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome</label>
                {editing ? (
                  <input type="text" className="input" value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                ) : (
                  <p className="text-gray-900">{socio.nome}</p>
                )}
              </div>
              <div>
                <label className="label">Cognome</label>
                {editing ? (
                  <input type="text" className="input" value={formData.cognome}
                    onChange={(e) => setFormData({...formData, cognome: e.target.value})} />
                ) : (
                  <p className="text-gray-900">{socio.cognome}</p>
                )}
              </div>
              <div>
                <label className="label">Codice Fiscale</label>
                {editing ? (
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.codiceFiscale}
                    onChange={(e) => setFormData({...formData, codiceFiscale: e.target.value.toUpperCase()})}
                    maxLength="16"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{socio.codiceFiscale}</p>
                )}
              </div>
              <div>
                <label className="label">Data di Nascita</label>
                {editing ? (
                  <input 
                    type="date" 
                    className="input" 
                    value={formData.dataNascita}
                    onChange={(e) => setFormData({...formData, dataNascita: e.target.value})}
                  />
                ) : (
                  <p className="text-gray-900">{new Date(socio.dataNascita).toLocaleDateString('it-IT')}</p>
                )}
              </div>
              <div>
                <label className="label">Età</label>
                <p className="text-gray-900">{socio.eta} anni</p>
              </div>
              <div>
                <label className="label">Stato</label>
                {editing ? (
                  <select className="input" value={formData.statoSocio}
                    onChange={(e) => setFormData({...formData, statoSocio: e.target.value})}>
                    <option value="Attivo">Attivo</option>
                    <option value="Sospeso">Sospeso</option>
                    <option value="Cessato">Cessato</option>
                  </select>
                ) : (
                  <span className={`badge badge-${socio.statoSocio === 'Attivo' ? 'success' : socio.statoSocio === 'Sospeso' ? 'warning' : 'danger'}`}>
                    {socio.statoSocio}
                  </span>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Carica</label>
                {editing ? (
                  <select 
                    className="input" 
                    value={formData.caricaId || ''}
                    onChange={(e) => setFormData({...formData, caricaId: e.target.value})}
                  >
                    <option value="">Nessuna carica</option>
                    {cariche.map(carica => (
                      <option key={carica.caricaId} value={carica.caricaId}>
                        {carica.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{caricaCorrente ? caricaCorrente.nome : 'Nessuna carica'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Contatti</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                {editing ? (
                  <input type="email" className="input" value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                ) : (
                  <p className="text-gray-900 break-words">{socio.email || '-'}</p>
                )}
              </div>
              <div>
                <label className="label">Telefono</label>
                {editing ? (
                  <input type="tel" className="input" value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                ) : (
                  <p className="text-gray-900">{socio.telefono || '-'}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Indirizzo</label>
                {editing ? (
                  <input type="text" className="input" value={formData.indirizzo}
                    onChange={(e) => setFormData({...formData, indirizzo: e.target.value})} />
                ) : (
                  <p className="text-gray-900">{socio.indirizzo || '-'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Note</h2>
            {editing ? (
              <textarea className="input" rows={4} value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})} />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{socio.note || 'Nessuna nota'}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Informazioni Iscrizione</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Data Iscrizione</label>
                <p className="text-gray-900">{new Date(socio.dataIscrizione).toLocaleDateString('it-IT')}</p>
              </div>
              {socio.dataCessazione && (
                <div>
                  <label className="label">Data Cessazione</label>
                  <p className="text-gray-900">{new Date(socio.dataCessazione).toLocaleDateString('it-IT')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Carica Attuale</h2>
            {caricaCorrente ? (
              <div>
                <p className="font-semibold text-blue-600">{caricaCorrente.nome}</p>
                {caricaCorrente.descrizione && (
                  <p className="text-sm text-gray-600 mt-1">{caricaCorrente.descrizione}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Nessuna carica assegnata</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Documenti</h2>
            <p className="text-gray-500 text-sm">Nessun documento caricato</p>
          </div>
        </div>
      </div>
    </div>
  )
}
