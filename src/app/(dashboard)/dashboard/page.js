'use client'

import { useEffect, useState } from 'react'
import { getDashboardStatsApi, getVisitsApi } from '@/lib/api-client'

export default function DashboardPage() {
  const [stats, setStats] = useState({ waiting: 0, inProgress: 0, done: 0, today: 0 })
  const [recentVisits, setRecentVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [statsData, visitsData] = await Promise.all([
        getDashboardStatsApi(),
        getVisitsApi(),
      ])
      setStats(statsData)
      setRecentVisits(visitsData || [])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Waiting"
          value={stats.waiting}
          color="bg-yellow-500"
          icon="⏳"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          color="bg-blue-500"
          icon="🔄"
        />
        <StatCard
          title="Completed"
          value={stats.done}
          color="bg-green-500"
          icon="✅"
        />
        <StatCard
          title="Today"
          value={stats.today}
          color="bg-purple-500"
          icon="📅"
        />
      </div>

      {/* Recent Visits */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Visit #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentVisits.slice(0, 10).map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {visit.visitNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.patient.firstName} {visit.patient.lastName}
                    <span className="text-gray-500 text-xs ml-2">
                      ({visit.patient.mrn})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.package.name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={visit.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(visit.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    WAITING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DONE: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  )
}
