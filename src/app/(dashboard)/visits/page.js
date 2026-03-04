'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getVisitsApi, getPackagesApi, getPatientsApi, createVisitApi } from '@/lib/api-client'

export default function VisitsPage() {
  const router = useRouter()
  const [visits, setVisits] = useState([])
  const [packages, setPackages] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [visitsData, packagesData, patientsData] = await Promise.all([
      getVisitsApi(),
      getPackagesApi(),
      getPatientsApi(),
    ])
    setVisits(visitsData || [])
    setPackages(packagesData || [])
    setPatients(patientsData || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    const result = await createVisitApi({
      patientId: data.patientId,
      packageId: data.packageId,
      notes: data.notes,
    })

    if (result?.success) {
      setShowForm(false)
      loadData()
    }
  }

  const filteredVisits = filter
    ? visits.filter((v) => v.status === filter)
    : visits

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          + New Visit
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <TabButton label="All" count={visits.length} active={filter === ''} onClick={() => setFilter('')} />
        <TabButton label="Waiting" count={visits.filter(v => v.status === 'WAITING').length} active={filter === 'WAITING'} onClick={() => setFilter('WAITING')} />
        <TabButton label="In Progress" count={visits.filter(v => v.status === 'IN_PROGRESS').length} active={filter === 'IN_PROGRESS'} onClick={() => setFilter('IN_PROGRESS')} />
        <TabButton label="Completed" count={visits.filter(v => v.status === 'DONE').length} active={filter === 'DONE'} onClick={() => setFilter('DONE')} />
      </div>

      {/* Visit List */}
      <div className="bg-white rounded-lg shadow">
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
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {visit.visitNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.patient?.firstName} {visit.patient?.lastName}
                    <span className="text-gray-500 text-xs ml-2">
                      ({visit.patient?.mrn})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {visit.package?.name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={visit.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(visit.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/visits/${visit.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredVisits.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No visits found
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 mb-4">Create New Visit</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  name="patientId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                >
                  <option value="">Select patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.mrn} - {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package *
                </label>
                <select
                  name="packageId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                >
                  <option value="">Select package...</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Create Visit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label} ({count})
    </button>
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
