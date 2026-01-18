import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { eventiAPI, reportAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { FiEdit2, FiTrash2, FiArrowLeft, FiCalendar, FiMapPin, FiDownload, FiMail } from 'react-icons/fi'
import TodoList from '../../components/TodoList'
import DocumentiEvento from '../../components/DocumentiEvento'

export default function EventoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvento()
  }, [id])

  const fetchEvento = async () => {
    try {
      const response = await eventiAPI.getById(id)
      setEvento(response.data.data)
    } catch (error) {
      toast.error('Errore nel caricamento dell\'evento')
      navigate('/eventi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questo evento?')) return

    try {
      await eventiAPI.delete(id)
      toast.success('Evento eliminato con successo')
      navigate('/eventi')
    } catch (error) {
      toast.error('Errore nell\'eliminazione dell\'evento')
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await reportAPI.downloadEventoPdf(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `Evento_${evento.titolo.replace(/ /g, '_')}.pdf`
      link.click()
      toast.success('PDF scaricato con successo')
    } catch (error) {
      toast.error('Errore nel download del PDF')
    }
  }

  const handleSendEmail = async () => {
    if (!window.confirm('Inviare il report via email a tutte le persone assegnate ai todo?')) return
    
    try {
      const response = await reportAPI.sendEventoEmail(id)
      toast.success(response.data.message || 'Email inviate con successo')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Errore nell\'invio delle email')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  if (!evento) {
    return <div className="text-center py-8">Evento non trovato</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/eventi')}
              className="text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{evento.titolo}</h1>
          </div>
          
          <div className="flex gap-2">
            <Link
              to={`/eventi/${id}/modifica`}
              className="btn-primary flex items-center gap-2"
            >
              <FiEdit2 /> Modifica
            </Link>
            <button
              onClick={handleDelete}
              className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <FiTrash2 /> Elimina
            </button>
          </div>
        </div>

        {/* Report Buttons */}
        <div className="flex gap-2 ml-12">
          <button
            onClick={handleDownloadPdf}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FiDownload size={16} /> Scarica PDF
          </button>
          <button
            onClick={handleSendEmail}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FiMail size={16} /> Invia Email a Tutti
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Tipo e Stato */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tipo e Stato</h3>
          <div className="space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              evento.tipoEvento === 'Festa' ? 'bg-pink-100 text-pink-800' :
              evento.tipoEvento === 'Corso' ? 'bg-green-100 text-green-800' :
              evento.tipoEvento === 'Rievocazione' ? 'bg-purple-100 text-purple-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {evento.tipoEvento}
            </span>
            <br />
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              evento.stato === 'In corso' ? 'bg-green-100 text-green-800' :
              evento.stato === 'Concluso' ? 'bg-gray-100 text-gray-800' :
              evento.stato === 'Annullato' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {evento.stato}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            <FiCalendar className="inline mr-2" />
            Date
          </h3>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="font-medium">Inizio:</span>{' '}
              {new Date(evento.dataInizio).toLocaleString('it-IT')}
            </div>
            {evento.dataFine && (
              <div className="text-sm">
                <span className="font-medium">Fine:</span>{' '}
                {new Date(evento.dataFine).toLocaleString('it-IT')}
              </div>
            )}
          </div>
        </div>

        {/* Luogo */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            <FiMapPin className="inline mr-2" />
            Luogo
          </h3>
          <p className="text-sm">{evento.luogo || 'Non specificato'}</p>
        </div>
      </div>

      {/* Descrizione */}
      {evento.descrizione && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-3">Descrizione</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{evento.descrizione}</p>
        </div>
      )}

      {/* Dettagli */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Dettagli</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Budget:</span>
            <p className="text-sm mt-1">
              {evento.budget ? `€ ${evento.budget.toFixed(2)}` : 'Non specificato'}
            </p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Pubblicato:</span>
            <p className="text-sm mt-1">
              {evento.pubblicato ? (
                <span className="text-green-600">✓ Pubblico</span>
              ) : (
                <span className="text-gray-500">✗ Privato</span>
              )}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Creato il:</span>
            <p className="text-sm mt-1">
              {new Date(evento.createdAt).toLocaleDateString('it-IT')}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Ultima modifica:</span>
            <p className="text-sm mt-1">
              {new Date(evento.updatedAt).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>
      </div>

      {/* Note */}
      {evento.note && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-3">Note</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{evento.note}</p>
        </div>
      )}
	  
      {/* Todo e Documenti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <TodoList eventoId={id} />
        <DocumentiEvento eventoId={id} />
      </div>
    </div>
  )
}