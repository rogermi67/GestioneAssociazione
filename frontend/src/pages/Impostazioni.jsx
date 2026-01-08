import { Link } from 'react-router-dom'
import { FiMail, FiSettings } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { impostazioniAPI } from '../services/api'
import AdminOnly from '../components/AdminOnly'
import NotificationToggle from '../components/NotificationToggle'

export default function Impostazioni() {
  const [settings, setSettings] = useState({
    nome_associazione: '',
    indirizzo: '',
    cap: '',
    citta: '',
    provincia: '',
    partita_iva: '',
    telefono: '',
    email: '',
    logo_base64: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await impostazioniAPI.getAll()
      const data = response.data.data || {}
      
      setSettings({
        nome_associazione: data.nome_associazione || '',
        indirizzo: data.indirizzo || '',
        cap: data.cap || '',
        citta: data.citta || '',
        provincia: data.provincia || '',
        partita_iva: data.partita_iva || '',
        telefono: data.telefono || '',
        email: data.email || '',
        logo_base64: data.logo_base64 || ''
      })
    } catch (error) {
      console.error('Errore caricamento:', error)
      toast.error('Errore nel caricamento delle impostazioni')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Seleziona un file immagine valido')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'immagine deve essere inferiore a 2MB')
      return
    }

    setUploadingLogo(true)
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSettings({...settings, logo_base64: reader.result})
        toast.success('Logo caricato! Ricorda di salvare le modifiche.')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Errore nel caricamento del logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setSettings({...settings, logo_base64: ''})
    toast.info('Logo rimosso! Ricorda di salvare le modifiche.')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = [
        'nome_associazione',
        'indirizzo', 
        'cap',
        'citta',
        'provincia',
        'partita_iva',
        'telefono',
        'email',
        'logo_base64'
      ]
      
      for (const key of updates) {
        await impostazioniAPI.update(key, settings[key] || '')
      }
      
      toast.success('Impostazioni salvate con successo!')
    } catch (error) {
      console.error('Errore salvataggio:', error)
      toast.error('Errore nel salvataggio')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center p-8">Caricamento...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Impostazioni Associazione</h1>
		<NotificationToggle />  {/* <-- AGGIUNGI QUESTA RIGA */}
        <AdminOnly>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </AdminOnly>
      </div>

      {/* CARD EMAIL */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            <FiMail className="text-blue-600 mr-4 mt-1" size={32} />
            <div>
              <h2 className="text-xl font-semibold mb-2">Configurazione Email (SMTP)</h2>
              <p className="text-gray-600 mb-4">
                Configura il server SMTP per inviare notifiche via email ai soci per riunioni ed eventi
              </p>
              <AdminOnly>
                <Link 
                  to="/impostazioni/email" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <FiSettings className="mr-2" />
                  Configura Email
                </Link>
              </AdminOnly>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Logo Associazione</h2>
        
        <div className="space-y-4">
          {settings.logo_base64 ? (
            <div className="flex items-start gap-4">
              <div className="border rounded p-4 bg-gray-50">
                <img 
                  src={settings.logo_base64} 
                  alt="Logo" 
                  className="h-32 w-auto object-contain"
                />
              </div>
              <AdminOnly>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-600">Logo caricato</p>
                  <button
                    onClick={handleRemoveLogo}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Rimuovi Logo
                  </button>
                </div>
              </AdminOnly>
            </div>
          ) : (
            <AdminOnly>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">Nessun logo caricato</p>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block">
                    {uploadingLogo ? 'Caricamento...' : 'Carica Logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF - Max 2MB</p>
              </div>
            </AdminOnly>
          )}
          
          <AdminOnly>
            {!settings.logo_base64 && (
              <label className="block">
                <span className="sr-only">Carica logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50"
                />
              </label>
            )}
          </AdminOnly>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dati Associazione</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Associazione</label>
            <input 
              type="text" 
              value={settings.nome_associazione} 
              onChange={(e) => setSettings({...settings, nome_associazione: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              placeholder="Associazione I Salionzesi ETS"
              readOnly={true}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
            <input 
              type="text" 
              value={settings.indirizzo} 
              onChange={(e) => setSettings({...settings, indirizzo: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              placeholder="Via/Piazza..."
              readOnly={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
            <input 
              type="text" 
              value={settings.cap} 
              onChange={(e) => setSettings({...settings, cap: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              placeholder="37067"
              readOnly={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
            <input 
              type="text" 
              value={settings.citta} 
              onChange={(e) => setSettings({...settings, citta: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              placeholder="Valeggio sul Mincio"
              readOnly={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
            <input 
              type="text" 
              value={settings.provincia} 
              onChange={(e) => setSettings({...settings, provincia: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              placeholder="VR" 
              maxLength="2"
              readOnly={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA / Codice Fiscale</label>
            <input 
              type="text" 
              value={settings.partita_iva} 
              onChange={(e) => setSettings({...settings, partita_iva: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              readOnly={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input 
              type="tel" 
              value={settings.telefono} 
              onChange={(e) => setSettings({...settings, telefono: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              readOnly={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={settings.email} 
              onChange={(e) => setSettings({...settings, email: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
