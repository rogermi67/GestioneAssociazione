import { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { pushNotificationAPI } from '../../services/api'
import { toast } from 'react-toastify'
import AdminOnly from '../../components/AdminOnly'

export default function SendNotification() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: ''
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    
    try {
      const response = await pushNotificationAPI.send(formData)
      toast.success(response.data.message || 'Notifiche inviate!')
      setFormData({ title: '', body: '', url: '' })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Errore nell\'invio delle notifiche')
    } finally {
      setSending(false)
    }
  }

  return (
    <AdminOnly>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Invia Notifica Push
        </h1>

        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Titolo *</label>
              <input
                type="text"
                className="input"
                placeholder="Nuova riunione convocata"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="label">Messaggio *</label>
              <textarea
                className="input"
                rows="4"
                placeholder="La prossima riunione si terrà venerdì 15 gennaio..."
                value={formData.body}
                onChange={(e) => setFormData({...formData, body: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="label">URL destinazione (opzionale)</label>
              <input
                type="text"
                className="input"
                placeholder="/riunioni/123"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
              <p className="text-sm text-gray-500 mt-1">
                Quando l'utente clicca sulla notifica, verrà portato a questo URL
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center"
              disabled={sending}
            >
              <FiSend className="mr-2" />
              {sending ? 'Invio in corso...' : 'Invia a tutti gli utenti'}
            </button>
          </form>
        </div>

        <div className="card max-w-2xl mt-6 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Come funziona</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• La notifica sarà inviata a tutti gli utenti che hanno abilitato le notifiche</li>
            <li>• Gli utenti riceveranno la notifica anche se l'app è chiusa</li>
            <li>• Cliccando sulla notifica, l'app si aprirà all'URL specificato</li>
          </ul>
        </div>
      </div>
    </AdminOnly>
  )
}