import { useState, useEffect, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { eventiAPI } from '../../services/api'
import { riunioniAPI } from '../../services/api'  // <-- AGGIUNGI
import { toast } from 'react-toastify'
import { FiFilter, FiCalendar } from 'react-icons/fi'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'it': it }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function CalendarioEventi() {
  const [eventi, setEventi] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [filters, setFilters] = useState({
    tipoEvento: 'Tutti',
    stato: 'Tutti',
    pubblicato: 'Tutti'
  })

  useEffect(() => {
    fetchEventi()
  }, [])

const fetchEventi = async () => {
  try {
    console.log('🔍 Fetching eventi...')
    const eventiResponse = await eventiAPI.getAll()
    const eventi = eventiResponse.data.data || []
    console.log('📅 Eventi ricevuti:', eventi)
    
    console.log('🔍 Fetching riunioni...')
    const riunioniResponse = await riunioniAPI.getAll()
    const riunioni = riunioniResponse.data.data || []
    console.log('📋 Riunioni ricevute:', riunioni)
    
    const allItems = [
  ...eventi.map(e => ({ ...e, tipo: 'evento' })),
  ...riunioni.map(r => {
    // Combina dataRiunione + oraInizio/oraFine
    const dataInizio = new Date(`${r.dataRiunione.split('T')[0]}T${r.oraInizio}:00`)
    const dataFine = new Date(`${r.dataRiunione.split('T')[0]}T${r.oraFine}:00`)
    
    return {
      ...r,
      tipo: 'riunione',
      titolo: r.tipoRiunione || 'Riunione',
      dataInizio: dataInizio.toISOString(),
      dataFine: dataFine.toISOString(),
      tipoEvento: 'Riunione'
    }
  })
]
    
    console.log('✅ Tutti gli item combinati:', allItems)
    setEventi(allItems)
  } catch (error) {
    console.error('❌ Errore caricamento:', error)
    toast.error('Errore nel caricamento del calendario')
  } finally {
    setLoading(false)
  }
}

  // Converti eventi per react-big-calendar
  const calendarEvents = useMemo(() => {
    return eventi
      .filter(e => {
        if (filters.tipoEvento !== 'Tutti' && e.tipoEvento !== filters.tipoEvento) return false
        if (filters.stato !== 'Tutti' && e.stato !== filters.stato) return false
        if (filters.pubblicato !== 'Tutti') {
          const isPubblicato = filters.pubblicato === 'Pubblicato'
          if (e.pubblicato !== isPubblicato) return false
        }
        return true
      })
      .map(evento => ({
        id: evento.eventoId,
        title: evento.titolo,
        start: new Date(evento.dataInizio),
        end: evento.dataFine ? new Date(evento.dataFine) : new Date(evento.dataInizio),
        resource: evento
      }))
  }, [eventi, filters])

  // Colori per tipo evento
  const eventStyleGetter = (event) => {
    const colors = {
      'Evento': { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
      'Festa': { backgroundColor: '#ec4899', borderColor: '#db2777' },
      'Rievocazione': { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' },
      'Corso': { backgroundColor: '#10b981', borderColor: '#059669' },
	  'Riunione': { backgroundColor: '#f59e0b', borderColor: '#d97706' } 
    }
    
    const color = colors[event.resource.tipoEvento] || colors['Evento']
    
    return {
      style: {
        ...color,
        borderRadius: '5px',
        opacity: event.resource.pubblicato ? 1 : 0.6,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    }
  }

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Caricamento calendario...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FiCalendar className="mr-3" />
          Calendario Eventi
        </h1>
      </div>

      {/* Filtri */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <FiFilter className="text-gray-500" />
          
          <select
            className="input max-w-xs"
            value={filters.tipoEvento}
            onChange={(e) => setFilters({...filters, tipoEvento: e.target.value})}
          >
            <option value="Tutti">Tutti i tipi</option>
            <option value="Evento">Evento</option>
            <option value="Festa">Festa</option>
            <option value="Rievocazione">Rievocazione</option>
            <option value="Corso">Corso</option>
          </select>

          <select
            className="input max-w-xs"
            value={filters.stato}
            onChange={(e) => setFilters({...filters, stato: e.target.value})}
          >
            <option value="Tutti">Tutti gli stati</option>
            <option value="Pianificato">Pianificato</option>
            <option value="In corso">In corso</option>
            <option value="Concluso">Concluso</option>
            <option value="Annullato">Annullato</option>
          </select>

          <select
            className="input max-w-xs"
            value={filters.pubblicato}
            onChange={(e) => setFilters({...filters, pubblicato: e.target.value})}
          >
            <option value="Tutti">Tutti</option>
            <option value="Pubblicato">Pubblicati</option>
            <option value="NonPubblicato">Non pubblicati</option>
          </select>

          <div className="text-sm text-gray-500 ml-auto">
            {calendarEvents.length} eventi visualizzati
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="card mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: '#3b82f6'}}></div>
            <span className="text-sm">Evento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: '#ec4899'}}></div>
            <span className="text-sm">Festa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: '#8b5cf6'}}></div>
            <span className="text-sm">Rievocazione</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: '#10b981'}}></div>
            <span className="text-sm">Corso</span>
          </div>
		  <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: '#f59e0b'}}></div>
            <span className="text-sm">Riunione</span>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="card" style={{height: '600px'}}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          messages={{
            next: "Succ",
            previous: "Prec",
            today: "Oggi",
            month: "Mese",
            week: "Settimana",
            day: "Giorno",
            agenda: "Agenda",
            date: "Data",
            time: "Ora",
            event: "Evento",
            noEventsInRange: "Nessun evento in questo periodo"
          }}
          culture="it"
        />
      </div>

      {/* Modal dettagli evento */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedEvent.titolo}</h2>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-semibold">Tipo:</span>{' '}
                <span className="px-2 py-1 rounded text-sm" style={{
                  backgroundColor: selectedEvent.tipoEvento === 'Festa' ? '#fce7f3' : 
                                 selectedEvent.tipoEvento === 'Corso' ? '#d1fae5' :
                                 selectedEvent.tipoEvento === 'Rievocazione' ? '#ede9fe' : '#dbeafe',
                  color: selectedEvent.tipoEvento === 'Festa' ? '#be185d' :
                         selectedEvent.tipoEvento === 'Corso' ? '#047857' :
                         selectedEvent.tipoEvento === 'Rievocazione' ? '#6d28d9' : '#1e40af'
                }}>
                  {selectedEvent.tipoEvento}
                </span>
              </div>

              <div>
                <span className="font-semibold">Stato:</span> {selectedEvent.stato}
              </div>

              <div>
                <span className="font-semibold">Inizio:</span>{' '}
                {new Date(selectedEvent.dataInizio).toLocaleString('it-IT')}
              </div>

              {selectedEvent.dataFine && (
                <div>
                  <span className="font-semibold">Fine:</span>{' '}
                  {new Date(selectedEvent.dataFine).toLocaleString('it-IT')}
                </div>
              )}

              {selectedEvent.luogo && (
                <div>
                  <span className="font-semibold">Luogo:</span> {selectedEvent.luogo}
                </div>
              )}

              {selectedEvent.descrizione && (
                <div>
                  <span className="font-semibold">Descrizione:</span>
                  <p className="mt-1 text-gray-600">{selectedEvent.descrizione}</p>
                </div>
              )}

              <div>
                <span className="font-semibold">Pubblicato:</span>{' '}
                {selectedEvent.pubblicato ? '✅ Sì' : '❌ No'}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}