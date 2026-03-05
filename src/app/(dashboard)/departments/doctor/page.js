'use client'

import { useEffect, useState } from 'react'
import { getVisitsApi, updateVisitStatusApi, getVisitWorkflowApi } from '@/lib/api-client'

export default function DoctorPage() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVisits()
  }, [])

  const loadVisits = async () => {
    try {
      const data = await getVisitsApi('IN_PROGRESS')
      setVisits(data || [])
    } catch (error) {
      console.error('Failed to load visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (visitId) => {
    try {
      await updateVisitStatusApi(visitId, 'DONE', 'Fit for duty')
      await loadVisits()
    } catch (error) {
      console.error('Failed to approve:', error)
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Doctor Dashboard</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Patients for Final Assessment ({visits.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {visits.map((visit) => (
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
                <a
                  href={`/visits/${visit.id}`}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  View Details
                </a>
                <button
                  onClick={() => handleApprove(visit.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
          {visits.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No patients waiting for assessment
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
