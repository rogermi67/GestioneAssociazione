import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiEdit, FiTrash2, FiDownload, FiSend, FiUserPlus, FiPlus, FiX } from 'react-icons/fi'
import { riunioniAPI, sociAPI, emailAPI } from '../../services/api'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import AdminOnly from '../../components/AdminOnly'

export default function RiunioneDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [riunione, setRiunione] = useState(null)
  const [partecipazioni, setPartecipazioni] = useState([])
  const [argomenti, setArgomenti] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPartModal, setShowPartModal] = useState(false)
  const [showArgModal, setShowArgModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [riunioneRes, partRes, argRes] = await Promise.all([
        riunioniAPI.getById(id),
        riunioniAPI.getPartecipazioni(id),
        riunioniAPI.getArgomenti(id)
      ])
      
      setRiunione(riunioneRes.data.data)
      setPartecipazioni(partRes.data.data || [])
      setArgomenti(argRes.data.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questa riunione?')) return
    
    try {
      await riunioniAPI.delete(id)
      toast.success('Riunione eliminata con successo!')
      navigate('/riunioni')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Errore nell\'eliminazione della riunione')
    }
  }

  const handleGeneraPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(16)
    doc.text('VERBALE RIUNIONE', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Tipo: ${riunione.tipoRiunione}`, 20, 40)
    doc.text(`Data: ${new Date(riunione.dataRiunione).toLocaleDateString('it-IT')}`, 20, 50)
    doc.text(`Ora: ${riunione.oraInizio}${riunione.oraFine ? ' - ' + riunione.oraFine : ''}`, 20, 60)
    doc.text(`Luogo: ${riunione.luogo || 'Non specificato'}`, 20, 70)
    
    doc.setFontSize(14)
    doc.text('Partecipanti:', 20, 90)
    
    doc.setFontSize(10)
    let y = 100
    const presenti = partecipazioni.filter(p => p.presente)
    const assenti = partecipazioni.filter(p => !p.presente)
    
    doc.text('Presenti:', 20, y)
    y += 10
    presenti.forEach(p => {
      doc.text(`- ${p.nomeSocio}${p.carica ? ' (' + p.carica + ')' : ''}`, 25, y)
      y += 7
    })
    
    if (assenti.length > 0) {
      y += 5
      doc.text('Assenti:', 20, y)
      y += 10
      assenti.forEach(p => {
        doc.text(`- ${p.nomeSocio}${p.carica ? ' (' + p.carica + ')' : ''}`, 25, y)
        y += 7
      })
    }
    
    if (argomenti.length > 0) {
      y += 10
      doc.setFontSize(14)
      doc.text('Ordine del Giorno:', 20, y)
      y += 10
      
      doc.setFontSize(10)
      argomenti.forEach((arg, idx) => {
        doc.text(`${idx + 1}. ${arg.titolo}`, 20, y)
        y += 7
        if (arg.descrizione) {
          const lines = doc.splitTextToSize(arg.descrizione, 170)
          doc.text(lines, 25, y)
          y += lines.length * 7
        }
        y += 3
      })
    }
    
    if (riunione.verbale) {
      y += 10
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(14)
      doc.text('Verbale:', 20, y)
      y += 10
      doc.setFontSize(10)
      const verbaleLines = doc.splitTextToSize(riunione.verbale, 170)
      doc.text(verbaleLines, 20, y)
    }
    
    doc.save(`verbale-${riunione.tipoRiunione}-${new Date(riunione.dataRiunione).toLocaleDateString('it-IT')}.pdf`)
    toast.success('PDF generato con successo!')
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="spinner"></div></div>
  }

  if (!riunione) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Riunione non trovata</p>
        <Link to="/riunioni" className="btn-primary">Torna alla lista</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center">
          <Link to="/riunioni" className="mr-4 text-gray-400 hover:text-gray-600">
            <FiArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{riunione.tipoRiunione}</h1>
            <p className="text-gray-500">{new Date(riunione.dataRiunione).toLocaleDateString('it-IT')}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setShowEmailModal(true)} className="btn-secondary flex items-center justify-center">
            <FiSend className="mr-2" />
            Invia Notifica
          </button>
          <button onClick={handleGeneraPDF} className="btn-primary flex items-center justify-center">
            <FiDownload className="mr-2" />
            Genera PDF
          </button>
          <AdminOnly>
            <button onClick={() => setShowEditModal(true)} className="btn-secondary flex items-center justify-center">
              <FiEdit className="mr-2" />
              Modifica
            </button>
            <button onClick={handleDelete} className="btn-danger flex items-center justify-center">
              <FiTrash2 className="mr-2" />
              Elimina
            </button>
          </AdminOnly>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Dettagli Riunione</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo</label>
                <p className="text-gray-900">{riunione.tipoRiunione}</p>
              </div>
              <div>
                <label className="label">Data</label>
                <p className="text-gray-900">{new Date(riunione.dataRiunione).toLocaleDateString('it-IT')}</p>
              </div>
              <div>
                <label className="label">Orario</label>
                <p className="text-gray-900">{riunione.oraInizio}{riunione.oraFine ? ` - ${riunione.oraFine}` : ''}</p>
              </div>
              <div>
                <label className="label">Luogo</label>
                <p className="text-gray-900">{riunione.luogo || '-'}</p>
              </div>
              <div>
                <label className="label">Stato Verbale</label>
                <span className={`badge badge-${riunione.statoVerbale === 'Approvato' ? 'success' : riunione.statoVerbale === 'Archiviato' ? 'default' : 'warning'}`}>
                  {riunione.statoVerbale}
                </span>
              </div>
            </div>
            {riunione.note && (
              <div className="mt-4">
                <label className="label">Note</label>
                <p className="text-gray-900 whitespace-pre-wrap">{riunione.note}</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-bold">Partecipanti</h2>
              <AdminOnly>
                <button onClick={() => setShowPartModal(true)} className="btn-primary flex items-center justify-center">
                  <FiUserPlus className="mr-2" />
                  Aggiungi
                </button>
              </AdminOnly>
            </div>
            <PartecipazioniTable partecipazioni={partecipazioni} onReload={loadData} />
          </div>

          <div className="card">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-bold">Ordine del Giorno</h2>
              <AdminOnly>
                <button onClick={() => setShowArgModal(true)} className="btn-primary flex items-center justify-center">
                  <FiPlus className="mr-2" />
                  Aggiungi
                </button>
              </AdminOnly>
            </div>
            <ArgomentiList argomenti={argomenti} onReload={loadData} />
          </div>

          {riunione.verbale && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Verbale</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{riunione.verbale}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Statistiche</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Presenti</span>
                <span className="font-semibold text-green-600">
                  {partecipazioni.filter(p => p.presente).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Assenti</span>
                <span className="font-semibold text-red-600">
                  {partecipazioni.filter(p => !p.presente).length}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Totale</span>
                <span className="font-semibold">{partecipazioni.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditRiunioneModal 
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        riunione={riunione}
        onSuccess={loadData}
      />
      
      <AddPartecipantiModal
        show={showPartModal}
        onClose={() => setShowPartModal(false)}
        riunioneId={id}
        onSuccess={loadData}
      />
      
      <AddArgomentoModal
        show={showArgModal}
        onClose={() => setShowArgModal(false)}
        riunioneId={id}
        onSuccess={loadData}
      />

      <EmailModal
        show={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        partecipazioni={partecipazioni}
        riunione={riunione}
      />
    </div>
  )
}

function PartecipazioniTable({ partecipazioni, onReload }) {
  const handleTogglePresenza = async (partId, presente) => {
    try {
      await riunioniAPI.updatePartecipazione(partId, { presente: !presente })
      toast.success('Presenza aggiornata')
      onReload()
    } catch (error) {
      toast.error('Errore nell\'aggiornamento')
    }
  }

  const handleRemove = async (partId) => {
    if (!window.confirm('Rimuovere questo partecipante?')) return
    try {
      await riunioniAPI.deletePartecipazione(partId)
      toast.success('Partecipante rimosso')
      onReload()
    } catch (error) {
      toast.error('Errore nella rimozione')
    }
  }

  if (partecipazioni.length === 0) {
    return <p className="text-gray-500 text-center py-4">Nessun partecipante</p>
  }

  return (
    <>
      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {partecipazioni.map((p) => (
          <div key={p.partecipazioneId} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-gray-900">{p.nomeSocio}</div>
                {p.carica && <div className="text-sm text-gray-500">{p.carica}</div>}
                {p.ruolo && <div className="text-sm text-blue-600">{p.ruolo}</div>}
              </div>
              <span className={`badge badge-${p.presente ? 'success' : 'danger'}`}>
                {p.presente ? 'Presente' : 'Assente'}
              </span>
            </div>
            <AdminOnly>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <button
                  onClick={() => handleTogglePresenza(p.partecipazioneId, p.presente)}
                  className="flex-1 text-sm text-blue-600 hover:text-blue-800 py-2 px-3 border border-blue-600 rounded"
                >
                  {p.presente ? 'Segna Assente' : 'Segna Presente'}
                </button>
                <button
                  onClick={() => handleRemove(p.partecipazioneId)}
                  className="text-sm text-red-600 hover:text-red-800 py-2 px-3 border border-red-600 rounded"
                >
                  Rimuovi
                </button>
              </div>
            </AdminOnly>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carica</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruolo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presenza</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partecipazioni.map((p) => (
              <tr key={p.partecipazioneId}>
                <td className="px-6 py-4 whitespace-nowrap">{p.nomeSocio}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.carica || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.ruolo || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge badge-${p.presente ? 'success' : 'danger'}`}>
                    {p.presente ? 'Presente' : 'Assente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <AdminOnly>
                    <button
                      onClick={() => handleTogglePresenza(p.partecipazioneId, p.presente)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {p.presente ? 'Segna Assente' : 'Segna Presente'}
                    </button>
                    <button
                      onClick={() => handleRemove(p.partecipazioneId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Rimuovi
                    </button>
                  </AdminOnly>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function ArgomentiList({ argomenti, onReload }) {
  const handleDelete = async (argId) => {
    if (!window.confirm('Eliminare questo argomento?')) return
    try {
      await riunioniAPI.deleteArgomento(argId)
      toast.success('Argomento eliminato')
      onReload()
    } catch (error) {
      toast.error('Errore nell\'eliminazione')
    }
  }

  if (argomenti.length === 0) {
    return <p className="text-gray-500 text-center py-4">Nessun argomento</p>
  }

  return (
    <div className="space-y-3">
      {argomenti.map((arg, idx) => (
        <div key={arg.argomentoId} className="border rounded p-4 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start">
              <span className="font-semibold text-gray-500 mr-2">{idx + 1}.</span>
              <div className="flex-1">
                <h3 className="font-semibold">{arg.titolo}</h3>
                {arg.descrizione && <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{arg.descrizione}</p>}
              </div>
            </div>
          </div>
          <AdminOnly>
            <button
              onClick={() => handleDelete(arg.argomentoId)}
              className="text-red-600 hover:text-red-800 ml-4 flex-shrink-0"
            >
              <FiTrash2 />
            </button>
          </AdminOnly>
        </div>
      ))}
    </div>
  )
}

function EditRiunioneModal({ show, onClose, riunione, onSuccess }) {
  const [formData, setFormData] = useState({
    dataRiunione: '',
    oraInizio: '',
    oraFine: '',
    luogo: '',
    tipoRiunione: '',
    statoVerbale: '',
    verbale: '',
    note: ''
  })

  useEffect(() => {
    if (riunione) {
      setFormData({
        dataRiunione: riunione.dataRiunione.split('T')[0],
        oraInizio: riunione.oraInizio,
        oraFine: riunione.oraFine || '',
        luogo: riunione.luogo || '',
        tipoRiunione: riunione.tipoRiunione,
        statoVerbale: riunione.statoVerbale,
        verbale: riunione.verbale || '',
        note: riunione.note || ''
      })
    }
  }, [riunione])

  if (!show) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await riunioniAPI.update(riunione.riunioneId, formData)
      toast.success('Riunione aggiornata con successo!')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Errore nell\'aggiornamento')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
        <h3 className="text-xl font-bold mb-4">Modifica Riunione</h3>
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
              <label className="label">Stato Verbale</label>
              <select
                value={formData.statoVerbale}
                onChange={(e) => setFormData({...formData, statoVerbale: e.target.value})}
                className="input"
              >
                <option value="Bozza">Bozza</option>
                <option value="Approvato">Approvato</option>
                <option value="Archiviato">Archiviato</option>
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

            <div>
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
              <label className="label">Verbale</label>
              <textarea
                value={formData.verbale}
                onChange={(e) => setFormData({...formData, verbale: e.target.value})}
                className="input"
                rows="6"
                placeholder="Testo del verbale..."
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
              Salva Modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddPartecipantiModal({ show, onClose, riunioneId, onSuccess }) {
  const [soci, setSoci] = useState([])
  const [selectedSoci, setSelectedSoci] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (show) {
      loadSoci()
    }
  }, [show])

  const loadSoci = async () => {
    try {
      const response = await sociAPI.getAll()
      setSoci(response.data.data || [])
    } catch (error) {
      toast.error('Errore nel caricamento dei soci')
    }
  }

  if (!show) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedSoci.length === 0) {
      toast.warning('Seleziona almeno un socio')
      return
    }

    setLoading(true)
    try {
      for (const socioId of selectedSoci) {
        await riunioniAPI.addPartecipazione(riunioneId, {
          socioId: parseInt(socioId),
          presente: true
        })
      }
      toast.success('Partecipanti aggiunti con successo!')
      onSuccess()
      onClose()
      setSelectedSoci([])
    } catch (error) {
      toast.error('Errore nell\'aggiunta dei partecipanti')
    } finally {
      setLoading(false)
    }
  }

  const toggleSocio = (socioId) => {
    setSelectedSoci(prev =>
      prev.includes(socioId)
        ? prev.filter(id => id !== socioId)
        : [...prev, socioId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Aggiungi Partecipanti</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {soci.map((socio) => (
              <label key={socio.socioId} className="flex items-center p-3 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSoci.includes(socio.socioId.toString())}
                  onChange={() => toggleSocio(socio.socioId.toString())}
                  className="mr-3 h-5 w-5"
                />
                <div className="flex-1">
                  <div className="font-medium">{socio.nomeCompleto}</div>
                  {socio.carica && <div className="text-sm text-gray-500">{socio.carica.nome}</div>}
                </div>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end border-t pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Annulla
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Aggiunta...' : `Aggiungi ${selectedSoci.length} Partecipanti`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddArgomentoModal({ show, onClose, riunioneId, onSuccess }) {
  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: ''
  })

  if (!show) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await riunioniAPI.addArgomento(riunioneId, formData)
      toast.success('Argomento aggiunto con successo!')
      onSuccess()
      onClose()
      setFormData({ titolo: '', descrizione: '' })
    } catch (error) {
      toast.error('Errore nell\'aggiunta dell\'argomento')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Aggiungi Argomento</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Titolo *</label>
            <input
              type="text"
              value={formData.titolo}
              onChange={(e) => setFormData({...formData, titolo: e.target.value})}
              className="input"
              placeholder="Titolo argomento..."
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
              placeholder="Descrizione dettagliata..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annulla
            </button>
            <button type="submit" className="btn-primary">
              Aggiungi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EmailModal({ show, onClose, partecipazioni, riunione }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (show && riunione) {
      setSubject(`Convocazione: ${riunione.tipoRiunione} - ${new Date(riunione.dataRiunione).toLocaleDateString('it-IT')}`)
      setBody(`Gentile Socio,\n\nTi informiamo che è convocata una ${riunione.tipoRiunione}.\n\nData: ${new Date(riunione.dataRiunione).toLocaleDateString('it-IT')}\nOra: ${riunione.oraInizio}\nLuogo: ${riunione.luogo || 'Da definire'}\n\nLa tua presenza è importante.\n\nCordiali saluti`)
    }
  }, [show, riunione])

  if (!show) return null

  const handleSend = async () => {
    const emailsToSend = partecipazioni
      .filter(p => p.email)
      .map(p => p.email)

    if (emailsToSend.length === 0) {
      toast.warning('Nessun partecipante con email')
      return
    }

    setSending(true)
    try {
      await emailAPI.sendCustom({
        email: emailsToSend.join(','),
        subject,
        body
      })
      toast.success(`Email inviata a ${emailsToSend.length} destinatari`)
      onClose()
    } catch (error) {
      toast.error('Errore nell\'invio delle email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Invia Notifica Email</h3>
        
        <div className="space-y-4">
          <div>
            <label className="label">Oggetto</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Messaggio</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="input"
              rows="10"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-gray-700">
              Verrà inviata a {partecipazioni.filter(p => p.email).length} partecipanti con email
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <button onClick={onClose} className="btn-secondary" disabled={sending}>
              Annulla
            </button>
            <button onClick={handleSend} className="btn-primary" disabled={sending}>
              {sending ? 'Invio...' : 'Invia Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
