import { useState, useEffect } from 'react'
import { documentiEventiAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiUpload, FiTrash2, FiDownload, FiFile, FiImage } from 'react-icons/fi'

export default function DocumentiEvento({ eventoId }) {
  const [documenti, setDocumenti] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchDocumenti()
  }, [eventoId])

  const fetchDocumenti = async () => {
    try {
      const response = await documentiEventiAPI.getByEvento(eventoId)
      setDocumenti(response.data.data || [])
    } catch (error) {
      console.error('Errore caricamento documenti:', error)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Limita dimensione a 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File troppo grande (max 10MB)')
      return
    }

    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1]
        
        await documentiEventiAPI.upload({
          eventoId,
          nomeFile: file.name,
          tipoFile: file.type,
          base64Content: base64
        })

        toast.success('Documento caricato')
        fetchDocumenti()
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Errore nel caricamento')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questo documento?')) return

    try {
      await documentiEventiAPI.delete(id)
      toast.success('Documento eliminato')
      fetchDocumenti()
    } catch (error) {
      toast.error('Errore eliminazione')
    }
  }

  const handleDownload = async (doc) => {
    try {
      const response = await documentiEventiAPI.download(doc.documentoEventoId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = doc.nomeFile
      link.click()
    } catch (error) {
      toast.error('Errore download')
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (tipoFile) => {
    if (tipoFile.startsWith('image/')) return <FiImage className="text-blue-500" size={20} />
    return <FiFile className="text-gray-500" size={20} />
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Documenti</h3>
        <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <FiUpload />
          {uploading ? 'Caricamento...' : 'Carica File'}
          <input
            type="file"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
          />
        </label>
      </div>

      <div className="space-y-2">
        {documenti.map(doc => (
          <div key={doc.documentoEventoId} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
            <div className="flex items-center gap-3 flex-1">
              {getFileIcon(doc.tipoFile)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.nomeFile}</p>
                <p className="text-xs text-gray-500">
                  {formatBytes(doc.dimensione)} • {new Date(doc.uploadedAt).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(doc)}
                className="text-blue-600 hover:text-blue-800"
                title="Download"
              >
                <FiDownload size={18} />
              </button>
              <button
                onClick={() => handleDelete(doc.documentoEventoId)}
                className="text-red-600 hover:text-red-800"
                title="Elimina"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {documenti.length === 0 && (
          <p className="text-center text-gray-500 py-4">Nessun documento caricato</p>
        )}
      </div>
    </div>
  )
}