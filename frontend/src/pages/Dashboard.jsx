import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiCalendar, FiFileText, FiTrendingUp } from 'react-icons/fi'
import { sociAPI, riunioniAPI, eventiAPI } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    soci: 0,
    riunioni: 0,
    eventi: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [sociRes, riunioniRes, eventiRes] = await Promise.all([
        sociAPI.getAll(),
        riunioniAPI.getAll(),
        eventiAPI.getAll(),
      ])

      setStats({
        soci: sociRes.data.data?.length || 0,
        riunioni: riunioniRes.data.data?.length || 0,
        eventi: eventiRes.data.data?.length || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const statCards = [
    {
      name: 'Soci Totali',
      value: stats.soci,
      icon: FiUsers,
      link: '/soci',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Riunioni',
      value: stats.riunioni,
      icon: FiFileText,
      link: '/riunioni',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Eventi',
      value: stats.eventi,
      icon: FiCalendar,
      link: '/eventi',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Benvenuto nel Gestionale Associazione ETS! 🎉
        </h2>
        <p className="text-gray-600 mb-4">
          Questo sistema ti permette di gestire in modo completo tutti gli aspetti 
          della tua associazione: soci, riunioni, eventi e molto altro.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Gestione Soci</h3>
            <p className="text-sm text-gray-600">
              Anagrafica completa, documenti, cariche e storico
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Riunioni</h3>
            <p className="text-sm text-gray-600">
              Verbali, presenze, delibere e generazione PDF
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Eventi</h3>
            <p className="text-sm text-gray-600">
              Calendario, partecipanti e gestione budget
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Notifiche</h3>
            <p className="text-sm text-gray-600">
              Email automatiche e reminder scadenze
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
