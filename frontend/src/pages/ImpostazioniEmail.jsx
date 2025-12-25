import { useState } from 'react'
import { FiMail, FiCheck, FiSend } from 'react-icons/fi'
import { notificheAPI } from '../services/api'
import { toast } from 'react-toastify'

export default function ImpostazioniEmail() {
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  const testConnection = async () => {
    setTesting(true)
    try {
      const response = await notificheAPI.testConnection()
      if (response.data.success) {
        toast.success('✅ Connessione SMTP funzionante!')
      } else {
        toast.error('❌ Errore: ' + response.data.message)
      }
    } catch (error) {
      console.error('Test error:', error)
      toast.error('❌ Errore nella connessione SMTP')
    } finally {
      setTesting(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Inserisci un indirizzo email')
      return
    }

    setSendingTest(true)
    try {
      const response = await notificheAPI.testSingle(testEmail)
      if (response.data.success) {
        toast.success('✅ Email di test inviata!')
      } else {
        toast.error('❌ Errore: ' + response.data.message)
      }
    } catch (error) {
      console.error('Send test error:', error)
      toast.error('❌ Errore nell\'invio dell\'email')
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Configurazione Email
      </h1>

      {/* Istruzioni Gmail */}
      <div className="card mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <FiMail className="text-blue-600 mt-1 mr-3" size={24} />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">
              Come configurare Gmail
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Vai su <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Account Security</a></li>
              <li>Attiva la <strong>Verifica in due passaggi</strong></li>
              <li>Vai su <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline font-medium">Password per le app</a></li>
              <li>Crea una nuova password per "Associazione ETS"</li>
              <li>Copia la password di 16 caratteri</li>
              <li>Modifica <code className="bg-blue-100 px-2 py-1 rounded">backend/appsettings.json</code></li>
              <li>Inserisci la tua email in <code>SmtpUser</code> e <code>FromEmail</code></li>
              <li>Incolla la password in <code>SmtpPass</code></li>
              <li>Riavvia il backend</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Test Connessione */}
      <div className="card mb-6">
        <h3 className="text-lg font-bold mb-4">Test Connessione SMTP</h3>
        <p className="text-gray-600 mb-4">
          Verifica che la configurazione SMTP sia corretta
        </p>
        <button
          onClick={testConnection}
          disabled={testing}
          className="btn-primary flex items-center"
        >
          {testing ? (
            <>
              <div className="spinner mr-2"></div>
              Test in corso...
            </>
          ) : (
            <>
              <FiCheck className="mr-2" />
              Testa Connessione
            </>
          )}
        </button>
      </div>

      {/* Invia Email di Test */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Invia Email di Test</h3>
        <p className="text-gray-600 mb-4">
          Invia un'email di prova a un indirizzo specifico
        </p>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="tua-email@esempio.com"
            className="input flex-1"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
          <button
            onClick={sendTestEmail}
            disabled={sendingTest}
            className="btn-primary flex items-center"
          >
            {sendingTest ? (
              <>
                <div className="spinner mr-2"></div>
                Invio...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Invia Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
