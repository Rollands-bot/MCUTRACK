'use client'

import { useEffect, useState } from 'react'
import { getVisitsApi, getPatientsApi, getPackagesApi, updateVisitStatusApi } from '@/lib/api-client'

export default function NursingPage() {
  const [waitingVisits, setWaitingVisits] = useState([])
  const [patients, setPatients] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewVisitForm, setShowNewVisitForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [visits, patientsData, packagesData] = await Promise.all([
        getVisitsApi('WAITING'),
        getPatientsApi(),
        getPackagesApi(),
      ])
      setWaitingVisits(visits || [])
      setPatients(patientsData || [])
      setPackages(packagesData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCallPatient = async (visitId) => {
    try {
      await updateVisitStatusApi(visitId, 'IN_PROGRESS')
      await loadData()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nursing Station</h1>
        <button
          onClick={() => setShowNewVisitForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + New Visit
        </button>
      </div>

      {/* Waiting Patients Queue */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Waiting Queue ({waitingVisits.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {waitingVisits.map((visit) => (
            <div
              key={visit.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {visit.patient?.firstName} {visit.patient?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  MRN: {visit.patient?.mrn} • {visit.package?.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {visit.visitNumber}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCallPatient(visit.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Call Patient
                </button>
              </div>
            </div>
          ))}
          {waitingVisits.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No waiting patients
            </div>
          )}
        </div>
      </div>

      {/* New Visit Modal */}
      {showNewVisitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 mb-4">New Visit</h3>
            <NewVisitForm
              patients={patients}
              packages={packages}
              onClose={() => setShowNewVisitForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function NewVisitForm({ patients, packages, onClose }) {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    // TODO: Implement create visit API
    alert('Create visit API endpoint needed')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
              {p.firstName} {p.lastName} ({p.mrn})
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
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Create Visit
        </button>
      </div>
    </form>
  )
}
